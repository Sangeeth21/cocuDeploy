
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowRight, Wand2, Tag, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { useUser } from "@/context/user-context";
import { useAuthDialog } from "@/context/auth-dialog-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Program, DisplayProduct } from "@/lib/types";
import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";

export default function CorporateCartPage() {
  const { cartItems, updateQuantity, removeFromCart, loading } = useCart();
  const { isLoggedIn, commissionRates } = useUser();
  const { openDialog } = useAuthDialog();
  const router = useRouter();
  const [promotions, setPromotions] = useState<Program[]>([]);
  const platform = 'corporate';

   useEffect(() => {
    const promotionsQuery = query(collection(db, "programs"), where("status", "==", "Active"), where("target", "==", "customer"));
     const unsubscribe = onSnapshot(promotionsQuery, (snapshot) => {
        const activePromos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
        const relevantPromos = activePromos.filter(p => p.productScope === 'all' && (p.platform === platform || p.platform === 'both'));
        setPromotions(relevantPromos);
    });
    return () => unsubscribe();
  }, [platform]);

  const getPriceDetails = (item: typeof cartItems[0]) => {
      const commissionRule = commissionRates?.[platform]?.[item.product.category];
      
      const basePrice = item.product.tierPrices?.find(tier => item.quantity >= tier.quantity)?.price || item.product.price;

      let finalPrice = basePrice;
      if (commissionRule && commissionRule.buffer) {
          if (commissionRule.buffer.type === 'fixed') {
              finalPrice += commissionRule.buffer.value;
          } else {
              finalPrice *= (1 + (commissionRule.buffer.value / 100));
          }
      }
       const originalPrice = finalPrice;
       const applicableDiscount = promotions.find(p => p.productScope === 'all'); // simplified for now
       if (applicableDiscount && applicableDiscount.reward.referrer?.value) {
           finalPrice *= (1 - (applicableDiscount.reward.referrer.value / 100));
       }
      return { original: originalPrice, final: finalPrice, hasDiscount: !!applicableDiscount, discountValue: applicableDiscount?.reward.referrer?.value };
  }

  const calculatedSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + getPriceDetails(item).final * item.quantity, 0);
  }, [cartItems, promotions, commissionRates]);


  const shipping = cartItems.length > 0 ? 50.00 : 0; // Higher base shipping for B2B
  const total = calculatedSubtotal + shipping;

  const handleCheckout = () => {
    if (!isLoggedIn) {
      openDialog('login');
    } else {
      router.push('/checkout');
    }
  };

  const hasCustomizations = (item: typeof cartItems[0]) => {
      return Object.keys(item.customizations).length > 0;
  }

  if (loading) {
    return (
        <div className="container py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary"/>
            <p className="mt-2 text-muted-foreground">Loading your corporate cart...</p>
        </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold font-headline mb-8 text-center">Corporate Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2 space-y-4">
            {cartItems.map(item => {
                const priceDetails = getPriceDetails(item);
                return (
                  <Card key={item.instanceId} className="overflow-hidden">
                    <div className="flex items-center gap-4">
                      <Link href={`/corporate/products/${item.product.id}`} className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                        <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" data-ai-hint={`${item.product.tags?.[0] || 'product'} ${item.product.tags?.[1] || ''}`} />
                      </Link>
                      <div className="flex-grow p-4">
                        <Link href={`/corporate/products/${item.product.id}`} className="font-semibold font-headline hover:text-primary">{item.product.name}</Link>
                        {hasCustomizations(item) && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                <Wand2 className="h-3 w-3" />
                                <span>Customized</span>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">Vendor ID: {item.product.vendorId}</p>
                         <div className="flex items-baseline gap-2 mt-2">
                            <p className="text-lg font-semibold">${priceDetails.final.toFixed(2)}</p>
                            {priceDetails.hasDiscount && (
                                <p className="text-sm text-muted-foreground line-through">${priceDetails.original.toFixed(2)}</p>
                            )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-4">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.instanceId, -item.product.moq || -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input type="text" value={item.quantity} className="w-14 h-8 text-center" readOnly />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.instanceId, item.product.moq || 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.instanceId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
            })}
          </div>
          
          <aside className="md:col-span-1 sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${calculatedSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping (estimated)</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      ) : (
        <div className="text-center py-16">
            <ShoppingCartIcon className="mx-auto h-24 w-24 text-muted-foreground opacity-30" />
            <h2 className="text-2xl font-semibold mb-2 mt-4">Your corporate cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild>
                <Link href="/corporate/products">Start Shopping</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
