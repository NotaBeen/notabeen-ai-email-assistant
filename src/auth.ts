// src/auth.ts
export const runtime = "nodejs";

import { MongoClient } from "mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth, { Session } from "next-auth";
import { Adapter, AdapterAccount } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";

// --- Custom Type Definition for Adapter Interception ---
type AdapterAccountMethods = Adapter & {
  createAccount: (account: AdapterAccount) => Promise<AdapterAccount>;
  getAccount: (
    providerAccountId: string,
    provider: string,
  ) => Promise<AdapterAccount | null>;
  linkAccount: (account: AdapterAccount) => Promise<AdapterAccount | undefined>;
};

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
const ENCRYPTION_FIELDS = [
  "access_token",
  "id_token",
  "refresh_token",
  "scope",
  "token_type",
] as const;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decrypt(encryptedText: string): string {
  const data = Buffer.from(encryptedText, "base64");
  const iv = data.slice(0, IV_LENGTH);
  const tag = data.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const text = data.slice(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  return decipher.update(text, undefined, "utf8") + decipher.final("utf8");
}

// --- Custom Adapter Wrapper for Encryption/Decryption ---
function PatchedMongoDBAdapter(
  p: Promise<MongoClient>,
  options: Record<string, unknown>,
): Adapter {
  const adapter = MongoDBAdapter(p, options) as AdapterAccountMethods;

  const encryptAccountFields = (account: AdapterAccount): AdapterAccount => {
    const encryptedAccount = { ...account };
    for (const field of ENCRYPTION_FIELDS) {
      const value = encryptedAccount[field as keyof AdapterAccount] as
        | string
        | undefined;
      if (value) {
        encryptedAccount[field as keyof AdapterAccount] = encrypt(value);
      }
    }
    return encryptedAccount;
  };

  const decryptAccountFields = (account: AdapterAccount): AdapterAccount => {
    const decryptedAccount = { ...account };
    for (const field of ENCRYPTION_FIELDS) {
      const value = decryptedAccount[field as keyof AdapterAccount] as
        | string
        | undefined;

      if (value) {
        try {
          const decryptedValue = decrypt(value);
          decryptedAccount[field as keyof AdapterAccount] = decryptedValue;
        } catch (e) {
          console.error(
            `[DECRYPTION_ERROR] Failed to decrypt field ${field} for user ${account.userId}. Please check AUTH_SECRET and encryption fields.`,
            e,
          );
        }
      }
    }
    return decryptedAccount;
  };

  return {
    ...adapter,
    createAccount: async (account: AdapterAccount) => {
      const encryptedAccount = encryptAccountFields(account);
      return adapter.createAccount(encryptedAccount);
    },
    getAccount: async (providerAccountId, provider) => {
      const account = await adapter.getAccount(providerAccountId, provider);
      if (!account) return null;
      return decryptAccountFields(account);
    },
    linkAccount: async (account: AdapterAccount) => {
      const encryptedAccount = encryptAccountFields(account);
      return adapter.linkAccount(encryptedAccount);
    },
  } as Adapter;
}

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

// --- Environment Variable Validation ---
const requiredEnvVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.AUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGO_CLIENT: process.env.MONGO_CLIENT,
};

// Log missing environment variables for debugging
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  console.error('Please check your .env file and ensure all required variables are set.');
}

// --- NextAuth Configuration ---
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  adapter: PatchedMongoDBAdapter(clientPromise, {
    databaseName: MONGODB_CLIENT_NAME,
    useEncryption: false,
    encryptionKeys: {
      Account: ENCRYPTION_FIELDS as unknown as string[],
      User: ["email", "image"],
    },
  }) as Adapter,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope:
            "openid profile email https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET!,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && user.id) token.sub = user.id;

      if (account && account.provider === "google") {
        if (account.access_token)
          token.googleAccessToken = account.access_token;
        if (account.refresh_token)
          token.googleRefreshToken = account.refresh_token;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub as string;

      if (typeof token.googleAccessToken === "string")
        session.googleAccessToken = token.googleAccessToken;

      if (
        "googleRefreshToken" in token &&
        typeof token.googleRefreshToken === "string"
      ) {
        (
          session as Session & { googleRefreshToken?: string }
        ).googleRefreshToken = token.googleRefreshToken;
      }

      return session;
    },
  },
});

// --- Extend NextAuth types ---
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    googleAccessToken?: string;
    googleRefreshToken?: string;
  }
}

declare module "next-auth" {
  interface JWT {
    googleAccessToken?: string;
    googleRefreshToken?: string;
  }
}
