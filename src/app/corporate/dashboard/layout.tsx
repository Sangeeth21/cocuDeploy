
"use client";

// This layout is no longer needed as the root corporate layout handles it.
// Keeping a basic layout file might be necessary for Next.js routing, but it just passes children through.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
