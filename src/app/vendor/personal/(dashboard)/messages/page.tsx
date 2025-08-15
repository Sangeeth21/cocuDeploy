
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PersonalMessagesRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/vendor/both/messages?tab=customer');
    }, [router]);

    return null;
}
