// src/app/api/database/__tests__/route.test.ts

/**
 * @fileoverview Jest test suite for the database health check API route.
 * It mocks the MongoDB client to test the API's behavior under various
 * connection scenarios without requiring a live database.
 */

import { GET } from "../route";
import { MongoClient } from "mongodb";

// Mock the entire 'mongodb' module to prevent real database connections
jest.mock("mongodb");

// Define mock implementations for the MongoClient methods used in the API route
const mockConnect = jest.fn();
const mockClient = {
  connect: mockConnect,
  db: jest.fn(),
  close: jest.fn(),
};

describe("Database API Route (GET)", () => {
  // Store the original environment variables to restore them after each test
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear all mock call history and mock return values before each test
    jest.clearAllMocks();
    jest.resetModules(); // Re-loads the module for a clean slate

    // Set a valid URI to satisfy the environment variable check
    process.env = { ...originalEnv, MONGODB_URI: "mongodb://localhost:27017" };
  });

  afterEach(() => {
    // Restore the original environment variables after each test
    process.env = originalEnv;
  });

  it("should return 200 on a successful database connection", async () => {
    // Arrange: Mock a successful connection
    mockConnect.mockResolvedValue(true);
    (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);

    // Act: Call the API route handler
    const response = await GET();

    // Assert: Verify the response and that the connect method was called
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ message: "Database connection successful" });
    expect(mockClient.connect).toHaveBeenCalledTimes(1);
  });

  it("should return 500 on a failed database connection", async () => {
    // Arrange: Mock a failed connection and spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockConnect.mockRejectedValue(new Error("Connection failed"));
    (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);

    // Act: Call the API route handler
    const response = await GET();

    // Assert: Verify the error response and that the error was logged
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ message: "Internal Server Error" });
    expect(mockClient.connect).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error connecting to MongoDB:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore(); // Clean up the spy
  });

  it("should return 500 if MONGODB_URI is not defined", async () => {
    // Arrange: Overwrite the environment variable for this test case
    process.env = { ...originalEnv, MONGODB_URI: undefined };

    // Act: Call the API route handler
    const response = await GET();

    // Assert: Verify the specific error message and that the MongoClient was not called
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      message: "Server configuration error: MONGODB_URI not defined",
    });
    expect(MongoClient).not.toHaveBeenCalled();
  });
});
