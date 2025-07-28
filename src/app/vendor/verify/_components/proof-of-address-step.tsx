
"use file";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp } from "lucide-react";

export function ProofOfAddressStep({ onComplete }: { onComplete: () => void }) {
    const [proof, setProof] = useState<File | null>(null);

    return (
        <div className="space-y-6">
             <div className="space-y-2">
                <Label htmlFor="poa-upload">Upload Proof of Address</Label>
                <label
                    htmlFor="poa-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                >
                    {proof ? (
                         <p className="text-sm font-medium">{proof.name}</p>
                    ) : (
                        <>
                            <FileUp className="h-8 w-8 text-muted-foreground"/>
                            <span className="text-sm text-muted-foreground text-center mt-1">
                                Utility bill, lease, or bank statement (≤3 months old)
                            </span>
                        </>
                    )}
                </label>
                <Input id="poa-upload" type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => e.target.files && setProof(e.target.files[0])} />
            </div>
            <div className="flex justify-end">
                <Button onClick={onComplete} disabled={!proof}>
                    Save and Continue
                </Button>
            </div>
        </div>
    );
}
