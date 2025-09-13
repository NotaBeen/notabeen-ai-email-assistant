"use client";

import { useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import CookieBanner from "../components/ui/CookieBanner";
import { useUser } from "@auth0/nextjs-auth0";

export function CSPostHogProvider({ children }) {
  const [hasConsented, setHasConsented] = useState(false);
  const [initialPreferencesLoaded, setInitialPreferencesLoaded] =
    useState(false);
  const [currentPreferences, setCurrentPreferences] = useState({
    essential: true,
    analytics: false, // Default to false if no consent
    marketing: false, // Default to false if no consent
  });
  // New state to control banner visibility based on rejected non-essential cookies
  const [showBannerDueToRejection, setShowBannerDueToRejection] =
    useState(false);

  const { user } = useUser();

  // Function to get initial preferences from localStorage
  const getStoredPreferences = useCallback(() => {
    const stored = localStorage.getItem("cookiePreferences");
    if (stored) {
      return JSON.parse(stored);
    }
    // Default if nothing stored (all non-essential off)
    return { essential: true, analytics: false, marketing: false };
  }, []);

  // Initialize PostHog based on current preferences
  const initializePostHog = useCallback(() => {
    const preferences = getStoredPreferences();
    setCurrentPreferences(preferences); // Update state with loaded preferences

    // --- PostHog Initialization / Update ---
    // Only initialize PostHog if it hasn't been loaded yet
    if (typeof window !== "undefined" && !posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: "always",
        cookies: {
          sameSite: "None",
          secure: process.env.NODE_ENV === "production",
        },
        loaded: (ph) => {
          if (preferences.analytics) {
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
        capture: false, // Start capture off, manage with opt_in/out
      });
    } else if (posthog.__loaded) {
      // If PostHog is already loaded, ensure its state matches preferences
      if (preferences.analytics && posthog.has_opted_out_capturing()) {
        posthog.opt_in_capturing();
        console.log("PostHog updated: Analytics ON.");
      } else if (!preferences.analytics && posthog.has_opted_in_capturing()) {
        posthog.opt_out_capturing();
        console.log("PostHog updated: Analytics OFF.");
      }
    }

    // Determine initial consent for banner visibility
    const consentGiven = localStorage.getItem("posthogConsent") === "true";
    setHasConsented(consentGiven);

    // Determine if the banner should be shown due to rejected non-essential cookies
    if (consentGiven && (!preferences.analytics || !preferences.marketing)) {
      setShowBannerDueToRejection(true);
    } else {
      setShowBannerDueToRejection(false);
    }

    setInitialPreferencesLoaded(true); // Mark initial checks complete
  }, [getStoredPreferences]);

  // Effect to run on mount to initialize everything
  useEffect(() => {
    initializePostHog();
  }, [initializePostHog]);

  // Effect to identify user with PostHog if consent is given and user is available
  useEffect(() => {
    if (user && currentPreferences.analytics) {
      // Check currentPreferences.analytics
      console.log("Identifying user with PostHog:", user.sub);
      posthog.identify(user.sub, {
        email: user.email,
        name: user.name,
      });
    } else if (user && !currentPreferences.analytics) {
      // If analytics is turned off, ensure user is not identified or reset
      posthog.reset(); // This can clear the user identity
      console.log("PostHog user identity reset as analytics is OFF.");
    }
  }, [user, currentPreferences.analytics]); // Depend on currentPreferences.analytics

  // Handler for when user updates specific cookie preferences (from popup or "Reject Non-Essential")
  const handleUpdateCookieConsent = useCallback(
    (essential, analytics, marketing) => {
      const newPreferences = { essential, analytics, marketing };
      localStorage.setItem("posthogConsent", "true");
      localStorage.setItem("cookiePreferences", JSON.stringify(newPreferences));
      setCurrentPreferences(newPreferences); // Update state

      if (posthog.__loaded) {
        if (analytics) {
          posthog.opt_in_capturing();
          console.log("PostHog capturing opted in.");
        } else {
          posthog.opt_out_capturing();
          console.log("PostHog capturing opted out.");
        }
        posthog.capture("consent_updated", { analytics, marketing });
        console.log(
          "Cookie preferences saved. Analytics:",
          analytics,
          "Marketing:",
          marketing,
        );
      } else {
        // Re-init PostHog if it wasn't loaded, it will pick up new preferences
        initializePostHog();
        // Small delay to ensure PostHog is ready before capturing
        setTimeout(() => {
          if (analytics) {
            posthog.opt_in_capturing();
          } else {
            posthog.opt_out_capturing();
          }
          posthog.capture("consent_updated", { analytics, marketing });
        }, 100);
      }

      setHasConsented(true);

      // If any non-essential cookies are false, keep the banner visible
      if (!analytics || !marketing) {
        setShowBannerDueToRejection(true);
      } else {
        setShowBannerDueToRejection(false);
      }
    },
    [initializePostHog],
  );

  return (
    <PostHogProvider client={posthog}>
      {/* Render CookieBanner if initial preferences loaded AND (not consented OR showBannerDueToRejection) */}
      {initialPreferencesLoaded &&
        (!hasConsented || showBannerDueToRejection) && (
          <CookieBanner onUpdateConsent={handleUpdateCookieConsent} />
        )}
      {children}
    </PostHogProvider>
  );
}
