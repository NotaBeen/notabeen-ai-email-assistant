# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm run dev` (uses Turbopack for faster builds)
- **Build**: `pnpm run build`
- **Production server**: `pnpm run start`
- **Linting**: `pnpm run lint` and `pnpm run lint:fix`
- **Testing**: `pnpm run test` and `pnpm run test:watch`

## Architecture Overview

NotaBeen is a Next.js 15 AI-powered email assistant that helps users manage their Gmail inbox through AI categorization, summarization, and prioritization.

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **UI**: Material-UI (MUI) v7 with custom theming
- **Authentication**: NextAuth.js v5 with Google OAuth and custom encryption
- **Database**: MongoDB with custom adapter
- **AI**: Google Gemini API for email processing
- **Email Integration**: Gmail API with batch processing system

### Authentication & Security
- Custom MongoDB adapter with AES-256-GCM encryption for OAuth tokens
- Google OAuth with Gmail API scopes (`https://www.googleapis.com/auth/gmail.readonly`)
- Session management via NextAuth.js with JWT strategy
- Security headers configured in Next.js config

### Core Architecture Patterns

#### Email Processing Pipeline
- **Batch Processing**: Located in `src/lib/gmail/batchProcessor/`
  - `batch-api-processor.ts`: Handles Gmail API batch requests
  - `email-processor-service.ts`: Core email processing logic
  - `data-persister.ts`: Database persistence layer
- **Email Queue**: `src/lib/gmail/email-queue.ts` manages processing queue
- **Gmail Client**: `src/lib/gmail/gmail-client.ts` handles API interactions

#### API Routes Structure
- `src/app/api/gmail/`: Gmail integration endpoints
- `src/app/api/user/`: User data management and email operations
- `src/app/api/auth/`: NextAuth.js authentication routes
- `src/app/api/database/`: Database connection testing

#### Frontend Structure
- **Dashboard**: `src/app/dashboard/` with email list and detail views
- **Navigation**: Three-column layout with email list, details, and actions
- **Landing Page**: Component-based marketing page in `src/components/landingPage/`
- **Theme System**: Material-UI theme registry in `src/components/ThemeRegistry.tsx`

#### Data Models
- **Email Interface**: Defined in `src/types/interfaces.ts` with comprehensive email properties
- **User Data**: Stored in MongoDB with encrypted OAuth credentials
- **Email Categories**: Urgent, Important, Can Wait, Unsubscribe, Unimportant

### Important Implementation Details

#### Token Encryption
- Uses AUTH_SECRET as encryption key (must be 64-character hex string)
- Encrypts Gmail OAuth tokens in database
- Custom adapter wrapper in `src/auth.ts` handles encryption/decryption

#### Gmail Integration
- Requires Google Cloud Project with Gmail API enabled
- OAuth callback URL: `http://localhost:3000/api/auth/callback/google` (development)
- Batch processing for efficient email retrieval and processing

#### Environment Variables
- AUTH_SECRET: 64-character hex string for encryption
- GOOGLE_CLIENT_ID/SECRET: Google OAuth credentials
- MONGODB_URI/MONGO_CLIENT: Database connection
- GEMINI_API_KEY: AI processing
- NEXTAUTH_URL: Application base URL

### Testing
- Jest with React Testing Library
- Test files located in `__tests__/` directories alongside source files
- Use `pnpm run test:watch` for development testing

### Security Considerations
- All OAuth tokens are encrypted at rest
- Comprehensive security headers in Next.js config
- Input validation and error handling throughout
- GDPR compliance features in profile management