// Authentication URL setup
export const loginUrl = `/auth/login?audience=${encodeURIComponent("urn:my-api")}&scope=${encodeURIComponent("openid profile email https://www.googleapis.com/auth/gmail.readonly")}&access_type=offline&prompt=select_account&state=${encodeURIComponent(Math.random().toString(36).substring(2))}`;
