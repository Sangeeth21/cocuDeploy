

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This component is now redundant due to the new /vendor/(dashboard) layout.
// It will redirect to the unified "both" dashboard, which handles different vendor types.
export default function RedirectToUnifiedDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/dashboard");
  }, [router]);

  return null;
}
