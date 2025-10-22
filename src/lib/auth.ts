// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";

// --- MongoDB Singleton Setup ---
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const MONGODB_CLIENT_NAME = process.env.MONGO_CLIENT;

if (!uri) throw new Error("MONGODB_URI is not defined");
if (!MONGODB_CLIENT_NAME)
  throw new Error("MONGO_CLIENT database name is not defined");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export const getMongoClient = () => clientPromise;

// --- Encryption utilities (Using AUTH_SECRET from .env) ---
const SECRET = process.env.AUTH_SECRET!;
if (!SECRET || SECRET.length !== 64) {
  throw new Error(
    "AUTH_SECRET must be a 64-character hex string (32 bytes) for encryption.",
  );
}

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(SECRET, "hex");
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(encryptedText: string): string {
  const data = Buffer.from(encryptedText, "base64");
  const iv = data.slice(0, IV_LENGTH);
  const tag = data.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const text = data.slice(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  return decipher.update(text, undefined, "utf8") + decipher.final("utf8");
}

// --- Environment Variable Validation ---
const requiredEnvVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.AUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGO_CLIENT: process.env.MONGO_CLIENT,
};

// Validate all required environment variables and halt if any are missing
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. Please check your .env file and ensure all required variables are set.`
  );
}

// --- Better Auth Configuration ---
// Better Auth requires both the connected Db instance AND the MongoClient
// During build time, we create a minimal stub to avoid database connection
const isBuildTime = process.env.SKIP_DB_CONNECTION === 'true';

let mongoClient: MongoClient;
let mongoDb;

if (!isBuildTime) {
  mongoClient = await clientPromise;
  mongoDb = mongoClient.db(MONGODB_CLIENT_NAME);
} else {
  // Create stub instances for build time
  mongoClient = {
    db: () => ({
      collection: () => ({}),
    }),
  } as unknown as MongoClient;
  mongoDb = {} as ReturnType<MongoClient['db']>;
}

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb, {
    client: mongoClient
  }),

  emailAndPassword: {
    enabled: false, // We only use OAuth
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      enabled: true,
      accessType: "offline",
      prompt: "consent",
      scope: [
        "openid",
        "profile",
        "email",
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
      // Map tokens to be stored in the account table
      mapProfileToUser: (profile) => ({
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        image: profile.picture,
        emailVerified: profile.email_verified,
      }),
    },
  },

  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET!,

  // Base URL for callbacks
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",

  // Trust host in production
  trustedOrigins: process.env.BETTER_AUTH_URL
    ? [process.env.BETTER_AUTH_URL]
    : process.env.NEXTAUTH_URL
    ? [process.env.NEXTAUTH_URL]
    : ["http://localhost:3000"],

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
});

// Helper function to detect if a string is base64 encoded (likely encrypted)
function isLikelyEncrypted(str: string): boolean {
  // Encrypted tokens are base64 encoded and start with random characters
  // OAuth tokens typically start with "ya29." for Google
  // If it starts with "ya29." it's likely NOT encrypted
  if (str.startsWith("ya29.")) {
    return false;
  }
  // If it's base64-like and doesn't look like a typical OAuth token, it's likely encrypted
  return /^[A-Za-z0-9+/]+=*$/.test(str) && str.length > 50;
}

// Helper function to get decrypted access token for a user
export async function getGoogleAccessToken(
  userId: string,
): Promise<string | null> {
  try {
    const db = await clientPromise;
    const accountsCollection = db
      .db(MONGODB_CLIENT_NAME)
      .collection("account");

    // Convert userId string to ObjectId for MongoDB query
    const account = await accountsCollection.findOne({
      userId: new ObjectId(userId),
      providerId: "google",
    });

    if (!account || !account.accessToken) {
      return null;
    }

    const token = account.accessToken as string;

    // Try to detect if the token is encrypted
    // If it looks encrypted, decrypt it. Otherwise, return as-is.
    try {
      if (isLikelyEncrypted(token)) {
        return decrypt(token);
      }
      return token;
    } catch (decryptError) {
      // If decryption fails, try returning the token as-is
      console.warn("Token decryption failed, using token as-is:", decryptError);
      return token;
    }
  } catch (error) {
    console.error("Error fetching Google access token:", error);
    return null;
  }
}

// Helper function to get decrypted refresh token
export async function getGoogleRefreshToken(
  userId: string,
): Promise<string | null> {
  try {
    const db = await clientPromise;
    const accountsCollection = db
      .db(MONGODB_CLIENT_NAME)
      .collection("account");

    // Convert userId string to ObjectId for MongoDB query
    const account = await accountsCollection.findOne({
      userId: new ObjectId(userId),
      providerId: "google",
    });

    if (!account || !account.refreshToken) {
      return null;
    }

    const token = account.refreshToken as string;

    // Try to detect if the token is encrypted
    // If it looks encrypted, decrypt it. Otherwise, return as-is.
    try {
      if (isLikelyEncrypted(token)) {
        return decrypt(token);
      }
      return token;
    } catch (decryptError) {
      // If decryption fails, try returning the token as-is
      console.warn("Token decryption failed, using token as-is:", decryptError);
      return token;
    }
  } catch (error) {
    console.error("Error fetching Google refresh token:", error);
    return null;
  }
}
