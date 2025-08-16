
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToOrders() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/orders");
  }, [router]);

  return null;
}

    