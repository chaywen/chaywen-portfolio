/* Optional deployment override, set before this script:
 * window.LEXI_LENS_CONFIG = { API_URL: "https://your-backend.example" };
 * No API keys belong in this file.
 */
(function () {
  "use strict";
  const overrides = window.LEXI_LENS_CONFIG || {};
  const page = window.location;
  const localHosts = ["localhost", "127.0.0.1", "[::1]"];
  const staticDevPorts = ["3000", "5173", "5500", "8080", "8081"];
  const defaultBase = page.protocol === "file:"
    ? "http://127.0.0.1:8000"
    : localHosts.includes(page.hostname) && staticDevPorts.includes(page.port)
      ? `${page.protocol}//${page.hostname}:8000`
      : page.origin;
  const api = new URL(overrides.API_URL || defaultBase);
  if (!["http:", "https:"].includes(api.protocol)) {
    throw new Error("LexiLens API_URL must use HTTP or HTTPS.");
  }
  api.search = "";
  api.hash = "";
  const base = api.href.replace(/\/+$/, "");
  const websocket = new URL(`${base}/ws/session`);
  websocket.protocol = api.protocol === "https:" ? "wss:" : "ws:";
  window.LEXI_LENS_CONFIG = Object.freeze({
    API_URL: base,
    WS_URL: overrides.WS_URL || websocket.href,
  });
})();
