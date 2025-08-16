
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToTemplates() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified templates page.
    router.replace("/vendor/both/templates");
  }, [router]);

  return null;
}
