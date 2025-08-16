
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToCorpProducts() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/products?tab=corporate");
  }, [router]);

  return null;
}

    