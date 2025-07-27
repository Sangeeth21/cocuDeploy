
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function VendorSettingsPage() {
    return (
        <VendorSidebarLayout>
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
                         <Button>Save Changes</Button>
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
        </VendorSidebarLayout>
    );
}
