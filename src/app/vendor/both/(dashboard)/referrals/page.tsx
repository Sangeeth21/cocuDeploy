
"use client";

import { useState, useEffect } from "react";
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
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/user-context";
import { format } from 'date-fns';
import type { Program } from "@/lib/types";

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
    const { user } = useUser();
    const [referralBonus, setReferralBonus] = useState<Program | null>(null);

    useEffect(() => {
        const q = query(collection(db, "programs"), where("target", "==", "vendor"), where("status", "==", "Active"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.forEach(doc => {
                const program = doc.data() as Program;
                if (program.type === 'referral') {
                    setReferralBonus(program);
                }
            });
        });
        return () => unsubscribe();
    }, []);

    const referrals = user?.loyalty?.referrals || 0;
    const referralsNeeded = referralBonus?.condition?.type === 'referral' ? referralBonus.condition.count : 5;
    const referralProgress = (referrals / referralsNeeded) * 100;
    
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
                                {referralBonus ? (
                                    <p className="text-sm text-muted-foreground mb-2">Share your code with other potential vendors. For every {referralsNeeded} new vendors that sign up and get verified, you'll receive a {referralBonus?.reward.value}% discount on your commission!</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground mb-2">The referral program is not currently active.</p>
                                )}
                                 <div className="flex">
                                    <Input value={user?.loyalty?.referralCode || "N/A"} readOnly className="rounded-r-none focus:ring-0 focus:ring-offset-0"/>
                                    <ShareDialog referralCode={user?.loyalty?.referralCode || ""} />
                                </div>
                            </div>
                            <Separator />
                             <div>
                                <Progress value={referralProgress} />
                                 <p className="text-sm text-muted-foreground text-center mt-2">
                                    You have <span className="font-bold text-primary">{referrals}</span> successful referrals. You're <span className="font-bold text-primary">{Math.max(0, referralsNeeded - referrals)}</span> away from your next reward!
                                </p>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
