import { POST } from "../route";
import { MongoClient } from "mongodb";

// --- MOCKING DEPENDENCIES ---
jest.mock("@/lib/auth0", () => ({
  auth0: {
    getSession: jest.fn(),
  },
}));
import { auth0 } from "@/lib/auth0";
const mockGetSession = auth0.getSession as jest.Mock;

// 2. Mock the mongodb module and its methods dynamically
jest.mock("mongodb");
const mockUpdateOne = jest.fn();
const mockFindOne = jest.fn();
const mockClose = jest.fn();
const mockCollection = {
  updateOne: mockUpdateOne,
  findOne: mockFindOne,
};
const mockDb = {
  collection: () => mockCollection,
};
const mockClient = {
  connect: jest.fn().mockResolvedValue({
    db: () => mockDb,
    close: mockClose,
  }),
  db: () => mockDb,
  close: mockClose,
};
(MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);

// --- TEST SUITE SETUP ---
const originalEnv = process.env;
const MOCK_USER_SUB = "auth0|12345";
const MOCK_REQUEST_BODY = {
  accepted: true,
  cookiePreferences: { essential: true, analytics: false },
};

describe("POST /api/user/terms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = {
      ...originalEnv,
      MONGODB_URI: "mongodb://localhost:27017/test",
      MONGO_CLIENT: "test",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return 401 if no user session exists", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const mockRequest = {
      json: () => Promise.resolve(MOCK_REQUEST_BODY),
    } as Request;
    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Unauthorized");
    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  it("should return 401 if session exists but user.sub is missing", async () => {
    mockGetSession.mockResolvedValueOnce({ user: {} });
    const mockRequest = {
      json: () => Promise.resolve(MOCK_REQUEST_BODY),
    } as Request;
    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Unauthorized");
    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  it("should return 404 if user is not found in the database", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 0 });
    mockFindOne.mockResolvedValueOnce(null);
    const mockRequest = {
      json: () => Promise.resolve(MOCK_REQUEST_BODY),
    } as Request;
    const response = await POST(mockRequest);
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.message).toBe("User not found");
    expect(mockUpdateOne).toHaveBeenCalled();
    expect(mockFindOne).toHaveBeenCalledWith({ sub: MOCK_USER_SUB });
  });

  it("should return 409 if user has already accepted terms", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 0 });
    mockFindOne.mockResolvedValueOnce({
      sub: MOCK_USER_SUB,
      terms_acceptance: true,
    });
    const mockRequest = {
      json: () => Promise.resolve(MOCK_REQUEST_BODY),
    } as Request;
    const response = await POST(mockRequest);
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.message).toBe("User already accepted terms");
    expect(mockUpdateOne).toHaveBeenCalled();
    expect(mockFindOne).toHaveBeenCalledWith({ sub: MOCK_USER_SUB });
  });

  it("should return 200 with the updated user document on success", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });
    const mockUpdatedUser = {
      sub: MOCK_USER_SUB,
      terms_acceptance: true,
      cookie_preferences: { essential: true, analytics: false },
    };
    mockFindOne.mockResolvedValueOnce(mockUpdatedUser);
    const mockRequest = {
      json: () => Promise.resolve(MOCK_REQUEST_BODY),
    } as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockUpdatedUser);
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { sub: MOCK_USER_SUB },
      expect.objectContaining({
        $set: {
          terms_acceptance: true,
          terms_acceptance_date: expect.any(Date), // <-- Add this
          cookie_preferences: { essential: true, analytics: false },
          cookie_preferences_date: expect.any(Date), // <-- Add this
        },
      }),
    );
    expect(mockFindOne).toHaveBeenCalledWith({ sub: MOCK_USER_SUB });
  });

  it("should return 500 if an unexpected error occurs during database operation", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    // Mock the connection to fail to trigger the catch block
    mockClient.connect.mockRejectedValueOnce(
      new Error("Database connection failed"),
    );
    const mockRequest = {
      json: () => Promise.resolve(MOCK_REQUEST_BODY),
    } as Request;
    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toBe("Internal server error");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error in /user/terms POST:",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });
});
