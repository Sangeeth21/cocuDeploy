
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BusinessProfileStep({ onComplete }: { onComplete: () => void }) {
    const [legalName, setLegalName] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [contactPerson, setContactPerson] = useState("");

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="legal-name">Legal Business Name</Label>
                <Input id="legal-name" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger id="business-type">
                        <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                        <SelectItem value="private_limited">Private Limited</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="contact-person">Primary Contact Person</Label>
                <Input id="contact-person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
            <div className="flex justify-end">
                <Button onClick={onComplete} disabled={!legalName || !businessType || !contactPerson}>
                    Save and Continue
                </Button>
            </div>
        </div>
    );
}
