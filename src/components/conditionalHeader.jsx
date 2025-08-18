"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  // Hide header for member portal pages and other full-screen pages
  const shouldHideHeader = 
    pathname.startsWith("/members-portal") || 
    pathname.startsWith("/dashboard") || 
    pathname === "/membership" ||
    pathname === "/members-login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/payment-status";

  if (shouldHideHeader) return null;

  return <Header />;
}
