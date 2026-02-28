(function () {
  console.log("🚀 Advanced Injector Test FIX Booted...");
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const url = typeof args[0] === "string" ? args[0] : args[0].url;

    if (url.includes("Bookmarks")) {
      const clone = response.clone();
      clone
        .json()
        .then((data) => {
          window.dispatchEvent(new CustomEvent("X_DATA_RAW", { detail: data }));
        })
        .catch(() => {});
    }
    return response;
  };

  // مراقبة الـ XHR
  const XHR = XMLHttpRequest.prototype;
  const open = XHR.open;
  const send = XHR.send;

  XHR.open = function (method, url) {
    this._url = url;
    return open.apply(this, arguments);
  };

  XHR.send = function () {
    this.addEventListener("load", function () {
      if (this._url && this._url.includes("Bookmarks")) {
        try {
          const data = JSON.parse(this.responseText);
          window.dispatchEvent(new CustomEvent("X_DATA_RAW", { detail: data }));
        } catch (e) {}
      }
    });
    return send.apply(this, arguments);
  };
})();
