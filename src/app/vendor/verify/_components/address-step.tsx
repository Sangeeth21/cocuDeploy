
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AddressStep({ onComplete }: { onComplete: () => void }) {
    const [address, setAddress] = useState("");
    const [pincode, setPincode] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<"DELIVERABLE" | "UNDELIVERABLE" | null>(null);
    const { toast } = useToast();

    // Placeholder for Google Places Autocomplete API integration
    // In a real app, you would use a library like `@react-google-maps/api`
    // and its `Autocomplete` component.

    const handleValidateAddress = () => {
        if (!address || !pincode) {
            toast({ variant: "destructive", title: "Please enter a full address and pincode." });
            return;
        }
        setIsValidating(true);
        // Placeholder for Google Address Validation API call
        setTimeout(() => {
            // Simulate a successful validation
            const isDeliverable = Math.random() > 0.1; // 90% chance of success
            setValidationResult(isDeliverable ? "DELIVERABLE" : "UNDELIVERABLE");
            setIsValidating(false);
            if (isDeliverable) {
                toast({ title: "Address Validated", description: "Address is deliverable." });
            }
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="address" 
                        placeholder="Start typing your address..." 
                        className="pl-10"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                 <p className="text-xs text-muted-foreground">
                    We recommend using an address suggested by Google for best accuracy.
                </p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                 <Input 
                    id="pincode" 
                    placeholder="e.g. 110001" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                />
            </div>
            
            <Button onClick={handleValidateAddress} disabled={isValidating}>
                {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Validate Address
            </Button>

            {validationResult && (
                <Alert variant={validationResult === 'DELIVERABLE' ? "default" : "destructive"} className={validationResult === 'DELIVERABLE' ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : ""}>
                    <AlertTitle>{validationResult === 'DELIVERABLE' ? 'Validation Successful' : 'Validation Failed'}</AlertTitle>
                    <AlertDescription>
                       {validationResult === 'DELIVERABLE' 
                           ? "This address appears to be valid and deliverable." 
                           : "This address could not be validated or may be undeliverable. Please check for errors or try a different address."}
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end">
                <Button onClick={onComplete} disabled={validationResult !== 'DELIVERABLE'}>
                    Save and Continue
                </Button>
            </div>
        </div>
    );
}
