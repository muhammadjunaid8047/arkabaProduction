"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  // Hide navbar for dashboard pages, membership page, and other full-screen pages
  const shouldHideNavbar = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/members-portal") ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/payment-status";

  // Hide navbar for dashboard and membership-related pages
 
  if (shouldHideNavbar) return null;

  return <Navbar />;
}
