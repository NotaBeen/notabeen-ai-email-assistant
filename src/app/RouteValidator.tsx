"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

// List of all acceptable application routes
const ALLOWED_PATHS = [
  "/",
  "/dashboard",
  "/pricing",
  "/product",
  "/cookie-policy",
  "/privacy-policy",
  "/about",
];

interface RouteValidatorProps {
  children: ReactNode;
}

const RouteValidator = ({ children }: RouteValidatorProps) => {
  const currentPath = usePathname();
  const navigation = useRouter();

  useEffect(() => {
    // Redirect to the home page if the current URL is not valid
    if (currentPath && !ALLOWED_PATHS.includes(currentPath)) {
      navigation.push("/");
    }
  }, [currentPath, navigation]);

  return <>{children}</>;
};

export default RouteValidator;
