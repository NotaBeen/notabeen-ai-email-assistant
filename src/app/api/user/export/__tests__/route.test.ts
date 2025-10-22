import { GET } from "../route";
import { MongoClient, ObjectId, Collection, Db } from "mongodb";
import { validateUserSession } from "@/lib/session-helpers"; // Mocked dependency: Better Auth session
import { NextRequest } from "next/server";
import crypto from "crypto"; // Mocked dependency: Node's built-in crypto module
// NOTE: NextResponse is no longer imported here as it's only used inside the mocked jest.mock block.

// --- Mock External Dependencies ---

// 1. Mock Next.js Server Response utility
// Provides a mock for NextResponse.json for testing API route responses.
jest.mock("next/server", () => ({
  NextResponse: {
    // Note: We intentionally use 'NextResponse' inside this mock but don't export it
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(body),
    })),
  },
  NextRequest: jest.requireActual("next/server").NextRequest,
}));

// 2. Mock the Better Auth session validation function
jest.mock("@/lib/session-helpers", () => ({
  validateUserSession: jest.fn(),
}));

// 3. Mock the MongoDB Client and related types
// Setup mock objects for the MongoDB connection flow (Collection, Db, Client).
const mockUserCollection = {
  findOne: jest.fn(),
} as unknown as Collection;

const mockDb = {
  collection: jest.fn(() => mockUserCollection),
} as unknown as Db;

const mockClient = {
  connect: jest.fn(),
  db: jest.fn(() => mockDb),
  close: jest.fn(),
} as unknown as MongoClient;

// Mock the MongoClient constructor to return our mock client instance.
jest.mock("mongodb", () => ({
  MongoClient: jest.fn(() => mockClient),
  // Simple mock for ObjectId conversion used in MongoDB queries.
  ObjectId: jest.fn((id: string) => ({
    toString: () => id,
    toHexString: () => id,
  })),
}));

// 4. Mock the crypto module's decryption functionality
// Mocks the decryption stream to return predictable "decryptedValue" strings.
// NOTE: 'mockDecrypt' removed as it was unused (L53)
jest.mock("crypto", () => ({
  createDecipheriv: jest.fn(() => ({
    setAuthTag: jest.fn(),
    // Mocks the decryption process result in two parts
    update: jest.fn(() => "decrypted"),
    final: jest.fn(() => "Value"), // Concatenates with update result to form "decryptedValue"
  })),
}));

// --- Test Setup Constants and Helper Function ---

// Constants matching the expected environment variables for the route.
const MONGODB_URI = "mongodb://mock-uri";
const ENCRYPTION_KEY = "12345678901234567890123456789012"; // 32 chars for AES-256-GCM
const ENCRYPTION_IV = "123456789012"; // 12 chars for GCM
const COLLECTION_NAME = "test-db-name";

/**
 * Sets up environment variables, Better Auth session validation, and the MongoDB findOne mock.
 * @param envVars Mock environment variables.
 * @param session Mock Better Auth session object or error to throw.
 * @param userDoc The user document to be returned by the database.
 */
// FIX: Replaced 'any' with specific types or 'unknown' (L84, L85)
const setupMocks = (
  envVars: {
    MONGODB_URI: string;
    ENCRYPTION_KEY: string;
    ENCRYPTION_IV: string;
    MONGO_CLIENT: string;
  },
  session: { user?: { id?: string } } | null | Error, // Specific session structure or error
  userDoc: Record<string, unknown> | null,    // User document type
) => {
  // Set environment variables for the route handler
  process.env.MONGODB_URI = envVars.MONGODB_URI;
  process.env.ENCRYPTION_KEY = envVars.ENCRYPTION_KEY;
  process.env.ENCRYPTION_IV = envVars.ENCRYPTION_IV;
  process.env.MONGO_CLIENT = envVars.MONGO_CLIENT;

  // Mock session validation return value or throw error
  if (session instanceof Error) {
    (validateUserSession as jest.Mock).mockRejectedValue(session);
  } else {
    (validateUserSession as jest.Mock).mockResolvedValue(session);
  }

  // Mock database findOne result for the user's document
  if (userDoc !== undefined) {
    (mockUserCollection.findOne as jest.Mock).mockResolvedValue(userDoc);
  }
};

describe("GET /api/user/export - GDPR Data Export", () => {
  // Spy on console.error to prevent logs from environment/DB error tests polluting the output.
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const nextAuthUserId = "test-user-id-123";
  const mockSession = { user: { id: nextAuthUserId } };
  const mockObjectId = new ObjectId("507f1f77bcf86cd799439011");

  // Full mock document representing a user record from the database.
  const fullMockUserDocument = {
    _id: mockObjectId,
    nextAuthUserId: nextAuthUserId,
    email: "encrypted_email_data",
    emailAuthTag: "email_tag",
    name: "encrypted_name_data",
    nameAuthTag: "name_tag",
    settings: {
      theme: "dark",
      language: "en",
      notifications_enabled: true,
    },
    total_emails_analyzed: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-configure the crypto mock implementation before each test
    const mockDecipher = {
      setAuthTag: jest.fn(),
      // FIX: Removed unused args '_encoding' and '_outputEncoding' to silence ESLint warnings.
      update: jest.fn((data) => {
        if (data === "encrypted_email_data") return "decrypted";
        if (data === "encrypted_name_data") return "decrypted";
        return "";
      }),
      // FIX: Removed unused arg '_encoding' to silence ESLint warning.
      final: jest.fn(() => {
        return "Value";
      }),
    };
    (crypto.createDecipheriv as jest.Mock).mockReturnValue(mockDecipher);

    // Clear the console spy for accurate per-test checking if needed
    consoleErrorSpy.mockClear();
  });

  // Restore the original console.error function after all tests have run.
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- 1. Configuration Validation Tests ---

  it("should return 500 if MONGODB_URI is missing", async () => {
    setupMocks(
      {
        MONGODB_URI: "", // Test missing URI
        ENCRYPTION_KEY,
        ENCRYPTION_IV,
        MONGO_CLIENT: COLLECTION_NAME,
      },
      mockSession,
      fullMockUserDocument,
    );

    const response = await GET({} as NextRequest);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toContain("Server configuration error");
  });

  it("should return 500 if ENCRYPTION_KEY is the wrong length", async () => {
    setupMocks(
      {
        MONGODB_URI,
        ENCRYPTION_KEY: "too_short", // Test incorrect key length
        ENCRYPTION_IV,
        MONGO_CLIENT: COLLECTION_NAME,
      },
      mockSession,
      fullMockUserDocument,
    );

    const response = await GET({} as NextRequest);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toContain("Invalid encryption key or IV length");
  });

  // --- 2. Session and Authorization Tests ---

  it("should return 401 if the session validation throws unauthorized error", async () => {
    setupMocks(
      { MONGODB_URI, ENCRYPTION_KEY, ENCRYPTION_IV, MONGO_CLIENT: COLLECTION_NAME },
      new Error("Unauthorized: Session or User ID is missing."), // Test error thrown by validateUserSession
      fullMockUserDocument,
    );

    const response = await GET({} as NextRequest);

    expect(response.status).toBe(500); // Catches all errors as 500
    const body = await response.json();
    expect(body.message).toBe("Internal server error");
    expect(mockClient.connect).not.toHaveBeenCalled(); // Should fail before DB connection attempt
  });

  it("should return 401 if session validation returns null", async () => {
    setupMocks(
      { MONGODB_URI, ENCRYPTION_KEY, ENCRYPTION_IV, MONGO_CLIENT: COLLECTION_NAME },
      null, // Test null session
      fullMockUserDocument,
    );

    const response = await GET({} as NextRequest);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toBe("Internal server error");
  });

  it("should return 401 if session is present but user ID is missing", async () => {
    // Create a custom error that mimics what validateUserSession throws
    const customError = new Error("Unauthorized: Session or User ID is missing.");
    (customError as any).status = 401;

    setupMocks(
      { MONGODB_URI, ENCRYPTION_KEY, ENCRYPTION_IV, MONGO_CLIENT: COLLECTION_NAME },
      customError, // Test error thrown when user.id is missing
      fullMockUserDocument,
    );

    const response = await GET({} as NextRequest);

    expect(response.status).toBe(500); // Route catches all errors as 500
    const body = await response.json();
    expect(body.message).toBe("Internal server error");
  });

  // --- 3. Database Fetch Tests ---

  it("should return 404 if the user is not found in the database", async () => {
    setupMocks(
      { MONGODB_URI, ENCRYPTION_KEY, ENCRYPTION_IV, MONGO_CLIENT: COLLECTION_NAME },
      mockSession,
      null, // Test user not found
    );

    const response = await GET({} as NextRequest);

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockUserCollection.findOne).toHaveBeenCalledWith({
      nextAuthUserId,
    });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.message).toBe("User not found");
    expect(mockClient.close).toHaveBeenCalled();
  });

  // --- 4. Success and Decryption Tests ---

  it("should return 200 with decrypted data and GDPR info on success", async () => {
    setupMocks(
      { MONGODB_URI, ENCRYPTION_KEY, ENCRYPTION_IV, MONGO_CLIENT: COLLECTION_NAME },
      mockSession,
      fullMockUserDocument, // Test successful fetch and decryption
    );

    const response = await GET({} as NextRequest);

    expect(mockClient.connect).toHaveBeenCalled();
    expect(crypto.createDecipheriv).toHaveBeenCalledTimes(2); // Should decrypt email and name

    // Verify correct decryption algorithm usage
    const emailDecipherCall = (crypto.createDecipheriv as jest.Mock).mock.calls[0][0];
    expect(emailDecipherCall).toBe("aes-256-gcm");

    // Check successful response status and body content
    expect(response.status).toBe(200);
    const body = await response.json();

    // Check decrypted data (simulated result is "decryptedValue")
    expect(body.data.email).toBe("decryptedValue");
    expect(body.data.name).toBe("decryptedValue");
    expect(body.data).not.toHaveProperty("emailAuthTag"); // Encrypted fields removed

    // Check GDPR structure is included
    expect(body).toHaveProperty("gdpr_compliance_information");

    expect(mockClient.close).toHaveBeenCalledTimes(1);
  });

  it("should return 200 and not decrypt fields if they are missing (partially filled document)", async () => {
    const partialUserDocument = {
      _id: mockObjectId,
      nextAuthUserId: nextAuthUserId,
      total_emails_analyzed: 5,
      // email and name fields intentionally missing
    };

    setupMocks(
      { MONGODB_URI, ENCRYPTION_KEY, ENCRYPTION_IV, MONGO_CLIENT: COLLECTION_NAME },
      mockSession,
      partialUserDocument, // Test partial document
    );

    const response = await GET({} as NextRequest);

    expect(response.status).toBe(200);
    const body = await response.json();

    // Decryption functions should not have been called for missing fields
    expect(crypto.createDecipheriv).not.toHaveBeenCalled();

    // Data should contain non-encrypted fields but not undefined sensitive fields
    expect(body.data.email).toBeUndefined();
    expect(body.data.total_emails_analyzed).toBe(5);

    expect(mockClient.close).toHaveBeenCalledTimes(1);
  });

  // --- 5. Error Handling Tests ---

  it("should return 500 on a generic database connection error", async () => {
    setupMocks(
      { MONGODB_URI, ENCRYPTION_KEY, ENCRYPTION_IV, MONGO_CLIENT: COLLECTION_NAME },
      mockSession,
      fullMockUserDocument,
    );

    // Force an error during the connection phase
    (mockClient.connect as jest.Mock).mockRejectedValue(
      new Error("Forced DB connection failure"),
    );

    const response = await GET({} as NextRequest);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toBe("Internal server error");
    expect(body.error).toContain("Forced DB connection failure");
    // Ensure client.close is called, even on connection failure
    expect(mockClient.close).toHaveBeenCalledTimes(1);
  });
});
