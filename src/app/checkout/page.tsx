
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { mockProducts, mockUserOrders } from "@/lib/mock-data";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Loader2, Percent, Ticket, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";


const MOCK_USER_DATA = {
    walletBalance: 100, // in Rs
    loyaltyPoints: 2500,
    pointsRedemptionValue: 0.5, // 1 point = 0.5 Rs
};

const MOCK_EMAIL_OTP = "123456";
const MOCK_PHONE_OTP = "654321";


export default function CheckoutPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    const [emailOtp, setEmailOtp] = useState("");
    const [phoneOtp, setPhoneOtp] = useState("");
    
    const cartItems = mockProducts.slice(0, 2).map(p => ({ ...p, quantity: 1 }));
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Loyalty Program check
    const loyaltyOrdersRequired = 3;
    const hasLoyalty = mockUserOrders.length >= loyaltyOrdersRequired;
    const shipping = hasLoyalty ? 0 : 5.00;
    
    const total = useMemo(() => {
        return subtotal + shipping;
    }, [subtotal, shipping]);

    const handleContinueToVerification = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would send OTPs to the entered email/phone here.
        toast({
            title: "Verification Required",
            description: "We've sent verification codes to your email and phone.",
        });
        setShowVerificationDialog(true);
    };
    
    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();

        if (emailOtp !== MOCK_EMAIL_OTP || phoneOtp !== MOCK_PHONE_OTP) {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: "Invalid verification codes. Please try again.",
            });
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowVerificationDialog(false);
            toast({
                title: "Payment Successful!",
                description: "Your order has been placed.",
            });
            router.push('/account?tab=orders');
        }, 2000);
    }

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline">Checkout</h1>
                <p className="text-muted-foreground mt-2">Complete your purchase in a few easy steps.</p>
            </div>
             <form onSubmit={handleContinueToVerification}>
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" placeholder="you@example.com" required />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
                                </div>
                                 <div className="col-span-1">
                                    <Label htmlFor="first-name">First Name</Label>
                                    <Input id="first-name" placeholder="John" required />
                                </div>
                                 <div className="col-span-1">
                                    <Label htmlFor="last-name">Last Name</Label>
                                    <Input id="last-name" placeholder="Doe" required />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" placeholder="123 Main St" required />
                                </div>
                                <div className="col-span-1">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" placeholder="Anytown" required />
                                </div>
                                <div className="col-span-1">
                                    <Label htmlFor="zip">ZIP Code</Label>
                                    <Input id="zip" placeholder="12345" required />
                                </div>
                                <div className="col-span-2 flex items-center space-x-2">
                                    <Checkbox id="save-info" />
                                    <Label htmlFor="save-info" className="font-normal">Save this information for next time</Label>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Payment</CardTitle>
                                <CardDescription>All transactions are secure and encrypted.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div>
                                    <Label htmlFor="card-number">Card Number</Label>
                                    <Input id="card-number" placeholder="•••• •••• •••• ••••" required />
                               </div>
                               <div className="grid grid-cols-3 gap-4">
                                   <div className="col-span-1">
                                        <Label htmlFor="expiry-date">Expiry</Label>
                                        <Input id="expiry-date" placeholder="MM/YY" required />
                                   </div>
                                   <div className="col-span-1">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input id="cvc" placeholder="123" required />
                                   </div>
                               </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="sticky top-24">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint={`${item.tags?.[0] || 'product'} ${item.tags?.[1] || ''}`} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Input placeholder="Enter coupon or gift card" />
                                        <Button variant="outline">Apply</Button>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t space-y-2">
                                    <div className="flex justify-between">
                                        <p className="text-muted-foreground">Subtotal</p>
                                        <p>${subtotal.toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-muted-foreground">Shipping</p>
                                        {hasLoyalty ? <p className="text-green-600 font-semibold">FREE</p> : <p>${shipping.toFixed(2)}</p>}
                                    </div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <p>Total</p>
                                        <p>₹{total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button size="lg" type="submit" className="w-full">
                                    Continue to Verification
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </form>

            <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
                <DialogContent>
                     <form onSubmit={handlePayment}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldCheck className="text-primary"/> Final Step: Verify & Pay
                            </DialogTitle>
                            <DialogDescription>
                                To protect your account, please enter the verification codes sent to your email and phone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email-otp">Email Code</Label>
                                <Input 
                                    id="email-otp" 
                                    placeholder="Enter 6-digit code" 
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone-otp">Phone Code</Label>
                                <Input 
                                    id="phone-otp" 
                                    placeholder="Enter 6-digit code"
                                    value={phoneOtp}
                                    onChange={(e) => setPhoneOtp(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                {isProcessing ? 'Processing...' : `Verify & Pay ₹${total.toFixed(2)}`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
