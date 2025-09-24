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
import { useUser } from "@auth0/nextjs-auth0";

import CookieBanner from "../components/ui/CookieBanner";

// Create a context to share the consent state and update function
const CookieConsentContext = createContext(null);

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

export function CSPostHogProvider({ children }) {
  const { user } = useUser();

  const [consentState, setConsentState] = useState(() => {
    const initialPreferences = getStoredPreferences();
    return {
      preferences: initialPreferences,
      showBanner: !initialPreferences,
    };
  });

  // PostHog initialization and user identification logic
  useEffect(() => {
    if (typeof window === "undefined" || posthog.__loaded) {
      return;
    }

    const initialPreferences = getStoredPreferences();
    if (!initialPreferences) {
      // Don't initialize PostHog until user makes a choice
      return;
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "always",
      cookies: {
        sameSite: "None",
        secure: process.env.NODE_ENV === "production",
      },
      capture: false,
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
  }, []); // Run only once on client-side mount

  // Identify user if consent has been given
  useEffect(() => {
    if (!consentState.preferences?.analytics || !posthog.__loaded) {
      return;
    }

    if (user) {
      posthog.identify(user.sub, {
        email: user.email,
        name: user.name,
      });
    } else {
      posthog.reset();
    }
  }, [user, consentState.preferences]);

  const handleUpdateCookieConsent = useCallback((newPreferences) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("cookiePreferences", JSON.stringify(newPreferences));
    setConsentState({
      preferences: newPreferences,
      showBanner: false,
    });

    if (posthog.__loaded) {
      if (newPreferences.analytics) {
        posthog.opt_in_capturing();
        posthog.capture("consent_updated", {
          analytics: true,
          marketing: newPreferences.marketing,
        });
      } else {
        posthog.opt_out_capturing();
        posthog.capture("consent_updated", {
          analytics: false,
          marketing: newPreferences.marketing,
        });
      }
    }
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <CookieConsentContext.Provider
        value={{ consentState, handleUpdateCookieConsent }}
      >
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
