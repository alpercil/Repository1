// Şifreyi asla düz metin olarak saklamayız: PBKDF2 (SHA-256, 150k iterasyon) ile
// salt'lı hash üretip sadece hash+salt'ı chrome.storage.local'e yazarız.
// Bu dosya hem background.js (importScripts ile) hem de options.js (<script> ile) tarafından kullanılır.

const PBKDF2_ITERATIONS = 150000;

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveHash(password, saltBytes) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bytesToBase64(new Uint8Array(bits));
}

// Yeni şifre için rastgele salt üretir ve {hash, salt} döner (base64).
async function hashNewPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveHash(password, salt);
  return { hash, salt: bytesToBase64(salt) };
}

// Girilen şifreyi kayıtlı hash+salt ile karşılaştırır.
async function verifyPassword(password, storedHash, storedSaltBase64) {
  const salt = base64ToBytes(storedSaltBase64);
  const hash = await deriveHash(password, salt);
  return timingSafeEqual(hash, storedHash);
}

// Sabit zamanlı string karşılaştırma (timing attack'ı zorlaştırmak için).
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
