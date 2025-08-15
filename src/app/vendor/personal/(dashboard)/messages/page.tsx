
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToMessages() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified messages page.
    router.replace("/vendor/both/messages");
  }, [router]);

  return null;
}
