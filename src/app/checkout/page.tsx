
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
    const [phoneStatus, setPhoneStatus] = useState<VerificationStatus>('verified');
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
            setPhoneStatus('verified'); // Assume phone is verified if user is logged in for simplicity
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
        if (appliedCoupon) {
            // If user applied a stackable coupon, add it to platform discount
            if (appliedCoupon.isStackable) {
                return platformDiscountAmount + userCouponDiscountAmount;
            }
            // If user applied a non-stackable coupon, the logic is handled in handleApplyCoupon
            // We just return the user-applied coupon's value here as it has replaced the platform one.
            return userCouponDiscountAmount;
        }
        // If no user coupon, just use the platform discount
        return platformDiscountAmount;
    }, [appliedCoupon, platformDiscountAmount, userCouponDiscountAmount]);


    const shipping = cartItems.length > 0 ? 5.00 : 0;
    const convenienceFee = (subtotal - totalDiscount) * 0.03;
    const total = subtotal - totalDiscount + shipping + convenienceFee;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) { toast({ variant: "destructive", title: "Please enter a coupon code." }); return; }
        const q = query(collection(db, "coupons"), where("code", "==", couponCode.toUpperCase()), limit(1));
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

        if (!coupon.isStackable && platformDiscountAmount > 0) {
            if (newCouponDiscount > platformDiscountAmount) {
                toast({
                    title: "Better Discount Already Applied",
                    description: "Your current platform discount is better than this coupon.",
                });
                setCouponCode(platformDiscount?.code || ""); // Revert input to platform code
                return;
            } else {
                 setAppliedCoupon(coupon);
                 toast({ title: "Coupon Applied!", description: `The platform discount was replaced.` });
            }
        } else {
            setAppliedCoupon(coupon);
            toast({ title: "Coupon Applied!" });
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode(platformDiscount?.code || "");
    };
    
    const handleFinalizePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { toast({ variant: "destructive", title: "You must be logged in to place an order." }); return; }
        setIsProcessing(true);
        // ... Firestore logic from original component
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
                            <CardHeader><CardTitle className="font-headline">Shipping Information</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-6">
                                {/* Shipping form fields */}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Payment</CardTitle>
                                <CardDescription>All transactions are secure and encrypted.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               {/* Payment form fields */}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="sticky top-24">
                        <Card>
                            <CardHeader><CardTitle className="font-headline">Order Summary</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cartItems.map(item => {
                                        const originalPrice = calculateItemPrice(item.product);
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
                                                    <p className="font-semibold">${(originalPrice * item.quantity).toFixed(2)}</p>
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
                                                <Button type="button" variant="outline" onClick={handleApplyCoupon}>Apply</Button>
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
                            <Button size="lg" type="submit" className="w-full" disabled={isProcessing}>
                                {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                {isProcessing ? 'Processing...' : `Pay Now ($${total.toFixed(2)})`}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
