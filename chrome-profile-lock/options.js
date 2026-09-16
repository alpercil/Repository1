(() => {
  const setupSection = document.getElementById("setup-section");
  const changeSection = document.getElementById("change-section");
  const idleSection = document.getElementById("idle-section");
  const lockNowSection = document.getElementById("lock-now-section");
  const whitelistSection = document.getElementById("whitelist-section");

  async function refresh() {
    const { hasPassword } = await chrome.runtime.sendMessage({ type: "GET_LOCK_STATE" });
    setupSection.classList.toggle("hidden", hasPassword);
    changeSection.classList.toggle("hidden", !hasPassword);
    idleSection.classList.toggle("hidden", !hasPassword);
    lockNowSection.classList.toggle("hidden", !hasPassword);
    whitelistSection.classList.toggle("hidden", !hasPassword);

    const { idleMinutes, whitelistedHosts } = await chrome.storage.local.get([
      "idleMinutes",
      "whitelistedHosts"
    ]);
    document.getElementById("idle-minutes").value = idleMinutes || 5;
    document.getElementById("whitelist").value = (whitelistedHosts || []).join("\n");

    const builtIn = await chrome.runtime.sendMessage({ type: "GET_BUILT_IN_WHITELIST" });
    const list = document.getElementById("builtin-whitelist");
    list.textContent = "";
    for (const host of builtIn.hosts) {
      const li = document.createElement("li");
      li.textContent = host;
      list.appendChild(li);
    }
  }

  function showMsg(el, text, ok) {
    el.textContent = text;
    el.className = "msg " + (ok ? "ok" : "error");
  }

  document.getElementById("setup-btn").addEventListener("click", async () => {
    const p1 = document.getElementById("new-pw-1").value;
    const p2 = document.getElementById("new-pw-2").value;
    const msg = document.getElementById("setup-msg");
    if (p1.length < 8) return showMsg(msg, "Şifre en az 8 karakter olmalı.", false);
    if (p1 !== p2) return showMsg(msg, "Şifreler eşleşmiyor.", false);
    const res = await chrome.runtime.sendMessage({ type: "SET_PASSWORD", password: p1 });
    if (res.ok) {
      showMsg(msg, "Şifre kuruldu.", true);
      document.getElementById("new-pw-1").value = "";
      document.getElementById("new-pw-2").value = "";
      refresh();
    }
  });

  document.getElementById("change-btn").addEventListener("click", async () => {
    const oldPw = document.getElementById("old-pw").value;
    const p1 = document.getElementById("change-pw-1").value;
    const p2 = document.getElementById("change-pw-2").value;
    const msg = document.getElementById("change-msg");
    if (p1.length < 8) return showMsg(msg, "Yeni şifre en az 8 karakter olmalı.", false);
    if (p1 !== p2) return showMsg(msg, "Yeni şifreler eşleşmiyor.", false);
    const res = await chrome.runtime.sendMessage({
      type: "CHANGE_PASSWORD",
      oldPassword: oldPw,
      newPassword: p1
    });
    if (res.ok) {
      showMsg(msg, "Şifre değiştirildi.", true);
      document.getElementById("old-pw").value = "";
      document.getElementById("change-pw-1").value = "";
      document.getElementById("change-pw-2").value = "";
    } else {
      showMsg(msg, res.error, false);
    }
  });

  document.getElementById("idle-btn").addEventListener("click", async () => {
    const minutes = document.getElementById("idle-minutes").value;
    const msg = document.getElementById("idle-msg");
    await chrome.runtime.sendMessage({ type: "SET_IDLE_MINUTES", minutes });
    showMsg(msg, "Kaydedildi.", true);
  });

  document.getElementById("whitelist-btn").addEventListener("click", async () => {
    const msg = document.getElementById("whitelist-msg");
    const hosts = document
      .getElementById("whitelist")
      .value.split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const res = await chrome.runtime.sendMessage({ type: "SET_WHITELIST", hosts });
    if (!res.ok) return showMsg(msg, res.error || "Kaydedilemedi.", false);
    document.getElementById("whitelist").value = res.hosts.join("\n");
    showMsg(
      msg,
      res.hosts.length ? `${res.hosts.length} site kaydedildi.` : "Liste boşaltıldı.",
      true
    );
  });

  document.getElementById("lock-now-btn").addEventListener("click", async () => {
    await chrome.runtime.sendMessage({ type: "LOCK_NOW" });
    window.close();
  });

  refresh();
})();
