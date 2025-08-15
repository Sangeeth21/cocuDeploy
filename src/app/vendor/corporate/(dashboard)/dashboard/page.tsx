
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified dashboard page.
    router.replace("/vendor/both/dashboard");
  }, [router]);

  return null;
}
