
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToNewTemplates() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/both/(dashboard)/templates/new");
  }, [router]);

  return null; // or a loading spinner
}
