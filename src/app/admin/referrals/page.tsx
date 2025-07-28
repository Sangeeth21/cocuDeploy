
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Percent, Users, Truck, Save, Gift, Trophy } from "lucide-react";
import { Separator } from "@/components/ui/separator";


export default function ReferralsPage() {
    const { toast } = useToast();

    // Customer states
    const [customerReferralEnabled, setCustomerReferralEnabled] = useState(true);
    const [referralBonus, setReferralBonus] = useState(100);
    const [newCustomerDiscount, setNewCustomerDiscount] = useState(15);
    const [minPurchase, setMinPurchase] = useState(500);
    const [frequentBuyerEnabled, setFrequentBuyerEnabled] = useState(true);
    const [ordersToQualify, setOrdersToQualify] = useState(3);
    const [loyaltyPointsEnabled, setLoyaltyPointsEnabled] = useState(true);
    const [pointsPerRupee, setPointsPerRupee] = useState(1);
    const [pointsRedemptionValue, setPointsRedemptionValue] = useState(0.5); // 100 points = 50 Rs

    // Vendor states
    const [vendorReferralEnabled, setVendorReferralEnabled] = useState(true);
    const [vendorsToRefer, setVendorsToRefer] = useState(5);
    const [referrerDiscount, setReferrerDiscount] = useState(1);
    const [discountDuration, setDiscountDuration] = useState(8);
    const [newVendorCommissionDiscount, setNewVendorCommissionDiscount] = useState(0.25);
    const [listingBonusEnabled, setListingBonusEnabled] = useState(true);
    const [productsToList, setProductsToList] = useState(5);
    const [commissionFreeSales, setCommissionFreeSales] = useState(10);


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
                            <CardHeader className="flex-row items-start justify-between">
                                <div>
                                    <CardTitle>Customer Referral Program</CardTitle>
                                    <CardDescription>Reward customers for bringing new users to the platform.</CardDescription>
                                </div>
                                <Switch checked={customerReferralEnabled} onCheckedChange={setCustomerReferralEnabled} />
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="referral-bonus">Referrer Bonus (Wallet Credit)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="referral-bonus" type="number" value={referralBonus} onChange={(e) => setReferralBonus(Number(e.target.value))} className="pl-8" disabled={!customerReferralEnabled} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Bonus for the referrer after a successful purchase by the new customer.</p>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="new-customer-discount">New Customer Welcome Discount</Label>
                                     <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="new-customer-discount" type="number" value={newCustomerDiscount} onChange={(e) => setNewCustomerDiscount(Number(e.target.value))} className="pl-8" disabled={!customerReferralEnabled}/>
                                     </div>
                                    <p className="text-xs text-muted-foreground">A % discount for the new customer on their first order.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="min-purchase">Minimum Purchase for Bonus</Label>
                                     <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="min-purchase" type="number" value={minPurchase} onChange={(e) => setMinPurchase(Number(e.target.value))} className="pl-8" disabled={!customerReferralEnabled}/>
                                     </div>
                                    <p className="text-xs text-muted-foreground">The minimum order value for the new customer's first purchase to trigger rewards.</p>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex-row items-start justify-between">
                                 <div>
                                    <CardTitle>Loyalty Points Program</CardTitle>
                                    <CardDescription>Reward customers with points for every purchase they make.</CardDescription>
                                </div>
                                 <Switch checked={loyaltyPointsEnabled} onCheckedChange={setLoyaltyPointsEnabled} />
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                    <Label htmlFor="points-per-rupee">Points Earned per Rupee</Label>
                                    <Input id="points-per-rupee" type="number" value={pointsPerRupee} onChange={(e) => setPointsPerRupee(Number(e.target.value))} disabled={!loyaltyPointsEnabled}/>
                                    <p className="text-xs text-muted-foreground">How many points a customer gets for each rupee spent.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Points Redemption Value</Label>
                                    <Input type="number" value={pointsRedemptionValue} onChange={(e) => setPointsRedemptionValue(Number(e.target.value))} disabled={!loyaltyPointsEnabled}/>
                                     <p className="text-xs text-muted-foreground">Value of each point in rupees. E.g., 0.5 means 1 point = ₹0.50.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-start justify-between">
                                 <div>
                                    <CardTitle>Frequent Buyer Reward</CardTitle>
                                    <CardDescription>A special reward for customers who make a certain number of purchases.</CardDescription>
                                </div>
                                 <Switch checked={frequentBuyerEnabled} onCheckedChange={setFrequentBuyerEnabled} />
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                    <Label htmlFor="orders-qualify">Orders to Qualify</Label>
                                    <Input id="orders-qualify" type="number" value={ordersToQualify} onChange={(e) => setOrdersToQualify(Number(e.target.value))} disabled={!frequentBuyerEnabled}/>
                                    <p className="text-xs text-muted-foreground">Number of completed orders required to unlock the reward.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reward</Label>
                                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                                        <Trophy className="h-5 w-5 text-primary"/>
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
                             <CardHeader className="flex-row items-start justify-between">
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
                                    <Input id="discount-duration" type="number" value={discountDuration} onChange={(e) => setDiscountDuration(Number(e.target.value))} disabled={!vendorReferralEnabled}/>
                                    <p className="text-xs text-muted-foreground">Number of subsequent orders the referrer's discount applies to.</p>
                                </div>
                                 <div className="space-y-2 lg:col-span-3">
                                    <Label htmlFor="new-vendor-discount">New Vendor's Welcome Commission</Label>
                                    <div className="relative max-w-sm">
                                         <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="new-vendor-discount" type="number" value={newVendorCommissionDiscount} onChange={(e) => setNewVendorCommissionDiscount(Number(e.target.value))} className="pl-8" disabled={!vendorReferralEnabled}/>
                                    </div>
                                    <p className="text-xs text-muted-foreground">The % discount on platform commission for the newly referred vendors on their first few sales.</p>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="flex-row items-start justify-between">
                                <div>
                                    <CardTitle>New Vendor Onboarding Bonus</CardTitle>
                                    <CardDescription>Reward new vendors for listing their first products quickly.</CardDescription>
                                </div>
                                <Switch checked={listingBonusEnabled} onCheckedChange={setListingBonusEnabled} />
                            </CardHeader>
                             <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="products-to-list">Products to List</Label>
                                    <Input id="products-to-list" type="number" value={productsToList} onChange={(e) => setProductsToList(Number(e.target.value))} disabled={!listingBonusEnabled}/>
                                    <p className="text-xs text-muted-foreground">Number of products a new vendor must list to receive the bonus.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="commission-free-sales">Commission-Free Sales</Label>
                                    <Input id="commission-free-sales" type="number" value={commissionFreeSales} onChange={(e) => setCommissionFreeSales(Number(e.target.value))} disabled={!listingBonusEnabled}/>
                                    <p className="text-xs text-muted-foreground">Number of sales that will have 0% platform commission as a reward.</p>
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
