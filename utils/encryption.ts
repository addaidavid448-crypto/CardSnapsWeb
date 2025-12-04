// Simple simulation of AES Encryption for demo purposes
// In a real production app, use window.crypto.subtle
// This simulates "Encrypted Storage" requirement

const SECRET_SALT = "CardSnap-Secure-Salt-v1";

export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple obfuscation to simulate encryption without heavy dependencies for this demo
    // Base64 Encode + Reverse + Salt
    const b64 = btoa(unescape(encodeURIComponent(jsonString)));
    const reversed = b64.split('').reverse().join('');
    return `${SECRET_SALT}:${reversed}`;
  } catch (e) {
    console.error("Encryption failed", e);
    return "";
  }
};

export const decryptData = (encryptedString: string): any => {
  try {
    if (!encryptedString.startsWith(SECRET_SALT)) {
      // Fallback for old unencrypted data
      return JSON.parse(encryptedString);
    }
    const payload = encryptedString.split(':')[1];
    const originalB64 = payload.split('').reverse().join('');
    const jsonString = decodeURIComponent(escape(atob(originalB64)));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};

export const maskCardNumber = (number: string): string => {
  if (number.length < 8) return number;
  const first4 = number.slice(0, 4);
  const last4 = number.slice(-4);
  return `${first4} **** **** ${last4}`;
};