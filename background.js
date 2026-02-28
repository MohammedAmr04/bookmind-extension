chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("background");
  if (request.action === "SYNC_TO_SERVER") {
    fetch("http://localhost:5000/api/sync-bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.payload),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Server responded with error");
      })
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => {
        console.error(err);
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }
});
