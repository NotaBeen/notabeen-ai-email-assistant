/**
 * Default Auth0 scope requested by the application. Includes OpenID profile data and Gmail
 * read-only access needed for the email assistant features.
 */
const DEFAULT_SCOPE = "openid profile email https://www.googleapis.com/auth/gmail.readonly";

/**
 * Prompt behavior for Auth0's hosted login page. "select_account" ensures the user can pick the
 * Google account they want to connect without forcing re-consent.
 */
const DEFAULT_PROMPT = "select_account";

/**
 * OAuth access type controls whether a refresh token is issued. We request "offline" so that the
 * backend can refresh Gmail access without user interaction.
 */
const DEFAULT_ACCESS_TYPE = "offline";

/**
 * Audience configured for Auth0. This must match the API identifier defined in the Auth0 dashboard.
 */
const AUTH0_AUDIENCE = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE ?? "";

/**
 * Route users should land on once Auth0 completes the login callback. Using a relative URL keeps it
 * compatible across environments (localhost, preview, production).
 */
const DEFAULT_RETURN_TO = "/dashboard";

/**
 * Generates an OAuth state parameter using the best entropy source available in the current
 * runtime. Falls back to Math.random in non-crypto environments (e.g. during some server-side
 * rendering scenarios).
 */
function generateState(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID().replace(/-/g, "");
	}

	if (
		typeof window !== "undefined" &&
		typeof window.crypto !== "undefined" &&
		typeof window.crypto.getRandomValues === "function"
	) {
		const bytes = new Uint8Array(16);
		window.crypto.getRandomValues(bytes);
		return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
	}

	return Math.random().toString(36).slice(2);
}

/**
 * Serialises Auth0 login parameters into a URLSearchParams instance to ensure consistent encoding
 * and easier unit testing/mocking.
 */
function buildParams(
	audience: string,
	scope: string,
	accessType: string,
	prompt: string,
	state: string,
	returnTo: string,
): URLSearchParams {
	const params = new URLSearchParams({
		audience,
		scope,
		access_type: accessType,
		prompt,
	});

	params.set("state", state);
	params.set("returnTo", returnTo);

	return params;
}

/**
 * Optional overrides when generating a login URL. Useful for components that need a different
 * prompt (e.g. forcing re-consent) or a custom post-login redirect while reusing the rest of the
 * configuration.
 */
export interface LoginUrlOptions {
	audience?: string;
	scope?: string;
	accessType?: string;
	prompt?: string;
	state?: string;
	returnTo?: string;
}

/**
 * Constructs an Auth0 login URL using project defaults and any provided overrides. Returns `null`
 * if the audience is missing so that callers can decide how to handle misconfiguration in UI.
 */
export function createLoginUrl(options: LoginUrlOptions = {}): string | null {
	const audience = options.audience ?? AUTH0_AUDIENCE;
	const scope = options.scope ?? DEFAULT_SCOPE;
	const accessType = options.accessType ?? DEFAULT_ACCESS_TYPE;
	const prompt = options.prompt ?? DEFAULT_PROMPT;
	const state = options.state ?? generateState();
	const returnTo = options.returnTo ?? DEFAULT_RETURN_TO;

	if (!audience) {
		if (process.env.NODE_ENV !== "production") {
			console.warn("NEXT_PUBLIC_AUTH0_AUDIENCE is not configured.");
		}
		return null;
	}

	const params = buildParams(audience, scope, accessType, prompt, state, returnTo);
	return `/auth/login?${params.toString()}`;
}

/**
 * Default login link used throughout the marketing site components.
 */
export const loginUrl = createLoginUrl() ?? "";

/**
 * Login link that explicitly forces consent (used when the user needs to re-authorize Gmail).
 */
export const consentLoginUrl = createLoginUrl({ prompt: "consent" }) ?? "";

export const auth0Scope = DEFAULT_SCOPE;
export const auth0Audience = AUTH0_AUDIENCE;
export const isAuth0Configured = Boolean(AUTH0_AUDIENCE);
