import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <VendorSidebarLayout>
      {children}
    </VendorSidebarLayout>
  );
}
