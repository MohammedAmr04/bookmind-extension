// حقن ملف الـ inject.js
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
(document.head || document.documentElement).appendChild(script);

window.addEventListener("X_DATA_RAW", (event) => {
  if (!event.detail || Object.keys(event.detail).length === 0) return;
  showToast(" SYNC DATA", true);
  const rawData = event.detail;
  const entries =
    rawData?.data?.bookmark_timeline_v2?.timeline?.instructions?.[0]?.entries ||
    [];

  const cleanBookmarks = entries
    .filter((entry) => entry.entryId.startsWith("tweet-")) // نضمن إننا بناخد تويتات مش إعلانات
    .map((entry) => {
      const result = entry.content?.itemContent?.tweet_results?.result;
      if (!result) return null;

      const tweetData = result.legacy;
      const userData =
        result.core?.user_results?.result?.legacy ||
        result.core?.user_results?.result;

      return {
        tweet_id: result.rest_id,
        text: tweetData?.full_text,
        created_at: tweetData?.created_at,
        author: {
          id: userData?.rest_id,
          name: userData?.name,
          handle: userData?.screen_name,
          avatar: result.core?.user_results?.result?.avatar?.image_url, // المسار اللي في الـ JSON بتاعك
        },
        stats: {
          bookmarks: tweetData?.bookmark_count,
          favorites: tweetData?.favorite_count,
        },
      };
    })
    .filter((item) => item !== null);
  console.log(cleanBookmarks);
  chrome.runtime.sendMessage(
    {
      action: "SYNC_TO_SERVER",
      payload: cleanBookmarks,
    },
    (response) => {
      if (response && response.success) {
        showToast(" SYNC DATA SUCCESS", true);
        setTimeout(() => {
          window.scrollBy({
            top: 1200,
            behavior: "smooth",
          });
        }, 1000);
      } else {
        showToast(" SYNC DATA FAIL", false);
      }
    },
  );
});

function showToast(msg, isSuccess = false) {
  let t = document.getElementById("sync-status");
  if (!t) {
    t = document.createElement("div");
    t.id = "sync-status";
    Object.assign(t.style, {
      position: "fixed",
      bottom: "30px",
      start: "30px",
      background: "#1d9bf0",
      color: "white",
      padding: "15px",
      borderRadius: "20px",
      zIndex: "9999",
      fontWeight: "bold",
    });
    document.body.appendChild(t);
  }
  t.innerText = msg;
  if (isSuccess) {
    t.style.background = "#1d9bf0";
  } else {
    t.style.background = "#ff4444";
  }
}
