
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, Percent, Users, CheckCircle, Clock } from "lucide-react";

const MOCK_VENDOR_DATA = {
    referralCode: "VENDOR-A1B2",
    referrals: 3,
    referralsNeeded: 5,
};

const mockActiveRewards = [
    { id: 1, title: "1% Commission Discount", description: "Active on your next 5 orders.", icon: Percent },
    { id: 2, title: "New Vendor Bonus", description: "0.25% commission discount. Expires in 10 days.", icon: Gift },
    { id: 3, title: "Onboarding Reward", description: "5 commission-free sales for listing 10 products.", icon: CheckCircle },
];


export default function VendorReferralsPage() {
    const { toast } = useToast();

    const copyReferralCode = () => {
        navigator.clipboard.writeText(MOCK_VENDOR_DATA.referralCode);
        toast({ title: 'Copied!', description: 'Referral code copied to clipboard.' });
    }

    const referralProgress = (MOCK_VENDOR_DATA.referrals / MOCK_VENDOR_DATA.referralsNeeded) * 100;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Referrals & Rewards</h1>
                <p className="text-muted-foreground">Track your referral progress and see your active rewards.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary"/> Vendor Referral Program</CardTitle>
                            <CardDescription>Refer other vendors to earn discounts on your commission fees.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                             <div>
                                <p className="text-sm text-muted-foreground mb-2">Share your code with other potential vendors. When 5 new vendors sign up and get verified, you'll receive a 1% discount on your commission for your next 8 orders!</p>
                                 <div className="flex">
                                    <Input value={MOCK_VENDOR_DATA.referralCode} readOnly className="rounded-r-none focus:ring-0 focus:ring-offset-0"/>
                                    <Button className="rounded-l-none" onClick={copyReferralCode}>
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                             <div>
                                <Progress value={referralProgress} />
                                 <p className="text-sm text-muted-foreground text-center mt-2">
                                    You have <span className="font-bold text-primary">{MOCK_VENDOR_DATA.referrals}</span> successful referrals. You're <span className="font-bold text-primary">{MOCK_VENDOR_DATA.referralsNeeded - MOCK_VENDOR_DATA.referrals}</span> away from your next reward!
                                </p>
                             </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Your Active Rewards</CardTitle>
                            <CardDescription>All your currently active bonuses and discounts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockActiveRewards.map((reward) => {
                                const Icon = reward.icon;
                                return (
                                <div key={reward.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{reward.title}</p>
                                        <p className="text-xs text-muted-foreground">{reward.description}</p>
                                    </div>
                                </div>
                            )})}
                             {mockActiveRewards.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">You have no active rewards right now. Refer a vendor to get started!</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
