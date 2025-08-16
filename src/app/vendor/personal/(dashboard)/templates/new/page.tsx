
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToNewTemplates() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/templates/new");
  }, [router]);

  return null;
}
