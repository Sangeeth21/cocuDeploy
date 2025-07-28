
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
import { Loader2, Percent } from "lucide-react";


export default function CheckoutPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [applyWallet, setApplyWallet] = useState(false);

    const cartItems = mockProducts.slice(0, 2).map(p => ({ ...p, quantity: 1 }));
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Loyalty Program check
    const loyaltyOrdersRequired = 3;
    const hasLoyalty = mockUserOrders.length >= loyaltyOrdersRequired;
    const shipping = hasLoyalty ? 0 : 5.00;
    
    // Wallet Balance
    const walletBalance = 100;
    const discountFromWallet = applyWallet ? Math.min(subtotal + shipping, walletBalance) : 0;
    
    const total = useMemo(() => {
        return subtotal + shipping - discountFromWallet;
    }, [subtotal, shipping, discountFromWallet]);
    
    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
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
             <form onSubmit={handlePayment}>
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
                                 <div className="mt-4 pt-4 border-t space-y-2">
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="apply-wallet" checked={applyWallet} onCheckedChange={(checked) => setApplyWallet(checked as boolean)} />
                                            <Label htmlFor="apply-wallet" className="font-normal flex items-center gap-1">Apply Wallet Balance <span className="font-bold text-green-600">(₹{walletBalance.toFixed(2)})</span></Label>
                                        </div>
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
                                    {discountFromWallet > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <p className="font-semibold">Wallet Discount</p>
                                            <p className="font-semibold">-${discountFromWallet.toFixed(2)}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg">
                                        <p>Total</p>
                                        <p>${total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button size="lg" type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                    {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}

    