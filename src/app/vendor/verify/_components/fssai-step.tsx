
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp } from "lucide-react";

export function FssaiStep({ onComplete }: { onComplete: () => void }) {
    const [fssaiLicense, setFssaiLicense] = useState<File | null>(null);
    const [fssaiNumber, setFssaiNumber] = useState("");

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                This step is optional but required if you intend to sell food products.
            </p>
            <div className="space-y-2">
                <Label htmlFor="fssai-number">FSSAI License Number</Label>
                <Input id="fssai-number" value={fssaiNumber} onChange={(e) => setFssaiNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="fssai-upload">Upload FSSAI License</Label>
                <div className="flex items-center gap-4">
                    <label
                        htmlFor="fssai-upload"
                        className="flex-1 cursor-pointer"
                    >
                        <div className="flex items-center gap-2 border rounded-md p-2 hover:bg-muted/50">
                            <FileUp className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {fssaiLicense ? fssaiLicense.name : 'Choose a file...'}
                            </span>
                        </div>
                    </label>
                    <Input
                        id="fssai-upload"
                        type="file"
                        className="sr-only"
                        onChange={(e) => e.target.files && setFssaiLicense(e.target.files[0])}
                    />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <Button variant="link" onClick={onComplete}>
                    Skip for now
                </Button>
                <Button onClick={onComplete} disabled={!fssaiNumber && !fssaiLicense}>
                    Save and Continue
                </Button>
            </div>
        </div>
    );
}
