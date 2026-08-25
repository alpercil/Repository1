// document_start'ta çalışır: sayfa boyanmadan önce overlay hazır olur.
// chrome://, chrome-extension://, Chrome Web Store gibi dahili sayfalara
// content script enjekte edilemez — bu Chrome platformunun sınırıdır.
(() => {
  const HOST_ID = "__profile_lock_host__";
  let shadowRoot = null;
  let passwordInput = null;
  let errorEl = null;
  let tempCountInput = null;
  let tempMinutesInput = null;
  let tempErrorEl = null;

  // Kilit tetiklendiğinde odak bir iframe içindeyse (ör. gömülü bir editör),
  // overlay görsel olarak üstte olsa da o iframe'in kendi keydown dinleyicileri
  // hâlâ çalışabilir çünkü olaylar frame sınırını aşıp üst pencereye bubbling
  // yapmaz. Odağı elden bırakarak bu sızıntıyı kapatıyoruz.
  function blurActiveElement() {
    const active = document.activeElement;
    if (active && typeof active.blur === "function") active.blur();
  }

  function ensureOverlay() {
    if (document.getElementById(HOST_ID)) return;
    blurActiveElement();
    const host = document.createElement("div");
    host.id = HOST_ID;
    (document.documentElement || document.head || document.body).appendChild(host);
    shadowRoot = host.attachShadow({ mode: "closed" });

    shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          background: #0b0f19;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .card {
          width: 320px;
          max-width: 90vw;
          padding: 32px;
          border-radius: 16px;
          background: #161c2c;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          text-align: center;
        }
        .lock-icon { font-size: 40px; margin-bottom: 8px; }
        h1 { color: #fff; font-size: 18px; margin: 0 0 20px; font-weight: 600; }
        input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #2c3550;
          background: #0f1420;
          color: #fff;
          font-size: 15px;
          outline: none;
        }
        input:focus { border-color: #5b8cff; }
        button {
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: #5b8cff;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }
        button:hover { background: #4a78e6; }
        .error { color: #ff6b6b; font-size: 13px; margin-top: 10px; min-height: 16px; }
        .temp-toggle {
          background: none;
          border: none;
          color: #8b96b8;
          font-size: 12px;
          margin-top: 16px;
          padding: 0;
          text-decoration: underline;
          cursor: pointer;
          width: auto;
        }
        .temp-toggle:hover { background: none; color: #b7c0dd; }
        .temp-form { margin-top: 14px; text-align: left; }
        .temp-form.hidden { display: none; }
        .temp-row { display: flex; gap: 8px; }
        .temp-row > div { flex: 1; }
        .temp-row label { color: #8b96b8; font-size: 11px; display: block; margin-bottom: 4px; }
        .temp-row input { padding: 8px 10px; font-size: 13px; }
        .temp-form button[type="submit"] { margin-top: 10px; }
      </style>
      <div class="overlay">
        <div class="card">
          <div class="lock-icon">🔒</div>
          <h1>Profil kilitli</h1>
          <form id="unlock-form" autocomplete="off">
            <input type="password" id="pw" placeholder="Şifre" autofocus />
            <button type="submit">Kilidi Aç</button>
            <div class="error" id="err"></div>
          </form>
          <button type="button" class="temp-toggle" id="temp-toggle">Sadece bazı sekmeleri geçici aç</button>
          <form id="temp-form" class="temp-form hidden" autocomplete="off">
            <div class="temp-row">
              <div>
                <label for="temp-count">Kaç sekme</label>
                <input type="number" id="temp-count" min="1" max="20" value="1" />
              </div>
              <div>
                <label for="temp-minutes">Kaç dakika</label>
                <input type="number" id="temp-minutes" min="1" max="180" value="5" />
              </div>
            </div>
            <button type="submit">Geçici Aç</button>
            <div class="error" id="temp-err"></div>
          </form>
        </div>
      </div>
    `;

    passwordInput = shadowRoot.getElementById("pw");
    errorEl = shadowRoot.getElementById("err");
    tempCountInput = shadowRoot.getElementById("temp-count");
    tempMinutesInput = shadowRoot.getElementById("temp-minutes");
    tempErrorEl = shadowRoot.getElementById("temp-err");
    shadowRoot.getElementById("unlock-form").addEventListener("submit", onSubmit);
    shadowRoot.getElementById("temp-form").addEventListener("submit", onTempSubmit);
    shadowRoot.getElementById("temp-toggle").addEventListener("click", () => {
      shadowRoot.getElementById("temp-form").classList.toggle("hidden");
    });

    document.documentElement.style.overflow = "hidden";
    exitFullscreenIfLocked();
  }

  function removeOverlay() {
    const host = document.getElementById(HOST_ID);
    if (host) host.remove();
    document.documentElement.style.overflow = "";
    // shadowRoot referansı kalırsa, aşağıdaki "SPA temizlerse geri koy"
    // MutationObserver'ı bu kasıtlı kaldırmayı da geri alıyordu.
    shadowRoot = null;
    passwordInput = null;
    errorEl = null;
    tempCountInput = null;
    tempMinutesInput = null;
    tempErrorEl = null;
  }

  // Sayfa tam ekrandayken kilitlenirse (ör. video oynatılırken), tam ekran
  // katmanı overlay'in üstünde kalır — kilitliyken tam ekrandan çıkar.
  function exitFullscreenIfLocked() {
    if (document.getElementById(HOST_ID) && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }
  document.addEventListener("fullscreenchange", exitFullscreenIfLocked, true);

  // Kapalı shadow DOM içindeki input'a yazılan tuşlar da composed event
  // olarak sayfanın kendi keydown dinleyicilerine (ör. YouTube'un "f" tam
  // ekran kısayolu) ulaşabiliyor. İki katman gerekiyor:
  // 1) Capture aşamasında (window): bize ait olmayan (overlay dışı) tüm
  //    tuşları sayfa hiç görmeden durdur.
  // 2) Bubble aşamasında (documentElement, host'un hemen üstü): bize ait
  //    tuşları input işledikten sonra da durdur — yoksa event input'tan
  //    geçtikten sonra normal şekilde document/window'a kadar "bubble"
  //    edip oradaki sayfa dinleyicilerine (target'a bakmaksızın sadece
  //    tuşu kontrol eden) yine ulaşabiliyor.
  function isOverlayEvent(e) {
    const host = document.getElementById(HOST_ID);
    return !!host && e.target === host;
  }
  function blockForeignKey(e) {
    if (!document.getElementById(HOST_ID)) return;
    if (isOverlayEvent(e)) return; // bize gidiyor, dokunma
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
  }
  function stopOwnKeyFromBubbling(e) {
    if (isOverlayEvent(e)) {
      e.stopImmediatePropagation();
      e.stopPropagation();
    }
  }
  ["keydown", "keyup", "keypress"].forEach((evt) => {
    window.addEventListener(evt, blockForeignKey, true);
    if (document.documentElement) {
      document.documentElement.addEventListener(evt, stopOwnKeyFromBubbling, false);
    }
  });

  async function onSubmit(e) {
    e.preventDefault();
    const password = passwordInput.value;
    errorEl.textContent = "";
    let res;
    try {
      res = await chrome.runtime.sendMessage({ type: "UNLOCK_ATTEMPT", password });
    } catch (err) {
      errorEl.textContent = "Uzantı güncellendi, lütfen sayfayı yenile (F5) ve tekrar dene.";
      return;
    }
    if (!res.ok) {
      errorEl.textContent = res.error || "Yanlış şifre.";
      passwordInput.value = "";
      passwordInput.focus();
      return;
    }
    // storage.onChanged diğer sekmeleri açacak; bu sekmeyi hemen açıyoruz,
    // event'in dolaylı olarak tetiklenmesini beklemiyoruz.
    removeOverlay();
  }

  // Sadece bu sekmeyi (+ istenirse birkaç sekme daha) belirli bir süreliğine
  // açar; diğer tüm sekmeler kilitli kalır. bkz. background.js TEMP_UNLOCK_ATTEMPT.
  async function onTempSubmit(e) {
    e.preventDefault();
    const password = passwordInput.value;
    const tabCount = tempCountInput.value;
    const minutes = tempMinutesInput.value;
    tempErrorEl.textContent = "";
    let res;
    try {
      res = await chrome.runtime.sendMessage({
        type: "TEMP_UNLOCK_ATTEMPT",
        password,
        tabCount,
        minutes
      });
    } catch (err) {
      tempErrorEl.textContent = "Uzantı güncellendi, lütfen sayfayı yenile (F5) ve tekrar dene.";
      return;
    }
    if (!res.ok) {
      tempErrorEl.textContent = res.error || "Yanlış şifre.";
      passwordInput.value = "";
      return;
    }
    removeOverlay();
  }

  function syncFromState(state) {
    if (state.hasPassword && state.locked && !state.tempUnlocked) {
      ensureOverlay();
    } else {
      removeOverlay();
    }
  }

  chrome.runtime.sendMessage({ type: "GET_LOCK_STATE" }).then(syncFromState).catch(() => {});

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if ("locked" in changes || "passwordHash" in changes || "tempUnlock" in changes) {
      chrome.runtime.sendMessage({ type: "GET_LOCK_STATE" }).then(syncFromState).catch(() => {});
    }
  });

  // SPA'lar veya sayfa script'leri documentElement'i temizlerse overlay'i geri koy.
  const observer = new MutationObserver(() => {
    if (shadowRoot && !document.getElementById(HOST_ID)) {
      const host = shadowRoot.host;
      (document.documentElement || document.body).appendChild(host);
    }
  });
  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true });
  }

  // background.js, idle anında bu sekmede video/ses çalıp çalmadığını sorar
  // (bkz. background.js: isAnyTabPlayingMedia). Durumu bellekte tutup push
  // etmek yerine anlık sorguya yanıt veriyoruz: service worker uykuya
  // dalıp yeniden başlayabildiği için önceden gönderilmiş bir durum kaybolabilir,
  // sorguya her seferinde DOM'dan taze cevap vermek bu sorunu ortadan kaldırır.
  function isMediaPlaying() {
    return Array.from(document.querySelectorAll("video, audio")).some(
      (el) => !el.paused && !el.ended && el.readyState > 2
    );
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === "QUERY_MEDIA_STATE") {
      sendResponse({ playing: isMediaPlaying() });
    }
  });
})();
