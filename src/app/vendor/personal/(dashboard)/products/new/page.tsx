
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToNewProducts() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified new product page.
    router.replace("/vendor/both/products/new");
  }, [router]);

  return null;
}
