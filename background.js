chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // بنشغل الـ Debugger لما المستخدم يفتح صفحة البوكماركس
  if (changeInfo.status === "complete" && tab.url?.includes("/i/bookmarks")) {
    chrome.debugger.attach({ tabId }, "1.3", () => {
      chrome.debugger.sendCommand({ tabId }, "Network.enable");
    });
  }
});

chrome.debugger.onEvent.addListener((source, method, params) => {
  if (method === "Network.responseReceived") {
    const url = params.response.url;

    // بندور على الـ API بتاع البوكماركس في تويتر
    if (url.includes("Bookmarks?variables")) {
      chrome.debugger.sendCommand(
        { tabId: source.tabId },
        "Network.getResponseBody",
        { requestId: params.requestId },
        (response) => {
          if (response && response.body) {
            const cleanData = JSON.parse(response.body);
            console.log("لقطنا الداتا النضيفة يا كبير!", cleanData);

            // هنا بنبعت الداتا للـ Node.js بتاعك
            sendToNodeBackend(cleanData);
          }
        },
      );
    }
  }
});

async function sendToNodeBackend(data) {
  try {
    await fetch("http://localhost:5000/api/sync-bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error("الباك إيند مش صاحي أو فيه مشكلة:", err);
  }
}
