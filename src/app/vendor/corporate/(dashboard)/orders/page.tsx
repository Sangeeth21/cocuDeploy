
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToCorpOrders() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/orders?tab=corporate");
  }, [router]);

  return null;
}

    