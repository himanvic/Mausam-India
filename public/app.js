const $ = (s) => document.querySelector(s),
        RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
      const ls = {
        g: (k) => {
          try {
            return localStorage.getItem(k);
          } catch {
            return null;
          }
        },
        s: (k, v) => {
          try {
            localStorage.setItem(k, v);
          } catch {}
        },
      };
      const S = {
        loc: JSON.parse(ls.g("loc") || "null") || {
          n: "Delhi",
          la: 28.61,
          lo: 77.21,
        },
        u: ls.g("u") || "c",
        th: ["auto", "light", "dark"].includes(ls.g("th")) ? ls.g("th") : "auto",
        fav: JSON.parse(ls.g("fav") || "[]"),
      };
      // Replace this placeholder with your actual public Mausam India GitHub repository URL.
      const GITHUB_REPO_URL = "https://github.com/himanvic/Mausam-India";
      let D,
        A,
        CT,
        O = null,
        night = 0,
        mode = "clear",
        dark = 0,
        last = 0;
      const CITIES = [
        ["Delhi", 28.61, 77.21],
        ["Mumbai", 19.08, 72.88],
        ["Bengaluru", 12.97, 77.59],
        ["Kolkata", 22.57, 88.36],
        ["Chennai", 13.08, 80.27],
        ["Hyderabad", 17.39, 78.49],
        ["Pune", 18.52, 73.86],
        ["Jaipur", 26.91, 75.79],
        ["Srinagar", 34.08, 74.8],
        ["Guwahati", 26.14, 91.74],
        ["Kochi", 9.93, 76.27],
        ["Jamshedpur", 22.8, 86.18],
      ];
      const W = {
        0: ["Clear sky", "☀️", "clear"],
        1: ["Mainly clear", "🌤️", "clear"],
        2: ["Partly cloudy", "⛅", "cloud"],
        3: ["Overcast", "☁️", "cloud"],
        45: ["Foggy", "🌫️", "fog"],
        48: ["Foggy", "🌫️", "fog"],
        51: ["Light drizzle", "🌦️", "rain"],
        53: ["Drizzle", "🌦️", "rain"],
        55: ["Heavy drizzle", "🌧️", "rain"],
        56: ["Freezing drizzle", "🌧️", "rain"],
        57: ["Freezing drizzle", "🌧️", "rain"],
        61: ["Light rain", "🌧️", "rain"],
        63: ["Rain", "🌧️", "rain"],
        65: ["Heavy rain", "🌧️", "rain"],
        66: ["Freezing rain", "🌧️", "rain"],
        67: ["Freezing rain", "🌧️", "rain"],
        71: ["Light snow", "🌨️", "snow"],
        73: ["Snow", "🌨️", "snow"],
        75: ["Heavy snow", "❄️", "snow"],
        77: ["Snow grains", "❄️", "snow"],
        80: ["Light showers", "🌦️", "rain"],
        81: ["Showers", "🌧️", "rain"],
        82: ["Violent showers", "⛈️", "rain"],
        85: ["Snow showers", "🌨️", "snow"],
        86: ["Snow showers", "🌨️", "snow"],
        95: ["Thunderstorm", "⛈️", "storm"],
        96: ["Thunderstorm with hail", "⛈️", "storm"],
        99: ["Thunderstorm with hail", "⛈️", "storm"],
      };
      const SKY = {
        clear: ["#bae6fd", "#fef3c7", "#0b1d3f", "#3b2a6b"],
        cloud: ["#cbd5e1", "#e2e8f0", "#111827", "#334155"],
        rain: ["#94a3b8", "#bfdbfe", "#0b1220", "#1e3a5f"],
        snow: ["#e0f2fe", "#f8fafc", "#1e293b", "#475569"],
        storm: ["#64748b", "#a5b4fc", "#05070f", "#2b1b4a"],
        fog: ["#d1d5db", "#f3f4f6", "#1f2937", "#4b5563"],
      };
      const wi = (c, isDay = 1) => {
        const w = W[c] || W[3];
        const isNight = isDay === 0 || isDay === false || isDay === "0";
        let icon = w[1];
        if (isNight) {
          if (c === 0 || c === 1) icon = "🌙";
          else if (c === 2) icon = "☁️";
          else if (c === 51 || c === 53 || c === 80) icon = "🌧️";
        }
        return { t: w[0], i: icon, k: w[2] };
      };
      const esc = (s) =>
        String(s).replace(
          /[&<>'"`]/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
              "`": "&#96;",
            })[c],
        );
      const T = (c) => Math.round(S.u == "c" ? c : (c * 9) / 5 + 32),
        U = () => "°" + S.u.toUpperCase();
      const hr = (t, m) =>
        new Date(t)
          .toLocaleTimeString(
            "en-IN",
            m
              ? { hour: "numeric", minute: "2-digit", hour12: true }
              : { hour: "numeric", hour12: true },
          )
          .toUpperCase();
      const dn = (d) =>
        ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(d / 45) % 8];
      const j = (u) => {
        const signal =
          typeof AbortSignal !== "undefined" && AbortSignal.timeout
            ? AbortSignal.timeout(8000)
            : undefined;
        return fetch(u, { signal }).then((r) => {
          if (!r.ok) throw Error(r.status);
          return r.json();
        });
      };
      // When opened locally, call Open-Meteo directly so previewing the HTML still works.
      // On a deployed HTTP(S) site, use Cloudflare Pages Functions for response caching.
      const LOCAL_PREVIEW =
        location.protocol === "file:" ||
        (["localhost", "127.0.0.1", "::1"].includes(location.hostname) &&
          location.port !== "8788");
      const API = LOCAL_PREVIEW
        ? "https://api.open-meteo.com/v1/forecast?"
        : "/api/forecast?";
      const AQU = LOCAL_PREVIEW
        ? "https://air-quality-api.open-meteo.com/v1/air-quality?"
        : "/api/air-quality?";
      const GEO = LOCAL_PREVIEW
        ? "https://geocoding-api.open-meteo.com/v1/search?"
        : "/api/geocoding?";
      const OPENAQ_API = LOCAL_PREVIEW ? null : "/api/openaq/nearest?";

      async function loadOpenAQStation(lat, lon) {
        if (!OPENAQ_API)
          return {
            available: false,
            status: "local_preview",
            reason:
              "OpenAQ station readings load through the deployed Cloudflare Pages Function. A local file preview cannot access the server-side API secret.",
          };
        try {
          const signal =
            typeof AbortSignal !== "undefined" && AbortSignal.timeout
              ? AbortSignal.timeout(5000)
              : undefined;
          const response = await fetch(
            `${OPENAQ_API}latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&radius=25000`,
            {
              headers: { accept: "application/json" },
              cache: "no-store",
              signal,
            },
          );
          const payload = await response.json().catch(() => ({}));
          if (!response.ok)
            return {
              available: false,
              status: payload.status || "error",
              reason:
                payload.error ||
                `OpenAQ station request failed (HTTP ${response.status}).`,
            };
          return payload;
        } catch (_) {
          return {
            available: false,
            status: "error",
            reason:
              "Could not reach the OpenAQ station service. Weather forecasts continue to work.",
          };
        }
      }
      function renderOpenAQStationPanel(data) {
        if (!data || data.status === "loading") {
          return `<details class="openaq-panel"><summary><span>📡 OpenAQ station readings · not an AQI</span><span class="openaq-state" style="opacity:0.75">SCANNING STATIONS…</span></summary><div class="openaq-body"><p class="openaq-station-meta">Checking nearby physical CAAQMS air quality monitoring stations within 25 km in the background…</p><p class="openaq-note">The AQI card above is a model-based estimate using Indian CPCB breakpoints. Independent physical ground station readings load asynchronously here.</p></div></details>`;
        }
        const status = data?.status || "unavailable";
        if (!data?.available) {
          const labels = {
            local_preview: "DEPLOYED SITE ONLY",
            not_configured: "API KEY NEEDED",
            no_station: "NO NEARBY STATION",
            stale: "NO RECENT READINGS",
            error: "TEMPORARILY UNAVAILABLE",
          };
          const label = labels[status] || "NOT AVAILABLE";
          const reason =
            data?.reason ||
            "No suitable OpenAQ station readings are available within 25 km of this location.";
          return `<details class="openaq-panel"><summary><span>📡 OpenAQ station readings · not an AQI</span><span class="openaq-state">${label}</span></summary><div class="openaq-body"><p class="openaq-station-meta">${esc(reason)}</p><p class="openaq-note">The AQI card above is a model-based estimate using Indian CPCB breakpoints. These independent station readings are not used in that number. When a suitable station has readings, they will appear here as measured pollutant concentrations—not as a composite AQI.</p></div></details>`;
        }
        const station = data.station || {},
          readings = Array.isArray(data.measurements) ? data.measurements : [];
        const stale = Number(station.age_hours) > 24;
        const freshness = station.freshness_status || "Latest available";
        const stamp =
          station.latest_at_local ||
          station.latest_at ||
          "Timestamp unavailable";
        const distance = Number.isFinite(Number(station.distance_km))
          ? `${Number(station.distance_km).toFixed(1)} km away`
          : "distance unavailable";
        const owner = [station.owner_name, station.provider_name]
          .filter(Boolean)
          .join(" · ");
        const tiles = readings.length
          ? readings
              .map(
                (p) =>
                  `<div class="openaq-reading"><small>${esc(p.label || p.key || "Pollutant")}</small><strong>${Number.isFinite(Number(p.value)) ? Number(p.value).toLocaleString("en-IN", { maximumFractionDigits: 3 }) : "—"}</strong><span>${esc(p.unit || "unit not supplied")} · ${esc(p.age_label || "time unavailable")}</span></div>`,
              )
              .join("")
          : '<p class="openaq-station-meta">The station was found, but it returned no supported pollutant measurements.</p>';
        return `<details class="openaq-panel"><summary><span>📡 OpenAQ station readings · not an AQI</span><span class="openaq-state ${stale ? "openaq-stale" : "openaq-fresh"}">${esc(freshness.toUpperCase())}</span></summary><div class="openaq-body"><p class="openaq-station-meta"><strong>${esc(station.name || "OpenAQ station")}</strong> · ${esc(distance)}<br>Latest reported reading: ${esc(stamp)}${owner ? `<br>${esc(owner)}` : ""}${station.is_monitor ? " · Monitor" : ""}</p><div class="openaq-reading-grid">${tiles}</div><p class="openaq-note">Source: OpenAQ v3 · measured pollutant concentrations from this named station, shown in each sensor’s reported units. These readings are not a composite AQI and are not used to calculate the model estimate above. Pollutant readings can have different timestamps, and a station can differ from the model grid or your exact location—so the numbers are not a like-for-like comparison. <a href="https://explore.openaq.org/" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline">Explore OpenAQ</a>.</p></div></details>`;
      }

      
      /* ==========================================================================
         Mausam India — High-Performance Procedural 3D WebGL Sky Engine (Three.js)
         100% Procedural Math & Shaders. Zero external texture files. Zero copyright.
         ========================================================================== */
      const SkyEngine = (() => {
        let renderer, scene, camera;
        let sunGroup, sunSprite, sunRaysSprite, sunLight;
        let moonGroup, moonSprite;
        let starField, starMat;
        let cloudGroup, clouds = [];
        let rainSystem, rainGeo, rainMat, rainCoords;
        let mistGroup, mistPlanes = [];
        let lightningLine, lightningGeo, lightningMat;
        let lightningTimer = 0, isFlashing = false;
        let ambientLight;
        let currentMode = "clear", isNight = false, isDarkTheme = false;
        let animId = null, lastTime = performance.now();
        let isInitialized = false;

        function generateTexture(w, h, drawFn) {
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          drawFn(c.getContext("2d"), w, h);
          const tex = new THREE.CanvasTexture(c);
          tex.needsUpdate = true;
          return tex;
        }

        const textures = {};

        function initTextures() {
          // 1. Soft Cloud Puff Texture
          textures.cloud = generateTexture(128, 128, (ctx, w, h) => {
            const g = ctx.createRadialGradient(w/2, h/2, 4, w/2, h/2, w/2);
            g.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            g.addColorStop(0.3, "rgba(240, 245, 255, 0.65)");
            g.addColorStop(0.65, "rgba(220, 230, 245, 0.2)");
            g.addColorStop(1, "rgba(200, 215, 235, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
          });

          // 2. Radiant Sun Glow Texture
          textures.sunGlow = generateTexture(256, 256, (ctx, w, h) => {
            const g = ctx.createRadialGradient(w/2, h/2, 6, w/2, h/2, w/2);
            g.addColorStop(0, "rgba(255, 255, 255, 1)");
            g.addColorStop(0.18, "rgba(254, 240, 138, 0.95)");
            g.addColorStop(0.45, "rgba(251, 146, 60, 0.45)");
            g.addColorStop(0.75, "rgba(234, 88, 12, 0.12)");
            g.addColorStop(1, "rgba(234, 88, 12, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
          });

          // 3. Rotating Sun Rays Texture
          textures.sunRays = generateTexture(256, 256, (ctx, w, h) => {
            ctx.save();
            ctx.translate(w/2, h/2);
            ctx.strokeStyle = "rgba(255, 220, 130, 0.25)";
            ctx.lineWidth = 4;
            for (let i = 0; i < 16; i++) {
              ctx.rotate(Math.PI / 8);
              ctx.beginPath();
              ctx.moveTo(18, 0);
              ctx.lineTo(w/2 - 6, 0);
              ctx.stroke();
            }
            ctx.restore();
          });

          // 4. Luminous Moon & Halo Texture
          textures.moon = generateTexture(128, 128, (ctx, w, h) => {
            const g = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w/2);
            g.addColorStop(0, "rgba(255, 255, 245, 0.98)");
            g.addColorStop(0.28, "rgba(224, 238, 255, 0.85)");
            g.addColorStop(0.6, "rgba(186, 215, 250, 0.22)");
            g.addColorStop(1, "rgba(140, 180, 230, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
          });

          // 5. Soft Mist / Fog Texture
          textures.mist = generateTexture(256, 128, (ctx, w, h) => {
            const g = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w/2);
            g.addColorStop(0, "rgba(255, 255, 255, 0.4)");
            g.addColorStop(0.5, "rgba(230, 240, 255, 0.18)");
            g.addColorStop(1, "rgba(210, 225, 245, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
          });
        }

        function init(canvas) {
          if (!canvas || typeof THREE === "undefined") return false;
          if (!state.cloudColor) {
            state.cloudColor = new THREE.Color(0xffffff);
            state.targetCloudColor = new THREE.Color(0xffffff);
          }
          const w = window.innerWidth, h = window.innerHeight;

          try {
            renderer = new THREE.WebGLRenderer({
              canvas,
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setSize(w, h);
          } catch (e) {
            console.warn("WebGL initialization failed, falling back to 2D canvas", e);
            return false;
          }

          scene = new THREE.Scene();
          camera = new THREE.PerspectiveCamera(55, w / h, 1, 1000);
          camera.position.z = 100;

          ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
          scene.add(ambientLight);

          initTextures();
          initSun();
          initMoonAndStars();
          initClouds();
          initRain();
          initMist();
          initLightning();

          window.addEventListener("resize", onWindowResize);
          window.addEventListener("mousemove", (e) => {
            if (!camera || window.innerWidth < 900) return;
            const targetX = ((e.clientX - window.innerWidth / 2) / window.innerWidth) * 12;
            const targetY = -((e.clientY - window.innerHeight / 2) / window.innerHeight) * 8;
            camera.position.x += (targetX - camera.position.x) * 0.05;
            camera.position.y += (targetY - camera.position.y) * 0.05;
          });
          document.addEventListener("visibilitychange", onVisibilityChange);

          isInitialized = true;
          lastTime = performance.now();
          start();
          return true;
        }

        function initSun() {
          sunGroup = new THREE.Group();
          sunGroup.position.set(55, 38, -60);

          const matGlow = new THREE.SpriteMaterial({
            map: textures.sunGlow,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
          });
          sunSprite = new THREE.Sprite(matGlow);
          sunSprite.scale.set(65, 65, 1);
          sunGroup.add(sunSprite);

          const matRays = new THREE.SpriteMaterial({
            map: textures.sunRays,
            color: 0xffe082,
            transparent: true,
            blending: THREE.AdditiveBlending,
          });
          sunRaysSprite = new THREE.Sprite(matRays);
          sunRaysSprite.scale.set(95, 95, 1);
          sunGroup.add(sunRaysSprite);

          sunLight = new THREE.PointLight(0xffedd5, 1.2, 350);
          sunGroup.add(sunLight);

          scene.add(sunGroup);
        }

        function initMoonAndStars() {
          moonGroup = new THREE.Group();
          moonGroup.position.set(-52, 40, -65);

          const matMoon = new THREE.SpriteMaterial({
            map: textures.moon,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
          });
          moonSprite = new THREE.Sprite(matMoon);
          moonSprite.scale.set(40, 40, 1);
          moonGroup.add(moonSprite);
          moonGroup.visible = false;
          scene.add(moonGroup);

          const count = 1200;
          const positions = new Float32Array(count * 3);
          for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 450;
            positions[i * 3 + 1] = Math.random() * 220 - 40;
            positions[i * 3 + 2] = -50 - Math.random() * 250;
          }
          const starGeo = new THREE.BufferGeometry();
          starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          starMat = new THREE.PointsMaterial({
            color: 0xe0e7ff,
            size: 1.8,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
          });
          starField = new THREE.Points(starGeo, starMat);
          scene.add(starField);
        }

        function initClouds() {
          cloudGroup = new THREE.Group();
          const count = 18;
          const mat = new THREE.SpriteMaterial({
            map: textures.cloud,
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
          });

          for (let i = 0; i < count; i++) {
            const sprite = new THREE.Sprite(mat.clone());
            const z = -40 - Math.random() * 110;
            const x = (Math.random() - 0.5) * 320;
            const y = Math.random() * 70 - 10;
            const scale = 55 + Math.random() * 65;
            sprite.position.set(x, y, z);
            sprite.scale.set(scale * 1.5, scale, 1);
            sprite.userData = {
              speed: 0.02 + Math.random() * 0.04,
              baseScale: scale,
              baseY: y,
              wobbleOffset: Math.random() * Math.PI * 2,
            };
            clouds.push(sprite);
            cloudGroup.add(sprite);
          }
          scene.add(cloudGroup);
        }

        function initRain() {
          const count = 2200;
          rainCoords = new Float32Array(count * 6);
          const velocities = [];

          for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 260;
            const y = Math.random() * 180 - 60;
            const z = -20 - Math.random() * 110;
            const len = 3.5 + Math.random() * 4.5;
            const speed = 2.8 + Math.random() * 2.5;

            rainCoords[i * 6] = x;
            rainCoords[i * 6 + 1] = y;
            rainCoords[i * 6 + 2] = z;

            rainCoords[i * 6 + 3] = x - 0.8;
            rainCoords[i * 6 + 4] = y + len;
            rainCoords[i * 6 + 5] = z;

            velocities.push({ x, y, z, len, speed });
          }

          rainGeo = new THREE.BufferGeometry();
          rainGeo.setAttribute("position", new THREE.BufferAttribute(rainCoords, 3));
          rainMat = new THREE.LineBasicMaterial({
            color: 0x93c5fd,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
          });
          rainSystem = new THREE.LineSegments(rainGeo, rainMat);
          rainSystem.userData = { velocities };
          scene.add(rainSystem);
        }

        function initMist() {
          mistGroup = new THREE.Group();
          const count = 7;
          const mat = new THREE.SpriteMaterial({
            map: textures.mist,
            color: 0xf1f5f9,
            transparent: true,
            opacity: 0,
          });

          for (let i = 0; i < count; i++) {
            const sprite = new THREE.Sprite(mat.clone());
            const x = (Math.random() - 0.5) * 240;
            const y = Math.random() * 50 - 30;
            const z = -20 - Math.random() * 80;
            const scale = 110 + Math.random() * 100;
            sprite.position.set(x, y, z);
            sprite.scale.set(scale * 2.2, scale * 0.7, 1);
            sprite.userData = {
              speed: 0.015 + Math.random() * 0.02,
              baseY: y,
              offset: Math.random() * Math.PI * 2,
            };
            mistPlanes.push(sprite);
            mistGroup.add(sprite);
          }
          scene.add(mistGroup);
        }

        function initLightning() {
          lightningGeo = new THREE.BufferGeometry();
          lightningMat = new THREE.LineBasicMaterial({
            color: 0xf0f9ff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
          });
          lightningLine = new THREE.Line(lightningGeo, lightningMat);
          lightningLine.visible = false;
          scene.add(lightningLine);
        }

        function triggerLightningStrike() {
          if (currentMode !== "storm" || isFlashing) return;
          isFlashing = true;

          const points = [];
          const startX = (Math.random() - 0.5) * 120;
          const startY = 85;
          const startZ = -45;
          points.push(new THREE.Vector3(startX, startY, startZ));

          const segments = 9;
          let curX = startX, curY = startY;
          for (let i = 1; i <= segments; i++) {
            curY -= 15 + Math.random() * 5;
            curX += (Math.random() - 0.5) * 22;
            points.push(new THREE.Vector3(curX, curY, startZ));
          }

          lightningGeo.setFromPoints(points);
          lightningLine.visible = true;
          lightningMat.opacity = 1;

          const originalAmbient = ambientLight.intensity;
          ambientLight.intensity = 3.2;

          setTimeout(() => {
            ambientLight.intensity = 0.5;
            lightningLine.visible = false;
            setTimeout(() => {
              ambientLight.intensity = 2.4;
              lightningLine.visible = true;
              setTimeout(() => {
                ambientLight.intensity = originalAmbient;
                lightningLine.visible = false;
                isFlashing = false;
              }, 60);
            }, 50);
          }, 70);
        }

        const state = {
          sunOpacity: 1, targetSunOpacity: 1,
          moonOpacity: 0, targetMoonOpacity: 0,
          starOpacity: 0, targetStarOpacity: 0,
          cloudOpacity: 0.2, targetCloudOpacity: 0.2,
          rainOpacity: 0, targetRainOpacity: 0,
          mistOpacity: 0, targetMistOpacity: 0,
          cloudColor: typeof THREE !== "undefined" ? new THREE.Color(0xffffff) : null,
          targetCloudColor: typeof THREE !== "undefined" ? new THREE.Color(0xffffff) : null,
          ambientIntensity: 0.9, targetAmbientIntensity: 0.9,
        };

        function setWeather(mode, night, darkTheme) {
          currentMode = mode || "clear";
          isNight = Boolean(night);
          isDarkTheme = Boolean(darkTheme);

          if (isNight) {
            state.targetSunOpacity = 0;
            state.targetMoonOpacity = 0.95;
            state.targetStarOpacity = 0.9;
            state.targetAmbientIntensity = 0.45;
          } else {
            state.targetSunOpacity = mode === "clear" ? 1 : mode === "cloud" ? 0.6 : 0.1;
            state.targetMoonOpacity = 0;
            state.targetStarOpacity = 0;
            state.targetAmbientIntensity = 0.95;
          }

          if (mode === "clear") {
            state.targetCloudOpacity = isNight ? 0.08 : 0.2;
            state.targetRainOpacity = 0;
            state.targetMistOpacity = 0;
            state.targetCloudColor.setHex(isNight ? 0x334155 : 0xffffff);
          } else if (mode === "cloud") {
            state.targetCloudOpacity = 0.75;
            state.targetRainOpacity = 0;
            state.targetMistOpacity = 0;
            state.targetCloudColor.setHex(isNight ? 0x1e293b : 0xe2e8f0);
          } else if (mode === "rain") {
            state.targetCloudOpacity = 0.9;
            state.targetRainOpacity = 0.85;
            state.targetMistOpacity = 0.15;
            state.targetCloudColor.setHex(0x334155);
            state.targetAmbientIntensity = 0.6;
          } else if (mode === "storm") {
            state.targetCloudOpacity = 0.95;
            state.targetRainOpacity = 1.0;
            state.targetMistOpacity = 0.25;
            state.targetCloudColor.setHex(0x1e1b4b);
            state.targetAmbientIntensity = 0.4;
          } else if (mode === "fog") {
            state.targetCloudOpacity = 0.4;
            state.targetRainOpacity = 0;
            state.targetMistOpacity = 0.8;
            state.targetCloudColor.setHex(0xcfd8dc);
            state.targetAmbientIntensity = 0.7;
          }

          if (moonGroup) moonGroup.visible = isNight;
        }

        function updatePhysics(dt, now) {
          const lerpFactor = 0.04;
          state.sunOpacity += (state.targetSunOpacity - state.sunOpacity) * lerpFactor;
          state.moonOpacity += (state.targetMoonOpacity - state.moonOpacity) * lerpFactor;
          state.starOpacity += (state.targetStarOpacity - state.starOpacity) * lerpFactor;
          state.cloudOpacity += (state.targetCloudOpacity - state.cloudOpacity) * lerpFactor;
          state.rainOpacity += (state.targetRainOpacity - state.rainOpacity) * lerpFactor;
          state.mistOpacity += (state.targetMistOpacity - state.mistOpacity) * lerpFactor;
          state.ambientIntensity += (state.targetAmbientIntensity - state.ambientIntensity) * lerpFactor;
          state.cloudColor.lerp(state.targetCloudColor, lerpFactor);

          if (!isFlashing) {
            ambientLight.intensity = state.ambientIntensity;
          }

          if (sunGroup) {
            sunSprite.material.opacity = state.sunOpacity;
            sunRaysSprite.material.opacity = state.sunOpacity * 0.75;
            sunRaysSprite.material.rotation += 0.0018;
            const pulse = 1.0 + Math.sin(now * 0.0018) * 0.04;
            sunSprite.scale.set(65 * pulse, 65 * pulse, 1);
            sunGroup.visible = state.sunOpacity > 0.01;
          }

          if (moonSprite) moonSprite.material.opacity = state.moonOpacity;
          if (starMat) starMat.opacity = state.starOpacity;

          clouds.forEach((cloud) => {
            cloud.position.x += cloud.userData.speed;
            cloud.position.y = cloud.userData.baseY + Math.sin(now * 0.001 + cloud.userData.wobbleOffset) * 2;
            if (cloud.position.x > 180) cloud.position.x = -180;
            cloud.material.opacity = state.cloudOpacity;
            cloud.material.color.copy(state.cloudColor);
          });

          if (rainSystem && state.rainOpacity > 0.01) {
            rainMat.opacity = state.rainOpacity;
            const vels = rainSystem.userData.velocities;
            const pos = rainGeo.attributes.position.array;
            const rainCount = vels.length;

            for (let i = 0; i < rainCount; i++) {
              const v = vels[i];
              v.y -= v.speed * (dt * 60);
              v.x -= 0.6 * (dt * 60);

              if (v.y < -65) {
                v.y = 120 + Math.random() * 30;
                v.x = (Math.random() - 0.5) * 260;
              }

              const idx = i * 6;
              pos[idx] = v.x;
              pos[idx + 1] = v.y;
              pos[idx + 2] = v.z;

              pos[idx + 3] = v.x + 0.8;
              pos[idx + 4] = v.y + v.len;
              pos[idx + 5] = v.z;
            }
            rainGeo.attributes.position.needsUpdate = true;
          }

          mistPlanes.forEach((mist) => {
            mist.position.x += mist.userData.speed;
            mist.position.y = mist.userData.baseY + Math.sin(now * 0.0008 + mist.userData.offset) * 3;
            if (mist.position.x > 170) mist.position.x = -170;
            mist.material.opacity = state.mistOpacity;
          });

          if (currentMode === "storm") {
            lightningTimer += dt;
            if (lightningTimer > 4.5 + Math.random() * 4.0) {
              lightningTimer = 0;
              triggerLightningStrike();
            }
          }
        }

        function renderFrame(now) {
          if (!isInitialized) return;
          const dt = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;

          updatePhysics(dt, now);
          renderer.render(scene, camera);
          animId = requestAnimationFrame(renderFrame);
        }

        function start() {
          if (RM) {
            updatePhysics(0.016, performance.now());
            renderer.render(scene, camera);
            return;
          }
          if (!animId) {
            lastTime = performance.now();
            animId = requestAnimationFrame(renderFrame);
          }
        }

        function stop() {
          if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        }

        function onWindowResize() {
          if (!renderer || !camera) return;
          const w = window.innerWidth, h = window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }

        function onVisibilityChange() {
          if (document.hidden) stop();
          else start();
        }

        return {
          init,
          setWeather,
          start,
          stop,
          isReady: () => isInitialized,
        };
      })();

      /* ---------- animated sky ---------- */
      const cv = $("#fx"),
        cx = cv.getContext("2d");
      let P = [],
        CL = [],
        w,
        h,
        fl = 0,
        tk = 0;
      function seed() {
        const r = devicePixelRatio || 1;
        w = innerWidth;
        h = innerHeight;
        cv.width = w * r;
        cv.height = h * r;
        cx.setTransform(r, 0, 0, r, 0, 0);
        const rain = mode == "rain" || mode == "storm",
          snow = mode == "snow",
          n = rain
            ? mode == "storm"
              ? 260
              : Math.min(200, w / 6)
            : snow
              ? 130
              : night && mode != "fog"
                ? mode == "cloud"
                  ? 50
                  : 110
                : 0;
        P = Array.from({ length: n }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          v: rain
            ? 9 + Math.random() * 9
            : snow
              ? 0.6 + Math.random() * 1.4
              : Math.random() * 6.3,
          r: rain
            ? 10 + Math.random() * 14
            : snow
              ? 1.5 + Math.random() * 3
              : 0.5 + Math.random() * 1.5,
        }));
        CL = Array.from(
          {
            length: { clear: 2, cloud: 7, rain: 7, storm: 8, snow: 4, fog: 7 }[
              mode
            ],
          },
          () => ({
            x: Math.random() * w,
            y: Math.random() * h * (mode == "fog" ? 1 : 0.6),
            s: 140 + Math.random() * 180,
            v: 0.12 + Math.random() * 0.25,
          }),
        );
        if (RM) frame();
      }
      function blob(x, y, s, c, a) {
        const g = cx.createRadialGradient(x, y, 0, x, y, s);
        g.addColorStop(0, `rgba(${c},${a})`);
        g.addColorStop(1, `rgba(${c},0)`);
        cx.fillStyle = g;
        cx.beginPath();
        cx.arc(x, y, s, 0, 7);
        cx.fill();
      }
      function frame() {
        cx.clearRect(0, 0, w, h);
        tk += 0.016;
        const wet = mode == "rain" || mode == "storm";
        if (!night && (mode == "clear" || mode == "cloud")) {
          blob(
            w * 0.82,
            h * 0.14,
            280 + Math.sin(tk) * 24,
            "255,200,80",
            mode == "clear" ? 0.6 : 0.28,
          );
          if (mode == "clear") {
            cx.save();
            cx.translate(w * 0.82, h * 0.14);
            cx.rotate(tk * 0.12);
            cx.strokeStyle = "rgba(255,210,90,.16)";
            cx.lineWidth = 14;
            for (let i = 0; i < 12; i++) {
              cx.rotate(Math.PI / 6);
              cx.beginPath();
              cx.moveTo(90, 0);
              cx.lineTo(330, 0);
              cx.stroke();
            }
            cx.restore();
          }
        }
        if (night && mode != "storm") {
          blob(
            w * 0.8,
            h * 0.14,
            200,
            dark ? "200,210,255" : "99,102,241",
            0.28,
          );
          cx.fillStyle = dark ? "#e2e8f0" : "#a5b4fc";
          cx.beginPath();
          cx.arc(w * 0.8, h * 0.14, 30, 0, 7);
          cx.fill();
        }
        const cc = dark ? "148,163,184" : wet ? "71,85,105" : "255,255,255",
          ca = mode == "clear" ? 0.16 : 0.26;
        CL.forEach((c) => {
          blob(c.x, c.y, c.s, cc, ca);
          blob(c.x + c.s * 0.7, c.y + c.s * 0.1, c.s * 0.8, cc, ca);
          blob(c.x - c.s * 0.6, c.y + c.s * 0.15, c.s * 0.7, cc, ca);
          c.x += c.v;
          if (c.x - c.s * 2 > w) c.x = -c.s * 2;
        });
        if (wet) {
          cx.strokeStyle = dark
            ? "rgba(180,200,255,.5)"
            : "rgba(30,64,175,.42)";
          cx.lineWidth = 1.2;
          cx.beginPath();
          P.forEach((p) => {
            cx.moveTo(p.x, p.y);
            cx.lineTo(p.x - 2, p.y + p.r);
            p.y += p.v;
            p.x -= 2;
            if (p.y > h) {
              p.y = -20;
              p.x = Math.random() * (w + 80);
            }
          });
          cx.stroke();
          if (mode == "storm") {
            if (Math.random() < 0.004) fl = 1;
            if (fl > 0) {
              cx.fillStyle = `rgba(255,255,255,${fl * 0.38})`;
              cx.fillRect(0, 0, w, h);
              fl -= 0.06;
            }
          }
        } else if (mode == "snow") {
          cx.fillStyle = dark
            ? "rgba(255,255,255,.85)"
            : "rgba(255,255,255,.95)";
          P.forEach((p) => {
            cx.beginPath();
            cx.arc(p.x, p.y, p.r, 0, 7);
            cx.fill();
            p.y += p.v;
            p.x += Math.sin(tk + p.r) * 0.6;
            if (p.y > h) {
              p.y = -5;
              p.x = Math.random() * w;
            }
          });
        } else if (night) {
          cx.fillStyle = dark ? "#fff" : "#6366f1";
          P.forEach((p) => {
            cx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(tk * 1.5 + p.v));
            cx.beginPath();
            cx.arc(p.x, p.y, p.r, 0, 7);
            cx.fill();
          });
          cx.globalAlpha = 1;
        }
        if (!RM) requestAnimationFrame(frame);
      }

      
      /* ==========================================================================
         Mausam India — Live Rain & Weather Radar Engine (RainViewer + Leaflet)
         100% Free, Safe, Zero API Key. Real-Time Doppler Rain Cloud Animations.
         ========================================================================== */
      const RadarEngine = (() => {
        let map = null;
        let baseLayer = null;
        let labelsLayer = null;
        let satelliteLayer = null;
        let marker = null;
        let frames = [];
        let radarLayers = {};
        let currentIndex = 0;
        let isPlaying = true;
        let playInterval = null;
        let host = "https://tilecache.rainviewer.com";
        let activeTab = "satellite"; // 'wind' | 'satellite' | 'radar'
        let isInitialized = false;

        // Wind Particle Streamline Simulation
        let windCanvas, windCtx, windWidth, windHeight;
        let windAnimId = null;
        let particles = [];
        const particleCount = 420;
        let currentWindSpeed = 12; // km/h
        let currentWindDir = 310;  // degrees

        function init() {
          const mapEl = $("#radarMap");
          if (!mapEl || typeof L === "undefined") return false;

          const lat = S.loc.la || 28.6139;
          const lon = S.loc.lo || 77.209;

          try {
            map = L.map("radarMap", {
              center: [lat, lon],
              zoom: 7,
              minZoom: 4,
              maxZoom: 12,
              zoomControl: true,
              attributionControl: false,
              scrollWheelZoom: false,
            });

            map.on("focus", () => map.scrollWheelZoom.enable());
            map.on("blur", () => map.scrollWheelZoom.disable());

            updateBaseLayer();
            initSatelliteLayer();

            // Pulsing location marker
            const pulseIcon = L.divIcon({
              className: "radar-pulse-icon",
              html: '<div class="radar-pulse-marker"></div>',
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            });
            marker = L.marker([lat, lon], { icon: pulseIcon }).addTo(map);

            initWindCanvas();
            fetchRainViewerFrames();
            setupTabControls();
            setupControls();

            setTimeout(() => {
              if (map) map.invalidateSize();
              resizeWindCanvas();
              switchLayerTab("satellite");
            }, 300);

            isInitialized = true;
            return true;
          } catch (e) {
            console.warn("Atmospheric map initialization error:", e);
            return false;
          }
        }

        function updateBaseLayer() {
          if (!map) return;
          if (baseLayer) map.removeLayer(baseLayer);
          if (labelsLayer) map.removeLayer(labelsLayer);

          const isDark = dark || document.documentElement.dataset.theme === "dark";
          const baseTileUrl = isDark
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
          const labelTileUrl = isDark
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}";

          baseLayer = L.tileLayer(baseTileUrl, {
            maxZoom: 16,
            zIndex: 1,
          }).addTo(map);

          labelsLayer = L.tileLayer(labelTileUrl, {
            maxZoom: 16,
            zIndex: 25,
            opacity: 0.9,
          }).addTo(map);

          if (satelliteLayer && map.hasLayer(satelliteLayer)) satelliteLayer.bringToFront();
          Object.values(radarLayers).forEach((layer) => {
            if (map.hasLayer(layer)) layer.bringToFront();
          });
          if (labelsLayer) labelsLayer.bringToFront();
        }

        function initSatelliteLayer() {
          if (!map) return;
          // NASA GIBS Terra TrueColor (yesterday or today UTC)
          const date = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const nasaUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;

          satelliteLayer = L.tileLayer(nasaUrl, {
            maxZoom: 9,
            minZoom: 1,
            subdomains: ["a", "b", "c"],
            tileSize: 256,
            opacity: 0,
            zIndex: 5,
          });
        }

        // ---------- Windy-Style Wind Particle Streamline Simulation ----------
        function initWindCanvas() {
          windCanvas = document.getElementById("windStreamCanvas");
          if (!windCanvas) return;
          windCtx = windCanvas.getContext("2d");

          resizeWindCanvas();
          map.on("resize move", resizeWindCanvas);

          particles = Array.from({ length: particleCount }, () => createParticle());
          startWindAnimation();
        }

        function resizeWindCanvas() {
          if (!windCanvas || !map) return;
          const size = map.getSize();
          windWidth = windCanvas.width = size.x;
          windHeight = windCanvas.height = size.y;
        }

        function createParticle() {
          return {
            x: Math.random() * (windWidth || 800),
            y: Math.random() * (windHeight || 400),
            age: Math.floor(Math.random() * 60),
            maxAge: 50 + Math.floor(Math.random() * 50),
            speedMult: 0.8 + Math.random() * 0.5,
          };
        }

        function startWindAnimation() {
          if (windAnimId) return;

          function loop() {
            if (!windCtx || !windWidth || !windHeight) {
              windAnimId = requestAnimationFrame(loop);
              return;
            }

            // Subtle trail fade
            windCtx.fillStyle = "rgba(11, 19, 41, 0.12)";
            windCtx.fillRect(0, 0, windWidth, windHeight);

            // Angle in radians (converted from meteorological direction)
            // Wind direction is direction wind comes FROM; travel is direction it blows TO
            const travelAngle = ((currentWindDir + 180) % 360) * (Math.PI / 180);
            const baseVelocity = Math.max(1.2, Math.min(4.8, currentWindSpeed / 7));

            windCtx.lineWidth = 1.6;
            windCtx.lineCap = "round";

            for (let i = 0; i < particles.length; i++) {
              const p = particles[i];
              p.age++;
              if (p.age > p.maxAge || p.x < 0 || p.x > windWidth || p.y < 0 || p.y > windHeight) {
                particles[i] = createParticle();
                continue;
              }

              // Atmospheric wave curvature
              const wave = Math.sin(p.y * 0.008 + p.x * 0.005) * 0.35;
              const angle = travelAngle + wave;
              const speed = baseVelocity * p.speedMult;

              const dx = Math.cos(angle) * speed;
              const dy = Math.sin(angle) * speed;

              // Color gradient by speed
              const alpha = Math.sin((p.age / p.maxAge) * Math.PI);
              windCtx.strokeStyle = activeTab === "wind"
                ? `rgba(56, 189, 248, ${(alpha * 0.85).toFixed(2)})`
                : `rgba(254, 240, 138, ${(alpha * 0.45).toFixed(2)})`;

              windCtx.beginPath();
              windCtx.moveTo(p.x, p.y);
              p.x += dx;
              p.y += dy;
              windCtx.lineTo(p.x, p.y);
              windCtx.stroke();
            }

            windAnimId = requestAnimationFrame(loop);
          }
          loop();
        }

        function setWindParams(speed, dir, locationName) {
          if (Number.isFinite(Number(speed))) currentWindSpeed = Number(speed);
          if (Number.isFinite(Number(dir))) currentWindDir = Number(dir);

          const pill = $("#radarInfoText");
          if (pill) {
            const dirCompass = typeof dn === "function" ? dn(currentWindDir) : "";
            if (activeTab === "wind") {
              pill.textContent = `💨 ${Math.round(currentWindSpeed)} km/h ${dirCompass} · Live Streamlines (${locationName || S.loc.n})`;
            } else if (activeTab === "satellite") {
              pill.textContent = `🛰️ NASA Terra Orbit · Real Clouds (${locationName || S.loc.n})`;
            } else if (activeTab === "radar") {
              pill.textContent = `🌧️ Rain Doppler Scan (${locationName || S.loc.n})`;
            }
          }
        }

        function switchLayerTab(tab) {
          activeTab = tab;
          document.querySelectorAll(".radar-tab").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.layer === tab);
          });

          const timeline = $("#radarTimeline");
          const windCanvasEl = $("#windStreamCanvas");
          const badge = $("#radarBadge");
          const metaNote = $("#radarMetaNote");

          // Reset radar frames opacity
          Object.values(radarLayers).forEach((layer) => {
            if (map && map.hasLayer(layer)) layer.setOpacity(0);
          });

          if (tab === "wind") {
            if (satelliteLayer && map.hasLayer(satelliteLayer)) map.removeLayer(satelliteLayer);
            if (timeline) timeline.style.display = "none";
            if (windCanvasEl) windCanvasEl.style.opacity = "0.95";
            if (badge) badge.textContent = "WIND STREAMLINES";
            if (metaNote) metaNote.textContent = "Animated fluid wind streamlines follow real-time meteorological vectors across India.";
            stopPlayback();
          } else if (tab === "satellite") {
            if (satelliteLayer && !map.hasLayer(satelliteLayer)) {
              satelliteLayer.addTo(map);
            }
            if (satelliteLayer) {
              satelliteLayer.setOpacity(0.85);
              satelliteLayer.bringToFront();
            }
            if (labelsLayer) labelsLayer.bringToFront();
            if (timeline) timeline.style.display = "none";
            if (windCanvasEl) windCanvasEl.style.opacity = "0.35";
            if (badge) badge.textContent = "NASA CLOUD SATELLITE";
            if (metaNote) metaNote.textContent = "True-color Earth orbit satellite photography from NASA Terra MODIS, showing actual clouds over India.";
            stopPlayback();
          } else if (tab === "radar") {
            if (satelliteLayer && map.hasLayer(satelliteLayer)) map.removeLayer(satelliteLayer);
            if (timeline) timeline.style.display = "flex";
            if (windCanvasEl) windCanvasEl.style.opacity = "0";
            if (badge) badge.textContent = "DOPPLER RADAR";
            if (metaNote) metaNote.textContent = "Precipitation radar imagery from RainViewer showing live Doppler sweeps and rain estimates.";
            showFrame(currentIndex);
            startPlayback();
          }

          setWindParams(currentWindSpeed, currentWindDir, S.loc.n);
        }

        function setupTabControls() {
          document.querySelectorAll(".radar-tab").forEach((btn) => {
            btn.onclick = () => switchLayerTab(btn.dataset.layer);
          });
        }

        async function fetchRainViewerFrames() {
          try {
            const signal =
              typeof AbortSignal !== "undefined" && AbortSignal.timeout
                ? AbortSignal.timeout(8000)
                : undefined;
            const res = await fetch(
              "https://api.rainviewer.com/public/weather-maps.json",
              { signal },
            );
            const data = await res.json();
            if (!data || !data.radar) return;

            host = data.host || "https://tilecache.rainviewer.com";
            const past = Array.isArray(data.radar.past) ? data.radar.past : [];
            const nowcast = Array.isArray(data.radar.nowcast) ? data.radar.nowcast : [];
            frames = [...past, ...nowcast];

            if (!frames.length) return;

            frames.forEach((f) => {
              const url = `${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`;
              const layer = L.tileLayer(url, {
                tileSize: 256,
                opacity: 0,
                zIndex: 10,
              });
              radarLayers[f.time] = layer;
            });

            const range = $("#radarRange");
            if (range) {
              range.max = String(frames.length - 1);
              range.value = String(frames.length - 1);
            }

            currentIndex = frames.length - 1;
          } catch (e) {
            console.warn("Could not load RainViewer radar frames:", e);
          }
        }

        function showFrame(index) {
          if (!frames.length || !map || activeTab !== "radar") return;
          const i = Math.max(0, Math.min(index, frames.length - 1));

          frames.forEach((f, idx) => {
            const layer = radarLayers[f.time];
            if (!layer) return;
            if (idx === i) {
              if (!map.hasLayer(layer)) layer.addTo(map);
              layer.setOpacity(0.82);
              if (labelsLayer) labelsLayer.bringToFront();
            } else if (map.hasLayer(layer)) {
              layer.setOpacity(0);
            }
          });

          currentIndex = i;
          const range = $("#radarRange");
          if (range) range.value = String(i);

          const frame = frames[i];
          const date = new Date(frame.time * 1000);
          const timeStr = date.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          const isLatest = i === frames.length - 1;
          const lbl = $("#radarTimeLabel");
          if (lbl) lbl.textContent = isLatest ? `LIVE · ${timeStr}` : timeStr;
        }

        function startPlayback() {
          stopPlayback();
          isPlaying = true;
          const btn = $("#radarPlayBtn");
          if (btn) btn.textContent = "⏸";

          playInterval = setInterval(() => {
            if (!frames.length || activeTab !== "radar") return;
            currentIndex = (currentIndex + 1) % frames.length;
            showFrame(currentIndex);
          }, 1200);
        }

        function stopPlayback() {
          isPlaying = false;
          if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
          }
          const btn = $("#radarPlayBtn");
          if (btn) btn.textContent = "▶";
        }

        function setupControls() {
          const btn = $("#radarPlayBtn");
          if (btn) {
            btn.onclick = () => {
              if (isPlaying) stopPlayback();
              else startPlayback();
            };
          }

          const range = $("#radarRange");
          if (range) {
            range.oninput = (e) => {
              stopPlayback();
              showFrame(Number(e.target.value));
            };
          }
        }

        function updateLocation(lat, lon, name) {
          if (!isInitialized) init();
          if (!map || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return;
          map.flyTo([lat, lon], 7, { duration: 1.2 });
          if (marker) marker.setLatLng([lat, lon]);
          setTimeout(() => {
            if (map) map.invalidateSize();
            resizeWindCanvas();
          }, 400);
        }

        return {
          init,
          updateLocation,
          updateBaseLayer,
          setWindParams,
          isReady: () => isInitialized,
        };
      })();

      /* ---------- theme / units ---------- */
      function theme() {
        dark =
          S.th == "dark" ||
          (S.th == "auto" && matchMedia("(prefers-color-scheme:dark)").matches);
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        $("#th").textContent = { auto: "🌗", light: "☀️", dark: "🌙" }[S.th];
        const p = SKY[mode],
          r = document.documentElement.style;
        r.setProperty("--bg1", p[dark ? 2 : 0]);
        r.setProperty("--bg2", p[dark ? 3 : 1]);
        if (RadarEngine.isReady()) RadarEngine.updateBaseLayer();
        if (SkyEngine.isReady()) {
          SkyEngine.setWeather(mode, night, dark);
        } else {
          seed();
        }
      }
      matchMedia("(prefers-color-scheme:dark)").addEventListener(
        "change",
        () => S.th == "auto" && theme(),
      );
      $("#th").onclick = () => {
        S.th = { auto: "light", light: "dark", dark: "auto" }[S.th];
        ls.s("th", S.th);
        theme();
      };
      $("#un").onclick = () => {
        S.u = S.u == "c" ? "f" : "c";
        ls.s("u", S.u);
        $("#un").textContent = U();
        D && render();
      };

      /* ---------- helpers ---------- */
      function cnt(el, to) {
        if (!el) return;
        const from = +el.dataset.v || 0;
        el.dataset.v = to;
        if (RM) {
          el.textContent = to;
          return;
        }
        const t0 = performance.now();
        (function f(t) {
          const p = Math.min(1, (t - t0) / 1000),
            e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(from + (to - from) * e);
          if (p < 1) requestAnimationFrame(f);
        })(t0);
      }
      function toast(m, r) {
        const t = $("#toast");
        t.innerHTML =
          esc(m) + (r ? '<button type="button" class="toast-retry-btn">Try again</button>' : "");
        const retryBtn = t.querySelector(".toast-retry-btn");
        if (retryBtn) retryBtn.onclick = () => load();
        t.classList.add("on");
        clearTimeout(t._t);
        t._t = setTimeout(() => t.classList.remove("on"), 6000);
      }
      const ring = (p, l) =>
        `<div class="rg"><svg viewBox="0 0 80 80" width="80"><circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" stroke-opacity=".15" stroke-width="8"/><circle class="rc" cx="40" cy="40" r="34" fill="none" stroke-width="8" stroke-linecap="round" stroke-dasharray="${p * 2.136} 214" transform="rotate(-90 40 40)"/></svg><b>${l}</b></div>`;
      const mini = (ic, t, b, x = "", i = 0) =>
        `<div class="card mini ${x}" style="--i:${i}"><h3>${ic} ${t}</h3>${b}</div>`;
      const aqC = (v) =>
        v <= 50
          ? ["Good", "#16a34a"]
          : v <= 100
            ? ["Satisfactory", "#84cc16"]
            : v <= 200
              ? ["Moderate", "#eab308"]
              : v <= 300
                ? ["Poor", "#f97316"]
                : v <= 400
                  ? ["Very Poor", "#ef4444"]
                  : ["Severe", "#7f1d1d"];
      function renderAQIMethodDetails() {
        return `<details class="aqi-method-details"><summary>How to read this India AQI</summary><div class="aqi-method-body"><p><strong>India CPCB category bands:</strong> Good 0–50 · Satisfactory 51–100 · Moderate 101–200 · Poor 201–300 · Very Poor 301–400 · Severe 401–500.</p><p><strong>What this number means:</strong> this is a model-based estimate calculated from Open-Meteo pollutant concentrations using Indian CPCB breakpoint bands. It is <strong>not an official CPCB monitoring-station AQI</strong>.</p><p><strong>Why another app may show a different number:</strong> it may use a different scale (for example, US EPA AQI), a different monitoring station or model grid, another update time, different pollutants, or different averaging windows. Compare numbers only when scale, location, source and time match.</p><p><strong>Averaging windows:</strong> PM2.5, PM10, NO₂ and SO₂ use 24-hour rolling averages; O₃ and CO use 8-hour rolling averages. The pollutant cards show the same rounded concentrations used by their sub-index.</p><p><strong>Coverage limits:</strong> NH₃ (ammonia) and Pb (lead) are not available in this model feed, so this estimate can differ from an official station calculation. OpenAQ readings below are independent station measurements and are <strong>not used to calculate the estimate above</strong>.</p><p class="aqi-method-links"><a href="https://app.cpcbccr.com/ccr_docs/FINAL-REPORT_AQI_.pdf" target="_blank" rel="noopener noreferrer">CPCB methodology ↗</a><span>·</span><a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noopener noreferrer">Open-Meteo data ↗</a></p></div></details>`;
      }
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
          // The displayed concentration is the same rolling mean used by the CPCB sub-index.
          // Open-Meteo CO arrives in µg/m³; convert to mg/m³ before CPCB rounding and interpolation.
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
        // CPCB minimum-data rule: >=3 valid pollutant sub-indices, including PM2.5 or PM10.
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
      function dateOffset(day, offset) {
        const d = new Date(day + "T00:00:00Z");
        d.setUTCDate(d.getUTCDate() + offset);
        return d.toISOString().slice(0, 10);
      }
      function calcIndiaAQIForDay(payload, day) {
        const h = payload && payload.hourly;
        if (!h || !Array.isArray(h.time)) return null;
        const dayIndices = [];
        for (let i = 0; i < h.time.length; i++)
          if (String(h.time[i]).slice(0, 10) === day) dayIndices.push(i);
        if (!dayIndices.length) return null;
        // Daily chart shows the highest valid rolling CPCB-style estimate whose window ends on that date.
        let best = null;
        for (const end of dayIndices) {
          const candidate = calculateCpcbAtEnd(payload, end);
          if (
            candidate &&
            candidate.index_available &&
            (!best || candidate.value > best.value)
          )
            best = candidate;
        }
        return best
          ? {
              value: best.value,
              openEnded: best.openEnded,
              category: best.category,
              prominent_pollutant: best.prominent_pollutant,
            }
          : null;
      }
      
      function renderInline7DayAQI(payload, currentTime) {
        if (!payload || !payload.hourly || !Array.isArray(payload.hourly.time)) {
          return "";
        }
        const today = String(
          currentTime ||
            payload.hourly.time[payload.hourly.time.length - 1] ||
            "",
        ).slice(0, 10);
        const records = Array.from({ length: 7 }, (_, i) => {
          const date = dateOffset(today, i - 6);
          return { date, value: calcIndiaAQIForDay(payload, date) };
        });
        const any = records.some((r) => r.value);
        if (!any) return "";

        const bars = records
          .map((record, i) => {
            const v = record.value;
            const dateObj = new Date(record.date + "T12:00:00Z");
            const dayLabel =
              i === 6
                ? "Today"
                : dateObj.toLocaleDateString("en-IN", {
                    weekday: "short",
                    timeZone: "UTC",
                  });
            const numLabel = dateObj.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              timeZone: "UTC",
            });
            if (!v) {
              return `<div class="aqi-inline-day" title="${record.date}: No sufficient modelled readings"><span class="aqi-inline-num mu">—</span><div class="aqi-inline-bar-wrap"><div class="aqi-inline-bar empty"></div></div><span class="aqi-inline-label">${dayLabel}</span><small class="aqi-inline-date">${numLabel}</small></div>`;
            }
            const [label, color] = aqC(v.value);
            const heightPercent = Math.max(8, Math.min(100, (Math.min(v.value, 500) / 450) * 100));
            const valueLabel = v.openEnded ? "401+" : String(v.value);
            return `<div class="aqi-inline-day ${i === 6 ? "is-today" : ""}" title="${record.date}: AQI ${valueLabel} (${label})">
              <span class="aqi-inline-num" style="color:${color}">${valueLabel}</span>
              <div class="aqi-inline-bar-wrap">
                <div class="aqi-inline-bar" style="height:${heightPercent}%;background:${color};box-shadow: 0 0 10px color-mix(in srgb, ${color} 60%, transparent);animation-delay:${i * 55}ms"></div>
              </div>
              <span class="aqi-inline-label">${dayLabel}</span>
              <small class="aqi-inline-date">${numLabel}</small>
            </div>`;
          })
          .join("");

        return `<div class="aqi-inline-history">
          <div class="aqi-inline-header">
            <div>
              <h3 class="aqi-inline-title">7-day AQI trend</h3>
              <p class="mu" style="font-size:11px;margin-top:2px">Daily peak modelled CPCB estimate</p>
            </div>
            <span class="history-badge">MODEL TREND</span>
          </div>
          <div class="aqi-inline-chart-scroll">
            <div class="aqi-inline-chart" role="img" aria-label="7-day estimated Indian AQI bar chart">
              ${bars}
            </div>
          </div>
        </div>`;
      }

      function renderAQIHistory(payload, currentTime) {
        const target = $("#aqiHistoryContent");
        if (!target) return;
        if (
          !payload ||
          !payload.hourly ||
          !Array.isArray(payload.hourly.time)
        ) {
          target.innerHTML =
            '<div class="history-head"><span class="history-badge">DATA UNAVAILABLE</span></div><p class="history-footnote">Air-quality history could not be loaded for this location. No values are fabricated.</p>';
          return;
        }
        const today = String(
          currentTime ||
            payload.hourly.time[payload.hourly.time.length - 1] ||
            "",
        ).slice(0, 10);
        const records = Array.from({ length: 7 }, (_, i) => {
          const date = dateOffset(today, i - 7);
          return { date, value: calcIndiaAQIForDay(payload, date) };
        });
        const any = records.some((record) => record.value);
        const chart = records
          .map((record, i) => {
            const v = record.value;
            const dateLabel = new Date(
              record.date + "T12:00:00Z",
            ).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              timeZone: "UTC",
            });
            if (!v)
              return `<div class="aqi-history-day" title="Not enough modelled hourly readings for ${record.date}"><span class="aqi-history-number mu">—</span><div class="aqi-history-bar-wrap"></div><span class="aqi-history-date">${dateLabel}</span><span class="aqi-history-category">No data</span></div>`;
            const [label, color] = aqC(v.value),
              barHeight = Math.max(4, (Math.min(v.value, 500) / 500) * 120),
              valueLabel = v.openEnded ? "401+" : String(v.value);
            return `<div class="aqi-history-day" title="${record.date}: ${valueLabel} · ${label}"><span class="aqi-history-number" style="color:${color}">${valueLabel}</span><div class="aqi-history-bar-wrap"><div class="aqi-history-bar" style="height:${barHeight}px;background:${color};animation-delay:${i * 55}ms"></div></div><span class="aqi-history-date">${dateLabel}</span><span class="aqi-history-category">${label}</span></div>`;
          })
          .join("");
        target.innerHTML = `<div class="history-head"><p class="history-lede">Daily peak estimates from modelled pollutant concentrations for the last seven completed days in ${esc(S.loc.n)}</p><span class="history-badge">MODEL DATA · NOT CPCB STATIONS</span></div>${any ? `<div class="history-scroll"><div class="aqi-history-chart" role="img" aria-label="Seven-day estimated Indian AQI bar chart">${chart}</div></div>` : '<p class="history-footnote">There are not enough modelled hourly pollutant readings to calculate a CPCB-style estimate for these days. No values are fabricated.</p>'}<p class="history-footnote">These are estimates calculated from Open-Meteo archived model concentrations, not verified historical readings from CPCB monitoring stations. The CPCB index normally uses eight pollutants; ammonia and lead are not available in this feed, so estimates may differ from official AQI.</p>`;
      }
      const uvL = (v) =>
        v < 3
          ? "Low"
          : v < 6
            ? "Moderate"
            : v < 8
              ? "High"
              : v < 11
                ? "Very high"
                : "Extreme";

      /* ---------- scroll-triggered micro-animations ---------- */
      const scrollRevealObserver =
        !RM && "IntersectionObserver" in window
          ? new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    scrollRevealObserver.unobserve(entry.target);
                  }
                });
              },
              { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
            )
          : null;
      function setupScrollReveal(root = document) {
        const selector =
          ".hc,.dy,.ct,.advice-pill,#det > .mini,.pg > div,.aqi-history-day";
        if (!root || typeof root.querySelectorAll !== "function") return;
        root.querySelectorAll(selector).forEach((el, index) => {
          if (el.dataset.scrollRevealReady === "1") return;
          el.dataset.scrollRevealReady = "1";
          el.classList.add("scroll-reveal-target");
          el.style.setProperty("--scroll-delay", `${(index % 5) * 42}ms`);
          if (scrollRevealObserver) scrollRevealObserver.observe(el);
          else el.classList.add("is-visible");
        });
      }

      let activeLoadToken = 0;

      /* ---------- data ---------- */
      async function load() {
        const loadToken = ++activeLoadToken;
        document.body.classList.add("ld");
        const { la, lo } = S.loc;
        try {
          const [f, a, c] = await Promise.all([
            j(
              `${API}latitude=${la}&longitude=${lo}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=10`,
            ),
            j(
              `${AQU}latitude=${la}&longitude=${lo}&current=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&hourly=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&past_days=7&forecast_days=2&timezone=Asia%2FKolkata`,
            ).catch(() => null),
            CT ||
              j(
                `${API}latitude=${CITIES.map((c) => c[1])}&longitude=${CITIES.map((c) => c[2])}&current=temperature_2m,weather_code,is_day&timezone=Asia%2FKolkata`,
              ).catch(() => null),
          ]);
          if (loadToken !== activeLoadToken) return;
          D = f;
          A = a;
          CT = c;
          O = null;
          last = Date.now();
          render();

          // Fetch physical OpenAQ station readings asynchronously in background
          loadOpenAQStation(la, lo)
            .then((stationData) => {
              if (loadToken !== activeLoadToken) return;
              O = stationData;
              const aqiEl = $("#aqi");
              if (aqiEl) {
                const panel = aqiEl.querySelector(".openaq-panel");
                const panelHtml = renderOpenAQStationPanel(O);
                if (panel) panel.outerHTML = panelHtml;
                else aqiEl.insertAdjacentHTML("beforeend", panelHtml);
              }
            })
            .catch(() => {});
        } catch (e) {
          if (loadToken === activeLoadToken) {
            toast("Couldn’t load the weather. Check your connection.", 1);
          }
        } finally {
          if (loadToken === activeLoadToken) {
            document.body.classList.remove("ld");
          }
        }
      }

      
      function renderMascot(c, d, H, hs, aq, pop, indiaAQI) {
        // Determine state based on AQI and Weather
        let mode = "normal";
        let accessorySVG = "";
        let bubbleText = "Weather looks peaceful today!";
        let tagText = "All Good ✨";
        let tagBg = "rgba(34, 197, 94, 0.2)";
        let tagCol = "#22c55e";

        if (aq != null && aq >= 200) {
          mode = "mask";
          bubbleText = `AQI is ${aq}. Wear your N95 mask outdoors! 😷`;
          tagText = `POLLUTION ALERT · AQI ${aq}`;
          tagBg = "rgba(249, 115, 22, 0.25)";
          tagCol = "#f97316";
          accessorySVG = `
            <g class="accessory-mask">
              <path d="M50 56 Q70 53 90 56 L86 78 Q70 86 54 78 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
              <path d="M70 54 L70 85" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="2 2" />
              <path d="M50 58 Q38 52 35 62" stroke="#cbd5e1" stroke-width="1.4" fill="none" />
              <path d="M90 58 Q102 52 105 62" stroke="#cbd5e1" stroke-width="1.4" fill="none" />
              <circle cx="78" cy="70" r="3.5" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" />
            </g>
          `;
        } else if (pop >= 60 || c.weather_code >= 51 && c.weather_code <= 82) {
          mode = "rain";
          bubbleText = "Rain expected, take an umbrella along! ☔";
          tagText = `RAIN LIKELY · ${pop}%`;
          tagBg = "rgba(59, 130, 246, 0.25)";
          tagCol = "#38bdf8";
          accessorySVG = `
            <g class="accessory-umbrella">
              <path d="M96 52 L96 82 Q96 88 90 88" stroke="#ea580c" stroke-width="3" fill="none" stroke-linecap="round" />
              <path d="M52 36 Q96 8 136 36 Q116 32 96 36 Q76 32 52 36 Z" fill="#ea580c" stroke="#c2410c" stroke-width="2" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))" />
              <circle cx="70" cy="18" r="2.5" fill="#38bdf8" />
              <circle cx="118" cy="15" r="2" fill="#38bdf8" />
            </g>
          `;
        } else if (c.temperature_2m >= 38 || (c.uv_index && c.uv_index >= 6)) {
          mode = "sun";
          bubbleText = "Intense sun out today. Stay hydrated and seek shade! 🧴";
          tagText = "HIGH HEAT / UV ☀️";
          tagBg = "rgba(234, 88, 12, 0.25)";
          tagCol = "#fb923c";
          accessorySVG = `
            <g class="accessory-shades">
              <path d="M48 48 Q58 46 66 50 L64 62 Q55 65 46 60 Z" fill="#0f172a" stroke="#fb923c" stroke-width="1.8" />
              <path d="M74 50 Q82 46 92 48 L94 60 Q85 65 76 62 Z" fill="#0f172a" stroke="#fb923c" stroke-width="1.8" />
              <line x1="66" y1="50" x2="74" y2="50" stroke="#fb923c" stroke-width="2.5" />
              <line x1="50" y1="52" x2="55" y2="58" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round" />
              <line x1="78" y1="52" x2="83" y2="58" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round" />
            </g>
          `;
        } else if (c.temperature_2m <= 12) {
          mode = "cold";
          bubbleText = "Brrr, chilly weather! Bundle up in cozy layers. 🧥";
          tagText = "CHILLY DAY ❄️";
          tagBg = "rgba(147, 197, 253, 0.25)";
          tagCol = "#93c5fd";
          accessorySVG = `
            <g class="accessory-scarf">
              <path d="M44 68 Q70 78 96 68 Q92 82 70 83 Q48 82 44 68 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.8" />
              <path d="M84 76 L86 98 L76 98 L74 78 Z" fill="#dc2626" stroke="#b91c1c" stroke-width="1.8" />
              <line x1="77" y1="98" x2="77" y2="103" stroke="#fecaca" stroke-width="1.5" />
              <line x1="81" y1="98" x2="81" y2="103" stroke="#fecaca" stroke-width="1.5" />
              <line x1="85" y1="98" x2="85" y2="103" stroke="#fecaca" stroke-width="1.5" />
            </g>
          `;
        } else if (!c.is_day) {
          mode = "night";
          bubbleText = "Peaceful starry night. Sleep well! 🌙";
          tagText = "STARLIT NIGHT 🌙";
          tagBg = "rgba(129, 140, 248, 0.25)";
          tagCol = "#a5b4fc";
          accessorySVG = `
            <g class="accessory-lantern">
              <line x1="95" y1="58" x2="108" y2="68" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" />
              <rect x="101" y="66" width="14" height="20" rx="3" fill="#fef08a" stroke="#d97706" stroke-width="1.6" filter="drop-shadow(0 0 10px #fde047)" />
              <polygon points="99,66 117,66 108,60" fill="#b45309" />
              <circle cx="108" cy="76" r="3" fill="#ffffff" />
            </g>
          `;
        }

        const smileSVG = mode !== "mask"
          ? '<path d="M64 63 Q70 70 76 63" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round" />'
          : "";

        return `
          <div class="mascot-speech-bubble" id="mascotBubble">
            <span>${bubbleText}</span>
          </div>
          <div class="mascot-wrapper" title="Click Mausam Mitra for a weather tip!" id="mascotInteractive">
            <svg class="mascot-svg" viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cloudBodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#ffffff" />
                  <stop offset="100%" stop-color="#e2e8f0" />
                </linearGradient>
              </defs>
              <!-- Mascot Cloud Body -->
              <g class="mascot-body-group">
                <ellipse cx="70" cy="65" rx="46" ry="32" fill="url(#cloudBodyGrad)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" />
                <circle cx="44" cy="52" r="22" fill="url(#cloudBodyGrad)" />
                <circle cx="70" cy="38" r="26" fill="url(#cloudBodyGrad)" />
                <circle cx="96" cy="52" r="21" fill="url(#cloudBodyGrad)" />
              </g>
              <!-- Cheeks -->
              <circle cx="48" cy="63" r="6" fill="#f43f5e" opacity="0.35" />
              <circle cx="92" cy="63" r="6" fill="#f43f5e" opacity="0.35" />
              <!-- Eyes -->
              <circle cx="58" cy="55" r="4.5" fill="#0f172a" class="mascot-eye" />
              <circle cx="82" cy="55" r="4.5" fill="#0f172a" class="mascot-eye" />
              <!-- Sparkles in eyes -->
              <circle cx="56.5" cy="53.5" r="1.5" fill="#ffffff" />
              <circle cx="80.5" cy="53.5" r="1.5" fill="#ffffff" />
              <!-- Smile -->
              ${smileSVG}
              <!-- Dynamic Accessory (Mask, Umbrella, Shades, Scarf, or Lantern) -->
              ${accessorySVG}
            </svg>
          </div>
          <span class="mascot-status-tag" style="background:${tagBg};color:${tagCol};border:1px solid ${tagCol}44">${tagText}</span>
        `;
      }

      function renderDailyGuide(c, d, H, hs, aq, pop, indiaAQI) {
        const target = $("#dailyAdvice");
        if (!target) return;

        const currentHour = new Date(c.time).getHours();
        const todayIST = c.time ? c.time.slice(0, 10) : "";
        let todayIdx = d && d.time ? d.time.findIndex((t) => t === todayIST) : 0;
        if (todayIdx === -1) todayIdx = 0;
        const tomorrowUV = Number(d.uv_index_max?.[todayIdx + 1] ?? d.uv_index_max?.[1] ?? 0);
        const isNightTime = c.is_day === 0 || (Number(c.uv_index || 0) === 0 && (currentHour >= 18 || currentHour < 6));

        // After 8:00 PM, switch to Tomorrow's quick guide for night-time utility
        const isNightPlan = currentHour >= 20;
        const targetDayIdx = isNightPlan ? (todayIdx + 1 < d.time.length ? todayIdx + 1 : todayIdx) : todayIdx;

        const feels = Number(
          isNightPlan
            ? (d.temperature_2m_max?.[targetDayIdx] ?? c.apparent_temperature ?? c.temperature_2m)
            : (c.apparent_temperature ?? c.temperature_2m)
        );
        const uv = Number(
          isNightPlan
            ? (d.uv_index_max?.[targetDayIdx] ?? 0)
            : (c.is_day ? (c.uv_index ?? d.uv_index_max?.[todayIdx] ?? 0) : 0)
        );
        const dayRain = Number(d.precipitation_probability_max?.[targetDayIdx] ?? 0);
        const rainChance = isNightPlan ? dayRain : Math.max(Number(pop) || 0, dayRain);
        const wind = Number(c.wind_speed_10m) || 0;

        let wearTitle,
          wearCopy,
          wearIcon = "👕";
        if (feels <= 8) {
          wearTitle = "Warm layers";
          wearCopy = isNightPlan
            ? "Tomorrow will be chilly. Keep warm jackets and thermal layers ready."
            : "Wear a warm jacket and layers, especially early and late in the day.";
          wearIcon = "🧥";
        } else if (feels <= 16) {
          wearTitle = "Light jacket";
          wearCopy = isNightPlan
            ? "Expect cool weather tomorrow. A sweater or light jacket will help."
            : "A sweater or light jacket should help during cooler hours.";
          wearIcon = "🧥";
        } else if (feels <= 25) {
          wearTitle = "Light layers";
          wearCopy = isNightPlan
            ? "Comfortable temperatures expected tomorrow. Everyday light layers will work well."
            : "Comfortable everyday layers should work well for these temperatures.";
          wearIcon = "👕";
        } else if (feels >= 34) {
          wearTitle = "Breathable clothes";
          wearCopy = isNightPlan
            ? "High heat forecast tomorrow. Plan for light cotton clothes and carry drinking water."
            : "Choose light, breathable clothing and carry water. Avoid overexertion in peak heat.";
          wearIcon = "🥤";
        } else {
          wearTitle = "Light clothing";
          wearCopy = isNightPlan
            ? "Mild weather expected tomorrow. Light cotton or casual wear is ideal."
            : "Light cotton or other breathable clothing should feel comfortable.";
          wearIcon = "👕";
        }

        let rainTitle = "Umbrella unlikely",
          rainCopy = isNightPlan
            ? "Dry conditions forecast tomorrow with low chance of rain."
            : "Rain chance looks limited in the available forecast.",
          rainIcon = "🌤️";
        if (rainChance >= 60 || (!isNightPlan && ["rain", "storm"].includes(mode))) {
          rainTitle = "Carry an umbrella";
          rainCopy = isNightPlan
            ? `High chance of rain tomorrow (${Math.round(rainChance)}%). Keep an umbrella handy.`
            : `Rain is possible (${Math.round(rainChance)}% forecast chance). An umbrella or rain jacket may help.`;
          rainIcon = "☔";
        } else if (rainChance >= 35) {
          rainTitle = "Compact umbrella";
          rainCopy = isNightPlan
            ? `Moderate rain chance tomorrow (${Math.round(rainChance)}%). Consider carrying an umbrella.`
            : `There is a ${Math.round(rainChance)}% forecast chance of rain. Consider a compact umbrella.`;
          rainIcon = "🌦️";
        } else if (wind >= 30) {
          rainTitle = "Windy conditions";
          rainCopy = isNightPlan
            ? "Breezy conditions forecast tomorrow; a light wind-resistant layer may be useful."
            : "Expect breezy conditions; a light wind-resistant layer may be useful.";
          rainIcon = "💨";
        }

        let sunTitle, sunCopy, sunIcon;
        if (isNightTime || isNightPlan) {
          sunIcon = "🌙";
          sunTitle =
            tomorrowUV > 0
              ? `No UV tonight (Peak tomorrow: ${Math.round(tomorrowUV)})`
              : "No UV tonight";
          sunCopy = `The sun has set; UV index is 0 right now. Tomorrow's peak UV index is forecast around ${Math.round(tomorrowUV)}. No sun protection is needed tonight.`;
        } else if (uv >= 8) {
          sunTitle = "High UV protection";
          sunCopy =
            "Use sunscreen, sunglasses and a hat; seek shade around midday.";
          sunIcon = "🧴";
        } else if (uv >= 6) {
          sunTitle = "Protect from UV";
          sunCopy = "Sunscreen, a cap and sunglasses are a good idea outdoors.";
          sunIcon = "🧢";
        } else if (uv >= 3) {
          sunTitle = "Bring sunglasses";
          sunCopy =
            "Sunglasses or a cap can help during extended time outdoors.";
          sunIcon = "🕶️";
        } else {
          sunTitle = "UV low–moderate";
          sunCopy =
            "UV is currently low to moderate; use normal sun-safety precautions.";
          sunIcon = "🌤️";
        }

        let airTitle = "Air looks manageable",
          airCopy =
            "This is a modelled estimate, not an official CPCB reading. Sensitive people should follow local advisories.",
          airIcon = "🍃";
        if (aq == null) {
          airTitle = "Check local AQI";
          airCopy =
            "Modelled CPCB-style AQI is unavailable. Check nearby official readings before strenuous outdoor activity.";
          airIcon = "🌬️";
        } else if (aq > 300) {
          airTitle = "Limit outdoor exertion";
          airCopy =
            "Estimated AQI is very poor or severe. Reduce outdoor activity and follow local advisories; a well-fitting N95/FFP2 may reduce particle exposure if going outside is unavoidable.";
          airIcon = "😷";
        } else if (aq > 200) {
          airTitle = "Consider a respirator";
          airCopy =
            "Estimated AQI is poor or worse. Reduce strenuous outdoor activity; a well-fitting N95/FFP2 may reduce particle exposure when outdoors.";
          airIcon = "😷";
        } else if (aq > 100) {
          airTitle = "Sensitive groups take care";
          airCopy =
            "People sensitive to pollution may prefer shorter, less strenuous outdoor activity. Check local official readings.";
          airIcon = "🌫️";
        }
        const items = [
          ["WEAR", wearIcon, wearTitle, wearCopy],
          ["RAIN & WIND", rainIcon, rainTitle, rainCopy],
          [isNightTime || isNightPlan ? "NIGHT" : "SUN", sunIcon, sunTitle, sunCopy],
          ["AIR", airIcon, airTitle, airCopy],
        ];

        const guideLabel = isNightPlan
          ? "Tomorrow’s quick guide · plan ahead"
          : "Today’s quick guide · tap or hover for details";

        target.innerHTML =
          `<span class="daily-advice-label">${guideLabel}</span>` +
          items
            .map(
              ([label, icon, title, copy]) =>
                `<span class="advice-pill" title="${esc(copy)}" aria-label="${esc(label + ": " + title + ". " + copy)}"><span class="advice-emoji" aria-hidden="true">${icon}</span><span class="advice-pill-text">${title}</span></span>`,
            )
            .join("");
      }
      function render() {
        const c = D.current,
          d = D.daily,
          H = D.hourly,
          wx = wi(c.weather_code, c.is_day);
        night = !c.is_day;
        mode = wx.k;
        theme();
        $("#un").textContent = U();
        const i0 = Math.max(
            0,
            H.time.findIndex((t) => t >= c.time.slice(0, 13)),
          ),
          hs = [...Array(24)]
            .map((_, k) => i0 + k)
            .filter((i) => i < H.time.length);
        const indiaAQI = A ? calcIndiaAQI(A, c.time) : null,
          aq = indiaAQI ? indiaAQI.value : null,
          pop = Math.max(
            0,
            ...hs.slice(0, 6).map((i) => H.precipitation_probability[i] || 0),
          );
        const tip =
          aq != null && aq > 400
            ? "😷 Estimated Indian AQI is severe. Avoid outdoor exertion and follow local health advisories."
            : aq != null && aq > 300
              ? "😷 Estimated Indian AQI is very poor. Reduce prolonged outdoor exertion."
              : aq != null && aq > 200
                ? "😷 Estimated Indian AQI is poor. Sensitive groups should limit outdoor exertion."
                : pop >= 60
                  ? "☔ Rain is likely in the next few hours. Carry an umbrella."
                  : c.temperature_2m >= 38
                    ? "🥵 It’s very hot. Stay hydrated and avoid the midday sun."
                    : c.uv_index >= 6
                      ? "🧴 Strong UV right now. Use sunscreen and seek shade."
                      : c.temperature_2m <= 10
                        ? "🧥 It’s cold out. Layer up."
                        : "✨ Conditions look comfortable right now.";
        const fav = S.fav.some((f) => f.n == S.loc.n && f.la == S.loc.la);
        let alertBanner = "";
        if (aq != null && aq > 400) {
          alertBanner = `<div class="severe-alert-banner alert-severe"><span class="alert-icon">🚨</span><div><strong>SEVERE AIR POLLUTION ADVISORY (AQI ${aq}):</strong> Modelled air quality is severe. Avoid outdoor exertion and use an N95 respirator outdoors.</div></div>`;
        } else if (aq != null && aq > 300) {
          alertBanner = `<div class="severe-alert-banner alert-warning"><span class="alert-icon">⚠️</span><div><strong>VERY POOR AIR QUALITY WARNING (AQI ${aq}):</strong> Sensitive individuals should avoid strenuous outdoor physical activities.</div></div>`;
        } else if (c.temperature_2m >= 42) {
          alertBanner = `<div class="severe-alert-banner alert-danger"><span class="alert-icon">🔥</span><div><strong>SEVERE HEATWAVE WARNING (${T(c.temperature_2m)}°):</strong> Extreme temperatures. Stay indoors during afternoon hours and drink plenty of fluids.</div></div>`;
        } else if (pop >= 80 && (c.precipitation > 5 || c.weather_code >= 80)) {
          alertBanner = `<div class="severe-alert-banner alert-info"><span class="alert-icon">⛈️</span><div><strong>HEAVY RAINFALL / STORM ADVISORY:</strong> Active downpour conditions detected. Take precautions while commuting.</div></div>`;
        }
        $("#hero").innerHTML =
          alertBanner +
          `<div class="hero-layout">
            <div class="hero-content">
              <div class="row"><div><h1>${esc(S.loc.n)}</h1><p class="mu">${new Date(c.time).toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true })}</p></div><button id="fav" aria-label="Save place" title="Save place">${fav ? "★" : "☆"}</button></div>
              <div class="big"><div class="ic">${wx.i}</div><div><div class="t"><span id="tv">0</span><sup>${U()}</sup></div><div class="cd">${wx.t}</div></div></div>
              <div class="chips"><span>Feels like ${T(c.apparent_temperature)}°</span><span>High ${T(d.temperature_2m_max[0])}° · Low ${T(d.temperature_2m_min[0])}°</span><span>💧 ${c.relative_humidity_2m}%</span><span>💨 ${Math.round(c.wind_speed_10m)} km/h ${dn(c.wind_direction_10m)}</span></div>
              <div id="dailyAdvice" class="daily-advice-row" aria-label="Today's weather recommendations"></div>
              <div class="tip">${tip}</div>
              <button type="button" class="hero-map-jump-btn" id="jumpToMap"><span>🛰️ Live Satellite Clouds & Atmospheric Map</span><kbd class="kbd-hint" title="Press R to jump to satellite map">R</kbd><span class="jump-arrow" aria-hidden="true">↓</span></button>
            </div>
            <div class="hero-mascot-panel" id="heroMascotPanel">
              ${renderMascot(c, d, H, hs, aq, pop, indiaAQI)}
            </div>
          </div>`;
        cnt($("#tv"), T(c.temperature_2m));
        if (RadarEngine.isReady()) {
          RadarEngine.updateLocation(S.loc.la, S.loc.lo, S.loc.n);
          RadarEngine.setWindParams(c.wind_speed_10m, c.wind_direction_10m, S.loc.n);
        }

        if (indiaAQI && Object.keys(indiaAQI.pollutants || {}).length) {
          const indexAvailable = indiaAQI.index_available && aq != null,
            [l, col] = indexAvailable
              ? aqC(aq)
              : ["Insufficient data", "#64748b"],
            aqLabel = !indexAvailable
              ? "—"
              : indiaAQI.openEnded
                ? "401+"
                : String(aq),
            a = indiaAQI.pollutants;
          $("#aqi").innerHTML =
            `<h2>India AQI estimate</h2><div class="aqt"><div class="aqn" style="color:${col}"><span id="av">${aqLabel}</span></div><div><b style="color:${col}">${l}</b><p class="mu">India CPCB bands · modelled data</p>${indexAvailable ? `<p class="mu" style="font-size:11px;margin-top:3px">Prominent pollutant: ${esc(indiaAQI.prominent_pollutant || "—")}</p>` : ""}</div></div><div class="gb" style="background:linear-gradient(90deg,#22c55e 0 10%,#84cc16 10% 20%,#eab308 20% 40%,#f97316 40% 60%,#ef4444 60% 80%,#7f1d1d 80% 100%)"><i style="left:${indexAvailable ? Math.min(aq / 500, 1) * 100 : 0}%"></i></div><div class="pg">${[
              ["PM2.5", "pm2_5"],
              ["PM10", "pm10"],
              ["NO₂", "nitrogen_dioxide"],
              ["O₃", "ozone"],
              ["SO₂", "sulphur_dioxide"],
              ["CO", "carbon_monoxide"],
            ]
              .map(([n, k]) => {
                const p = a[k];
                const isProm = indexAvailable && indiaAQI.prominent_pollutant && CPCB_POLLUTANTS[k] && CPCB_POLLUTANTS[k].label === indiaAQI.prominent_pollutant;
                return `<div class="${isProm ? "prominent" : ""}"><small>${n}${isProm ? ' <span class="prom-badge">PRIMARY</span>' : ""}</small><b>${p ? `${p.value.toFixed(CPCB_POLLUTANTS[k].decimals)} <span>${p.unit}</span>` : "–"}</b>${p ? `<em>Sub-index ${p.open_ended ? "401+" : p.sub_index} · ${esc(p.status)}</em>` : "<em>Insufficient readings</em>"}</div>`;
              })
              .join(
                "",
              )}</div><p class="mu" style="font-size:11px;line-height:1.5;margin-top:8px">Displayed concentrations are the rounded rolling averages used for each pollutant sub-index (24 h for PM/NO₂/SO₂; 8 h for O₃/CO). CO is converted to mg/m³ before calculation.</p><p class="mu" style="font-size:11px;line-height:1.5">${indexAvailable ? "Estimate from Open-Meteo modelled concentrations using Indian CPCB breakpoints—not an official CPCB station reading. NH₃ and Pb are unavailable in this feed." : "Overall AQI withheld because CPCB minimum-data rules are not met: " + esc(indiaAQI.missing_requirements.join(" ")) + " Individual sub-indices are shown where enough readings exist."}</p>${renderInline7DayAQI(A, c.time)}${renderAQIMethodDetails()}<button type="button" class="aqi-history-trigger" id="openAQIHistory"><span>📈 View 7-day AQI estimate</span><span aria-hidden="true">↗</span></button>`;
        } else
          $("#aqi").innerHTML =
            '<h2>India AQI estimate</h2><p class="mu">A model-based Indian CPCB-scale estimate is unavailable because this location does not have enough modelled pollutant history to calculate valid rolling averages. No AQI value is fabricated.</p>' +
            renderAQIMethodDetails() +
            '<button type="button" class="aqi-history-trigger" id="openAQIHistory"><span>📈 View 7-day AQI estimate</span><span aria-hidden="true">↗</span></button>';
        $("#aqi").insertAdjacentHTML("beforeend", renderOpenAQStationPanel(O));
        renderDailyGuide(c, d, H, hs, aq, pop, indiaAQI);

        function getHourlyIsDay(hourTimeStr, rawIsDay) {
          if (!d || !d.time || !d.sunrise || !d.sunset) return rawIsDay;
          const dateStr = hourTimeStr.slice(0, 10);
          const dayIdx = d.time.findIndex((dt) => dt === dateStr);
          if (dayIdx !== -1 && d.sunrise[dayIdx] && d.sunset[dayIdx]) {
            const sr = d.sunrise[dayIdx];
            const ss = d.sunset[dayIdx];
            return hourTimeStr >= sr && hourTimeStr < ss ? 1 : 0;
          }
          return rawIsDay;
        }

        // Overwrite Now slot with live current.temperature_2m to prevent 1°C hourly mismatch
        const ts = hs.map((i, k) => (k === 0 ? c.temperature_2m : H.temperature_2m[i])),
          mn = Math.min(...ts),
          mx = Math.max(...ts),
          n = hs.length,
          W2 = n * 64,
          pts = ts.map((t, k) => [
            32 + k * 64,
            34 + ((mx - t) / (mx - mn || 1)) * 38,
          ]);
        let path = "M" + pts[0].join(",");
        for (let k = 1; k < n; k++) {
          const p = pts[k - 1],
            q = pts[k],
            m = (p[0] + q[0]) / 2;
          path += `C${m},${p[1]} ${m},${q[1]} ${q[0]},${q[1]}`;
        }
        $("#hourly").innerHTML =
          `<h2>Next 24 hours</h2><div class="sc"><div style="width:${W2}px;overflow:hidden"><svg width="${W2}" height="100" viewBox="0 0 ${W2} 100"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s1" stop-opacity=".4"/><stop offset="1" class="s1" stop-opacity="0"/></linearGradient></defs><path d="${path}L${W2 - 32},100L32,100Z" fill="url(#ag)"/><path class="ln" pathLength="1" d="${path}"/>${pts.map((p, k) => `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="${k ? 3.5 : 6}"/><text x="${p[0]}" y="${p[1] - 12}">${T(ts[k])}°</text>`).join("")}</svg>
 <div class="hcs">${hs
   .map((i, k) => {
     const p = H.precipitation_probability[i] || 0;
     const hCode = k === 0 ? c.weather_code : H.weather_code[i];
     const hDay = k === 0 ? c.is_day : getHourlyIsDay(H.time[i], H.is_day[i]);
     return `<div class="hc"><span>${k ? hr(H.time[i]) : "Now"}</span><i>${wi(hCode, hDay).i}</i><small>${p >= 10 ? p + "%" : " "}</small></div>`;
   })
   .join("")}</div></div></div>`;

        const todayIST = c.time ? c.time.slice(0, 10) : "";
        let todayIdx = d.time.findIndex((t) => t === todayIST);
        if (todayIdx === -1) todayIdx = 0;

        const dayIndices = [];
        for (let i = 0; i < 7 && todayIdx + i < d.time.length; i++) {
          dayIndices.push(todayIdx + i);
        }

        const gn = Math.min(...dayIndices.map((k) => d.temperature_2m_min[k])),
          gx = Math.max(...dayIndices.map((k) => d.temperature_2m_max[k]));

        $("#week").innerHTML =
          `<h2>7-day forecast</h2>` +
          dayIndices
            .map((k, relIdx) => {
              const t = d.time[k],
                lo = d.temperature_2m_min[k],
                hi = d.temperature_2m_max[k],
                p = d.precipitation_probability_max[k] || 0;
              const isToday = relIdx === 0;
              const dayLabel = isToday
                ? "Today"
                : new Date(t + "T12:00:00Z").toLocaleDateString("en-IN", {
                    weekday: "short",
                    timeZone: "UTC",
                  });
              return `<div class="dy"><b style="text-align:left">${dayLabel}</b><span style="font-size:22px">${wi(d.weather_code[k], 1).i}</span><small>${p >= 10 ? "💧" + p + "%" : ""}</small><span>${T(lo)}°</span><div class="tr"><i style="left:${((lo - gn) / (gx - gn || 1)) * 100}%;width:${Math.max(6, ((hi - lo) / (gx - gn || 1)) * 100)}%"></i></div><b>${T(hi)}°</b></div>`;
            })
            .join("");

        const sr = d.sunrise[todayIdx] || d.sunrise[0],
          ss = d.sunset[todayIdx] || d.sunset[0],
          sp = Math.min(
            1,
            Math.max(
              0,
              (new Date(c.time) - new Date(sr)) / (new Date(ss) - new Date(sr)),
            ),
          ),
          sx = 100 - 90 * Math.cos(Math.PI * sp),
          sy = 100 - 90 * Math.sin(Math.PI * sp),
          dl = (new Date(ss) - new Date(sr)) / 6e4,
          uv = c.uv_index ?? d.uv_index_max[todayIdx] ?? d.uv_index_max[0],
          vis = c.visibility;
        $("#det").innerHTML =
          mini(
            "💨",
            "Wind",
            `<div class="wd"><svg viewBox="0 0 80 80" width="72"><circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" stroke-opacity=".2" stroke-width="2"/><text x="40" y="12">N</text><g class="ar" data-r="${(c.wind_direction_10m + 180) % 360}"><path class="fa" d="M40 18L47 46L40 40L33 46Z"/></g></svg><div><div class="v">${Math.round(c.wind_speed_10m)}<small> km/h</small></div><p class="mu">From ${dn(c.wind_direction_10m)}, gusts ${Math.round(c.wind_gusts_10m)}</p></div></div>`,
            "",
            1,
          ) +
          mini(
            "💧",
            "Humidity",
            `<div class="wd">${ring(c.relative_humidity_2m, c.relative_humidity_2m + "%")}<p class="mu">${c.relative_humidity_2m < 30 ? "Dry" : c.relative_humidity_2m < 60 ? "Comfortable" : c.relative_humidity_2m < 80 ? "Humid" : "Very humid"}</p></div>`,
            "",
            2,
          ) +
          mini(
            "🕶️",
            "UV index",
            `<div class="v">${Math.round(uv)}<small> ${uvL(uv)}</small></div><div class="gb" style="background:linear-gradient(90deg,#22c55e,#eab308 30%,#f97316 55%,#ef4444 80%,#a855f7)"><i style="left:${Math.min(uv / 12, 1) * 100}%"></i></div>`,
            "",
            3,
          ) +
          mini(
            "🧭",
            "Pressure",
            `<div class="v">${Math.round(c.pressure_msl)}<small> hPa</small></div><p class="mu">${c.pressure_msl < 1000 ? "Low" : c.pressure_msl > 1020 ? "High" : "Normal"}</p>`,
            "",
            4,
          ) +
          mini(
            "👁️",
            "Visibility",
            `<div class="v">${vis >= 10000 ? Math.round(vis / 1000) : (vis / 1000).toFixed(1)}<small> km</small></div><p class="mu">${vis < 1000 ? "Very poor" : vis < 4000 ? "Poor" : vis < 10000 ? "Moderate" : "Clear"}</p>`,
            "",
            5,
          ) +
          mini(
            "☁️",
            "Cloud cover",
            `<div class="wd">${ring(c.cloud_cover, c.cloud_cover + "%")}</div>`,
            "",
            6,
          ) +
          mini(
            "🌅",
            "Sun",
            `<svg class="sun-orbit-svg" viewBox="0 0 200 112" width="100%" style="max-height:110px" role="img" aria-label="Sunrise-to-sunset daylight progress"><path class="sun-arc-track" d="M10 100A90 90 0 0 1 190 100" fill="none" stroke="currentColor" stroke-opacity=".22" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/><path class="sun-arc-progress" pathLength="100" d="M10 100A90 90 0 0 1 190 100" style="--sun-progress:${Math.max(0.01, sp * 100)};stroke-dasharray:${Math.max(0.01, sp * 100)} 100;stroke-dashoffset:${Math.max(0.01, sp * 100)}"/>${night ? "" : `<circle class="sun-orb-halo" cx="${sx}" cy="${sy}" r="14"/><circle class="sun-orb" cx="${sx}" cy="${sy}" r="8"/>`}</svg><div class="row"><span>↑ ${hr(sr, 1)}</span><span class="mu">${Math.floor(dl / 60)}h ${Math.round(dl % 60)}m of daylight</span><span>↓ ${hr(ss, 1)}</span></div>`,
            "w2",
            7,
          ) +
          mini(
            "🌧️",
            "Rain today",
            `<div class="v">${d.precipitation_sum[0]}<small> mm expected</small></div><p class="mu">${d.precipitation_probability_max[0] || 0}% chance · ${c.precipitation} mm falling now</p>`,
            "w2",
            8,
          );
        setTimeout(
          () =>
            document
              .querySelectorAll("[data-r]")
              .forEach(
                (e) => (e.style.transform = `rotate(${e.dataset.r}deg)`),
              ),
          90,
        );
        cities();
        const yr = new Date().getFullYear();
        const yrDisplay = yr > 2026 ? "2026–" + yr : "2026";
        $("#ft").innerHTML =
          '<div class="ft-card">' +
            '<div class="ft-top-row">' +
              '<span class="ft-pill"><span class="ft-dot"></span>Live Atmospheric Telemetry</span>' +
              '<div class="footer-attribution">Updated ' +
              hr(c.time, 1) +
              ' IST · Weather & forecasts: <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · Sensors: <a href="https://openaq.org" target="_blank" rel="noopener noreferrer">OpenAQ</a> · Orbit: NASA GIBS</div>' +
            '</div>' +
            '<div class="footer-rights">© ' +
            yrDisplay +
            ' Mausam India · Open source under MIT License · <button type="button" class="ft-link-btn" id="openPrivacyBtn">Privacy & Data Governance</button></div>' +
            '<div class="footer-disclaimer-box"><strong>Independent Project Notice:</strong> Mausam India is an independent open-source weather platform and is not affiliated with, authorized, or endorsed by the India Meteorological Department (IMD) or the Government of India. Official government advisories: <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer">mausam.imd.gov.in</a></div>' +
            '<a class="github-source-link" href="' +
            GITHUB_REPO_URL +
            '" target="_blank" rel="noopener noreferrer" aria-label="View Mausam India source code on GitHub">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.75-.24.75-.53v-2.04c-3.08.67-3.73-1.3-3.73-1.3-.5-1.28-1.23-1.62-1.23-1.62-1-.69.08-.67.08-.67 1.12.08 1.7 1.14 1.7 1.14.99 1.69 2.59 1.2 3.22.92.1-.71.39-1.2.7-1.48-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.97-.11-.28-.49-1.4.11-2.93 0 0 .93-.3 3.05 1.13a10.6 10.6 0 0 1 5.55 0c2.12-1.43 3.05-1.13 3.05-1.13.61 1.53.23 2.65.12 2.93.71.77 1.14 1.76 1.14 2.97 0 4.26-2.59 5.2-5.06 5.47.4.34.75 1.02.75 2.06V22c0 .29.2.63.76.52A11.1 11.1 0 0 0 12 .9Z"/></svg>' +
              '<span>View source on GitHub</span><span aria-hidden="true">↗</span>' +
            '</a>' +
          '</div>';
        setupScrollReveal();
      }

      function cities() {
        const fallbackDay =
          D && D.current && D.current.is_day != null
            ? D.current.is_day
            : night
              ? 0
              : 1;
        $("#cities").innerHTML =
          `<h2>Quick cities · search above for more places</h2>${S.fav.length ? `<div class="chips">${S.fav.map((f, i) => `<button class="chip" data-f="${i}">★ ${esc(f.n)}</button>`).join("")}</div>` : ""}<div class="cg">${CITIES.map(
            (c, i) => {
              const x = CT && CT[i] && CT[i].current;
              const isDay = x && x.is_day != null ? x.is_day : fallbackDay;
              return `<button class="ct${c[0] == S.loc.n ? " on" : ""}" data-c="${i}"><span>${c[0]}</span><em>${x ? wi(x.weather_code, isDay).i : "·"}</em><b>${x ? T(x.temperature_2m) + "°" : "–"}</b></button>`;
            },
          ).join("")}</div>`;
      }


      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeAQIHistory();
          closePrivacy();
        }
      });

      /* ---------- AQI history modal ---------- */
      function openAQIHistory() {
        const modal = $("#aqiHistoryModal");
        if (!modal) return;
        $("#aqiHistoryTitle").textContent = "7-day India AQI estimate";
        $("#aqiHistorySubtitle").textContent =
          "Modelled trend for " + S.loc.n + " · not official station history";
        renderAQIHistory(A, D && D.current ? D.current.time : null);
        modal.hidden = false;
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
        setupScrollReveal($("#aqiHistoryContent"));
        setTimeout(() => $("#aqiHistoryClose")?.focus(), 40);
      }
      function closeAQIHistory() {
        const modal = $("#aqiHistoryModal");
        if (!modal || modal.hidden) return;
        modal.classList.remove("open");
        modal.hidden = true;
        document.body.style.overflow = "";
        const trigger = $("#openAQIHistory");
        if (trigger) trigger.focus();
      }
      $("#aqiHistoryClose")?.addEventListener("click", closeAQIHistory);
      $("#aqiHistoryModal")?.addEventListener("click", (e) => {
        if (e.target === $("#aqiHistoryModal")) closeAQIHistory();
      });

      /* ---------- Privacy & DPDP Notice modal ---------- */
      function openPrivacy() {
        const modal = $("#privacyModal");
        if (!modal) return;
        modal.hidden = false;
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
        setTimeout(() => $("#privacyClose")?.focus(), 40);
      }
      function closePrivacy() {
        const modal = $("#privacyModal");
        if (!modal || modal.hidden) return;
        modal.classList.remove("open");
        modal.hidden = true;
        document.body.style.overflow = "";
        const trigger = $("#openPrivacyBtn");
        if (trigger) trigger.focus();
      }
      $("#privacyClose")?.addEventListener("click", closePrivacy);
      $("#privacyModal")?.addEventListener("click", (e) => {
        if (e.target === $("#privacyModal")) closePrivacy();
      });

      document.addEventListener("click", (e) => {
        if (e.target.closest("#openPrivacyBtn")) {
          openPrivacy();
        } else if (e.target.id === "clearLocalDataBtn") {
          try {
            localStorage.clear();
            const msg = $("#clearDataMsg");
            if (msg) msg.textContent = "Preferences cleared. Reloading…";
            setTimeout(() => location.reload(), 600);
          } catch (_) {}
        }
      });

      /* ---------- desktop pro keyboard shortcuts ---------- */
      document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          if (e.key === "Escape") {
            e.target.blur();
            $("#sug").style.display = "none";
          }
          return;
        }
        const key = e.key.toLowerCase();
        if (key === "s") {
          e.preventDefault();
          const q = $("#q");
          if (q) { q.focus(); q.select(); }
        } else if (key === "r") {
          e.preventDefault();
          const mapCard = $("#radarCard");
          if (mapCard) {
            mapCard.scrollIntoView({ behavior: "smooth", block: "center" });
            mapCard.classList.add("highlight-pulse");
            setTimeout(() => mapCard.classList.remove("highlight-pulse"), 2500);
          }
        } else if (key === "t") {
          e.preventDefault();
          const th = $("#th");
          if (th) th.click();
        } else if (key === "u") {
          e.preventDefault();
          const un = $("#un");
          if (un) un.click();
        }
      });

      /* ---------- interactions ---------- */
      function go(n, la, lo) {
        S.loc = { n, la, lo };
        ls.s("loc", JSON.stringify(S.loc));
        $("#q").value = "";
        $("#sug").style.display = "none";
        scrollTo({ top: 0, behavior: "smooth" });
        load();
      }
      document.addEventListener("click", (e) => {
        const t = e.target;
        let b;
        if (t.closest("#mascotInteractive")) {
          const bubble = $("#mascotBubble span");
          if (bubble) {
            const tips = [
              "Remember to stay hydrated today! 💧",
              "Check the 7-day AQI trend below before running outdoors! 🏃",
              "Mausam India uses real CPCB calculations! 🇮🇳",
              "Press R to glide down to NASA satellite clouds! 🛰️",
              "Have an amazing and productive day! ✨"
            ];
            bubble.textContent = tips[Math.floor(Math.random() * tips.length)];
            const wrapper = $("#mascotInteractive");
            if (wrapper) {
              wrapper.style.transform = "scale(1.18) rotate(6deg)";
              setTimeout(() => wrapper.style.transform = "", 300);
            }
          }
          return;
        }
        if (t.closest("#jumpToMap")) {
          const mapCard = $("#radarCard");
          if (mapCard) {
            mapCard.scrollIntoView({ behavior: "smooth", block: "center" });
            mapCard.classList.add("highlight-pulse");
            setTimeout(() => mapCard.classList.remove("highlight-pulse"), 2500);
          }
          return;
        }
        if (t.closest("#openAQIHistory")) {
          openAQIHistory();
          return;
        }
        if (!t.closest(".sw")) $("#sug").style.display = "none";
        if ((b = t.closest("[data-g]"))) {
          const [n, la, lo] = JSON.parse(b.dataset.g);
          go(n, la, lo);
        } else if ((b = t.closest("[data-c]"))) {
          const c = CITIES[b.dataset.c];
          go(c[0], c[1], c[2]);
        } else if ((b = t.closest("[data-f]"))) {
          const f = S.fav[b.dataset.f];
          go(f.n, f.la, f.lo);
        } else if (t.closest("#fav")) {
          const i = S.fav.findIndex((f) => f.n == S.loc.n && f.la == S.loc.la);
          const added = i < 0;
          if (added) S.fav.push(S.loc);
          else S.fav.splice(i, 1);
          ls.s("fav", JSON.stringify(S.fav));
          $("#fav").textContent = added ? "★" : "☆";
          cities();
        }
      });
      let tm;
      $("#q").addEventListener("input", (e) => {
        clearTimeout(tm);
        // Trim, cap at 80 characters, and strip control characters to eliminate injection
        let q = (e.target.value || "").trim().slice(0, 80);
        q = q.replace(/[<>"{}|\\^~[\]]/g, "");
        if (q.length < 2) {
          $("#sug").style.display = "none";
          $("#sug").innerHTML = "";
          return;
        }
        tm = setTimeout(async () => {
          try {
            const r = await j(
                `${GEO}name=${encodeURIComponent(q)}&count=30&language=en&format=json&countryCode=IN`,
              ),
              L = (r.results || [])
                .filter((x) => x.country_code == "IN")
                .slice(0, 6);
            $("#sug").innerHTML = "";
            if (!L.length) {
              const btn = document.createElement("button");
              btn.disabled = true;
              btn.textContent = "No place found in India";
              $("#sug").appendChild(btn);
            } else {
              L.forEach((x) => {
                const btn = document.createElement("button");
                btn.dataset.g = JSON.stringify([x.name, x.latitude, x.longitude]);
                btn.textContent = `📍 ${x.name} `;
                const label = [x.admin2, x.admin1].filter(Boolean).join(", ");
                if (label) {
                  const sm = document.createElement("small");
                  sm.textContent = label;
                  btn.appendChild(sm);
                }
                $("#sug").appendChild(btn);
              });
            }
            $("#sug").style.display = "block";
          } catch {
            $("#sug").style.display = "none";
          }
        }, 250);
      });
      $("#q").addEventListener("keydown", (e) => {
        if (e.key == "Enter") {
          const b = $("#sug [data-g]");
          b && b.click();
        }
      });
      $("#loc").onclick = () =>
        navigator.geolocation
          ? navigator.geolocation.getCurrentPosition(
              (p) =>
                go(
                  "My location",
                  +p.coords.latitude.toFixed(3),
                  +p.coords.longitude.toFixed(3),
                ),
              () =>
                toast(
                  "Location access was denied. Search for your city instead.",
                ),
              { timeout: 8000 },
            )
          : toast("Your browser doesn’t support location.");
      addEventListener("resize", seed);
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && Date.now() - last > 6e5) {
          CT = null;
          load();
        }
      });
      setInterval(() => {
        CT = null;
        load();
      }, 6e5);
      theme();
      $("#un").textContent = U();
      function initEngines() {
        if (typeof SkyEngine !== "undefined" && SkyEngine.init(cv)) {
          SkyEngine.setWeather(mode, night, dark);
        } else {
          requestAnimationFrame(frame);
        }
        if (typeof RadarEngine !== "undefined") {
          RadarEngine.init();
        }
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initEngines);
      } else {
        initEngines();
      }

      function initAutoLocation() {
        if (!navigator.geolocation) return;
        if (!ls.g("loc")) {
          navigator.geolocation.getCurrentPosition(
            (p) => {
              go(
                "My location",
                +p.coords.latitude.toFixed(3),
                +p.coords.longitude.toFixed(3),
              );
            },
            () => {},
            { timeout: 8000, maximumAge: 600000 },
          );
        } else if (S.loc && S.loc.n === "My location") {
          navigator.geolocation.getCurrentPosition(
            (p) => {
              const la = +p.coords.latitude.toFixed(3);
              const lo = +p.coords.longitude.toFixed(3);
              if (la !== S.loc.la || lo !== S.loc.lo) {
                go("My location", la, lo);
              }
            },
            () => {},
            { timeout: 8000, maximumAge: 600000 },
          );
        }
      }

      async function boot() {
        // Fast-path: If user previously authorized geolocation, resolve coordinates first
        // to avoid launching an unnecessary initial Delhi load storm
        if (!ls.g("loc") && navigator.permissions && navigator.geolocation) {
          try {
            const perm = await navigator.permissions.query({ name: "geolocation" });
            if (perm && perm.state === "granted") {
              const pos = await new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(res, rej, {
                  timeout: 1200,
                  maximumAge: 300000,
                });
              });
              S.loc = {
                n: "My location",
                la: +pos.coords.latitude.toFixed(3),
                lo: +pos.coords.longitude.toFixed(3),
              };
              ls.s("loc", JSON.stringify(S.loc));
            }
          } catch (_) {}
        }
        load();
        initAutoLocation();
      }

      boot();
      if ("serviceWorker" in navigator && location.protocol !== "file:") {
        navigator.serviceWorker.register("./sw.js").catch(() => {});
      }
