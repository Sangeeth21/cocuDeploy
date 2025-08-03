
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { DisplayProduct, User } from '@/lib/types';
import { ArrowLeft, X, CheckCircle, PlusCircle, Truck, Building, Loader2, Calendar, Clock, FileUp, Users, ShieldCheck } from "lucide-react";
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useBidRequest } from '@/context/bid-request-context';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const MOCK_OTP = "123456";

export default function NewBidPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { bidItems, removeFromBid, clearBid } = useBidRequest();

    // State
    const [quantity, setQuantity] = useState(100);
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const [deliveryPreference, setDeliveryPreference] = useState("");
    const [biddingDuration, setBiddingDuration] = useState<"24" | "48">("24");
    const [notes, setNotes] = useState("");
    const [brief, setBrief] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOtpOpen, setIsOtpOpen] = useState(false);
    const [otp, setOtp] = useState("");


    const handleFinalizeBid = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsOtpOpen(false);
            toast({
                title: "Bid Submitted!",
                description: "Vendors have been notified and will respond within your selected timeframe.",
            });
            clearBid();
            router.push("/corporate/bids");
        }, 1500);
    };

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically trigger the OTP send
        toast({ title: "Verification Required", description: "An OTP has been sent to your registered phone number." });
        setIsOtpOpen(true);
    };

    const handleOtpChange = (value: string) => {
        setOtp(value);
        if (value.length === 6) {
            if (value === MOCK_OTP) {
                handleFinalizeBid();
            } else {
                toast({ variant: 'destructive', title: 'Invalid OTP', description: 'Please try again.'});
                setOtp("");
            }
        }
    };


    return (
        <form onSubmit={handleInitialSubmit}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Create New Bid Request</h1>
                <p className="text-muted-foreground">Specify your requirements for the selected products to receive competitive bids from vendors.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Selected Products Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Selected Products</CardTitle>
                            <CardDescription>
                                These are the items in your bid request. All must belong to the same category.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {bidItems.length > 0 ? (
                                    bidItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 p-2 border rounded-md">
                                            <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md" />
                                            <div className="flex-grow">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.category}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeFromBid(item.id)}>
                                                <X className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No products selected for this bid.</p>
                                        <Button variant="link" asChild><Link href="/corporate/products">Browse products to add them.</Link></Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bid Details */}
                    <Card>
                         <CardHeader>
                            <CardTitle>Bid Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity (per product)</Label>
                                <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Delivery Location</Label>
                                <Input id="location" placeholder="e.g., City, State, ZIP" value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} />
                            </div>
                             <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="eta">Delivery Preference (ETA)</Label>
                                <Input id="eta" placeholder="e.g., 'Within 2 weeks', 'Before end of month'" value={deliveryPreference} onChange={e => setDeliveryPreference(e.target.value)} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Bidding Duration</Label>
                                 <RadioGroup value={biddingDuration} onValueChange={(v) => setBiddingDuration(v as any)} className="flex gap-4">
                                    <Label htmlFor="24h" className="flex items-center gap-2 p-3 border rounded-md cursor-pointer flex-1">
                                        <RadioGroupItem value="24" id="24h" />
                                        <Clock className="h-4 w-4" /> 24 Hours
                                    </Label>
                                     <Label htmlFor="48h" className="flex items-center gap-2 p-3 border rounded-md cursor-pointer flex-1">
                                        <RadioGroupItem value="48" id="48h" />
                                        <Clock className="h-4 w-4" /> 48 Hours
                                    </Label>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 sticky top-24 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" placeholder="Any special instructions or details for vendors..." value={notes} onChange={e => setNotes(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brief">Upload Brief (Optional)</Label>
                                <label htmlFor="brief" className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/50">
                                    <FileUp className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground truncate">{brief ? brief.name : "Upload a file..."}</span>
                                </label>
                                <Input id="brief" type="file" className="sr-only" onChange={(e) => e.target.files && setBrief(e.target.files[0])} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Submit Bid</CardTitle>
                             <CardDescription>Your request will be sent to all relevant vendors.</CardDescription>
                         </CardHeader>
                         <CardContent>
                            <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
                                <DialogTrigger asChild>
                                    <Button type="submit" className="w-full" disabled={bidItems.length === 0}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Submit Bid Request
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <ShieldCheck/> Two-Factor Verification
                                        </DialogTitle>
                                        <DialogDescription>
                                            To ensure the security of your request, please enter the 6-digit code sent to your registered phone number.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                        <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                        <Button variant="link" size="sm" className="text-xs">Resend Code</Button>
                                        {isSubmitting && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                                    </div>
                                </DialogContent>
                            </Dialog>
                         </CardContent>
                     </Card>
                </div>
            </div>
        </form>
    );
}
