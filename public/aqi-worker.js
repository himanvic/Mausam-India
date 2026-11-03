/**
 * Mausam India — Background Math & CPCB AQI WebWorker (aqi-worker.js)
 * Offloads multi-pollutant 24-hour rolling average calculations and
 * Haversine spatial distance math off the main browser UI thread.
 */

const CPCB_POLLUTANTS = {
  pm2_5: {
    label: "PM2.5",
    unit: "µg/m³",
    hours: 24,
    min: 16,
    decimals: 0,
    ranges: [
      [0, 30, 0, 50],
      [31, 60, 51, 100],
      [61, 90, 101, 200],
      [91, 120, 201, 300],
      [121, 250, 301, 400],
    ],
    openAfter: 250,
  },
  pm10: {
    label: "PM10",
    unit: "µg/m³",
    hours: 24,
    min: 16,
    decimals: 0,
    ranges: [
      [0, 50, 0, 50],
      [51, 100, 51, 100],
      [101, 250, 101, 200],
      [251, 350, 201, 300],
      [351, 430, 301, 400],
    ],
    openAfter: 430,
  },
  nitrogen_dioxide: {
    label: "NO₂",
    unit: "µg/m³",
    hours: 24,
    min: 16,
    decimals: 0,
    ranges: [
      [0, 40, 0, 50],
      [41, 80, 51, 100],
      [81, 180, 101, 200],
      [181, 280, 201, 300],
      [281, 400, 301, 400],
    ],
    openAfter: 400,
  },
  sulphur_dioxide: {
    label: "SO₂",
    unit: "µg/m³",
    hours: 24,
    min: 16,
    decimals: 0,
    ranges: [
      [0, 40, 0, 50],
      [41, 80, 51, 100],
      [81, 380, 101, 200],
      [381, 800, 201, 300],
      [801, 1600, 301, 400],
    ],
    openAfter: 1600,
  },
  ozone: {
    label: "O₃",
    unit: "µg/m³",
    hours: 8,
    min: 6,
    decimals: 0,
    ranges: [
      [0, 50, 0, 50],
      [51, 100, 51, 100],
      [101, 168, 101, 200],
      [169, 208, 201, 300],
      [209, 748, 301, 400],
    ],
    openAfter: 748,
  },
  carbon_monoxide: {
    label: "CO",
    unit: "mg/m³",
    hours: 8,
    min: 6,
    scale: 0.001,
    decimals: 1,
    ranges: [
      [0, 1.0, 0, 50],
      [1.1, 2.0, 51, 100],
      [2.1, 10.0, 101, 200],
      [10.1, 17.0, 201, 300],
      [17.1, 34.0, 301, 400],
    ],
    openAfter: 34.0,
  },
};

function aqC(v) {
  if (v == null || v === "" || !Number.isFinite(Number(v)))
    return ["No data", "#94a3b8", "#64748b"];
  const n = Number(v);
  if (n <= 50) return ["Good", "#10b981", "#059669"];
  if (n <= 100) return ["Satisfactory", "#84cc16", "#65a30d"];
  if (n <= 200) return ["Moderate", "#eab308", "#ca8a04"];
  if (n <= 300) return ["Poor", "#f97316", "#ea580c"];
  if (n <= 400) return ["Very Poor", "#ef4444", "#dc2626"];
  return ["Severe", "#7f1d1d", "#450a0a"];
}

function roundCpcbConcentration(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function cpcbSubIndex(concentration, config) {
  if (!Number.isFinite(concentration) || concentration < 0) return null;
  const rounded = roundCpcbConcentration(concentration, config.decimals);
  for (const [cLow, cHigh, iLow, iHigh] of config.ranges) {
    if (rounded >= cLow && rounded <= cHigh) {
      const fraction = (rounded - cLow) / (cHigh - cLow || 1);
      return {
        value: Math.max(
          iLow,
          Math.min(iHigh, Math.round(iLow + fraction * (iHigh - iLow))),
        ),
        openEnded: false,
        concentration: rounded,
      };
    }
  }
  if (rounded > config.openAfter)
    return { value: 401, openEnded: true, concentration: rounded };
  return null;
}

function validPollutantValues(values) {
  return Array.isArray(values)
    ? values
        .filter(
          (v) =>
            v !== null &&
            v !== undefined &&
            v !== "" &&
            Number.isFinite(Number(v)),
        )
        .map(Number)
    : [];
}

function calculateCpcbAtEnd(payload, end) {
  const h = payload && payload.hourly;
  if (!h || !Array.isArray(h.time) || end < 0 || end >= h.time.length)
    return null;
  const pollutants = {};
  for (const [key, config] of Object.entries(CPCB_POLLUTANTS)) {
    const series = h[key];
    if (!Array.isArray(series)) continue;
    const start = Math.max(0, end - config.hours + 1);
    const values = validPollutantValues(series.slice(start, end + 1));
    if (values.length < config.min) continue;
    const mean =
      values.reduce((sum, value) => sum + value, 0) / values.length;
    const concentration = mean * (config.scale || 1);
    const sub = cpcbSubIndex(concentration, config);
    if (!sub) continue;
    const [status] = aqC(sub.value);
    pollutants[key] = {
      value: sub.concentration,
      unit: config.unit,
      sub_index: sub.value,
      status,
      averaging_hours: config.hours,
      samples: values.length,
      open_ended: sub.openEnded,
    };
  }
  const pollutantEntries = Object.entries(pollutants);
  const hasParticulate = Boolean(pollutants.pm2_5 || pollutants.pm10);
  const indexAvailable = pollutantEntries.length >= 3 && hasParticulate;
  const max = indexAvailable
    ? Math.max(...pollutantEntries.map(([, p]) => p.sub_index))
    : null;
  const worst = indexAvailable
    ? pollutantEntries
        .filter(([, p]) => p.sub_index === max)
        .map(([key]) => CPCB_POLLUTANTS[key].label)
    : [];
  const [category] = indexAvailable ? aqC(max) : ["Insufficient data"];
  return {
    value: max,
    aqi: max,
    category,
    index_available: indexAvailable,
    openEnded:
      indexAvailable &&
      worst.some(
        (key) =>
          pollutants[
            Object.keys(CPCB_POLLUTANTS).find(
              (k) => CPCB_POLLUTANTS[k].label === key,
            )
          ]?.open_ended,
      ),
    prominent_pollutant: worst.join(", ") || null,
    pollutant_count: pollutantEntries.length,
    pollutants,
    missing_requirements: indexAvailable
      ? []
      : [
          ...(pollutantEntries.length < 3
            ? ["At least three valid pollutant sub-indices are required."]
            : []),
          ...(!hasParticulate
            ? ["At least one of PM2.5 or PM10 is required."]
            : []),
        ],
  };
}

function calcIndiaAQI(payload, currentTime) {
  const h = payload && payload.hourly;
  if (!h || !Array.isArray(h.time)) return null;
  let end = -1;
  for (let i = 0; i < h.time.length; i++) {
    if (h.time[i] <= currentTime) end = i;
    else break;
  }
  if (end < 0) return null;
  return calculateCpcbAtEnd(payload, end);
}

function calcIndiaAQIForDay(payload, day) {
  const h = payload && payload.hourly;
  if (!h || !Array.isArray(h.time)) return null;
  const dayIndices = [];
  for (let i = 0; i < h.time.length; i++) {
    if (String(h.time[i]).slice(0, 10) === day) dayIndices.push(i);
  }
  if (!dayIndices.length) return null;
  let best = null;
  for (const end of dayIndices) {
    const candidate = calculateCpcbAtEnd(payload, end);
    if (
      candidate &&
      candidate.index_available &&
      (!best || candidate.value > best.value)
    ) {
      best = candidate;
    }
  }
  return best;
}

// Haversine Spatial Great-Circle Distance (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// WebWorker Message Receiver
self.onmessage = function (e) {
  const data = e.data || {};
  const { action, reqId } = data;

  try {
    if (action === "CALCULATE_CURRENT_AQI") {
      const res = calcIndiaAQI(data.payload, data.currentTime);
      self.postMessage({ reqId, ok: true, result: res });
    } else if (action === "CALCULATE_FULL_AQI") {
      const current = calcIndiaAQI(data.payload, data.currentTime);
      const daily = {};
      if (Array.isArray(data.days)) {
        for (const day of data.days) {
          daily[day] = calcIndiaAQIForDay(data.payload, day);
        }
      }
      self.postMessage({ reqId, ok: true, result: { current, daily } });
    } else if (action === "CALCULATE_HAVERSINE") {
      const dist = haversineDistance(data.lat1, data.lon1, data.lat2, data.lon2);
      self.postMessage({ reqId, ok: true, result: dist });
    } else if (action === "PING") {
      self.postMessage({ reqId, ok: true, result: "PONG" });
    } else {
      self.postMessage({ reqId, ok: false, error: "Unknown action" });
    }
  } catch (err) {
    self.postMessage({ reqId, ok: false, error: String(err && err.message) });
  }
};
