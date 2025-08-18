
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, Percent, Users, CheckCircle, Clock, Share2, MessageCircle, Send, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import type { Program } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";


function ShareDialog({ referralCode }: { referralCode: string }) {
    const { toast } = useToast();
    const shareUrl = "https://coandcu.example.com/signup?ref=vendor";

    const genericText = `Join our community of vendors on Co & Cu! Use my code to get special onboarding benefits: ${referralCode}`;
    const fullMessage = `${genericText}\n\nSign up here: ${shareUrl}`;
    const twitterText = `Looking to sell your products online? Join me on @CoAndCu. Use my referral code ${referralCode} to get a great start. #sellonline #ecommerce`;
    const linkedinTitle = "Opportunity for Vendors: Join Co & Cu Marketplace";
    const linkedinSummary = `I've had a positive experience selling my products on Co & Cu and wanted to extend an invitation. It's a great platform to reach new customers. They have a referral program that gives new vendors a commission discount to start. Use my code if you decide to sign up: ${referralCode}`;

    const copyShareMessage = () => {
        navigator.clipboard.writeText(fullMessage);
        toast({ title: 'Copied!', description: 'Share message copied to clipboard.' });
    }

    const socialLinks = [
        { name: 'WhatsApp', icon: MessageCircle, url: `https://wa.me/?text=${encodeURIComponent(fullMessage)}` },
        { name: 'Telegram', icon: Send, url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(genericText)}` },
        { name: 'Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}` },
        { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(genericText)}` },
        { name: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(linkedinTitle)}&summary=${encodeURIComponent(linkedinSummary)}` },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="rounded-l-none">
                    <Share2 className="h-4 w-4"/>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Your Referral Code</DialogTitle>
                    <DialogDescription>
                        Invite other vendors to join Co & Cu and earn rewards when they sign up.
                    </DialogDescription>
                </DialogHeader>
                 <div className="flex flex-col space-y-2">
                    <Label htmlFor="share-message" className="text-sm font-medium">Share Message</Label>
                    <Textarea id="share-message" value={fullMessage} readOnly rows={4} className="resize-none" />
                    <Button type="button" size="sm" className="w-full" onClick={copyShareMessage}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Message
                    </Button>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground text-center">Or share directly</p>
                <div className="flex justify-center gap-2">
                    {socialLinks.map(social => (
                         <Button key={social.name} variant="outline" size="icon" asChild>
                            <a href={social.url} target="_blank" rel="noopener noreferrer">
                                <social.icon className="h-5 w-5" />
                                <span className="sr-only">Share on {social.name}</span>
                            </a>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function VendorReferralsPage() {
    const [referralCode] = useState("VENDOR-A1B2"); // Placeholder
    const [referrals, setReferrals] = useState(3);
    const [referralsNeeded, setReferralsNeeded] = useState(5);
    const [onboardingBonus, setOnboardingBonus] = useState<Program | null>(null);
    const [referralBonus, setReferralBonus] = useState<Program | null>(null);

    useEffect(() => {
        const q = query(collection(db, "programs"), where("target", "==", "vendor"), where("status", "==", "Active"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.forEach(doc => {
                const program = doc.data() as Program;
                if (program.type === 'onboarding') {
                    setOnboardingBonus(program);
                } else if (program.type === 'referral') {
                    setReferralBonus(program);
                    // In a real app, this value would come from the user's data
                    // setReferralsNeeded(program.reward.condition.quantity);
                }
            });
        });
        return () => unsubscribe();
    }, []);


    const referralProgress = (referrals / referralsNeeded) * 100;
    const totalDiscount = (onboardingBonus?.reward.value || 0) + (referralBonus?.reward.value || 0);

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
                                <p className="text-sm text-muted-foreground mb-2">Share your code with other potential vendors. For every {referralsNeeded} new vendors that sign up and get verified, you'll receive a {referralBonus?.reward.value}% discount on your commission!</p>
                                 <div className="flex">
                                    <Input value={referralCode} readOnly className="rounded-r-none focus:ring-0 focus:ring-offset-0"/>
                                    <ShareDialog referralCode={referralCode} />
                                </div>
                            </div>
                            <Separator />
                             <div>
                                <Progress value={referralProgress} />
                                 <p className="text-sm text-muted-foreground text-center mt-2">
                                    You have <span className="font-bold text-primary">{referrals}</span> successful referrals. You're <span className="font-bold text-primary">{referralsNeeded - referrals}</span> away from your next reward!
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
                            {onboardingBonus && (
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{onboardingBonus.name}</p>
                                        <p className="text-xs text-muted-foreground">{onboardingBonus.reward.value}% commission discount. Expires: {format(onboardingBonus.endDate, "LLL dd, y")}</p>
                                    </div>
                                </div>
                            )}
                             {referralBonus && (
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Gift className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{referralBonus.name}</p>
                                        <p className="text-xs text-muted-foreground">{referralBonus.reward.value}% commission discount currently active.</p>
                                    </div>
                                </div>
                             )}

                             <Separator />

                             <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                                <p className="text-sm font-medium text-primary-foreground/80">Total Commission Discount</p>
                                 <p className="text-3xl font-bold text-primary">{totalDiscount.toFixed(2)}%</p>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
