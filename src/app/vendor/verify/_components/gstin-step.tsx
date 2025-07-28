
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function GstinStep({ onComplete }: { onComplete: () => void }) {
    const [gstin, setGstin] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const { toast } = useToast();

    const handleVerifyGstin = () => {
        if (!gstin) {
            toast({ variant: "destructive", title: "Please enter a GSTIN." });
            return;
        }
        setIsVerifying(true);
        // Placeholder for GSTIN verification API
        setTimeout(() => {
            setIsVerifying(false);
            toast({
                title: "GSTIN Verified (Simulated)",
                description: `Legal Name: Mock Business Name, Address: Mock Address`,
            });
            onComplete();
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                This step is optional but recommended to enhance trust with B2B buyers.
            </p>
            <div className="space-y-2">
                <Label htmlFor="gstin">GST Identification Number (GSTIN)</Label>
                <Input
                    id="gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                />
            </div>
            <div className="flex justify-between items-center">
                 <Button variant="link" onClick={onComplete}>
                    Skip for now
                </Button>
                <Button onClick={handleVerifyGstin} disabled={isVerifying}>
                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify GSTIN
                </Button>
            </div>
        </div>
    );
}
