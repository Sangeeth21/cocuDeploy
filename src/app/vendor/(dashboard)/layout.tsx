
"use client";

import { useVerification } from "@/context/vendor-verification-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandedLoader } from "@/components/branded-loader";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { vendorType, isVerified } = useVerification();
    const router = useRouter();

    useEffect(() => {
        // This layout is now purely for wrapping the dashboard pages.
        // The redirection logic has been moved to the login page.
        // We can add a check here to redirect if the context is ever lost.
        if (!vendorType) {
            router.replace('/vendor/login');
        }
    }, [vendorType, router]);

    // Show a loader if the vendorType isn't confirmed yet, preventing flicker.
    if (!vendorType) {
        return <BrandedLoader />;
    }

    // This component will be replaced by the specific layout (e.g., personal, corporate) once redirected.
    // So in practice, this children will likely never be rendered for long.
    return <>{children}</>;
}
