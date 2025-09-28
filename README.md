<p align="center">
  <img src="public/readMeImg.png" alt="NotaBeen Banner" width="100%" />
</p>

### NotaBeen

**An open-source AI powered email assistant for reducing inbox overload.**

<br/>

<div align="center">
  <a href="https://github.com/NotaBeen/notabeen-ai-email-assistant/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/NotaBeen/notabeen-ai-email-assistant"></a>
  <a href="https://github.com/NotaBeen/NotaBeen/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-purple"></a>
</div>

<br/>

NotaBeen is an open-source email assistant that uses AI to help you manage your inbox more efficiently. It helps you quickly summarize emails, generate smart replies, and categorize messages to reduce inbox overload.

## Features

- **AI-Powered Summarization:** Get a quick overview of long emails with AI-generated summaries.
- **Automated Categorization:** Automatically sort incoming emails into categories like "Urgent," "Important," "Can Wait," "Unsubscribe," and "Unimportant" to prioritize what matters.
- **Secure Inbox Management:** Manage your email without worrying about your data, as NotaBeen is self-hostable.

## Demo

![Notabeen Welcome GIF](/public/notabeen-welcome.gif)

## Tech Stack

- [Next.js](https://nextjs.org/) – Framework
- [Material UI](https://mui.com/) – UI Components
- [MongoDB](https://www.mongodb.com/) – Database
- [Google Gemini API](https://ai.google.dev/docs/gemini_api_overview) – AI Engine

## Getting Started: Setup Guide for New Users

### Prerequisites

Here's what you need to run NotaBeen:

- Node.js (version >= 18.0.0)
- **MongoDB** Database (e.g., [MongoDB Atlas](https://www.mongodb.com/atlas))
- An **Auth0** Account
- A **Google Gemini API Key**
- A **Google Cloud Project**

### 1. Local Setup

| Step | Instruction |
| :--- | :--- |
| **1.1 Clone Repository** | `git clone https://github.com/NotaBeen/notabeen-ai-email-assistant.git` <br/> `cd notabeen-ai-email-assistant` |
| **1.2 Install Dependencies** | `npm install` |
| **1.3 Environment File** | Create a **`.env.local`** file in the root directory. |
| **1.4 MongoDB URI Update** | In your `.env.local`, update your `MONGODB_URI` by adding `?retryWrites=true&w=majority&appName=Cluster0` to the string. **Note**: Replace `Cluster0` with your actual MongoDB application name (e.g., `appName=notabeen-cluster`). |

### 2. Auth0 Configuration

This setup is crucial for user authentication and Gmail access.

#### 2.1 API Setup

1.  Navigate to **APIs** in your Auth0 dashboard and click **+ Create API**.
2.  Set **Name** to `urn:my-api`.
3.  Set **Identifier** to `urn:my-api`.
4.  Set **JWT Signature Algorithm** to **RS256**.
5.  Go to the **Permissions** tab for the `urn:my-api` API and add the following two permissions:
    - **Permission**: `https://www.googleapis.com/auth/gmail.readonly`, **Description**: `gmail read`
    - **Permission**: `https://mail.google.com/`, **Description**: `gmail`

#### 2.2 Application Setup

1.  Navigate to **Applications** and click **+ Create Application**.
2.  Select **Regular Web Application**.
3.  Go to **Settings** and copy the following values to your `.env.local` file:
    - `AUTH0_CLIENT_ID=`
    - `AUTH0_CLIENT_SECRET=`
    - `AUTH0_DOMAIN=`
4.  In **Settings**, set:
    - **Allowed Callback URLs**: `http://localhost:3000/auth/callback`, `http://localhost:3000/`
    - **Allowed Logout URLs**: `http://localhost:3000/` (or your preferred logout URL)
    - **Allowed Web Origins**: `http://localhost:3000/`
5.  Enable **Cross-Origin Authentication**.
6.  Scroll to the bottom and **Save Changes**.

#### 2.3 Management API Authorization

1.  Navigate to **APIs** and select the **Auth0 Management API**.
2.  Go to the **Machine to Machine Applications** tab.
3.  Find your application and click the **Authorize** dropdown, then select **Allow all** and **Update**.

#### 2.4 Google Social Connection

1.  Navigate to **Authentication** -> **Social** and click **+ Create Connection** -> **Custom** connection.
2.  Set **Name**: `Google`.
3.  Set **Authorization URL**: `https://accounts.google.com/o/oauth2/auth`
4.  Set **Token URL**: `https://oauth2.googleapis.com/token`
5.  Set **Scope**: `https://www.googleapis.com/auth/gmail.readonly openid email profile` (**Ensure scopes are separated by a space and 'Separate scopes using a space' is checked**).
6.  Enter the **Client ID** and **Client Secret** (obtained from your **Google Cloud Project** OAuth client, see **Step 3.2**).
7.  Add the following **Fetch User Profile Script**:

    ```javascript
    function(accessToken, ctx, callback) {
      const url = '[https://www.googleapis.com/oauth2/v2/userinfo](https://www.googleapis.com/oauth2/v2/userinfo)';

      request.get(
        {
          url: url,
          headers: {
            'Authorization': 'Bearer ' + accessToken
          },
          json: true
        },
        function(err, response, body) {
          if (err) return callback(err);
          if (response.statusCode !== 200)
            return callback(new Error('Failed to fetch user profile'));

          const profile = {
            user_id: body.id,
            name: body.name,
            given_name: body.given_name,
            family_name: body.family_name,
            email: body.email,
            picture: body.picture,
            locale: body.locale
          };

          callback(null, profile);
        }
      );
    }
    ```
8.  **Create** the connection.
9.  In the new connection's settings, ensure your application is enabled under **Applications Using This Connection**.
10. Navigate to **Authentication** -> **Database** -> **Username-Password-Authentication** and **untick** your application name, as the app currently only works with Gmail login.

#### 2.5 API Connection to Application

1.  Navigate back to **APIs** and select `urn:my-api`.
2.  Go to the **Machine to Machine Applications** tab.
3.  Find your application name and **Tick the box to authorize** the connection.

---

### 3. Google Gemini & Cloud Setup

#### 3.1 Gemini API Key

1.  Go to the **Google AI Studio** API Keys page: `https://aistudio.google.com/app/api-keys`.
2.  Create a project and generate a new API key.
3.  Copy this key to your `.env.local` file: `GEMINI_API_KEY=`

#### 3.2 Google Cloud Project (For Gmail Access)

1.  Go to the **Google Cloud Console**: `https://console.cloud.google.com/`.
2.  **Create a new project** and complete the basic setup.
3.  Enable the **Gmail API**:
    - Navigate to the **APIs & Services Library**: `https://console.cloud.google.com/apis/library`.
    - Search for and **Enable** the **Gmail API**.
4.  Configure **OAuth Consent Screen**:
    - Go to **APIs & Services** -> **OAuth consent screen**.
    - Configure the screen. You must add your own Gmail email to the **Test users** list.
5.  Configure **OAuth Credentials**:
    - Navigate to **APIs & Services** -> **Credentials**.
    - Click **+ Create Credentials** -> **OAuth client ID**.
    - **Application type**: **Web application**.
    - **Authorized JavaScript origins**: `http://localhost:3000`
    - **Authorized redirect URIs**:
        ```
        http://localhost:3000/auth/callback
        http://localhost:3000/
        https://localhost:3000/auth/callback
        https://dev-YOUR-AUTH0-DOMAIN/login/callback  <- Replace with your actual Auth0 domain
        https://www.googleapis.com/auth/gmail.readonly
        ```
    - **Create** the client. **Copy the Client ID and Client Secret** and use them for the **Auth0 Custom Social Connection** setup in **Step 2.4**.

#### 3.3 Data Access Scopes

1.  Navigate to **APIs & Services** -> **Credentials** -> **Data Access** (or click on your project's data access settings).
2.  Click **Add/Remove scope** and search for `gmail.readonly`.
3.  **Enable** the scope and **Update** the settings.

---

### 4. Encryption Key Generation

The app encrypts sensitive data. You must generate unique keys.

1.  You will need **OpenSSL** installed to generate these keys (e.g., from `https://slproweb.com/products/Win32OpenSSL.html` for Windows).
2.  Generate the **Initialization Vector (IV)**:
    ```shell
    openssl rand -base64 9
    ```
    Copy the output to your `.env.local`: `ENCRYPTION_IV=`
3.  Generate the **Encryption Key**:
    ```shell
    openssl rand -base64 24
    ```
    Copy the output to your `.env.local`: `ENCRYPTION_KEY=`

> **⚠️ IMPORTANT NOTE:** If you change the encryption keys *after* a user account has been created, you **must** manually empty the `user` and `emails` collections in your MongoDB database, otherwise, decryption errors will occur.

---

### 5. Run the App

1.  Add the final environment variables to your `.env.local`:
    ```shell
    AUTH0_SECRET= # Use [openssl rand -hex 32] to generate a 32 bytes value
    APP_BASE_URL=http://localhost:3000/
    MONGO_CLIENT=notabeen
    ```
2.  Start the development server:
    ```shell
    npm run dev
    ```
3.  Open the app in your browser: [http://localhost:3000](http://localhost:3000)

---

### Troubleshooting

- **403 Error after login**: On the top right menu, click your profile and select **Grant Gmail Permission**. Log out and log in again.
- **Login Loop / Permission Error**: Double-check all Auth0 and Google Cloud settings, especially the **Client ID/Secret** match, **Allowed Callback URLs**, and that the **Gmail API** is enabled.

---

## **Important Note:** Currently, the app only supports Gmail.

## Contributing

We <3 contributions big and small:

- Open a PR to fix a bug or add a new feature.
- Submit a [feature request](https://github.com/NotaBeen/notabeen-ai-email-assistant/issues/new?assignees=&labels=enhancement%2C+feature&template=feature_request.md) or [bug report](https://github.com/NotaBeen/notabeen-ai-email-assistant/issues/new?assignees=&labels=bug&template=bug_report.md).
- Vote on features or get early access to beta functionality in our roadmap.

---

## Open-source vs. paid

This repo is available under the [MIT expat license](https://github.com/NotaBeen/notabeen-ai-email-assistant/blob/main/LICENSE).