"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProducts } from "@/lib/mock-data";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const cartItems = mockProducts.slice(0, 3).map(p => ({ ...p, quantity: 1 }));
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 5.00;
  const total = subtotal + shipping;

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold font-headline mb-8 text-center">Your Shopping Cart</h1>
      <div className="grid md:grid-cols-3 gap-12 items-start">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint={`${item.tags?.[0] || 'product'} ${item.tags?.[1] || ''}`} />
                </div>
                <div className="flex-grow p-4">
                  <Link href={`/products/${item.id}`} className="font-semibold font-headline hover:text-primary">{item.name}</Link>
                  <p className="text-sm text-muted-foreground">{item.vendor}</p>
                  <p className="text-lg font-semibold mt-2">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 p-4">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input type="number" value={item.quantity} className="w-14 h-8 text-center" readOnly />
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <aside className="md:col-span-1 sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}
