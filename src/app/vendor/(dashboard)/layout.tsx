
"use client";

import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Mock function to check vendor verification status
// In a real app, this would be an API call to your backend
const checkVerificationStatus = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In this mock, we'll use localStorage to track verification.
    // A real app would use a secure, server-side method like a JWT or session.
    return localStorage.getItem("vendor_verified") === "true";
};


export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState<boolean | null>(null);

    useEffect(() => {
        const verifyVendor = async () => {
            const status = await checkVerificationStatus();
            if (!status) {
                router.push('/vendor/verify');
            } else {
                setIsVerified(true);
            }
        };
        verifyVendor();
    }, [router]);

    if (isVerified === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <VendorSidebarLayout>
            {children}
        </VendorSidebarLayout>
    );
}
