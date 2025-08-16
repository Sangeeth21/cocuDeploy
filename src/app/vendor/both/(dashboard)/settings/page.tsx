
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useVerification } from "@/context/vendor-verification-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useUser } from "@/context/user-context";
import { updateVendorProfile } from "../../../actions";
import { Loader2 } from "lucide-react";

export default function VendorSettingsPage() {
    const { toast } = useToast();
    const { vendorType } = useVerification();
    const { user } = useUser(); // Assuming this provides the logged-in vendor's info

    const [storeName, setStoreName] = useState(user?.name || "Timeless Co.");
    const [storeBio, setStoreBio] = useState(user?.bio || "Specializing in handcrafted leather goods and timeless accessories. Committed to quality and craftsmanship.");
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveChanges = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "You must be logged in." });
            return;
        }
        setIsSaving(true);
        const result = await updateVendorProfile(user.id, { name: storeName, bio: storeBio });
        
        if (result.success) {
            toast({
                title: "Settings Saved",
                description: "Your changes have been saved successfully.",
            });
        } else {
             toast({
                variant: "destructive",
                title: "Update Failed",
                description: result.message,
            });
        }
        setIsSaving(false);
    }
    
    const handleSaveAutoReply = () => {
         toast({
            title: "Settings Saved",
            description: "Your auto-reply settings have been updated.",
        });
    }

    return (
        <div>
             <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your store and account settings.</p>
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Store Profile</CardTitle>
                        <CardDescription>Update your store's public information. This information is monitored to prevent sharing of contact details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="store-name">Store Name</Label>
                            <Input id="store-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="store-bio">Store Bio</Label>
                            <Textarea id="store-bio" rows={4} value={storeBio} onChange={(e) => setStoreBio(e.target.value)} />
                        </div>
                         <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                         </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Vendor Type</CardTitle>
                        <CardDescription>This setting cannot be changed after verification.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup defaultValue={vendorType} className="flex gap-4" disabled>
                            <Label htmlFor="type-personalized" className="flex items-center gap-2 p-3 border rounded-md cursor-not-allowed flex-1 opacity-50 has-[:checked]:opacity-100 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                                <RadioGroupItem value="personalized" id="type-personalized" />
                                Personalized Retail
                            </Label>
                            <Label htmlFor="type-corporate" className="flex items-center gap-2 p-3 border rounded-md cursor-not-allowed flex-1 opacity-50 has-[:checked]:opacity-100 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                                <RadioGroupItem value="corporate" id="type-corporate" />
                                Corporate & Bulk
                            </Label>
                            <Label htmlFor="type-both" className="flex items-center gap-2 p-3 border rounded-md cursor-not-allowed flex-1 opacity-50 has-[:checked]:opacity-100 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                                <RadioGroupItem value="both" id="type-both" />
                                Both Channels
                            </Label>
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Automated Messages</CardTitle>
                        <CardDescription>Configure automated replies for customer inquiries.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div>
                             <Label htmlFor="auto-reply-switch" className="font-medium">Enable Instant Reply</Label>
                             <p className="text-xs text-muted-foreground">Automatically send a reply to new messages.</p>
                           </div>
                           <Switch id="auto-reply-switch" defaultChecked />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="auto-reply-message">Instant Reply Message</Label>
                            <Textarea id="auto-reply-message" rows={3} defaultValue="Thanks for your message! We'll get back to you shortly." />
                        </div>
                        <Button onClick={handleSaveAutoReply}>Save Auto-Reply</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payout Information</CardTitle>
                        <CardDescription>Configure how you receive payments from your sales.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label>Bank Account</Label>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Chase Bank</p>
                                    <p className="text-sm text-muted-foreground">Account ending in •••• 1234</p>
                                </div>
                                <Button variant="outline">Update</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
