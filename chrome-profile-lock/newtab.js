(() => {
  const lockScreen = document.getElementById("lock-screen");
  const openScreen = document.getElementById("open-screen");
  const pw = document.getElementById("pw");
  const err = document.getElementById("err");

  function render(state) {
    if (state.hasPassword && state.locked) {
      lockScreen.classList.remove("hidden");
      openScreen.classList.add("hidden");
      pw.focus();
    } else {
      lockScreen.classList.add("hidden");
      openScreen.classList.remove("hidden");
      document.getElementById("q").focus();
    }
  }

  chrome.runtime.sendMessage({ type: "GET_LOCK_STATE" }).then(render);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if ("locked" in changes || "passwordHash" in changes) {
      chrome.runtime.sendMessage({ type: "GET_LOCK_STATE" }).then(render);
    }
  });

  document.getElementById("unlock-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "";
    let res;
    try {
      res = await chrome.runtime.sendMessage({ type: "UNLOCK_ATTEMPT", password: pw.value });
    } catch (err2) {
      err.textContent = "Uzantı güncellendi, lütfen sayfayı yenile (F5) ve tekrar dene.";
      return;
    }
    if (!res.ok) {
      err.textContent = res.error || "Yanlış şifre.";
      pw.value = "";
      pw.focus();
      return;
    }
    render({ hasPassword: true, locked: false });
  });

  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("q").value.trim();
    if (!q) return;
    const looksLikeUrl = /^([a-z]+:\/\/)|(^[\w-]+\.[a-z]{2,}(\/.*)?$)/i.test(q);
    window.location.href = looksLikeUrl
      ? (q.startsWith("http") ? q : `https://${q}`)
      : `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  });
})();
