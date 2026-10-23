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
  if (!rawLat || !rawLon)
    return jsonError("latitude and longitude are required.");

  const latitudes = rawLat.split(",");
  const longitudes = rawLon.split(",");
  if (latitudes.length !== longitudes.length || latitudes.length > 20) {
    return jsonError(
      "Coordinate lists must have matching lengths (maximum 20 locations).",
    );
  }
  const validList = (values, min, max) =>
    values.every((value) => {
      if (!value.trim()) return false;
      const number = Number(value);
      return Number.isFinite(number) && number >= min && number <= max;
    });
  if (!validList(latitudes, -90, 90) || !validList(longitudes, -180, 180)) {
    return jsonError("One or more coordinates are invalid.");
  }
  return null;
}

async function proxyJson(
  context,
  upstreamBase,
  allowedParams,
  ttlSeconds,
  options = {},
) {
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
    upstream = await fetch(target.toString(), {
      headers: { accept: "application/json" },
    });
  } catch {
    return jsonError(
      "The weather data provider could not be reached. Please retry shortly.",
      502,
    );
  }
  if (!upstream.ok) {
    const message = await upstream.text().catch(() => "Upstream API error");
    return new Response(
      message || JSON.stringify({ error: "Weather provider error." }),
      {
        status: upstream.status,
        headers: { ...JSON_HEADERS, "cache-control": "no-store" },
      },
    );
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
    if (edgeCache)
      context.waitUntil(
        edgeCache.put(cacheKey, response.clone()).catch(() => {}),
      );
  } catch {
    // The fresh response remains usable if cache storage is unavailable.
  }
  return response;
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Use GET for this endpoint." }),
      {
        status: 405,
        headers: { ...JSON_HEADERS, allow: "GET", "cache-control": "no-store" },
      },
    );
  }

  const incoming = new URL(context.request.url);
  const route = incoming.pathname.replace(/\/+$/, "");
  const params = incoming.searchParams;

  if (route === "/api/forecast") {
    const coordinateError = validateCoordinates(params);
    if (coordinateError) return coordinateError;
    const days = Number(params.get("forecast_days") || 7);
    if (!Number.isInteger(days) || days < 1 || days > 16) {
      return jsonError("forecast_days must be an integer between 1 and 16.");
    }
    return proxyJson(
      context,
      "https://api.open-meteo.com/v1/forecast",
      [
        "latitude",
        "longitude",
        "current",
        "hourly",
        "daily",
        "timezone",
        "forecast_days",
        "forecast_hours",
        "forecast_minutely_15",
        "past_days",
        "temperature_unit",
        "wind_speed_unit",
        "precipitation_unit",
        "timeformat",
        "models",
        "cell_selection",
      ],
      600,
      { defaults: { timezone: "Asia/Kolkata" } },
    );
  }

  if (route === "/api/air-quality") {
    const coordinateError = validateCoordinates(params);
    if (coordinateError) return coordinateError;
    const pastDays = Number(params.get("past_days") || 0);
    if (!Number.isInteger(pastDays) || pastDays < 0 || pastDays > 92) {
      return jsonError("past_days must be an integer between 0 and 92.");
    }
    const forecastDays = Number(params.get("forecast_days") || 5);
    if (
      !Number.isInteger(forecastDays) ||
      forecastDays < 0 ||
      forecastDays > 7
    ) {
      return jsonError("forecast_days must be an integer between 0 and 7.");
    }
    return proxyJson(
      context,
      "https://air-quality-api.open-meteo.com/v1/air-quality",
      [
        "latitude",
        "longitude",
        "current",
        "hourly",
        "timezone",
        "past_days",
        "forecast_days",
        "domains",
        "start_date",
        "end_date",
      ],
      900,
      { defaults: { timezone: "Asia/Kolkata" } },
    );
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
    if (countryCode !== "IN")
      return jsonError("This search is limited to India.");
    return proxyJson(
      context,
      "https://geocoding-api.open-meteo.com/v1/search",
      ["name", "count", "language", "format", "countryCode"],
      86400,
      {
        defaults: { count: "10", language: "en", format: "json" },
        force: { countryCode: "IN" },
      },
    );
  }

  return jsonError("Endpoint not found.", 404);
}
