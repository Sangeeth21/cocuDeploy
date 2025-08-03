

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, Percent, Users } from "lucide-react";

export default function VendorSettingsPage() {
    const { toast } = useToast();

    const handleSaveChanges = () => {
         toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
        });
    }

    const copyReferralCode = () => {
        navigator.clipboard.writeText("VENDOR-A1B2");
        toast({ title: 'Copied!', description: 'Referral code copied to clipboard.' });
    }

    // Mock data for vendor referrals
    const MOCK_VENDOR_DATA = {
        referrals: 3,
        referralsNeeded: 5,
        commissionDiscount: 0, // No discount yet
    };

    const referralProgress = (MOCK_VENDOR_DATA.referrals / MOCK_VENDOR_DATA.referralsNeeded) * 100;

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
                        <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary"/> Vendor Referral Program</CardTitle>
                        <CardDescription>Refer other vendors to earn discounts on your commission fees.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                         <div>
                            <p className="text-sm text-muted-foreground mb-2">Share your code with other potential vendors. When 5 new vendors sign up and get verified, you'll receive a 1% discount on your commission for your next 8 orders!</p>
                             <div className="flex">
                                <Input value="VENDOR-A1B2" readOnly className="rounded-r-none focus:ring-0 focus:ring-offset-0"/>
                                <Button className="rounded-l-none" onClick={copyReferralCode}>
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-lg text-center">
                                <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2"/>
                                <p className="text-2xl font-bold">{MOCK_VENDOR_DATA.referrals}/{MOCK_VENDOR_DATA.referralsNeeded}</p>
                                <p className="text-xs text-muted-foreground">Verified Referrals</p>
                            </div>
                             <div className="p-4 bg-muted/50 rounded-lg text-center">
                                 <Percent className="h-6 w-6 text-muted-foreground mx-auto mb-2"/>
                                <p className="text-2xl font-bold">{MOCK_VENDOR_DATA.commissionDiscount}%</p>
                                <p className="text-xs text-muted-foreground">Current Commission Discount</p>
                            </div>
                        </div>
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
