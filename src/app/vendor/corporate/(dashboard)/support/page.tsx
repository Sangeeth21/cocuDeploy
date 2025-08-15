
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToSupport() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/support");
  }, [router]);

  return null;
}
