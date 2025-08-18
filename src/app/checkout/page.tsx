
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Loader2, ShieldCheck, CheckCircle, Gift, BadgePercent, X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/user-context";
import { useCart } from "@/context/cart-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, query, where, getDocs, limit, onSnapshot } from "firebase/firestore";
import type { OrderItem, Freebie, Coupon, Program, DisplayProduct } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";


const MOCK_EMAIL_OTP = "123456";
const MOCK_PHONE_OTP = "654321";

type VerificationStatus = 'unverified' | 'pending' | 'verified';

export default function CheckoutPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, isLoggedIn, commissionRates } = useUser();
    const { cartItems, subtotal: rawSubtotal, clearCart, loading: isCartLoading } = useCart();

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
    
    // Freebie state
    const [availableFreebies, setAvailableFreebies] = useState<Freebie[]>([]);
    const [selectedFreebie, setSelectedFreebie] = useState<Freebie | null>(null);

    // Coupon and Discount State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [platformDiscount, setPlatformDiscount] = useState<Program | null>(null);
    
    useEffect(() => {
        if(isLoggedIn && user) {
            setEmail(user.email);
            setPhone(user.phone || "");
            setEmailStatus('verified');
            setPhoneStatus('verified'); 
        }
    }, [isLoggedIn, user]);
    
    useEffect(() => {
        const fetchFreebies = async () => {
            if (cartItems.length === 0) {
                setAvailableFreebies([]);
                return;
            }
            const vendorIds = [...new Set(cartItems.map(item => item.product.vendorId))];
            if (vendorIds.length > 0) {
                const q = query(collection(db, "freebies"), where("vendorId", "in", vendorIds), where("status", "==", "active"), limit(5));
                const querySnapshot = await getDocs(q);
                const freebiesData: Freebie[] = [];
                querySnapshot.forEach(doc => freebiesData.push({ id: doc.id, ...doc.data() } as Freebie));
                setAvailableFreebies(freebiesData);
            }
        };
        fetchFreebies();

        const promotionsQuery = query(collection(db, "programs"), where("status", "==", "Active"), where("target", "==", "customer"), where("type", "==", "discount"), where("productScope", "==", "all"));
        const unsubscribePromos = onSnapshot(promotionsQuery, (snapshot) => {
            if(!snapshot.empty){
                const promo = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Program;
                setPlatformDiscount(promo);
                if (promo.code) {
                    setCouponCode(promo.code);
                    handleApplyCoupon(promo.code);
                }
            } else {
                setPlatformDiscount(null);
            }
        });
        return () => unsubscribePromos();

    }, [cartItems]);

    const calculateItemPrice = (product: DisplayProduct) => {
        const commissionRule = commissionRates?.personalized?.[product.category];
        let finalPrice = product.price;
        if (commissionRule && commissionRule.buffer) {
            if (commissionRule.buffer.type === 'fixed') {
                finalPrice += commissionRule.buffer.value;
            } else {
                finalPrice *= (1 + (commissionRule.buffer.value / 100));
            }
        }
        return finalPrice;
    }
    
    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + calculateItemPrice(item.product) * item.quantity, 0);
    }, [cartItems, commissionRates]);

    const calculateCouponDiscount = useCallback((coupon: Coupon) => {
        let applicableSubtotal = 0;
        if (coupon.scope === 'all') {
            applicableSubtotal = subtotal;
        } else {
            applicableSubtotal = cartItems
                .filter(item => 
                    (coupon.scope === 'category' && coupon.applicableCategories?.includes(item.product.category)) ||
                    (coupon.scope === 'product' && coupon.applicableProducts?.includes(item.product.id))
                )
                .reduce((acc, item) => acc + calculateItemPrice(item.product) * item.quantity, 0);
        }
        if (applicableSubtotal === 0) return 0;
        let calculatedDiscount = coupon.type === 'fixed' ? coupon.value : applicableSubtotal * (coupon.value / 100);
        if (coupon.type === 'percentage' && coupon.maxDiscount) {
            calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscount);
        }
        return Math.min(calculatedDiscount, applicableSubtotal);
    }, [cartItems, subtotal, calculateItemPrice]);
    
    const platformDiscountAmount = useMemo(() => {
        if (!platformDiscount) return 0;
        return subtotal * (platformDiscount.reward.value / 100);
    }, [platformDiscount, subtotal]);

    const userCouponDiscountAmount = useMemo(() => {
        if (!appliedCoupon) return 0;
        return calculateCouponDiscount(appliedCoupon);
    }, [appliedCoupon, calculateCouponDiscount]);
    
    const totalDiscount = useMemo(() => {
        if (appliedCoupon && platformDiscount) {
            if (appliedCoupon.isStackable) {
                return platformDiscountAmount + userCouponDiscountAmount;
            }
            // Non-stackable: apply whichever is smaller (better for the platform)
            return Math.min(platformDiscountAmount, userCouponDiscountAmount);
        }
        return platformDiscountAmount + userCouponDiscountAmount;
    }, [appliedCoupon, platformDiscount, platformDiscountAmount, userCouponDiscountAmount]);


    const shipping = cartItems.length > 0 ? 5.00 : 0;
    const convenienceFee = (subtotal - totalDiscount) * 0.03;
    const total = subtotal - totalDiscount + shipping + convenienceFee;

    const handleApplyCoupon = async (codeToApply?: string) => {
        const finalCode = codeToApply || couponCode;
        if (!finalCode.trim()) { toast({ variant: "destructive", title: "Please enter a coupon code." }); return; }
        
        const q = query(collection(db, "coupons"), where("code", "==", finalCode.toUpperCase()), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ variant: "destructive", title: "Invalid coupon code." });
            return;
        }

        const coupon = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Coupon;
        
        if (coupon.status !== 'Active') {
            toast({ variant: 'destructive', title: 'Coupon Not Active', description: 'This coupon is either expired or inactive.' });
            return;
        }
        
        const newCouponDiscount = calculateCouponDiscount(coupon);
        
        if (!coupon.isStackable && platformDiscount) {
            if (newCouponDiscount > platformDiscountAmount) {
                 toast({
                    title: "Better Promotion Active",
                    description: `This coupon cannot be applied as a better platform-wide discount is already active.`,
                });
                setCouponCode(platformDiscount.code || "");
                return;
            }
        }
        
        setAppliedCoupon(coupon);
        if(!codeToApply) {
            toast({ title: "Coupon Applied!" });
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        // Re-apply platform discount if it exists
        if(platformDiscount?.code){
            setCouponCode(platformDiscount.code);
            handleApplyCoupon(platformDiscount.code);
        } else {
            setCouponCode("");
        }
    };

    const handleSendOtp = (type: 'email' | 'phone') => {
        toast({ title: 'OTP Sent (Simulated)', description: `An OTP has been sent to your ${type}.`});
        if (type === 'email') {
            setShowEmailOtp(true);
            setEmailStatus('pending');
        } else {
            setShowPhoneOtp(true);
            setPhoneStatus('pending');
        }
    };
    
    const handleVerifyOtp = (type: 'email' | 'phone') => {
        if (type === 'email' && emailOtp === MOCK_EMAIL_OTP) {
            setEmailStatus('verified');
            setShowEmailOtp(false);
            toast({ title: 'Email Verified!'});
        } else if (type === 'phone' && phoneOtp === MOCK_PHONE_OTP) {
            setPhoneStatus('verified');
            setShowPhoneOtp(false);
            toast({ title: 'Phone Verified!'});
        } else {
            toast({ variant: 'destructive', title: 'Invalid OTP'});
        }
    };
    
    const handleFinalizePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { toast({ variant: "destructive", title: "You must be logged in to place an order." }); return; }
        setIsProcessing(true);
        await clearCart();
        toast({ title: "Payment Successful!", description: "Your order has been placed." });
        router.push('/account?tab=orders');
    }

     if (isCartLoading) {
        return (
            <div className="container py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary"/>
                <p className="mt-2 text-muted-foreground">Loading checkout...</p>
            </div>
        )
    }

    const isVerified = emailStatus === 'verified' && phoneStatus === 'verified';

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
                                <CardTitle className="font-headline">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={emailStatus === 'verified'} />
                                        {emailStatus === 'verified' ? <Badge variant="secondary"><CheckCircle className="h-4 w-4 mr-1.5"/>Verified</Badge> : <Button type="button" size="sm" onClick={() => handleSendOtp('email')}>Verify</Button>}
                                    </div>
                               </div>
                               {showEmailOtp && (
                                   <div className="space-y-2">
                                       <Label htmlFor="email-otp">Email OTP</Label>
                                       <Input id="email-otp" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} onBlur={() => handleVerifyOtp('email')} />
                                   </div>
                               )}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={phoneStatus === 'verified'} />
                                        {phoneStatus === 'verified' ? <Badge variant="secondary"><CheckCircle className="h-4 w-4 mr-1.5"/>Verified</Badge> : <Button type="button" size="sm" onClick={() => handleSendOtp('phone')}>Verify</Button>}
                                    </div>
                               </div>
                               {showPhoneOtp && (
                                   <div className="space-y-2">
                                       <Label htmlFor="phone-otp">Phone OTP</Label>
                                       <Input id="phone-otp" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} onBlur={() => handleVerifyOtp('phone')}/>
                                   </div>
                               )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="font-headline">Shipping Information</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-6">
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="shipping-name">Full Name</Label>
                                    <Input id="shipping-name" defaultValue={user?.name} required />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="shipping-address">Address</Label>
                                    <Input id="shipping-address" placeholder="123 Main St" required />
                                </div>
                                 <div className="col-span-2 sm:col-span-1 space-y-2">
                                    <Label htmlFor="shipping-city">City</Label>
                                    <Input id="shipping-city" placeholder="Anytown" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-zip">ZIP Code</Label>
                                    <Input id="shipping-zip" placeholder="12345" required />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Payment</CardTitle>
                                <CardDescription>All transactions are secure and encrypted.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="space-y-2">
                                    <Label htmlFor="card-number">Card Number</Label>
                                    <Input id="card-number" placeholder="•••• •••• •••• ••••" />
                               </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry Date</Label>
                                        <Input id="expiry" placeholder="MM / YY" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input id="cvc" placeholder="123" />
                                    </div>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox id="billing-same" defaultChecked />
                                    <Label htmlFor="billing-same" className="font-normal">Billing address is same as shipping</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="sticky top-24">
                        <Card>
                            <CardHeader><CardTitle className="font-headline">Order Summary</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cartItems.map(item => {
                                        const priceDetails = getPriceDetails(item);
                                        return (
                                            <div key={item.instanceId} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                                        <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{item.product.name}</p>
                                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">${(priceDetails.final * item.quantity).toFixed(2)}</p>
                                                     {priceDetails.hasDiscount && (
                                                        <p className="text-xs text-muted-foreground line-through">${(priceDetails.original * item.quantity).toFixed(2)}</p>
                                                     )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="mt-4 pt-4 border-t space-y-2">
                                     <div className="space-y-2">
                                         <Label htmlFor="coupon-code">Coupon Code</Label>
                                        {appliedCoupon ? (
                                             <div className="flex items-center justify-between gap-2 p-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-green-700 dark:text-green-300" />
                                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">{appliedCoupon.code}</span>
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-green-700 dark:text-green-300" onClick={removeCoupon}><X className="h-4 w-4"/></Button>
                                             </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input id="coupon-code" placeholder="Enter coupon" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                                                <Button type="button" variant="outline" onClick={() => handleApplyCoupon()}>Apply</Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t space-y-2">
                                    <div className="flex justify-between"><p>Subtotal</p><p>${subtotal.toFixed(2)}</p></div>
                                    
                                     {totalDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <p>Discount</p>
                                            <p>-${totalDiscount.toFixed(2)}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-between"><p className="text-muted-foreground">Shipping</p><p>${shipping.toFixed(2)}</p></div>
                                    <div className="flex justify-between"><p className="text-muted-foreground">Convenience Fee (3%)</p><p>${convenienceFee.toFixed(2)}</p></div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg"><p>Total</p><p>${total.toFixed(2)}</p></div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="mt-4">
                            <Button size="lg" type="submit" className="w-full" disabled={isProcessing || !isVerified}>
                                {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                {isProcessing ? 'Processing...' : `Pay Now ($${total.toFixed(2)})`}
                            </Button>
                            {!isVerified && <p className="text-xs text-destructive text-center mt-2">Please verify your contact information to proceed.</p>}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
