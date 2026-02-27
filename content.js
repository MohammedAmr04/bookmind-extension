// content.js

// دالة لإضافة الزرار في واجهة تويتر
function injectSyncButton() {
  // بنستنى لحد ما الـ Sidebar بتاع تويتر يظهر
  const checkExist = setInterval(() => {
    const nav = document.querySelector('nav[role="navigation"]');
    if (nav && !document.getElementById("threadmind-sync-btn")) {
      clearInterval(checkExist);

      const btn = document.createElement("button");
      btn.id = "threadmind-sync-btn";
      btn.innerHTML = "🚀 Sync ThreadMind";

      // ستايل سريع بالـ CSS (ممكن تستبدله بـ Tailwind classes لو شغلتها)
      btn.style.cssText = `
                background-color: #1d9bf0;
                color: white;
                border: none;
                border-radius: 9999px;
                padding: 12px 24px;
                margin: 10px;
                font-weight: bold;
                cursor: pointer;
                width: 90%;
            `;

      btn.onclick = () => {
        alert("جاري سحب البوكماركس.. بص على الـ Terminal بتاع الـ Node.js");
        // بنعمل ريفريش عشان نجبر تويتر يبعت الـ API Request اللي الـ Background مستنيه
        window.location.reload();
      };

      nav.appendChild(btn);
    }
  }, 1000);
}

injectSyncButton();
