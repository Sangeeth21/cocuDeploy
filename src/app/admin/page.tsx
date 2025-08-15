
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dashboard page.
    router.replace("/admin/dashboard");
  }, [router]);

  return null;
}
