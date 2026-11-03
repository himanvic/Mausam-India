/**
 * Mausam India — Desktop & Embeddable Widget Controller
 * Pure vanilla JavaScript, strict CSP compliant (script-src 'self'), zero dependencies.
 */
(function () {
  "use strict";

  const CITIES = {
    "new delhi": [28.6139, 77.2090, "New Delhi"],
    "delhi": [28.6139, 77.2090, "New Delhi"],
    "mumbai": [19.0760, 72.8777, "Mumbai"],
    "bengaluru": [12.9716, 77.5946, "Bengaluru"],
    "bangalore": [12.9716, 77.5946, "Bengaluru"],
    "kolkata": [22.5726, 88.3639, "Kolkata"],
    "chennai": [13.0827, 80.2707, "Chennai"],
    "hyderabad": [17.3850, 78.4867, "Hyderabad"],
    "ahmedabad": [23.0225, 72.5714, "Ahmedabad"],
    "pune": [18.5204, 73.8567, "Pune"],
    "jaipur": [26.9124, 75.7873, "Jaipur"],
    "lucknow": [26.8467, 80.9462, "Lucknow"],
    "chandigarh": [30.7333, 76.7794, "Chandigarh"],
    "patna": [25.5941, 85.1376, "Patna"],
    "bhopal": [23.2599, 77.4126, "Bhopal"],
    "kochi": [9.9312, 76.2673, "Kochi"],
    "dehradun": [30.3165, 78.0322, "Dehradun"],
    "srinagar": [34.0837, 74.7973, "Srinagar"],
    "shimla": [31.1048, 77.1734, "Shimla"],
    "guwahati": [26.1445, 91.7362, "Guwahati"],
    "surat": [21.1702, 72.8311, "Surat"],
    "indore": [22.7196, 75.8577, "Indore"],
    "nagpur": [21.1458, 79.0882, "Nagpur"],
    "visakhapatnam": [17.6868, 83.2185, "Visakhapatnam"],
    "varanasi": [25.3176, 82.9739, "Varanasi"],
    "agra": [27.1767, 78.0081, "Agra"],
    "amritsar": [31.6340, 74.8723, "Amritsar"],
    "bhubaneswar": [20.2961, 85.8245, "Bhubaneswar"],
    "coimbatore": [11.0168, 76.9558, "Coimbatore"],
    "vadodara": [22.3072, 73.1812, "Vadodara"]
  };

  const WMO_MAP = {
    0: ["Clear sky", "☀️", "🌙"],
    1: ["Mainly clear", "🌤️", "🌤️"],
    2: ["Partly cloudy", "⛅", "⛅"],
    3: ["Overcast", "☁️", "☁️"],
    45: ["Fog", "🌫️", "🌫️"],
    48: ["Depositing rime fog", "🌫️", "🌫️"],
    51: ["Light drizzle", "🌦️", "🌦️"],
    53: ["Moderate drizzle", "🌦️", "🌦️"],
    55: ["Dense drizzle", "🌧️", "🌧️"],
    61: ["Slight rain", "🌦️", "🌦️"],
    63: ["Moderate rain", "🌧️", "🌧️"],
    65: ["Heavy rain", "🌧️", "🌧️"],
    71: ["Slight snow", "🌨️", "🌨️"],
    73: ["Moderate snow", "🌨️", "🌨️"],
    75: ["Heavy snow", "❄️", "❄️"],
    80: ["Rain showers", "🌦️", "🌦️"],
    81: ["Moderate showers", "🌧️", "🌧️"],
    82: ["Violent showers", "⛈️", "⛈️"],
    95: ["Thunderstorm", "⛈️", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️", "⛈️"],
    99: ["Severe thunderstorm", "⛈️", "⛈️"]
  };

  function getAqiCategory(v) {
    if (!v || v < 0) return { label: "No Data", color: "#94a3b8", bg: "rgba(148,163,184,0.15)" };
    if (v <= 50) return { label: "Good", color: "#10b981", bg: "rgba(16,185,129,0.15)" };
    if (v <= 100) return { label: "Satisfactory", color: "#84cc16", bg: "rgba(132,204,22,0.15)" };
    if (v <= 200) return { label: "Moderate", color: "#eab308", bg: "rgba(234,179,8,0.15)" };
    if (v <= 300) return { label: "Poor", color: "#f97316", bg: "rgba(249,115,22,0.15)" };
    if (v <= 400) return { label: "Very Poor", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
    return { label: "Severe", color: "#b91c1c", bg: "rgba(185,28,28,0.2)" };
  }

  function calculateAqi(p25, p10) {
    if (p25 != null && p25 >= 0) {
      if (p25 <= 30) return Math.round((50 / 30) * p25);
      if (p25 <= 60) return Math.round(51 + (49 / 30) * (p25 - 31));
      if (p25 <= 90) return Math.round(101 + (99 / 30) * (p25 - 61));
      if (p25 <= 120) return Math.round(201 + (99 / 30) * (p25 - 91));
      if (p25 <= 250) return Math.round(301 + (99 / 130) * (p25 - 121));
      return 401;
    }
    if (p10 != null && p10 >= 0) {
      if (p10 <= 50) return Math.round(p10);
      if (p10 <= 100) return Math.round(51 + (49 / 50) * (p10 - 51));
      if (p10 <= 250) return Math.round(101 + (99 / 150) * (p10 - 101));
      if (p10 <= 350) return Math.round(201 + (99 / 100) * (p10 - 251));
      if (p10 <= 430) return Math.round(301 + (99 / 80) * (p10 - 351));
      return 401;
    }
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const rawCity = params.get("city") || "New Delhi";
  const cityKey = rawCity.trim().toLowerCase();
  const theme = params.get("theme") || "dark";
  const showAqi = params.get("aqi") !== "false";

  if (theme === "light" || (theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)) {
    document.documentElement.classList.add("light");
  }

  let lat = parseFloat(params.get("lat"));
  let lon = parseFloat(params.get("lon"));
  let cityName = params.get("name") || rawCity;

  if (isNaN(lat) || isNaN(lon)) {
    const found = CITIES[cityKey];
    if (found) {
      lat = found[0];
      lon = found[1];
      cityName = found[2];
    } else {
      lat = 28.6139;
      lon = 77.2090;
      cityName = rawCity;
    }
  }

  const card = document.getElementById("widgetCard");
  const cacheKey = `mausam_widget_cache_${cityKey}`;

  function renderCard(data, isOfflineFallback = false) {
    if (!card) return;
    const aqiMeta = getAqiCategory(data.aqi);
    const offlineBadge = isOfflineFallback
      ? `<span class="badge-pill" style="background:rgba(234,179,8,0.15);color:#eab308;border:1px solid rgba(234,179,8,0.3)" title="Displaying cached or offline estimate">⚠️ Offline</span>`
      : "";

    card.innerHTML = `
      <div class="widget-header">
        <div class="location-wrap" title="${cityName}">
          <span class="loc-icon">📍</span>
          <span>${cityName}</span>
        </div>
        <a href="https://mausam-india.pages.dev/" target="_blank" rel="noopener noreferrer" class="widget-brand" title="Open Mausam India Live Portal">
          <span>🇮🇳 Mausam India</span>
        </a>
      </div>

      <div class="main-metrics">
        <div class="temp-group">
          <span class="temp-val">${data.temp}</span>
          <span class="temp-unit">°C</span>
        </div>
        <span class="weather-glyph">${data.glyph}</span>
      </div>

      <div class="condition-text">
        <span>${data.condText}</span>
        <span>·</span>
        <span>Feels <span class="feels-text">${data.feels}°</span></span>
        ${offlineBadge}
      </div>

      <div class="widget-footer">
        <span class="badge-pill rain-pill">
          <span>☔</span>
          <span>${data.rainProb}% rain</span>
        </span>
        ${
          showAqi && data.aqi !== null
            ? `<span class="badge-pill aqi-pill" style="background:${aqiMeta.bg};color:${aqiMeta.color};border-color:color-mix(in srgb, ${aqiMeta.color} 40%, transparent)">
                <span>🍃</span>
                <span>AQI ${data.aqi} · ${aqiMeta.label}</span>
              </span>`
            : `<span class="badge-pill aqi-pill"><span>🍃</span><span>CPCB Scale</span></span>`
        }
      </div>
    `;
  }

  function renderError(message) {
    if (!card) return;
    card.innerHTML = `
      <div class="error-state">
        <span>⚠️ ${message || "Unable to load live weather"}</span>
        <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
          <button id="retryBtn" style="background:var(--ac);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-weight:600">Retry</button>
          <a href="https://mausam-india.pages.dev/" target="_blank" style="color:var(--ac);text-decoration:underline;font-size:11px">Open Mausam India</a>
        </div>
      </div>
    `;
    const retryBtn = document.getElementById("retryBtn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        card.innerHTML = `
          <div class="loading-state">
            <div class="spinner"></div>
            <span>Refreshing Mausam India...</span>
          </div>
        `;
        fetchWidgetData();
      });
    }
  }

  // Pre-load from local storage cache for instant 0ms startup
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.temp === "number") {
        renderCard(parsed, false);
      }
    }
  } catch (_) {}

  async function fetchWithTimeout(url, timeoutMs = 6000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      clearTimeout(id);
      return null;
    }
  }

  async function fetchWidgetData() {
    try {
      const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,is_day,precipitation,weather_code&hourly=precipitation_probability&timezone=Asia%2FKolkata&forecast_days=1`;
      const aUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10&timezone=Asia%2FKolkata`;

      const [wRes, aRes] = await Promise.all([
        fetchWithTimeout(wUrl, 6000),
        showAqi ? fetchWithTimeout(aUrl, 6000) : Promise.resolve(null)
      ]);

      if (!wRes || !wRes.current) {
        // Fallback: check if local cached data exists
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed.temp === "number") {
              renderCard(parsed, true);
              return;
            }
          }
        } catch (_) {}

        // Fallback: Default reasonable baseline if network completely disconnected on first launch
        renderCard({
          temp: 27,
          feels: 28,
          glyph: "⛅",
          condText: "Partly cloudy",
          rainProb: 15,
          aqi: 112
        }, true);
        return;
      }

      const cur = wRes.current;
      const temp = Math.round(cur.temperature_2m);
      const feels = Math.round(cur.apparent_temperature);
      const isDay = cur.is_day !== 0;
      const wmo = WMO_MAP[cur.weather_code] || ["Fair", "⛅", "⛅"];
      const glyph = isDay ? wmo[1] : wmo[2];
      const condText = wmo[0];

      let rainProb = 0;
      if (wRes.hourly && Array.isArray(wRes.hourly.precipitation_probability)) {
        rainProb = Math.max(0, ...wRes.hourly.precipitation_probability.slice(0, 6));
      }

      let aqiVal = null;
      if (aRes && aRes.current) {
        aqiVal = calculateAqi(aRes.current.pm2_5, aRes.current.pm10);
      }

      const dataToSave = { temp, feels, glyph, condText, rainProb, aqi: aqiVal };
      renderCard(dataToSave, false);

      try {
        localStorage.setItem(cacheKey, JSON.stringify(dataToSave));
      } catch (_) {}

    } catch (err) {
      renderError("Network timeout. Retrying...");
    }
  }

  fetchWidgetData();

  // Automatic background refresh every 15 minutes (battery friendly)
  setInterval(fetchWidgetData, 15 * 60 * 1000);
})();
