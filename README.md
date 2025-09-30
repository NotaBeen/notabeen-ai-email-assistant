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
- [NextAuth.js](https://next-auth.js.org/) — Authentication
- [Google Gemini API](https://ai.google.dev/docs/gemini_api_overview) — AI Engine

---

## Getting Started

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

Create a `.env.local` file in the root directory and add the following variables:

```env
# NextAuth & Security
NEXTAUTH_SECRET="use [openssl rand -hex 32] to generate a 32 bytes value"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Authentication & Gmail Access)
# NOTE: This MUST be set up with the Gmail API scope enabled in Google Cloud.
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database & Encryption
MONGODB_URI=
MONGO_CLIENT=
ENCRYPTION_IV=
ENCRYPTION_KEY=

# AI Engine
GEMINI_API_KEY=
```

#### Environment Variable Instructions

- **NEXTAUTH_SECRET:** Run `openssl rand -hex 32` to generate a secure value.
- **NEXTAUTH_URL:** Base URL for your app (e.g., `http://localhost:3000` for local development).
- **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET:** From your Google Cloud OAuth 2.0 credentials.
- **MONGODB_URI:** Connection string for your MongoDB database.
- **MONGO_CLIENT:** Database name (e.g., `test` or `notabeen-db`).
- **ENCRYPTION_IV:** Run `openssl rand -hex 12` to generate.
- **ENCRYPTION_KEY:** Run `openssl rand -hex 32` to generate.
- **GEMINI_API_KEY:** Your Google Gemini API key.

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
