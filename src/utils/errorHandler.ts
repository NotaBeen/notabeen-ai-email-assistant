// src/utils/errorHandler.ts

import { NextResponse } from "next/server";
import { AxiosError } from "axios";

export class CustomError extends Error {
  statusCode: number;
  isOperational: boolean; // Indicates if this is an error we expect and can handle gracefully

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: unknown, context: string): NextResponse {
  let message = "An unexpected error occurred.";
  let statusCode = 500;

  // Check for expected, custom errors
  if (error instanceof CustomError) {
    message = error.message;
    statusCode = error.statusCode;

    // Check if the error is a 401 and handle it specially
    if (statusCode === 401) {
      console.error(
        `[${context}] Unauthorized Error (${statusCode}): ${message}. Sending reauthentication signal.`,
      );
      return NextResponse.json(
        { message: "Authentication required", requires_reauthentication: true },
        { status: 401 },
      );
    }
  }
  // Check for Axios errors, which are common for API calls
  else if (error instanceof AxiosError) {
    statusCode = error.response?.status || 500;
    message = error.response?.data?.message || error.message;

    // Check if the Axios error is a 401
    if (statusCode === 401) {
      console.error(
        `[${context}] Axios Unauthorized Error (${statusCode}): ${message}. Sending reauthentication signal.`,
      );
      return NextResponse.json(
        { message: "Authentication required", requires_reauthentication: true },
        { status: 401 },
      );
    }
  }
  // Handle all other unexpected errors
  else if (error instanceof Error) {
    console.error(
      `[${context}] Unexpected Error: ${error.message}`,
      error.stack,
    );
    // You might want to hide internal details for security
    message = "An unexpected error occurred.";
    statusCode = 500;
  } else {
    console.error(`[${context}] Unknown Error:`, error);
    message = "An unknown error occurred.";
    statusCode = 500;
  }

  // Log and return a generic error response for non-401 errors
  console.error(`[${context}] Operational Error (${statusCode}): ${message}`);
  return NextResponse.json({ message: message }, { status: statusCode });
}
