importScripts("lock-crypto.js");

const DEFAULT_IDLE_MINUTES = 5;
const MAX_ATTEMPTS_BEFORE_COOLDOWN = 5;
const COOLDOWN_MS = 30000;

// Idle tetiklendiğinde, hangi sekmenin video/ses oynattığını bellekte tutmak
// yerine anlık olarak sorarız: MV3 service worker'ı birkaç saniye işlemsizlikten
// sonra kapanıp yeniden başlayabiliyor, bu da bellekte tutulan bir Set'i
// sessizce sıfırlayıp "hâlâ oynatılıyor" bilgisini kaybettirirdi (uzun bir
// video izlerken, yeni bir play/pause olayı gelmeden SW yeniden başlarsa,
// idle anında yanlışlıkla kilitlenirdi).
async function isAnyTabPlayingMedia() {
  const tabs = await chrome.tabs.query({});
  const results = await Promise.all(
    tabs.map((tab) =>
      chrome.tabs
        .sendMessage(tab.id, { type: "QUERY_MEDIA_STATE" })
        .catch(() => ({ playing: false }))
    )
  );
  return results.some((r) => r && r.playing);
}

async function getState() {
  const data = await chrome.storage.local.get([
    "passwordHash",
    "passwordSalt",
    "locked",
    "idleMinutes",
    "failedAttempts",
    "cooldownUntil"
  ]);
  return {
    passwordHash: data.passwordHash || null,
    passwordSalt: data.passwordSalt || null,
    locked: !!data.locked,
    idleMinutes: data.idleMinutes || DEFAULT_IDLE_MINUTES,
    failedAttempts: data.failedAttempts || 0,
    cooldownUntil: data.cooldownUntil || 0
  };
}

async function setLocked(locked) {
  const state = await getState();
  if (!state.passwordHash) return; // şifre kurulmadan kilitlenemez, dışarıda kalınmasın
  await chrome.storage.local.set({ locked });
}

async function applyIdleDetection(idleMinutes) {
  chrome.idle.setDetectionInterval(Math.max(15, idleMinutes * 60));
}

chrome.runtime.onInstalled.addListener(async () => {
  const state = await getState();
  await applyIdleDetection(state.idleMinutes);
  if (!state.passwordHash) {
    chrome.runtime.openOptionsPage();
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const state = await getState();
  await applyIdleDetection(state.idleMinutes);
  if (state.passwordHash) {
    await setLocked(true);
  }
});

chrome.idle.onStateChanged.addListener(async (newState) => {
  if (newState === "locked") {
    // İşletim sistemi ekranı kilitlendi: kullanıcı kesin olarak ayrılmış demektir.
    await setLocked(true);
    return;
  }
  if (newState === "idle") {
    // Klavye/mouse boşta ama bir sekmede video/ses çalıyorsa kullanıcı hâlâ burada demektir.
    if (await isAnyTabPlayingMedia()) return;
    await setLocked(true);
  }
});

chrome.action.onClicked.addListener(async () => {
  await setLocked(true);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // async response
});

async function handleMessage(message, sender) {
  const state = await getState();

  switch (message.type) {
    case "GET_LOCK_STATE":
      return { locked: state.locked, hasPassword: !!state.passwordHash };

    case "SET_PASSWORD": {
      const { password } = message;
      const { hash, salt } = await hashNewPassword(password);
      await chrome.storage.local.set({
        passwordHash: hash,
        passwordSalt: salt,
        locked: false,
        failedAttempts: 0,
        cooldownUntil: 0
      });
      return { ok: true };
    }

    case "CHANGE_PASSWORD": {
      const { oldPassword, newPassword } = message;
      if (!state.passwordHash) return { ok: false, error: "Henüz şifre kurulmamış." };
      const valid = await verifyPassword(oldPassword, state.passwordHash, state.passwordSalt);
      if (!valid) return { ok: false, error: "Mevcut şifre yanlış." };
      const { hash, salt } = await hashNewPassword(newPassword);
      await chrome.storage.local.set({ passwordHash: hash, passwordSalt: salt });
      return { ok: true };
    }

    case "SET_IDLE_MINUTES": {
      const minutes = Math.max(1, Number(message.minutes) || DEFAULT_IDLE_MINUTES);
      await chrome.storage.local.set({ idleMinutes: minutes });
      await applyIdleDetection(minutes);
      return { ok: true };
    }

    case "LOCK_NOW":
      await setLocked(true);
      return { ok: true };

    case "UNLOCK_ATTEMPT": {
      if (!state.passwordHash) return { ok: false, error: "Şifre kurulmamış." };

      const now = Date.now();
      if (state.cooldownUntil > now) {
        const secondsLeft = Math.ceil((state.cooldownUntil - now) / 1000);
        return { ok: false, error: `Çok fazla yanlış deneme. ${secondsLeft} sn sonra tekrar dene.` };
      }

      const valid = await verifyPassword(message.password, state.passwordHash, state.passwordSalt);
      if (valid) {
        await chrome.storage.local.set({ locked: false, failedAttempts: 0, cooldownUntil: 0 });
        return { ok: true };
      }

      const attempts = state.failedAttempts + 1;
      const update = { failedAttempts: attempts };
      if (attempts >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
        update.failedAttempts = 0;
        update.cooldownUntil = now + COOLDOWN_MS;
      }
      await chrome.storage.local.set(update);
      return { ok: false, error: "Yanlış şifre." };
    }

    default:
      return { ok: false, error: "Bilinmeyen mesaj." };
  }
}
