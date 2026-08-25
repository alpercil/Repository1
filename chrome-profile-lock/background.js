importScripts("lock-crypto.js");

const DEFAULT_IDLE_MINUTES = 5;
const MAX_ATTEMPTS_BEFORE_COOLDOWN = 5;
const COOLDOWN_MS = 30000;
const MAX_TEMP_TABS = 20;
const MAX_TEMP_MINUTES = 180;
const TEMP_UNLOCK_ALARM = "tempUnlockExpiry";
const EMPTY_TEMP_UNLOCK = { expiresAt: 0, slotsRemaining: 0, unlockedTabIds: [] };

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
    "cooldownUntil",
    "tempUnlock"
  ]);
  return {
    passwordHash: data.passwordHash || null,
    passwordSalt: data.passwordSalt || null,
    locked: !!data.locked,
    idleMinutes: data.idleMinutes || DEFAULT_IDLE_MINUTES,
    failedAttempts: data.failedAttempts || 0,
    cooldownUntil: data.cooldownUntil || 0,
    tempUnlock: data.tempUnlock || EMPTY_TEMP_UNLOCK
  };
}

// Geçici (kısmi) kilit açma: normal "Kilidi Aç" tüm sekmeleri açarken, bu
// belirli sayıda sekmeyi belirli bir süreliğine açık tutar, geri kalanı
// kilitli bırakır. `locked` bayrağı true kalmaya devam eder — hangi
// sekmelerin istisna olduğunu tempUnlock.unlockedTabIds tutar.
async function clearTempUnlock() {
  await chrome.alarms.clear(TEMP_UNLOCK_ALARM);
  await chrome.storage.local.set({ tempUnlock: EMPTY_TEMP_UNLOCK });
}

function isTempUnlockActive(tempUnlock) {
  return !!tempUnlock && tempUnlock.expiresAt > Date.now();
}

async function setLocked(locked) {
  const state = await getState();
  if (!state.passwordHash) return; // şifre kurulmadan kilitlenemez, dışarıda kalınmasın
  if (locked) {
    // Yeni bir tam kilit olayı (boşta kalma, OS kilidi, elle kilitleme),
    // önceki geçici izinleri de geçersiz kılar.
    await clearTempUnlock();
    await chrome.storage.local.set({ locked });
  } else {
    await chrome.storage.local.set({ locked });
  }
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

// Süre dolunca geçici izinleri temizle — bu, tempUnlock'u değiştirdiği için
// storage.onChanged üzerinden daha önce açık bırakılan sekmelerin overlay'i
// otomatik geri gelir (bkz. content.js/newtab.js syncFromState).
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === TEMP_UNLOCK_ALARM) {
    await clearTempUnlock();
  }
});

// Kullanıcı, geçici açık kalan sekme hakkının fazlasını (tabCount > 1) başka
// bir kilitli sekmeye geçerek kullanabilir — o sekme şifre sormadan, kalan
// haklardan biri düşülerek açılır. Böylece kullanıcı gerçekten kullanmak
// istediği sekmeler açılır, arka planda sessizce duran diğer sekmeler değil.
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const state = await getState();
  if (!state.locked || !state.passwordHash) return;
  if (!isTempUnlockActive(state.tempUnlock)) return;
  if (state.tempUnlock.unlockedTabIds.includes(tabId)) return;
  if (state.tempUnlock.slotsRemaining <= 0) return;

  const updated = {
    ...state.tempUnlock,
    slotsRemaining: state.tempUnlock.slotsRemaining - 1,
    unlockedTabIds: [...state.tempUnlock.unlockedTabIds, tabId]
  };
  await chrome.storage.local.set({ tempUnlock: updated });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // async response
});

async function handleMessage(message, sender) {
  const state = await getState();

  switch (message.type) {
    case "GET_LOCK_STATE": {
      const tabId = sender.tab && sender.tab.id;
      const tempActive = isTempUnlockActive(state.tempUnlock);
      const tempUnlocked =
        tempActive && tabId != null && state.tempUnlock.unlockedTabIds.includes(tabId);
      return {
        locked: state.locked,
        hasPassword: !!state.passwordHash,
        tempUnlocked,
        tempRemainingMs: tempUnlocked ? Math.max(0, state.tempUnlock.expiresAt - Date.now()) : 0
      };
    }

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

    case "TEMP_UNLOCK_ATTEMPT": {
      if (!state.passwordHash) return { ok: false, error: "Şifre kurulmamış." };

      const now = Date.now();
      if (state.cooldownUntil > now) {
        const secondsLeft = Math.ceil((state.cooldownUntil - now) / 1000);
        return { ok: false, error: `Çok fazla yanlış deneme. ${secondsLeft} sn sonra tekrar dene.` };
      }

      const valid = await verifyPassword(message.password, state.passwordHash, state.passwordSalt);
      if (!valid) {
        // Aynı deneme sayacını paylaşır: bu form üzerinden de brute-force denenebilir.
        const attempts = state.failedAttempts + 1;
        const update = { failedAttempts: attempts };
        if (attempts >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
          update.failedAttempts = 0;
          update.cooldownUntil = now + COOLDOWN_MS;
        }
        await chrome.storage.local.set(update);
        return { ok: false, error: "Yanlış şifre." };
      }

      const tabId = sender.tab && sender.tab.id;
      if (tabId == null) return { ok: false, error: "Sekme bulunamadı." };

      const tabCount = Math.max(1, Math.min(MAX_TEMP_TABS, Number(message.tabCount) || 1));
      const minutes = Math.max(1, Math.min(MAX_TEMP_MINUTES, Number(message.minutes) || 5));
      const expiresAt = now + minutes * 60000;

      const tempUnlock = {
        expiresAt,
        slotsRemaining: tabCount - 1,
        unlockedTabIds: [tabId]
      };
      await chrome.storage.local.set({ tempUnlock, failedAttempts: 0, cooldownUntil: 0 });
      await chrome.alarms.create(TEMP_UNLOCK_ALARM, { when: expiresAt });
      return { ok: true, expiresAt, tabCount, minutes };
    }

    default:
      return { ok: false, error: "Bilinmeyen mesaj." };
  }
}
