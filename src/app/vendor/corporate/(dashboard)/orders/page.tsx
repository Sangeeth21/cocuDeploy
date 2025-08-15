
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToCorporateOrders() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/corporate-orders");
  }, [router]);

  return null;
}
