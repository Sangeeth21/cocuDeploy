
"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X, Plus, Minus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { Input } from "./ui/input";
import { useUser } from "@/context/user-context";
import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Program, DisplayProduct } from "@/lib/types";
import { Badge } from "./ui/badge";

export function CartPreview() {
    const { cartItems, updateQuantity, removeFromCart, totalItems } = useCart();
    const { commissionRates } = useUser();
    const [promotions, setPromotions] = useState<Program[]>([]);

    useEffect(() => {
        const promotionsQuery = query(collection(db, "programs"), where("status", "==", "Active"), where("target", "==", "customer"));
        const unsubscribe = onSnapshot(promotionsQuery, (snapshot) => {
            const activePromos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
            const relevantPromos = activePromos.filter(p => p.productScope === 'all');
            setPromotions(relevantPromos);
        });
        return () => unsubscribe();
    }, []);

    const applicableDiscount = useMemo(() => {
        return promotions.find(p => p.type === 'discount');
    }, [promotions]);

    const getPriceDetails = (product: DisplayProduct) => {
        const commissionRule = commissionRates?.personalized?.[product.category];
        let finalPrice = product.price;
        if (commissionRule && commissionRule.buffer) {
            if (commissionRule.buffer.type === 'fixed') {
                finalPrice += commissionRule.buffer.value;
            } else {
                finalPrice *= (1 + (commissionRule.buffer.value / 100));
            }
        }
        const originalPrice = finalPrice;
        
        if (applicableDiscount) {
            finalPrice *= (1 - (applicableDiscount.reward.value / 100));
        }
        
        return { original: originalPrice, final: finalPrice, hasDiscount: !!applicableDiscount, discountValue: applicableDiscount?.reward.value };
    };

    const calculatedSubtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + getPriceDetails(item.product).final * item.quantity, 0);
    }, [cartItems, promotions, commissionRates]);


    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open cart preview" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">My Cart</h4>
                        <p className="text-sm text-muted-foreground">
                           {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart.
                        </p>
                    </div>
                    <div className="grid gap-4">
                       {cartItems.length > 0 ? (
                            <>
                                <div className="max-h-[22rem] overflow-y-auto pr-2 space-y-4">
                                {cartItems.map(item => {
                                    const priceDetails = getPriceDetails(item.product);
                                    return (
                                        <div key={item.instanceId} className="flex items-start gap-4">
                                            <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                                                <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" data-ai-hint="product image" />
                                                {priceDetails.hasDiscount && (
                                                    <Badge variant="destructive" className="absolute top-1 left-1">
                                                        <Tag className="mr-1 h-3 w-3" /> {priceDetails.discountValue}% OFF
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Link href={`/products/${item.product.id}`} className="text-sm font-medium leading-tight hover:text-primary">{item.product.name}</Link>
                                                
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-sm font-semibold">${(priceDetails.final * item.quantity).toFixed(2)}</p>
                                                    {priceDetails.hasDiscount && (
                                                        <p className="text-xs text-muted-foreground line-through">${(priceDetails.original * item.quantity).toFixed(2)}</p>
                                                    )}
                                                </div>

                                                 <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.instanceId, -1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <Input type="text" value={item.quantity} className="w-12 h-6 text-center" readOnly />
                                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.instanceId, 1)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => removeFromCart(item.instanceId)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                })}
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>Subtotal</span>
                                    <span>${calculatedSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex gap-2">
                                     <Button asChild className="w-full" variant="outline">
                                        <Link href="/cart">View Cart</Link>
                                    </Button>
                                     <Button asChild className="w-full">
                                        <Link href="/checkout">Checkout</Link>
                                    </Button>
                                </div>
                            </>
                       ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">Your cart is empty.</p>
                       )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
