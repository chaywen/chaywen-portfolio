(function () {
  "use strict";
  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(window.LEXI_LENS_CONFIG.API_URL + path, {
        ...options, signal: controller.signal,
      });
      if (!response.ok) {
        const messages = {
          400: "The file or request could not be read. Try another file or check your input.",
          413: "This file is too large. Choose a file under 10 MB.",
          422: "Check the file or text and try again.",
          429: "Too many requests. Wait a moment and try again.",
          503: "The AI service is unavailable. You can still explore the sample demo.",
        };
        throw new Error(messages[response.status] || "The service could not complete this request. Please try again.");
      }
      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") throw new Error("This request took too long. Please try again.");
      if (error instanceof TypeError) throw new Error("Cannot connect to LexiLens. Check your connection or try the sample demo.");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  window.LexiAPI = { request };
})();
