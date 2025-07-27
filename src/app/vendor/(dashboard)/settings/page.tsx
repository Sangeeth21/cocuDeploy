
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function VendorSettingsPage() {
    const { toast } = useToast();

    const handleSaveChanges = () => {
         toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
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
                        <CardDescription>Update your store's public information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="store-name">Store Name</Label>
                            <Input id="store-name" defaultValue="Timeless Co." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="store-bio">Store Bio</Label>
                            <Textarea id="store-bio" rows={4} defaultValue="Specializing in handcrafted leather goods and timeless accessories. Committed to quality and craftsmanship." />
                        </div>
                         <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                        <Button onClick={handleSaveChanges}>Save Auto-Reply</Button>
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
