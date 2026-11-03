/**
 * Mausam India — Embeddable Web Widget Custom Element (<mausam-widget>)
 * Allows Indian blogs, schools, and non-profits to embed live weather & CPCB AQI.
 * Usage:
 *   <script src="https://mausam-india.pages.dev/widget.js" async></script>
 *   <mausam-widget city="Bengaluru" theme="dark" show-aqi="true"></mausam-widget>
 */

(function () {
  if (typeof window === "undefined" || customElements.get("mausam-widget")) {
    return;
  }

  class MausamWidget extends HTMLElement {
    static get observedAttributes() {
      return ["city", "lat", "lon", "theme", "show-aqi", "width", "height"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      if (this.shadowRoot && this.shadowRoot.innerHTML) {
        this.render();
      }
    }

    render() {
      const city = this.getAttribute("city") || "New Delhi";
      const lat = this.getAttribute("lat") || "";
      const lon = this.getAttribute("lon") || "";
      const theme = this.getAttribute("theme") || "dark";
      const showAqi = this.getAttribute("show-aqi") !== "false";
      const width = this.getAttribute("width") || "320px";
      const height = this.getAttribute("height") || "190px";

      // Detect base domain (supports local dev or Cloudflare Pages prod)
      let baseUrl = "https://mausam-india.pages.dev/widget.html";
      try {
        const currentScript = document.currentScript;
        if (currentScript && currentScript.src) {
          const scriptUrl = new URL(currentScript.src);
          baseUrl = `${scriptUrl.origin}/widget.html`;
        } else if (window.location && window.location.origin) {
          baseUrl = `${window.location.origin}/widget.html`;
        }
      } catch (_) {}

      const params = new URLSearchParams();
      if (lat && lon) {
        params.set("lat", lat);
        params.set("lon", lon);
        params.set("name", city);
      } else {
        params.set("city", city);
      }
      params.set("theme", theme);
      if (!showAqi) params.set("aqi", "false");

      const iframeSrc = `${baseUrl}?${params.toString()}`;

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            width: ${width};
            height: ${height};
            max-width: 100%;
            vertical-align: middle;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 16px;
            overflow: hidden;
            display: block;
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.25);
          }
        </style>
        <iframe
          src="${iframeSrc}"
          loading="lazy"
          title="Mausam India Live Weather & AQI Widget"
          sandbox="allow-scripts allow-popups allow-same-origin">
        </iframe>
      `;
    }
  }

  customElements.define("mausam-widget", MausamWidget);
})();
