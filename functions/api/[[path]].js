const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
};

function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...JSON_HEADERS, "cache-control": "no-store" },
  });
}

function validateCoordinates(params) {
  const rawLat = params.get("latitude");
  const rawLon = params.get("longitude");
  if (!rawLat || !rawLon) return jsonError("latitude and longitude are required.");

  const latitudes = rawLat.split(",");
  const longitudes = rawLon.split(",");
  if (latitudes.length !== longitudes.length || latitudes.length > 20) {
    return jsonError("Coordinate lists must have matching lengths (maximum 20 locations).");
  }
  const validList = (values, min, max) => values.every((value) => {
    if (!value.trim()) return false;
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max;
  });
  if (!validList(latitudes, -90, 90) || !validList(longitudes, -180, 180)) {
    return jsonError("One or more coordinates are invalid.");
  }
  return null;
}

async function proxyJson(context, upstreamBase, allowedParams, ttlSeconds, options = {}) {
  const incoming = new URL(context.request.url);
  const target = new URL(upstreamBase);
  const allowed = new Set(allowedParams);

  for (const key of incoming.searchParams.keys()) {
    if (!allowed.has(key)) return jsonError(`Unsupported parameter: ${key}`);
  }
  for (const [key, value] of incoming.searchParams.entries()) {
    if (value.length > 2000) return jsonError(`Parameter is too long: ${key}`);
    target.searchParams.set(key, value);
  }
  for (const [key, value] of Object.entries(options.defaults || {})) {
    if (!target.searchParams.has(key)) target.searchParams.set(key, value);
  }
  for (const [key, value] of Object.entries(options.force || {})) {
    target.searchParams.set(key, value);
  }
  target.searchParams.sort();

  const cacheKey = new Request(target.toString(), { method: "GET" });
  let edgeCache;
  try {
    edgeCache = caches.default;
    const cached = await edgeCache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set("x-mausam-cache", "HIT");
      return new Response(cached.body, { status: cached.status, headers });
    }
  } catch {
    // Caching is optional; continue to the provider if it is unavailable.
  }

  let upstream;
  try {
    upstream = await fetch(target.toString(), { headers: { accept: "application/json" } });
  } catch {
    return jsonError("The weather data provider could not be reached. Please retry shortly.", 502);
  }
  if (!upstream.ok) {
    const message = await upstream.text().catch(() => "Upstream API error");
    return new Response(message || JSON.stringify({ error: "Weather provider error." }), {
      status: upstream.status,
      headers: { ...JSON_HEADERS, "cache-control": "no-store" },
    });
  }

  const body = await upstream.text();
  const response = new Response(body, {
    status: 200,
    headers: {
      ...JSON_HEADERS,
      "cache-control": `public, max-age=0, s-maxage=${ttlSeconds}`,
      "x-mausam-cache": "MISS",
    },
  });
  try {
    if (edgeCache) context.waitUntil(edgeCache.put(cacheKey, response.clone()).catch(() => {}));
  } catch {
    // The fresh response remains usable if cache storage is unavailable.
  }
  return response;
}


function haversineKm(lat1, lon1, lat2, lon2) {
  const rad = (v) => v * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function openAQParameter(sensor) {
  const p = sensor?.parameter || {};
  const normalized = [p.name, p.displayName, sensor?.name].filter(Boolean).join(" ").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalized.includes("pm25")) return { key: "pm2_5", label: "PM2.5" };
  if (normalized.includes("pm10")) return { key: "pm10", label: "PM10" };
  if (normalized === "no2" || normalized.includes("nitrogendioxide")) return { key: "nitrogen_dioxide", label: "NO₂" };
  if (normalized === "o3" || normalized.includes("ozone")) return { key: "ozone", label: "O₃" };
  if (normalized === "so2" || normalized.includes("sulfurdioxide") || normalized.includes("sulphurdioxide")) return { key: "sulphur_dioxide", label: "SO₂" };
  if (normalized === "co" || normalized.includes("carbonmonoxide")) return { key: "carbon_monoxide", label: "CO" };
  return null;
}

async function openAQGet(url, apiKey) {
  const response = await fetch(url, { headers: { accept: "application/json", "X-API-Key": apiKey } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(response.status === 401 || response.status === 403
      ? "OpenAQ rejected the configured API key. Check the Cloudflare secret named OPENAQ_API_KEY."
      : response.status === 429
        ? "OpenAQ rate limit reached. Please retry after a short pause."
        : `OpenAQ returned HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function jsonResponse(data, status = 200, ttlSeconds = 600) {
  const headers = { ...JSON_HEADERS, "cache-control": ttlSeconds ? `public, max-age=0, s-maxage=${ttlSeconds}` : "no-store" };
  return new Response(JSON.stringify(data), { status, headers });
}

async function openAQNearest(context, params) {
  const apiKey = context.env?.OPENAQ_API_KEY;
  if (!apiKey) return jsonResponse({ available: false, status: "not_configured", error: "OpenAQ is not configured on this deployment. Add the OPENAQ_API_KEY secret in Cloudflare Pages settings." }, 503, 0);

  const latRaw = params.get("latitude"), lonRaw = params.get("longitude");
  const lat = Number(latRaw), lon = Number(lonRaw);
  if (!latRaw || !lonRaw || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return jsonResponse({ available: false, status: "invalid_coordinates", error: "Valid latitude and longitude are required." }, 400, 0);
  }
  const radius = Number(params.get("radius") || 25000);
  if (!Number.isInteger(radius) || radius < 1000 || radius > 25000) {
    return jsonResponse({ available: false, status: "invalid_radius", error: "radius must be between 1000 and 25000 metres." }, 400, 0);
  }

  // Cache by rounded coordinates and radius; never include the secret in a URL or cache key.
  const incoming = new URL(context.request.url);
  const cacheUrl = new URL("/api/openaq/nearest", incoming.origin);
  cacheUrl.searchParams.set("latitude", lat.toFixed(4));
  cacheUrl.searchParams.set("longitude", lon.toFixed(4));
  cacheUrl.searchParams.set("radius", String(radius));
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
  let edgeCache;
  try {
    edgeCache = caches.default;
    const cached = await edgeCache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set("x-mausam-cache", "HIT");
      return new Response(cached.body, { status: cached.status, headers });
    }
  } catch { /* The endpoint still works if edge caching is unavailable. */ }

  const locationsUrl = new URL("https://api.openaq.org/v3/locations");
  locationsUrl.searchParams.set("coordinates", `${lat.toFixed(4)},${lon.toFixed(4)}`);
  locationsUrl.searchParams.set("radius", String(radius));
  locationsUrl.searchParams.set("iso", "IN");
  locationsUrl.searchParams.set("limit", "100");
  locationsUrl.searchParams.set("page", "1");
  locationsUrl.searchParams.set("monitor", "true");

  try {
    let locationPayload = await openAQGet(locationsUrl.toString(), apiKey);
    let locations = Array.isArray(locationPayload.results) ? locationPayload.results : [];
    // If no reference monitors are listed, retry once without the monitor-only filter.
    if (!locations.length) {
      locationsUrl.searchParams.delete("monitor");
      locationPayload = await openAQGet(locationsUrl.toString(), apiKey);
      locations = Array.isArray(locationPayload.results) ? locationPayload.results : [];
    }
    if (!locations.length) {
      const result = jsonResponse({ available: false, status: "no_station", radius_km: radius / 1000, reason: `No OpenAQ monitoring station was found within ${(radius / 1000).toFixed(0)} km of this location.` });
      try { if (edgeCache) context.waitUntil(edgeCache.put(cacheKey, result.clone()).catch(() => {})); } catch { }
      return result;
    }

    const supported = locations.filter((location) => location && Number.isFinite(Number(location.id)) && Array.isArray(location.sensors) && location.sensors.some(sensor => openAQParameter(sensor)) && location.coordinates && Number.isFinite(Number(location.coordinates.latitude)) && Number.isFinite(Number(location.coordinates.longitude)))
      .map(location => ({ ...location, _distanceKm: haversineKm(lat, lon, Number(location.coordinates.latitude), Number(location.coordinates.longitude)) }))
      .filter(location => location._distanceKm <= radius / 1000 + 0.5)
      .sort((a, b) => a._distanceKm - b._distanceKm)
      .slice(0, 8);

    if (!supported.length) {
      const result = jsonResponse({ available: false, status: "no_station", radius_km: radius / 1000, reason: "Nearby OpenAQ locations were found, but none had supported pollutant sensors in the station metadata." });
      try { if (edgeCache) context.waitUntil(edgeCache.put(cacheKey, result.clone()).catch(() => {})); } catch { }
      return result;
    }

    const candidates = await Promise.all(supported.map(async location => {
      try {
        const latestUrl = `https://api.openaq.org/v3/locations/${encodeURIComponent(location.id)}/latest?limit=100&page=1`;
        const latestPayload = await openAQGet(latestUrl, apiKey);
        const sensorMap = new Map((location.sensors || []).map(sensor => [Number(sensor.id), sensor]));
        const readings = new Map();
        for (const item of (Array.isArray(latestPayload.results) ? latestPayload.results : [])) {
          const sensor = sensorMap.get(Number(item.sensorsId ?? item.sensorId ?? item.sensor_id));
          const parameter = openAQParameter(sensor || { parameter: item.parameter, name: item.parameter?.name });
          if (!parameter || !Number.isFinite(Number(item.value)) || Number(item.value) < 0) continue;
          const dt = item.datetime || {};
          const utc = dt.utc || dt.local || item.period?.datetimeTo?.utc || item.period?.datetimeFrom?.utc || null;
          const stamp = utc ? Date.parse(utc) : NaN;
          const old = readings.get(parameter.key);
          if (old && Number.isFinite(stamp) && old.timestamp >= stamp) continue;
          if (old && !Number.isFinite(stamp) && old.timestamp >= 0) continue;
          const ageHours = Number.isFinite(stamp) ? Math.max(0, (Date.now() - stamp) / 3600000) : null;
          readings.set(parameter.key, {
            key: parameter.key,
            label: parameter.label,
            value: Number(item.value),
            unit: sensor?.parameter?.units || item.unit || "unit unavailable",
            datetime_utc: dt.utc || (dt.local ? new Date(dt.local).toISOString() : null),
            datetime_local: dt.local || dt.utc || null,
            timestamp: Number.isFinite(stamp) ? stamp : -1,
            age_hours: ageHours,
            age_label: ageHours == null ? "time unavailable" : ageHours < 1 ? "<1 h ago" : ageHours < 24 ? `${Math.round(ageHours)} h ago` : `${Math.floor(ageHours / 24)} d ago`,
          });
        }
        const list = [...readings.values()].sort((a, b) => ["pm2_5", "pm10", "nitrogen_dioxide", "ozone", "sulphur_dioxide", "carbon_monoxide"].indexOf(a.key) - ["pm2_5", "pm10", "nitrogen_dioxide", "ozone", "sulphur_dioxide", "carbon_monoxide"].indexOf(b.key));
        const times = list.map(item => item.timestamp).filter(value => value > 0);
        const latestTimestamp = times.length ? Math.max(...times) : -1;
        const recent24 = list.filter(item => item.age_hours != null && item.age_hours <= 24).length;
        return { location, readings: list, latestTimestamp, recent24 };
      } catch (error) {
        return { location, readings: [], latestTimestamp: -1, recent24: 0, errorStatus: error.status || 0 };
      }
    }));

    candidates.sort((a, b) => b.recent24 - a.recent24 || b.readings.length - a.readings.length || b.latestTimestamp - a.latestTimestamp || a.location._distanceKm - b.location._distanceKm);
    const best = candidates.find(candidate => candidate.readings.length > 0);
    if (!best) {
      const rateLimited = candidates.some(candidate => candidate.errorStatus === 429);
      const result = jsonResponse({ available: false, status: rateLimited ? "rate_limited" : "no_recent_data", radius_km: radius / 1000, reason: rateLimited ? "OpenAQ rate limit reached. Please retry shortly." : "Nearby OpenAQ stations were found, but they did not return supported latest measurements." }, rateLimited ? 429 : 200, rateLimited ? 0 : 600);
      try { if (edgeCache && rateLimited === false) context.waitUntil(edgeCache.put(cacheKey, result.clone()).catch(() => {})); } catch { }
      return result;
    }

    const latestTimestamp = best.latestTimestamp > 0 ? best.latestTimestamp : null;
    const ageHours = latestTimestamp ? Math.max(0, (Date.now() - latestTimestamp) / 3600000) : null;
    const freshnessStatus = ageHours == null ? "Timestamp unavailable" : ageHours <= 3 ? "Fresh" : ageHours <= 24 ? "Recent" : ageHours <= 72 ? "Delayed" : "Stale";
    const location = best.location;
    const output = {
      available: true,
      status: "available",
      source: "OpenAQ API v3",
      station: {
        id: location.id,
        name: location.name || location.locality || "OpenAQ station",
        locality: location.locality || null,
        owner_name: location.owner?.name || null,
        provider_name: location.provider?.name || null,
        is_monitor: Boolean(location.isMonitor),
        latitude: location.coordinates?.latitude ?? null,
        longitude: location.coordinates?.longitude ?? null,
        distance_km: Math.round(location._distanceKm * 10) / 10,
        latest_at: latestTimestamp ? new Date(latestTimestamp).toISOString() : null,
        latest_at_local: best.readings.find(item => item.timestamp === latestTimestamp)?.datetime_local || (latestTimestamp ? new Date(latestTimestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST" : null),
        age_hours: ageHours,
        freshness_status: freshnessStatus,
        measurement_count: best.readings.length,
      },
      measurements: best.readings.map(({ timestamp, ...measurement }) => measurement),
      note: "OpenAQ measurements are physical pollutant readings, not a composite CPCB AQI. Some stations may be stale or incomplete.",
    };
    const response = jsonResponse(output, 200, 600);
    try { if (edgeCache) context.waitUntil(edgeCache.put(cacheKey, response.clone()).catch(() => {})); } catch { }
    return response;
  } catch (error) {
    const status = error.status === 429 ? 429 : error.status === 401 || error.status === 403 ? 502 : 502;
    return jsonResponse({ available: false, status: status === 429 ? "rate_limited" : "error", error: error.message || "Could not reach OpenAQ." }, status, 0);
  }
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Use GET for this endpoint." }), {
      status: 405,
      headers: { ...JSON_HEADERS, allow: "GET", "cache-control": "no-store" },
    });
  }

  const incoming = new URL(context.request.url);
  const route = incoming.pathname.replace(/\/+$/, "");
  const params = incoming.searchParams;

  if (route === "/api/openaq/nearest") {
    return openAQNearest(context, params);
  }

  if (route === "/api/forecast") {
    const coordinateError = validateCoordinates(params);
    if (coordinateError) return coordinateError;
    const days = Number(params.get("forecast_days") || 7);
    if (!Number.isInteger(days) || days < 1 || days > 16) {
      return jsonError("forecast_days must be an integer between 1 and 16.");
    }
    return proxyJson(context, "https://api.open-meteo.com/v1/forecast", [
      "latitude", "longitude", "current", "hourly", "daily", "timezone",
      "forecast_days", "forecast_hours", "forecast_minutely_15", "past_days",
      "temperature_unit", "wind_speed_unit", "precipitation_unit", "timeformat",
      "models", "cell_selection",
    ], 600, { defaults: { timezone: "Asia/Kolkata" } });
  }

  if (route === "/api/air-quality") {
    const coordinateError = validateCoordinates(params);
    if (coordinateError) return coordinateError;
    return proxyJson(context, "https://air-quality-api.open-meteo.com/v1/air-quality", [
      "latitude", "longitude", "current", "hourly", "timezone", "forecast_days", "past_days",
      "domains", "start_date", "end_date",
    ], 900, { defaults: { timezone: "Asia/Kolkata" } });
  }

  if (route === "/api/geocoding") {
    const name = (params.get("name") || "").trim();
    if (name.length < 2 || name.length > 100) {
      return jsonError("Search for at least 2 characters (maximum 100).");
    }
    const count = Number(params.get("count") || 10);
    if (!Number.isInteger(count) || count < 1 || count > 30) {
      return jsonError("count must be an integer between 1 and 30.");
    }
    const countryCode = (params.get("countryCode") || "IN").toUpperCase();
    if (countryCode !== "IN") return jsonError("This search is limited to India.");
    return proxyJson(context, "https://geocoding-api.open-meteo.com/v1/search", [
      "name", "count", "language", "format", "countryCode",
    ], 86400, {
      defaults: { count: "10", language: "en", format: "json" },
      force: { countryCode: "IN" },
    });
  }

  return jsonError("Endpoint not found.", 404);
}
