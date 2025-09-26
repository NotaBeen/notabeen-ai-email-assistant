// utils/crypto.ts
import crypto from "crypto";

/**
 * Symmetric cipher used across the application. AES-256-GCM provides
 * authenticated encryption with additional data integrity guarantees.
 */
const ALGORITHM = "aes-256-gcm" as const;

/**
 * Supported encodings for secrets provided through environment variables.
 * These align with common representations for binary secrets.
 */
const SUPPORTED_ENCODINGS: BufferEncoding[] = ["base64", "hex", "utf8"];

type SupportedEncoding = (typeof SUPPORTED_ENCODINGS)[number];

/**
 * Internal representation of an environment secret after successful decoding.
 */
interface ResolvedSecret {
  buffer: Buffer;
  encoding: SupportedEncoding;
}

/**
 * Normalises permissive Base64 input (Base64URL or unpadded strings) into a
 * standard Base64 representation consumable by {@link Buffer.from}.
 */
function normaliseBase64(value: string): string {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return base64;
}

/**
 * Validates and decodes an environment secret, attempting multiple encodings
 * until the expected byte length is satisfied.
 *
 * @param value Raw environment variable value.
 * @param expectedBytes Expected length of the decoded secret in bytes.
 * @param variableName Name of the environment variable (for diagnostics).
 * @throws Error when the value is missing or cannot be coerced into the
 *         required byte length using any supported encoding.
 */
function resolveSecret(
  value: string | undefined,
  expectedBytes: number,
  variableName: string,
): ResolvedSecret {
  if (!value) {
    throw new Error(`${variableName} is not defined.`);
  }

  const trimmed = value.trim();

  for (const encoding of SUPPORTED_ENCODINGS) {
    try {
      if (encoding === "hex" && trimmed.length % 2 !== 0) {
        continue;
      }

      const candidate =
        encoding === "base64"
          ? Buffer.from(normaliseBase64(trimmed), "base64")
          : Buffer.from(trimmed, encoding);

      if (candidate.length === expectedBytes) {
        return { buffer: candidate, encoding };
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    `${variableName} must represent exactly ${expectedBytes} bytes (supported encodings: base64, hex, utf8).`,
  );
}

const { buffer: SECRET_KEY_BUFFER, encoding: SECRET_KEY_ENCODING } = resolveSecret(
  process.env.ENCRYPTION_KEY,
  32,
  "ENCRYPTION_KEY",
);

const { buffer: IV_BUFFER, encoding: IV_ENCODING } = resolveSecret(
  process.env.ENCRYPTION_IV,
  12,
  "ENCRYPTION_IV",
);

/**
 * Encrypts a UTF-8 string using the application-wide AES-256-GCM settings.
 *
 * @param text Plaintext string to encrypt.
 * @returns Ciphertext and authentication tag, both hex encoded.
 */
export function encrypt(text: string) {
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY_BUFFER),
    Buffer.from(IV_BUFFER),
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypts AES-256-GCM ciphertext previously produced by {@link encrypt}.
 *
 * @param encryptedData Ciphertext in hex format.
 * @param authTag Authentication tag in hex format.
 * @returns Decrypted plaintext string.
 * @throws Error if the ciphertext cannot be authenticated or decoded.
 */
export function decrypt(encryptedData: string, authTag: string) {
  const authTagBuffer = Buffer.from(authTag, "hex");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY_BUFFER),
    Buffer.from(IV_BUFFER),
  );
  decipher.setAuthTag(authTagBuffer); // Set the authentication tag for verification

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Decodes a Base64URL string (commonly used in JWTs) into UTF-8 text.
 *
 * @param base64Url Input string in Base64URL format.
 * @returns Decoded UTF-8 string, or an empty string when input is falsy.
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

/**
 * Creates a defensive copy of the decoded 32-byte encryption key.
 */
export function getSecretKeyBuffer(): Buffer {
  return Buffer.from(SECRET_KEY_BUFFER);
}

/**
 * Creates a defensive copy of the decoded 12-byte initialisation vector.
 */
export function getIVBuffer(): Buffer {
  return Buffer.from(IV_BUFFER);
}

/**
 * Indicates the encoding originally used for {@link process.env.ENCRYPTION_KEY}.
 */
export function getSecretKeyEncoding(): SupportedEncoding {
  return SECRET_KEY_ENCODING;
}

/**
 * Indicates the encoding originally used for {@link process.env.ENCRYPTION_IV}.
 */
export function getIVEncoding(): SupportedEncoding {
  return IV_ENCODING;
}

/**
 * Convenience wrapper around {@link decrypt} that tolerates missing data.
 *
 * @param encryptedData Hex encoded ciphertext or `null`/`undefined`.
 * @param authTag Hex encoded authentication tag or `null`/`undefined`.
 * @returns Decrypted plaintext, or `null` when inputs are missing or invalid.
 */
export function decryptOptional(
  encryptedData?: string | null,
  authTag?: string | null,
): string | null {
  if (!encryptedData || !authTag) {
    return null;
  }

  try {
    return decrypt(encryptedData, authTag);
  } catch (error) {
    console.error("decryptOptional failed", error);
    return null;
  }
}

export { ALGORITHM as ENCRYPTION_ALGORITHM };
