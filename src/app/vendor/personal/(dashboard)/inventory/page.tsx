
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToInventory() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/inventory");
  }, [router]);

  return null;
}

    