// src/app/api/auth/health/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    AUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET ? 'SET' : 'MISSING',
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
    MONGO_CLIENT: process.env.MONGO_CLIENT ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  };

  const missingVars = Object.entries(envVars)
    .filter(([key, value]) => value === 'MISSING')
    .map(([key]) => key);

  return NextResponse.json({
    status: missingVars.length === 0 ? 'healthy' : 'misconfigured',
    environment: envVars,
    missing: missingVars,
    timestamp: new Date().toISOString(),
  });
}