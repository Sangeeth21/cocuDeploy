
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Loader2, ShieldCheck, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/user-context";
import { useCart } from "@/context/cart-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { OrderItem } from "@/lib/types";


const MOCK_EMAIL_OTP = "123456";
const MOCK_PHONE_OTP = "654321";

type VerificationStatus = 'unverified' | 'pending' | 'verified';

export default function CheckoutPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, isLoggedIn, commissionRates } = useUser();
    const { cartItems, subtotal, clearCart, loading: isCartLoading } = useCart();

    const [isProcessing, setIsProcessing] = useState(false);
    
    // Form state
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [emailStatus, setEmailStatus] = useState<VerificationStatus>('unverified');
    const [phoneStatus, setPhoneStatus] = useState<VerificationStatus>('unverified');
    const [emailOtp, setEmailOtp] = useState("");
    const [phoneOtp, setPhoneOtp] = useState("");
    const [showEmailOtp, setShowEmailOtp] = useState(false);
    const [showPhoneOtp, setShowPhoneOtp] = useState(false);

    useEffect(() => {
        if(isLoggedIn && user) {
            setEmail(user.email);
            setPhone(user.phone || "");
            setEmailStatus('verified');
            setPhoneStatus('verified'); // Assume phone is verified if user is logged in for simplicity
        }
    }, [isLoggedIn, user]);
    
    const getFinalPrice = (item: typeof cartItems[0]) => {
        const commissionRule = commissionRates?.personalized?.[item.product.category];
        let finalPrice = item.product.price;
        if (commissionRule && commissionRule.buffer) {
            if (commissionRule.buffer.type === 'fixed') {
                finalPrice += commissionRule.buffer.value;
            } else {
                finalPrice *= (1 + (commissionRule.buffer.value / 100));
            }
        }
        return finalPrice * item.quantity;
    }

    const hasLoyalty = (user?.loyalty?.totalOrdersForReward ?? 0) < 3;
    const shipping = cartItems.length > 0 ? (hasLoyalty ? 0 : 5.00) : 0;
    
    const total = useMemo(() => {
        return subtotal + shipping;
    }, [subtotal, shipping]);
    
    const handleSendCode = (type: 'email' | 'phone') => {
        if (isLoggedIn) return; // Don't send for logged in users

        if (type === 'email' && email) {
            setEmailStatus('pending');
            setShowEmailOtp(true);
            toast({ title: "Verification Code Sent", description: "A code has been sent to your email." });
        }
        if (type === 'phone' && phone) {
            setPhoneStatus('pending');
            setShowPhoneOtp(true);
            toast({ title: "Verification Code Sent", description: "A code has been sent to your phone." });
        }
    };
    
    const handleVerifyCode = (type: 'email' | 'phone') => {
        if (type === 'email') {
            if (emailOtp === MOCK_EMAIL_OTP) {
                setEmailStatus('verified');
                toast({ title: "Email Verified!", className: "bg-green-100 dark:bg-green-900" });
            } else {
                toast({ variant: "destructive", title: "Invalid Email Code" });
            }
        }
         if (type === 'phone') {
            if (phoneOtp === MOCK_PHONE_OTP) {
                setPhoneStatus('verified');
                toast({ title: "Phone Verified!", className: "bg-green-100 dark:bg-green-900 dark:text-green-200" });
            } else {
                toast({ variant: "destructive", title: "Invalid Phone Code" });
            }
        }
    };
    
    const handleFinalizePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: "destructive", title: "You must be logged in to place an order." });
            return;
        }

        setIsProcessing(true);
        try {
             const orderItemsForDb: OrderItem[] = cartItems.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                productImage: item.product.imageUrl,
                vendorId: item.product.vendorId,
                quantity: item.quantity,
                price: item.product.price,
                // Include customizations if they exist
                ...(Object.keys(item.customizations).length > 0 && { customizations: item.customizations }),
            }));

            await addDoc(collection(db, "orders"), {
                customer: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                },
                items: orderItemsForDb,
                total,
                subtotal,
                shipping,
                status: 'Pending',
                date: serverTimestamp(),
                shippingAddress: {
                    recipient: (e.target as HTMLFormElement)['first-name'].value + ' ' + (e.target as HTMLFormElement)['last-name'].value,
                    line1: (e.target as HTMLFormElement).address1.value,
                    city: (e.target as HTMLFormElement).city.value,
                    zip: (e.target as HTMLFormElement).zip.value,
                },
                payment: {
                    method: 'Mock Card',
                    last4: 'XXXX',
                }
            });

            await clearCart();

            toast({
                title: "Payment Successful!",
                description: "Your order has been placed.",
            });
            router.push('/account?tab=orders');

        } catch(error) {
            console.error("Error creating order:", error);
            toast({ variant: 'destructive', title: 'Order Failed', description: 'Could not place your order. Please try again.' });
            setIsProcessing(false);
        }
    }
    
    const isFormFullyVerified = emailStatus === 'verified' && phoneStatus === 'verified';

     if (isCartLoading) {
        return (
            <div className="container py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary"/>
                <p className="mt-2 text-muted-foreground">Loading checkout...</p>
            </div>
        )
    }

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline">Checkout</h1>
                <p className="text-muted-foreground mt-2">Complete your purchase in a few easy steps.</p>
            </div>
             <form onSubmit={handleFinalizePayment}>
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-6">
                                <div className="col-span-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => email && emailStatus === 'unverified' && handleSendCode('email')} disabled={isLoggedIn || emailStatus !== 'unverified'} />
                                        {emailStatus === 'verified' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-4 w-4 mr-1"/>Verified</Badge>}
                                    </div>
                                    {showEmailOtp && emailStatus === 'pending' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Input placeholder="Enter email code..." value={emailOtp} onChange={e => setEmailOtp(e.target.value)} />
                                            <Button type="button" variant="outline" onClick={() => handleVerifyCode('email')}>Verify</Button>
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                     <div className="flex items-center gap-2">
                                        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => phone && phoneStatus === 'unverified' && handleSendCode('phone')} disabled={isLoggedIn || phoneStatus !== 'unverified'} />
                                        {phoneStatus === 'verified' && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-4 w-4 mr-1"/>Verified</Badge>}
                                    </div>
                                    {showPhoneOtp && phoneStatus === 'pending' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Input placeholder="Enter phone code..." value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} />
                                            <Button type="button" variant="outline" onClick={() => handleVerifyCode('phone')}>Verify</Button>
                                        </div>
                                    )}
                                </div>
                                 <div className="col-span-1">
                                    <Label htmlFor="first-name">First Name</Label>
                                    <Input id="first-name" placeholder="John" required defaultValue={user?.name.split(' ')[0] || ""} />
                                </div>
                                 <div className="col-span-1">
                                    <Label htmlFor="last-name">Last Name</Label>
                                    <Input id="last-name" placeholder="Doe" required defaultValue={user?.name.split(' ').slice(1).join(' ') || ""} />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="address1">Address Line 1</Label>
                                    <Input id="address1" placeholder="123 Main St" required />
                                </div>
                                 <div className="col-span-2">
                                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                                    <Input id="address2" placeholder="Apartment, suite, etc." />
                                </div>
                                <div className="col-span-1">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" placeholder="Anytown" required />
                                </div>
                                 <div className="col-span-1">
                                    <Label htmlFor="state">State / Province</Label>
                                    <Input id="state" placeholder="California" required />
                                </div>
                                <div className="col-span-1">
                                    <Label htmlFor="zip">ZIP Code</Label>
                                    <Input id="zip" placeholder="12345" required />
                                </div>
                                 <div className="col-span-1">
                                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                                    <Input id="landmark" placeholder="Near the park" />
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
                                        <div key={item.instanceId} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                                    <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" data-ai-hint={`${item.product.tags?.[0] || 'product'} ${item.product.tags?.[1] || ''}`} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{item.product.name}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                     <p className="text-xs text-muted-foreground">Sold by: {item.product.vendorName}</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">${getFinalPrice(item).toFixed(2)}</p>
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
                                        <p>${total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button size="lg" type="submit" className="w-full" disabled={isProcessing || !isFormFullyVerified}>
                                    {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                    {isProcessing ? 'Processing...' : `Pay Now ($${total.toFixed(2)})`}
                                </Button>
                            </CardFooter>
                        </Card>
                        {!isFormFullyVerified && <p className="text-xs text-center text-muted-foreground mt-2">Please verify email and phone to complete your order.</p>}
                    </div>
                </div>
            </form>
        </div>
    );
}
