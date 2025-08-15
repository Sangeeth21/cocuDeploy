
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToReferrals() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/referrals");
  }, [router]);

  return null;
}
