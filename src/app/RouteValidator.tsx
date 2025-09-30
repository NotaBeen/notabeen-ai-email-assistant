// src/app/RouteValidator.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

/**
 * List of all explicitly allowed application routes.
 * This ensures that users can only navigate to predefined pages,
 * preventing accidental access to non-existent or internal URLs,
 * and routing them to the homepage if they type an invalid address.
 */
const ALLOWED_PATHS = [
  "/", // Home/Landing Page
  "/dashboard", // The main application screen (protected)
  "/pricing", // Pricing and plans page
  "/product", // Product features and information page
  "/cookie-policy", // Cookie usage policy
  "/privacy-policy", // Data privacy policy
  "/about", // About the project/team
];

interface RouteValidatorProps {
  children: ReactNode;
}

/**
 * RouteValidator is a client-side component that checks the current path
 * against a list of allowed paths and redirects to the homepage if the path is invalid.
 * It acts as a basic fail-safe for invalid URLs typed directly by the user.
 *
 * NOTE: This is not a security measure. Route protection (auth guards) should
 * be handled by middleware or server-side session checks.
 *
 * @param {RouteValidatorProps} props - The component props containing children.
 * @returns {ReactNode} The children components, wrapped by the validation logic.
 */
const RouteValidator = ({ children }: RouteValidatorProps) => {
  const currentPath = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if the current path is in the allowed list
    if (currentPath && !ALLOWED_PATHS.includes(currentPath)) {
      console.warn(
        `Invalid route attempted: ${currentPath}. Redirecting to home.`,
      );
      // Redirect to the home page
      router.push("/");
    }
  }, [currentPath, router]);

  // Render children only, the useEffect handles the validation/redirection
  return <>{children}</>;
};

export default RouteValidator;
