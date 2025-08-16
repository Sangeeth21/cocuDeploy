
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToCorpInventory() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/inventory?tab=corporate");
  }, [router]);

  return null;
}

    