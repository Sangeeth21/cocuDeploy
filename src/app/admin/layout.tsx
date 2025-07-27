
import { AdminSidebarLayout } from "./_components/admin-sidebar-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSidebarLayout>
      {children}
    </AdminSidebarLayout>
  );
}
