
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToCorporateProducts() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/corporate-products");
  }, [router]);

  return null;
}
