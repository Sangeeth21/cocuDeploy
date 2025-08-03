
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function CorporateSettingsPage() {
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
                <h1 className="text-3xl font-bold font-headline">Corporate Settings</h1>
                <p className="text-muted-foreground">Manage your corporate sales profile and settings.</p>
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Corporate Profile</CardTitle>
                        <CardDescription>This information is shown to corporate clients.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="store-name">Store Name</Label>
                            <Input id="store-name" defaultValue="Timeless Co." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="store-bio">Corporate Bio</Label>
                            <Textarea id="store-bio" rows={4} defaultValue="Timeless Co. provides premium, customizable products for corporate gifting, events, and bulk orders. We are committed to quality and timely delivery." />
                        </div>
                         <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Automated Messages</CardTitle>
                        <CardDescription>Configure automated replies for corporate inquiries.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div>
                             <Label htmlFor="auto-reply-switch" className="font-medium">Enable Auto-Reply for New Inquiries</Label>
                             <p className="text-xs text-muted-foreground">Automatically send a reply to new quote or bid requests.</p>
                           </div>
                           <Switch id="auto-reply-switch" defaultChecked />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="auto-reply-message">Auto-Reply Message</Label>
                            <Textarea id="auto-reply-message" rows={3} defaultValue="Thank you for your interest in our corporate offerings. We have received your request and a member of our B2B team will get back to you within 24 hours." />
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
