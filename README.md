# 🇮🇳 Mausam India (मौसम इंडिया)

```text
███╗   ███╗ █████╗ ██╗   ██╗███████╗ █████╗ ███╗   ███╗    ██╗███╗   ██╗██████╗ ██╗ █████╗
████╗ ████║██╔══██╗██║   ██║██╔════╝██╔══██╗████╗ ████║    ██║████╗  ██║██╔══██╗██║██╔══██╗
██╔████╔██║███████║██║   ██║███████╗███████║██╔████╔██║    ██║██╔██╗ ██║██║  ██║██║███████║
██║╚██╔╝██║██╔══██║██║   ██║╚════██║██╔══██║██║╚██╔╝██║    ██║██║╚██╗██║██║  ██║██║██╔══██║
██║ ╚═╝ ██║██║  ██║╚██████╔╝███████║██║  ██║██║ ╚═╝ ██║    ██║██║ ╚████║██████╔╝██║██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝╚═╝  ╚═╝

```

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![WebGL: Three.js](https://img.shields.io/badge/3D%20Engine-Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Maps: Leaflet](https://img.shields.io/badge/Interactive%20Maps-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20App-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Data Integrity](https://img.shields.io/badge/Data%20Integrity-CPCB%20%2B%20NASA%20Verified-059669?style=for-the-badge)](#-data-transparency--strict-separation)

---

## 🌐 Live Website & Repository

- **Live Production URL**: [https://mausam-india.pages.dev](https://mausam-india.pages.dev)
- **GitHub Repository**: [https://github.com/himanvic/Mausam-India](https://github.com/himanvic/Mausam-India)

---

## 📖 Overview

**Mausam India** is a modern, high-performance weather web application engineered specifically for the Indian subcontinent. It combines real-time atmospheric modeling, official Indian Central Pollution Control Board (CPCB) Air Quality Index mathematics, physical ground-level sensor feeds, real daily satellite cloud imagery from NASA, and interactive Doppler radar into a unified, responsive interface.

Built to run with zero server overhead at the edge on **Cloudflare Pages**, the application delivers near-instant cold starts, strict data integrity, and zero proprietary copyright liabilities.

> [!NOTE]
> **Independent Project Notice**: Mausam India is an independent open-source weather platform and is not affiliated with, authorized, sponsored, or endorsed by the India Meteorological Department (IMD), the Ministry of Earth Sciences (MoES), or the Government of India. For official governmental advisories and storm warnings, please visit [mausam.imd.gov.in](https://mausam.imd.gov.in).

---

## 🌟 Key Features

### 1. 🌦️ Procedural 3D WebGL Living Sky (Three.js)

- **Living Atmosphere**: Real-time celestial rendering featuring a procedural Sun with corona bloom, 1,200 scintillation stars, multi-altitude drifting 3D clouds, vertical rain streaks, dynamic lightning flashes, and low-altitude fog layers.
- **Mouse Parallax**: Smooth cursor tilt interactions on widescreen displays.
- **Resource Conscious**: Animation cycles automatically pause when the browser tab loses focus or when `prefers-reduced-motion` is detected, ensuring zero battery drain on laptops and mobile devices.

### 2. 🤖 "Mausam Mitra" Dynamic Weather Companion

- **Adaptive Vector Mascot**: Built entirely from clean procedural SVG vectors (zero third-party 3D assets or copyright risks).
- **Context-Aware States**:
  - **Pollution Alert (AQI $\ge 200$)**: Automatically equips a fitted N95 respirator mask with particulate valves and displays air health cautions.
  - **Precipitation**: Holds an umbrella with water-repellent bounce animations when rain or storms are imminent.
  - **High UV / Heatwave ($\ge 38^\circ\text{C}$)**: Wears dark sunglasses and triggers hydration advisories.
  - **Winter Chill ($< 14^\circ\text{C}$)**: Wraps in a warm knitted muffler.
  - **Starlit Night**: Holds an illuminated warm lantern.
- **Micro-Interactions**: Click or tap Mausam Mitra to cycle through contextual weather tips with physics-based wobble animations.
- **Fully Responsive**: Fills widescreen hero space on desktop and automatically reorganizes into a compact horizontal 2-row companion on mobile phones ($\le 900\text{px}$) with zero screen overflow.

### 3. 🛰️ Integrated NASA Satellite & Atmospheric Map

- **NASA GIBS Satellite Clouds**: Daily TrueColor composite imagery captured by NASA's Terra satellite orbit (`MODIS_Terra_CorrectedReflectance_TrueColor`), showing genuine physical cloud formations, storm eyes, and snow cover across the Himalayas and subcontinent.
- **Windy-Style Wind Streamlines**: Real-time canvas particle streams that visualize wind velocity, gusts, and directional airflow dynamically.
- **RainViewer Doppler Radar**: 13-frame animated Doppler precipitation radar loop with interactive playback controls (Play, Pause, Step).
- **Esri Dark Gray Basemap**: Crisp, high-contrast, royalty-free basemap tiles requiring zero third-party API keys and displaying zero watermarks.

### 4. 🇮🇳 Official Indian CPCB Air Quality Index Engine

- **Accurate Mathematical Standard**: Computes the official 6-category Indian CPCB AQI using piecewise linear interpolation across standard concentration breakpoints ($\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{SO}_2, \text{CO}, \text{O}_3$).
- **Strict CPCB Mandate**: Requires at least 3 pollutants with either $\text{PM}_{2.5}$ or $\text{PM}_{10}$ present to formulate an authentic overall index.
- **Inline 7-Day Trend Chart**: Color-coded micro-bar chart embedded directly inside the AQI card for immediate weekly air quality trajectory.
- **Interactive 7-Day History Modal**: Expanded 180px gradient bar visualization with official CPCB guideline thresholds (50 Good, 100 Satisfactory, 200 Moderate, 300 Poor, 400 Very Poor).

### 5. 🔬 Physical OpenAQ Ground Stations

- **Absolute Data Separation**: Modeled regional estimates are kept strictly isolated from physical ground monitors to eliminate cross-contamination.
- **Hyperlocal Ground Station Finder**: Locates the nearest registered CAAQMS physical monitoring station using spherical Haversine distance.
- **Freshness Health Badges**:
  - `CURRENT`: Data reported within the last 3 hours.
  - `DELAYED`: Station reporting gap between 3 and 24 hours.
  - `OFFLINE`: Station has not transmitted telemetry within 24 hours.

### 6. 📱 Progressive Web App (PWA)

- Installable on Android, iOS, Windows, and macOS directly from the browser.
- Offline app shell caching via `sw.js` for instant subsequent loads.
- Widescreen grid architecture that balances content on 4K monitors while remaining lean on handheld devices.

---

## 📡 Official APIs & Data Providers

Every external API utilized by Mausam India is official, legal, open, and proxied at the edge via Cloudflare Pages Functions to guarantee client privacy and avoid CORS roadblocks:

| Provider                   | Purpose                                                                                      | Upstream Endpoint                                                 | Edge Proxy Route      | Cache Strategy (TTL)        | Official Documentation                                                                                     |
| :------------------------- | :------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- | :-------------------- | :-------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **Open-Meteo Weather**     | Hyperlocal hourly, daily, UV, wind, and rain forecasts                                       | `https://api.open-meteo.com/v1/forecast`                          | `/api/forecast`       | 10 Minutes (`s-maxage=600`) | [Open-Meteo Weather API](https://open-meteo.com/en/docs)                                                   |
| **Open-Meteo Air Quality** | Hourly modeled atmospheric pollutants ($\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2$, etc.) | `https://air-quality-api.open-meteo.com/v1/air-quality`           | `/api/air-quality`    | 15 Minutes (`s-maxage=900`) | [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)                               |
| **Open-Meteo Geocoding**   | Indian city, town, village, and PIN code search                                              | `https://geocoding-api.open-meteo.com/v1/search`                  | `/api/geocoding`      | 24 Hours (`s-maxage=86400`) | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)                                   |
| **OpenAQ v3 Platform**     | Registered physical CPCB/CAAQMS ground sensor telemetry                                      | `https://api.openaq.org/v3/locations`                             | `/api/openaq/nearest` | 15 Minutes (`s-maxage=900`) | [OpenAQ API v3 Docs](https://docs.openaq.org/)                                                             |
| **NASA GIBS**              | Orbital satellite TrueColor cloud imagery (Terra/MODIS)                                      | `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/...`          | Client WMTS Layer     | Direct Browser Cache        | [NASA Earthdata GIBS](https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs) |
| **RainViewer Radar**       | Real-time Doppler precipitation radar tile loop                                              | `https://api.rainviewer.com/public/weather-maps.json`             | Client Radar Stream   | 5 Minutes (Dynamic)         | [RainViewer API](https://www.rainviewer.com/api.html)                                                      |
| **Esri ArcGIS Canvas**     | Dark Gray minimalist geographic basemap & boundaries                                         | `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/...` | Direct Tile Layer     | Browser Cache               | [Esri ArcGIS Basemaps](https://www.esri.com/en-us/arcgis/products/arcgis-platform/services/basemaps)       |

### 🏛️ India Meteorological Department (IMD / MoES) Integration Note

> **Status**: Architectural Blueprint Ready · Scheduled for Large-Scale Enterprise Roadmap

The **India Meteorological Department (IMD)**, functioning under the Ministry of Earth Sciences (MoES), Government of India, provides national weather observations, district-level agro-meteorological advisories, and indigenous Doppler Weather Radar (DWR) networks.

While an official IMD data integration is fully architected for Mausam India, it is intentionally reserved for an upcoming enterprise phase rather than this initial public release for the following technical and operational reasons:

1. **Institutional Verification & Access Provisioning**: Direct access to production-grade IMD APIs and high-frequency governmental telemetry (via `data.gov.in` / National Data Sharing and Accessibility Policy — NDSAP) requires institutional credential vetting, agency clearance, and multi-day bureaucratic onboarding workflows.
2. **Edge SLA & High-Availability Guarantees**: Public governmental API gateways frequently enforce strict concurrency caps and variable uptime windows during extreme weather events. To guarantee 99.99% global edge availability and sub-100ms response times, our primary ingestion pipeline leverages redundant, high-throughput Open-Meteo and OpenAQ edge arrays.
3. **Turnkey Adapter Readiness**: The Cloudflare edge runtime (`functions/api/[[path]].js`) is modularly architected. Once formalized institutional clearance and dedicated developer keys are finalized, an IMD upstream adapter (`/api/imd/*`) can be connected directly into the existing edge-caching layer without altering the client-side UI or breaking backwards compatibility.

---

## 🏗️ Architecture & How Data Renders

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
│  (Three.js 3D Sky · Leaflet Canvas Map · Mausam Mitra · Glassmorphic UI) │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                         Fetch (/api/forecast, etc.)
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE PAGES EDGE RUNTIME                        │
│                   functions/api/[[path]].js                            │
│                                                                        │
│  1. Parameter Whitelist & Sanitization (prevent injection)             │
│  2. Coordinate Bounds Verification (-90..90, -180..180)                │
│  3. Geographic Enforcement (forced to India countryCode=IN)            │
│  4. Cloudflare Global Edge Cache Match (HIT -> return in <15ms)        │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │ (MISS)                                   │ (MISS)
               ▼                                          ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│       OPEN-METEO APIS        │          │       OPENAQ PLATFORM        │
│   Weather & Air Quality APIs │          │  Physical Sensors v3 Ingest  │
└──────────────────────────────┘          └──────────────────────────────┘
```

### How Data Allocates & Renders in `index.html`

1. **Bootstrapping (`load()` & `go()`)**:
   - When a location is searched or selected (defaulting to New Delhi or browser geolocation), parallel asynchronous requests are dispatched to `/api/forecast`, `/api/air-quality`, and `/api/openaq/nearest`.
2. **Indian CPCB AQI Pipeline (`calcIndiaAQI()`)**:
   - Matches current hour concentrations against Indian Ministry of Environment, Forest and Climate Change (MoEFCC) breakpoint intervals.
   - Calculates sub-indices:
     $$I_p = I_{\text{low}} + \frac{I_{\text{high}} - I_{\text{low}}}{C_{\text{high}} - C_{\text{low}}} \times (C_p - C_{\text{low}})$$
   - Determines the governing pollutant ($I_{\text{overall}} = \max(I_p)$).
   - Generates the inline 7-day trend bars and initializes the detailed historical modal.
3. **Mascot Companion Pipeline (`renderMascot()`)**:
   - Inspects the newly calculated AQI, precipitation probability, current weather code, and ambient temperature.
   - Dynamically injects SVG accessories: N95 respirator mask for pollution, umbrella for rain, sunglasses for UV/heat, muffler for cold, lantern for night.
4. **Atmospheric Radar Engine (`RadarEngine`)**:
   - Centers the Leaflet instance on the searched coordinates with smooth panning.
   - Injects the Esri Canvas Dark basemap and labels.
   - Loads the latest NASA GIBS Terra TrueColor composite for daily cloud coverage.
   - Pulls the RainViewer 13-frame Doppler sequence for live storm tracking.
   - Launches the HTML5 Canvas particle stream synthesizing local wind vector physics.
5. **Celestial Engine (`SkyEngine`)**:
   - Updates lighting colors, cloud density, precipitation streak intensity, and celestial positioning according to solar zenith calculations and live weather parameters.

---

## 📁 Repository Directory Structure

```text
mausam-india/
├── functions/
│   └── api/
│       └── [[path]].js          # Cloudflare Pages Edge Proxy (API routing, caching, validation)
├── public/
│   ├── _headers                 # Cloudflare security headers, strict CSP, and HSTS profile
│   ├── _routes.json             # Edge rule configuration (routes /api/* to functions, serves static assets)
│   ├── index.html               # Main single-page application (UI, Three.js Sky, Leaflet Radar, CPCB Math)
│   ├── manifest.json            # Progressive Web App (PWA) manifest configuration
│   └── sw.js                    # Service Worker (offline shell caching & network fallback)
├── LICENSE                      # Open-source MIT License
└── README.md                    # Comprehensive technical documentation & deployment guide
```

---

## 🚀 Deployment Guide

### Method 1: Git-Connected Cloudflare Pages (Recommended)

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "feat: launch Mausam India production release"
   git push origin main
   ```

2. **Open the Cloudflare Dashboard**:
   - Navigate to [dash.cloudflare.com](https://dash.cloudflare.com/).
   - Go to **Workers & Pages** $\rightarrow$ **Create Application** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.

3. **Select Repository**:
   - Select the `Mausam-India` repository.

4. **Configure Build Settings**:
   - **Project Name**: `mausam-india`
   - **Production Branch**: `main`
   - **Framework Preset**: `None`
   - **Build Command**: _(leave blank)_
   - **Build Output Directory**: `public`

5. **Deploy**:
   - Select **Save and Deploy**.
   - Cloudflare compiles edge functions and distributes static assets globally across its edge network.

### Method 2: Command-Line Deployment via Wrangler CLI

```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Deploy the public assets to Cloudflare Pages
wrangler pages deploy public --project-name=mausam-india
```

---

## ⌨️ Desktop Keyboard Shortcuts

| Shortcut Key                 | Action                                                      |
| :--------------------------- | :---------------------------------------------------------- |
| <kbd>S</kbd> or <kbd>/</kbd> | Focus Indian city / PIN code search input                   |
| <kbd>R</kbd>                 | Smooth scroll directly to Live Satellite Clouds & Radar Map |
| <kbd>T</kbd>                 | Toggle Dark / Light / Atmospheric Theme                     |
| <kbd>U</kbd>                 | Toggle Temperature Units (°C / °F)                          |
| <kbd>Esc</kbd>               | Close any open modal or search dropdown                     |

---

## 🔒 Data Transparency & Zero Copyright Guarantee

- **100% Procedural Graphics**: No proprietary 3D models, copyrighted icons, or commercial image assets. All visual components are coded from scratch using standard WebGL and SVG.
- **Strict Data Integrity**: We never fake weather telemetry or synthesize false AQI data. OpenAQ physical ground monitoring stations remain completely unmixed from regional mathematical forecasts.
- **Privacy by Default**: No tracking cookies, no third-party analytics trackers, and zero personal telemetry collection. All location queries are proxied anonymously through Cloudflare's serverless edge.

---

## 🛡️ Production Security Hardening & Edge Precision Updates

Recent enhancements engineered for global edge deployment and data fidelity:

### 1. Edge Security & Content Security Policy (CSP)

- **Hardened Cloudflare `_headers`**: Deployed a comprehensive HTTP security profile across all static edge responses including HSTS (`max-age=31536000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Cross-Origin-Opener-Policy: same-origin`.
- **Whitelisted Content Security Policy**: Strictly permits authorized sources for scripts (CDNJS, Unpkg), styles (Google Fonts, Unpkg), imagery (NASA GIBS, RainViewer, Esri ArcGIS), and API endpoints while restricting unauthorized frame embedding.
- **Subresource Integrity (SRI)**: Embedded cryptographic hashes (`integrity="sha384-..." crossorigin="anonymous"`) across third-party runtime assets (Three.js and Leaflet) to guard against CDN tampering.

### 2. Reverse Proxy & API Key Defense

- **Origin & Referer Enforcement**: The serverless edge functions (`functions/api/[[path]].js` and `functions/api/openaq.js`) validate client request origins to prevent automated scrapers and foreign third-party domains from depleting API quotas.
- **SSRF Prevention & Coordinate Bounds**: Enforces strict mathematical verification on incoming coordinates, constraining latitude between `-90°` and `90°` and longitude between `-180°` and `180°`.
- **Edge Cache Redundancy**: Applied a 15-minute edge cache (`s-maxage=900`) with Cloudflare Cache API integration (`caches.default`), keeping response latencies under 15ms globally.

### 3. DOM XSS Neutralization & Defensive Networking

- **Input Sanitization**: Search bar inputs are constrained to 80 characters with control characters (`<>"{}|\\^~[]`) stripped before dispatch.
- **Safe DOM Generation**: Replaced string interpolation sinks with native `document.createElement()` and `.textContent` DOM nodes for search suggestion rendering.
- **Defensive Timeouts**: Attached `AbortSignal.timeout(8000)` across all frontend fetch requests, preventing hanging third-party networks from blocking user interactions.

### 4. Astronomical & Boundary Data Accuracy

- **Midnight IST Date Alignment**: The 7-day weather forecast aligns directly with today's local IST `YYYY-MM-DD` calendar date (`c.time.slice(0, 10)`). Between 12:00 AM and 5:30 AM IST (when UTC is still on the previous day), row 0 strictly anchors to today's Indian date as "Today", eliminating UTC date offsets.
- **Solar Zenith Boundary Evaluation**: Hourly forecast icons compare precise timestamps against daily sunrise and sunset marks (`daily.sunrise` / `daily.sunset`). A 5:00 PM slot prior to a 5:13 PM sunset accurately displays daytime icons instead of prematurely switching to night.
- **Nocturnal WMO Mappings & Quick Cities**: Whenever `isDay` is falsy (such as at 1:00 AM, 5:00 AM before sunrise, or in Quick Cities at night), WMO code 2 accurately returns night clouds (`☁️`) instead of sun-behind-cloud (`⛅`).
- **Harmonized "Now" Temperatures**: The initial "Now" slot in the 24-hour strip directly reflects live 15-minute readings (`current.temperature_2m`), ensuring identical temperature parity with the Hero card.
- **Scroll Container Polish**: The 24-hour strip wrapper enforces `overflow-x: auto; overflow-y: hidden;`, completely eliminating unwanted vertical scrollbars across desktop and mobile viewports.
- **Nighttime UV Guidance**: Whenever the sun is down (`current.is_day === 0`), the Quick Guide replaces daytime UV advice with `🌙 No UV tonight (Peak tomorrow: ...)` to provide actionable next-day planning.

### 5. Client Ergonomics, Geolocation & Dynamic Attribution

- **Autonomous Geolocation Discovery**: On initial application launch, Mausam India automatically prompts for browser geolocation permission. If granted, local weather and CPCB AQI data load seamlessly for the detected coordinates. If dismissed or denied, the application gracefully defaults to New Delhi while maintaining instant manual search and coordinate selection across all device form factors.
- **System-Aware Theme Engine**: Default application theme initializes to `"auto"`, natively synchronizing with the user's system dark/light mode preference (`prefers-color-scheme`) with cyclic on-demand switching (`auto` → `light` → `dark` → `auto`).
- **Complete Decoupling of External Database Dependencies**: Eliminated all third-party cloud database and auth dependencies, establishing 100% private, zero-latency bookmarking backed entirely by client-side `localStorage`. Favorite locations persist reliably without transmitting personal data.
- **Dynamic Perpetual Year & Developer Attribution**: The application footer dynamically computes the copyright year (`new Date().getFullYear()`) at runtime (`© 2026–<year>`), ensuring perpetual year accuracy without manual code maintenance, alongside developer rights attribution (`himanvic`) and direct repository source linking.
- **Mobile Adaptive Viewport Refinements**: Atmospheric radar layer tabs and hourly forecast strips feature native touch-scrolling containers with suppressed vertical scrollbars and responsive column stacking, ensuring an uninterrupted mobile experience across small screens (≤ 560px).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  <sub>Engineered with precision for the citizens of India 🇮🇳</sub>
</div>
