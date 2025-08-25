"use client";

import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function OwnerRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Wait for Redux store to be hydrated
    if (user === undefined || token === undefined) {
      return;
    }

    // Authentication Check
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // Onboarding Flow Redirects
    let redirectPath = null;
    if (!user?.hasRestaurant) {
      redirectPath = "/owner/restaurant-details";
    } else if (user?.hasRestaurant && !user?.hasMenu) {
      redirectPath = "/owner/menu";
    }

    // Perform Redirect if necessary
    if (redirectPath && pathname !== redirectPath) {
      router.replace(redirectPath);
    }
  }, [user, token, router, pathname]);

  // Conditional Rendering
  // Only render a loading state when the auth state is still hydrating
  if (user === undefined || token === undefined) {
    return <div>Loading ...</div>;
  }

  // If a redirect is pending, don't render children to prevent a flash of content
  if (
    (!user?.hasRestaurant && pathname !== "/owner/restaurant-details") ||
    (user?.hasRestaurant && !user?.hasMenu && pathname !== "/owner/menu")
  ) {
    return <div>Loading...</div>; // Return nothing while the redirect is in progress
  }

  // If all checks pass and the current path is correct, render the children
  return <>{children}</>;
}
