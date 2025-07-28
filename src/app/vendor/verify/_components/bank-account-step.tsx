
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Landmark } from "lucide-react";

export function BankAccountStep({ onComplete }: { onComplete: () => void }) {
    const [accountNumber, setAccountNumber] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const { toast } = useToast();

    const handleVerify = () => {
        if (!accountNumber || !ifsc) {
            toast({ variant: "destructive", title: "Please fill all fields." });
            return;
        }
        setIsVerifying(true);
        // Placeholder for RazorpayX penny-drop verification
        setTimeout(() => {
            setIsVerifying(false);
            toast({
                title: "Bank Account Verified!",
                description: "We have successfully verified your bank account.",
            });
            onComplete();
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="account-number">Bank Account Number</Label>
                <Input
                    id="account-number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="ifsc">IFSC Code</Label>
                <Input
                    id="ifsc"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                />
            </div>
            <p className="text-xs text-muted-foreground">
                We will deposit a small amount (a "penny-drop") to verify your account.
                This integration is a placeholder for RazorpayX.
            </p>
            <div className="flex justify-end">
                <Button onClick={handleVerify} disabled={isVerifying}>
                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify Account
                </Button>
            </div>
        </div>
    );
}
