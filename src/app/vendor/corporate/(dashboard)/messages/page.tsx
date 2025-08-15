
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToCorporateMessages() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/messages?tab=corporate");
  }, [router]);

  return null;
}
