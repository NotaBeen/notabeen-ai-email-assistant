// src/app/providers.js
"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useSession } from "next-auth/react"; // Use NextAuth's hook

import CookieBanner from "../components/ui/CookieBanner";

// ---
// 1. Cookie Consent Context Setup
// ---

// Create a context to share the consent state and update function
const CookieConsentContext = createContext(null);

/**
 * Custom hook to consume the cookie consent context.
 * @returns {{ consentState: { preferences: object, showBanner: boolean }, handleUpdateCookieConsent: (newPreferences: object) => void }}
 */
export const useCookieConsent = () => {
  return useContext(CookieConsentContext);
};

// Helper function to safely get preferences from localStorage
const getStoredPreferences = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("cookiePreferences");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error(
        "Failed to parse cookie preferences from localStorage:",
        error,
      );
    }
  }
  return null;
};

// ---
// 2. Main Provider Component
// ---

/**
 * Top-level provider component that manages PostHog analytics and cookie consent state.
 * It initializes PostHog based on stored preferences and identifies the user
 * using NextAuth session data.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 */
export function CSPostHogProvider({ children }) {
  // Use NextAuth's hook to get session data
  const { data: session } = useSession();
  const user = session?.user; // NextAuth user object has name, email, and id

  const [consentState, setConsentState] = useState(() => {
    const initialPreferences = getStoredPreferences();
    return {
      preferences: initialPreferences,
      // Show banner if no preferences are found in local storage
      showBanner: !initialPreferences,
    };
  });

  // Function to update preferences and manage PostHog opt-in/out
  const handleUpdateCookieConsent = useCallback((newPreferences) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("cookiePreferences", JSON.stringify(newPreferences));
    setConsentState({
      preferences: newPreferences,
      showBanner: false, // Hide the banner once a choice is made
    });

    if (posthog.__loaded) {
      // Opt-in or opt-out capturing based on analytics preference
      if (newPreferences.analytics) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
      // Capture the consent update event (if analytics is now active)
      posthog.capture("consent_updated", {
        analytics: newPreferences.analytics,
        marketing: newPreferences.marketing,
      });
    }
  }, []);

  // Effect 1: Initialize PostHog client after client-side mount, if preferences exist
  useEffect(() => {
    if (typeof window === "undefined" || posthog.__loaded) {
      return;
    }

    const initialPreferences = getStoredPreferences();
    if (!initialPreferences) {
      // Defer initialization until the user accepts/rejects cookies
      return;
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "always",
      cookies: {
        sameSite: "None",
        secure: process.env.NODE_ENV === "production", // Secure cookies in production
      },
      capture: false, // Start with capturing disabled; rely on opt_in/opt_out below
      loaded: (ph) => {
        if (initialPreferences.analytics) {
          ph.opt_in_capturing();
          console.log(
            "PostHog initialized: Analytics ON based on saved preferences.",
          );
        } else {
          ph.opt_out_capturing();
          console.log(
            "PostHog initialized: Analytics OFF based on saved preferences.",
          );
        }
      },
    });
  }, []); // Empty dependency array ensures this runs only once

  // Effect 2: Identify user in PostHog once they are logged in and have consented
  useEffect(() => {
    // Only proceed if analytics is consented to and PostHog is loaded
    if (!consentState.preferences?.analytics || !posthog.__loaded) {
      return;
    }

    if (user) {
      // Use the stable user ID from NextAuth for identification
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
      });
    } else {
      // If no user, reset the PostHog identity
      posthog.reset();
    }
  }, [user, consentState.preferences]); // Re-run when user or consent changes

  return (
    <PostHogProvider client={posthog}>
      <CookieConsentContext.Provider
        value={{ consentState, handleUpdateCookieConsent }}
      >
        {/* Render the cookie banner if the user hasn't made a choice yet */}
        {consentState.showBanner && (
          <CookieBanner
            currentPreferences={consentState.preferences}
            onUpdateConsent={handleUpdateCookieConsent}
          />
        )}
        {children}
      </CookieConsentContext.Provider>
    </PostHogProvider>
  );
}
