
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToDashboardOrders() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/corporate/dashboard/orders');
    }, [router]);

    return null;
}
