
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function PageLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setProgress(0);
        setIsVisible(true);

        const timer = setTimeout(() => {
            setProgress(90); // Animate to 90%
        }, 100); // Start animation shortly after navigation

        return () => {
            clearTimeout(timer);
        };
    }, [pathname, searchParams]);
    
    useEffect(() => {
        // This effect will run on the initial load and whenever the loading state changes
        // to complete the animation and hide the bar.
        const handleLoadComplete = () => {
            setProgress(100);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 500); // Wait for the bar to finish animating to 100%
            return () => clearTimeout(timer);
        };

        // For initial page load
        if (document.readyState === 'complete') {
            handleLoadComplete();
        } else {
            window.addEventListener('load', handleLoadComplete);
            return () => window.removeEventListener('load', handleLoadComplete);
        }
    }, [pathname, searchParams]);


    return (
        <div className={cn(
            "fixed top-0 left-0 w-full h-1 z-50 transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0"
        )}>
            <Progress value={progress} className="h-1 rounded-none bg-transparent" />
        </div>
    );
}
