
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebarLayout } from "./_components/admin-sidebar-layout";
import { useAdminAuth } from "@/context/admin-auth-context";

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.replace("/admin-login");
    }
  }, [isAdminLoggedIn, router]);

  if (!isAdminLoggedIn) {
    return null; // Or a loading spinner, to prevent flicker before redirect
  }

  return (
      <AdminSidebarLayout>
        {children}
      </AdminSidebarLayout>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
      <ProtectedAdminLayout>
        {children}
      </ProtectedAdminLayout>
  );
}
