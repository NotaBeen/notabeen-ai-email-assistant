// src/app/api/user/emails/[emailId]/__tests__/route.test.ts

import { PATCH } from "../route";
import { NextRequest } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// --- MOCKING DEPENDENCIES ---

// 1. Mock the auth0 wrapper
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
const mockClose = jest.fn();
const mockCollection = { updateOne: mockUpdateOne };
const mockDb = { collection: () => mockCollection };
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
const MOCK_USER_SUB = "auth0|12345";
const MOCK_EMAIL_ID = "60c72b2f9b1e8a001c8d62b5";
const MOCK_REQUEST_URL = `http://localhost:3000/api/user/emails/${MOCK_EMAIL_ID}`;
const mockContext = { params: Promise.resolve({ emailId: MOCK_EMAIL_ID }) };

describe("PATCH /api/user/emails/[emailId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.MONGODB_URI = "mongodb://localhost:27017/test";
    process.env.MONGO_CLIENT = "test";
  });

  it("should return 401 if no user session exists", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Unauthorized");
    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  it("should return 401 if session exists but user.sub is missing", async () => {
    mockGetSession.mockResolvedValueOnce({ user: {} });
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Unauthorized");
    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  it("should return 400 for an invalid userActionTaken value", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ userActionTaken: "InvalidAction" }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe("Invalid action");
  });

  it("should return 400 for an invalid read value", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ read: "not-a-boolean" }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe("Invalid read value");
  });

  it("should return 400 if no valid fields are provided to update", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ invalidField: "someValue" }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe("No valid fields to update");
  });

  it("should return 404 if email is not found or user is not the owner", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockUpdateOne.mockResolvedValueOnce({ matchedCount: 0 });
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.message).toBe("Email not found");
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: expect.any(ObjectId),
        emailOwner: MOCK_USER_SUB,
      },
      {
        $set: { read: true },
      },
    );
  });

  it("should return 200 with success message on a valid 'read' update", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockUpdateOne.mockResolvedValueOnce({ matchedCount: 1 });
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe("Email updated successfully");
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: expect.any(ObjectId),
        emailOwner: MOCK_USER_SUB,
      },
      {
        $set: { read: true },
      },
    );
  });

  it("should return 200 with success message on a valid 'userActionTaken' update", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockUpdateOne.mockResolvedValueOnce({ matchedCount: 1 });
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ userActionTaken: "Archived" }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe("Email updated successfully");
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: expect.any(ObjectId),
        emailOwner: MOCK_USER_SUB,
      },
      {
        $set: { userActionTaken: "Archived" },
      },
    );
  });

  it("should return 200 with success message on a valid combined update", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockUpdateOne.mockResolvedValueOnce({ matchedCount: 1 });
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ read: true, userActionTaken: "Archived" }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe("Email updated successfully");
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: expect.any(ObjectId),
        emailOwner: MOCK_USER_SUB,
      },
      {
        $set: { read: true, userActionTaken: "Archived" },
      },
    );
  });

  it("should return 500 if an unexpected error occurs during database operation", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetSession.mockResolvedValueOnce({ user: { sub: MOCK_USER_SUB } });
    mockUpdateOne.mockRejectedValueOnce(new Error("Database write failed"));
    const mockRequest = new NextRequest(MOCK_REQUEST_URL, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });

    const response = await PATCH(mockRequest, mockContext);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toBe("Internal Server Error");
    expect(body.error).toBe("Database write failed");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "PATCH error:",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });
});
