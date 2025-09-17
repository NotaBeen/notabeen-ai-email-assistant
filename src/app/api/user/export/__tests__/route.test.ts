// src/app/api/user/export/__tests__/route.test.ts

import { GET } from "../route"; // Import GET here for all tests except the env var test
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";

// --- MOCKING DEPENDENCIES ---

// 1. Mock your local auth0 wrapper (NOT the ESM library directly)
jest.mock("@/lib/auth0", () => ({
  auth0: {
    getSession: jest.fn(),
  },
}));
import { auth0 } from "@/lib/auth0";
const mockGetSession = auth0.getSession as jest.Mock;

// 2. Mock the mongodb module
jest.mock("mongodb");
const mockFindOne = jest.fn();
const mockClose = jest.fn();
const mockDb = { collection: () => ({ findOne: mockFindOne }) };
const mockConnect = jest
  .fn()
  .mockResolvedValue({ db: () => mockDb, close: mockClose });
(MongoClient as unknown as jest.Mock).mockImplementation(() => ({
  connect: mockConnect,
  db: () => mockDb,
  close: mockClose,
}));

// 3. Mock crypto
jest.mock("crypto");
const mockDecipherUpdate = jest.fn();
const mockDecipherFinal = jest.fn();
(crypto.createDecipheriv as jest.Mock).mockImplementation(() => ({
  setAuthTag: jest.fn(),
  update: mockDecipherUpdate,
  final: mockDecipherFinal,
}));

// --- TEST SUITE SETUP ---
const originalEnv = process.env;
const MOCK_USER_SUB = "auth0|12345";
const MOCK_ENCRYPTED_EMAIL = "encrypted_email_hex";
const MOCK_EMAIL_AUTH_TAG = "auth_tag_hex";
const MOCK_DECRYPTED_EMAIL = "testuser@example.com";
const MOCK_ENCRYPTED_NAME = "encrypted_name_hex";
const MOCK_NAME_AUTH_TAG = "name_auth_tag_hex";
const MOCK_DECRYPTED_NAME = "Test User";

describe("GET /api/user/export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = {
      ...originalEnv,
      MONGODB_URI: "mongodb://localhost:27017/test",
      ENCRYPTION_KEY: "01234567890123456789012345678901",
      ENCRYPTION_IV: "abcdefghijkl",
      MONGO_CLIENT: "test",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return 401 if no user session exists", async () => {
    mockGetSession.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Unauthorized");
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it("should return 401 if session exists but user.sub is missing", async () => {
    mockGetSession.mockResolvedValueOnce({ user: {} });

    const response = await GET();

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Unauthorized");
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it("should return 404 if user is not found in the database", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockFindOne.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.message).toBe("User not found");
    expect(mockFindOne).toHaveBeenCalledWith({ sub: MOCK_USER_SUB });
  });

  it("should return 500 if an unexpected error occurs during database connection", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockConnect.mockRejectedValueOnce(new Error("Database connection failed"));

    const response = await GET();

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toBe("Internal server error");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Error in GET /api/user/export:",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it("should return 200 with decrypted user data on success", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });

    mockDecipherUpdate.mockReturnValueOnce(MOCK_DECRYPTED_EMAIL);
    mockDecipherUpdate.mockReturnValueOnce(MOCK_DECRYPTED_NAME);
    mockDecipherFinal.mockReturnValueOnce("");
    mockDecipherFinal.mockReturnValueOnce("");

    const mockUserDocument = {
      _id: new ObjectId(),
      sub: MOCK_USER_SUB,
      email: MOCK_ENCRYPTED_EMAIL,
      emailAuthTag: MOCK_EMAIL_AUTH_TAG,
      name: MOCK_ENCRYPTED_NAME,
      nameAuthTag: MOCK_NAME_AUTH_TAG,
      total_emails_analyzed: 100,
      created_at: new Date(),
    };
    mockFindOne.mockResolvedValueOnce(mockUserDocument);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(
      expect.objectContaining({
        sub: MOCK_USER_SUB,
        email: MOCK_DECRYPTED_EMAIL,
        name: MOCK_DECRYPTED_NAME,
        total_emails_analyzed: 100,
      }),
    );
    expect(mockFindOne).toHaveBeenCalledWith({ sub: MOCK_USER_SUB });
  });

  it("should return 500 if required environment variables are not defined", async () => {
    // Clear all environment variables for this test, but keep NODE_ENV as required
    process.env = { NODE_ENV: "test" } as NodeJS.ProcessEnv;

    // Reset modules to pick up cleared env
    jest.resetModules();
    const { GET: GET_WITH_EMPTY_ENV } = await import("../route");

    const response = await GET_WITH_EMPTY_ENV();

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toBe(
      "Server configuration error: Required environment variables are not defined",
    );
  });
});
