
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToBids() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/bids");
  }, [router]);

  return null;
}
