
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToProducts() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified products page.
    router.replace("/vendor/both/products");
  }, [router]);

  return null;
}
