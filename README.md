<p align="center">
  <img src="public/readMeImg.png" alt="NotaBeen Banner" width="100%" />
</p>

# NotaBeen

**An open-source AI powered email assistant for reducing inbox overload.**

<div align="center">
  <a href="https://github.com/NotaBeen/notabeen-ai-email-assistant/stargazers">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/NotaBeen/notabeen-ai-email-assistant">
  </a>
  <a href="https://github.com/NotaBeen/NotaBeen/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-purple">
  </a>
</div>

---

NotaBeen is an open-source email assistant that uses AI to help you manage your inbox more efficiently. It helps you quickly summarize emails, generate smart replies, and categorize messages to reduce inbox overload.

---

## Features

- **AI-Powered Summarization:** Get a quick overview of long emails with AI-generated summaries.
- **Automated Categorization:** Automatically sort incoming emails into categories like _Urgent_, _Important_, _Can Wait_, _Unsubscribe_, and _Unimportant_ to prioritize what matters.
- **Secure Inbox Management:** Manage your email without worrying about your data, as NotaBeen is self-hostable.

---

## Demo

![Notabeen Welcome GIF](/public/notabeen-welcome.gif)

---

## Tech Stack

- [Next.js](https://nextjs.org/) — Framework
- [Material UI](https://mui.com/) — UI Components
- [MongoDB](https://www.mongodb.com/) — Database
- [Better Auth](https://www.better-auth.com/) — Authentication
- [Google Gemini API](https://ai.google.dev/docs/gemini_api_overview) — AI Engine

---

## Getting Started

Setup video: https://www.youtube.com/watch?v=HmpXFbpzquU

### Prerequisites

To run NotaBeen, you need:

- **Node.js** (>= 18.0.0)
- **MongoDB Database**
- **Google Cloud Project** (for OAuth 2.0 Client ID/Secret for Gmail access)
- **Google Gemini API Key**

### 1. Clone the repository

```sh
git clone https://github.com/NotaBeen/notabeen-ai-email-assistant.git
cd notabeen-ai-email-assistant
```

### 2. Install npm dependencies

```sh
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory by copying `.env.example`:

```sh
cp .env.example .env.local
```

Then fill in the following required variables:

```env
# Authentication (Better Auth)
AUTH_SECRET=                    # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=               # From Google Cloud Console
GOOGLE_CLIENT_SECRET=           # From Google Cloud Console

# Database
MONGODB_URI=                    # Your MongoDB connection string
MONGO_CLIENT=notabeen          # Database name

# Email Encryption
ENCRYPTION_KEY=                 # Generate with: openssl rand -base64 24
ENCRYPTION_IV=                  # Generate with: openssl rand -base64 9

# AI Engine
GEMINI_API_KEY=                # From Google AI Studio
```

#### Environment Variable Setup Guide

1. **AUTH_SECRET** (Required)
   ```sh
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   This generates a 64-character hex string used for encrypting OAuth tokens.

2. **Google OAuth Credentials** (Required)
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Enable [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
   - Copy Client ID and Client Secret

3. **MongoDB Database** (Required)
   - Use MongoDB Atlas (cloud) or local MongoDB
   - Set `MONGODB_URI` to your connection string
   - Set `MONGO_CLIENT` to your database name (default: `notabeen`)

4. **Encryption Keys** (Required for email security)
   ```sh
   # Generate encryption key (32 characters)
   openssl rand -base64 24

   # Generate initialization vector (12 characters)
   openssl rand -base64 9
   ```

5. **Google Gemini API Key** (Required)
   - Get your API key from [Google AI Studio](https://ai.google.dev/)

### 4. Run the dev server

```sh
npm run dev
```

### 5. Open the app in your browser

Visit [http://localhost:3000](http://localhost:3000).

> **Note:** Currently, the app only supports Gmail.

---

## Contributing

We ❤️ contributions big and small:

- Open a PR to fix a bug or add a new feature.
- Submit a feature request or bug report.
- Vote on features or get early access to beta functionality in our roadmap.

---

## License

This repo is available under the [MIT Expat License](https://github.com/NotaBeen/NotaBeen/blob/main/LICENSE).
