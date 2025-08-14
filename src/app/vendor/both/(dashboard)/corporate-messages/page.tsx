
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CorporateMessagesRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/vendor/both/messages?tab=corporate');
    }, [router]);

    return null; 
}
