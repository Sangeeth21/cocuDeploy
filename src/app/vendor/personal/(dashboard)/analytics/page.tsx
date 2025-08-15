
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToAnalytics() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified analytics page.
    router.replace("/vendor/both/analytics");
  }, [router]);

  return null;
}
