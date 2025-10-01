// src/app/api/auth/error/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl');

  console.error('[AUTH] Authentication error:', {
    error,
    callbackUrl,
    timestamp: new Date().toISOString(),
  });

  // Return a helpful error response
  return NextResponse.json({
    error: 'Authentication Error',
    message: getErrorMessage(error),
    error_code: error,
    callback_url: callbackUrl,
    troubleshooting_steps: getTroubleshootingSteps(error),
  }, { status: 400 });
}

function getErrorMessage(error: string | null): string {
  switch (error) {
    case 'Configuration':
      return 'There is a problem with the authentication configuration. Please check server logs for details.';
    case 'AccessDenied':
      return 'Access was denied. Please ensure you have granted the necessary permissions.';
    case 'Verification':
      return 'The verification token has expired or has already been used.';
    case 'Default':
      return 'An unknown authentication error occurred.';
    default:
      return 'An authentication error occurred.';
  }
}

function getTroubleshootingSteps(error: string | null): string[] {
  const commonSteps = [
    'Check that all required environment variables are set correctly',
    'Ensure NEXTAUTH_URL is set to your application\'s base URL',
    'Verify Google OAuth credentials are correct and enabled',
    'Check that the callback URL in Google Console matches your application',
  ];

  switch (error) {
    case 'Configuration':
      return [
        ...commonSteps,
        'Check server logs for missing environment variables',
        'Visit /api/auth/health to verify configuration',
      ];
    default:
      return commonSteps;
  }
}