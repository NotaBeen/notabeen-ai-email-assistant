// utils/crypto.ts
import crypto from "crypto";

// Ensure these environment variables are always available in your production environment
// and ideally loaded securely (e.g., using a secrets manager).
const SECRET_KEY = process.env.ENCRYPTION_KEY || ""; // Must be 32 bytes
const IV = process.env.ENCRYPTION_IV || ""; // Must be 12 bytes for GCM

const ALGORITHM = "aes-256-gcm";

// Validate keys on import to fail fast if configuration is incorrect
if (SECRET_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes for AES-256-GCM.");
}

if (IV.length !== 12) {
  throw new Error("ENCRYPTION_IV must be 12 bytes for AES-GCM.");
}

/**
 * Encrypts a given text string using AES-256-GCM.
 * @param text The string to encrypt.
 * @returns An object containing the encrypted data (hex string) and the authentication tag (hex string).
 */
export function encrypt(text: string) {
  const ivBuffer = Buffer.from(IV, "utf-8");
  const secretKeyBuffer = Buffer.from(SECRET_KEY, "utf-8");

  const cipher = crypto.createCipheriv(ALGORITHM, secretKeyBuffer, ivBuffer);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypts data encrypted with AES-256-GCM.
 * @param encryptedData The encrypted data in hex format.
 * @param authTag The authentication tag in hex format.
 * @returns The decrypted string.
 * @throws Error if decryption fails (e.g., due to incorrect key, IV, or tampered data).
 */
export function decrypt(encryptedData: string, authTag: string) {
  const ivBuffer = Buffer.from(IV, "utf-8");
  const secretKeyBuffer = Buffer.from(SECRET_KEY, "utf-8");
  const authTagBuffer = Buffer.from(authTag, "hex"); // Auth tag must be buffer for decryption

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    secretKeyBuffer,
    ivBuffer,
  );
  decipher.setAuthTag(authTagBuffer); // Set the authentication tag for verification

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Decodes a Base64Url encoded string.
 * This is useful for parsing parts of JWTs or other URL-safe Base64 strings.
 * @param base64Url The Base64Url string to decode.
 * @returns The decoded string.
 */
export function decodeBase64Url(base64Url: string): string {
  if (!base64Url) {
    return "";
  }
  // Replace characters unsafe for standard Base64
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  return decoded;
}
