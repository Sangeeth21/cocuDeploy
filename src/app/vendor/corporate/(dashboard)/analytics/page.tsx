
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToAnalytics() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/analytics");
  }, [router]);

  return null;
}
