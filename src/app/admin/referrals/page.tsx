
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Percent, Users, Truck, Save } from "lucide-react";


export default function ReferralsPage() {
    const { toast } = useToast();

    // Customer states
    const [customerReferralEnabled, setCustomerReferralEnabled] = useState(true);
    const [referralBonus, setReferralBonus] = useState(100);
    const [minPurchase, setMinPurchase] = useState(500);
    const [frequentBuyerEnabled, setFrequentBuyerEnabled] = useState(true);
    const [ordersToQualify, setOrdersToQualify] = useState(3);

    // Vendor states
    const [vendorReferralEnabled, setVendorReferralEnabled] = useState(true);
    const [vendorsToRefer, setVendorsToRefer] = useState(5);
    const [referrerDiscount, setReferrerDiscount] = useState(1);
    const [discountDuration, setDiscountDuration] = useState(8);
    const [newVendorDiscount, setNewVendorDiscount] = useState(0.25);

    const handleSaveChanges = (tab: 'customer' | 'vendor') => {
        toast({
            title: "Settings Saved!",
            description: `Your ${tab} program settings have been updated successfully.`,
        });
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Referrals & Loyalty</h1>
                <p className="text-muted-foreground">Configure and manage your customer and vendor incentive programs.</p>
            </div>

            <Tabs defaultValue="customer">
                <TabsList>
                    <TabsTrigger value="customer">Customer Programs</TabsTrigger>
                    <TabsTrigger value="vendor">Vendor Programs</TabsTrigger>
                </TabsList>
                <TabsContent value="customer" className="mt-6">
                    <div className="grid gap-8">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Customer Referral Program</CardTitle>
                                    <CardDescription>Reward customers for bringing new users to the platform.</CardDescription>
                                </div>
                                <Switch checked={customerReferralEnabled} onCheckedChange={setCustomerReferralEnabled} />
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="referral-bonus">Referral Bonus (in Wallet)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="referral-bonus" type="number" value={referralBonus} onChange={(e) => setReferralBonus(Number(e.target.value))} className="pl-8" disabled={!customerReferralEnabled} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Amount credited to the referrer's wallet after the new customer's first purchase.</p>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="min-purchase">New Customer Minimum Purchase</Label>
                                     <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="min-purchase" type="number" value={minPurchase} onChange={(e) => setMinPurchase(Number(e.target.value))} className="pl-8" disabled={!customerReferralEnabled}/>
                                     </div>
                                    <p className="text-xs text-muted-foreground">The minimum order value for the new customer's first purchase to trigger the bonus.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                 <div>
                                    <CardTitle>Frequent Buyer Loyalty</CardTitle>
                                    <CardDescription>Reward repeat customers for their loyalty.</CardDescription>
                                </div>
                                 <Switch checked={frequentBuyerEnabled} onCheckedChange={setFrequentBuyerEnabled} />
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                    <Label htmlFor="orders-qualify">Orders to Qualify</Label>
                                    <div className="relative">
                                         <Input id="orders-qualify" type="number" value={ordersToQualify} onChange={(e) => setOrdersToQualify(Number(e.target.value))} disabled={!frequentBuyerEnabled}/>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Number of completed orders required to unlock the reward.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reward</Label>
                                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                                        <Truck className="h-5 w-5 text-primary"/>
                                        <p className="font-medium">Free delivery on next 2 orders</p>
                                    </div>
                                     <p className="text-xs text-muted-foreground">This is a predefined reward. More options can be added in the future.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button onClick={() => handleSaveChanges('customer')}><Save className="mr-2 h-4 w-4"/> Save Customer Settings</Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="vendor" className="mt-6">
                     <div className="grid gap-8">
                        <Card>
                             <CardHeader className="flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Vendor Referral Program</CardTitle>
                                    <CardDescription>Incentivize vendors to recruit other high-quality sellers.</CardDescription>
                                </div>
                                <Switch checked={vendorReferralEnabled} onCheckedChange={setVendorReferralEnabled} />
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="vendors-to-refer">Vendors to Refer</Label>
                                    <div className="relative">
                                         <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="vendors-to-refer" type="number" value={vendorsToRefer} onChange={(e) => setVendorsToRefer(Number(e.target.value))} className="pl-8" disabled={!vendorReferralEnabled}/>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Number of successful new vendor sign-ups required.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="referrer-discount">Referrer's Commission Discount</Label>
                                    <div className="relative">
                                         <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="referrer-discount" type="number" value={referrerDiscount} onChange={(e) => setReferrerDiscount(Number(e.target.value))} className="pl-8" disabled={!vendorReferralEnabled}/>
                                    </div>
                                    <p className="text-xs text-muted-foreground">The % discount on platform commission for the referring vendor.</p>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="discount-duration">Discount Duration (Orders)</Label>
                                    <div className="relative">
                                        <Input id="discount-duration" type="number" value={discountDuration} onChange={(e) => setDiscountDuration(Number(e.target.value))} disabled={!vendorReferralEnabled}/>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Number of subsequent orders the referrer's discount applies to.</p>
                                </div>
                                 <div className="space-y-2 lg:col-span-3">
                                    <Label htmlFor="new-vendor-discount">New Vendor's Commission Discount</Label>
                                    <div className="relative max-w-sm">
                                         <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="new-vendor-discount" type="number" value={newVendorDiscount} onChange={(e) => setNewVendorDiscount(Number(e.target.value))} className="pl-8" disabled={!vendorReferralEnabled}/>
                                    </div>
                                    <p className="text-xs text-muted-foreground">The % discount on platform commission for the newly referred vendors.</p>
                                </div>
                            </CardContent>
                        </Card>
                         <div className="flex justify-end">
                            <Button onClick={() => handleSaveChanges('vendor')}><Save className="mr-2 h-4 w-4"/> Save Vendor Settings</Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
