

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { DisplayProduct } from "@/lib/types";
import { MessageSquare } from "lucide-react";


export function ProductInteractions({ product }: { product: DisplayProduct }) {
  const { toast } = useToast();

  const handleAddToCart = () => {
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart}>Add to Cart</Button>
        <Button size="lg" variant="outline" className="w-full" asChild>
            <Link href={`/account?tab=messages&vendorId=${product.vendorId}&productName=${encodeURIComponent(product.name)}`}>
                <MessageSquare className="mr-2 h-5 w-5" />
                Message Vendor
            </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Sold by <Link href={`/vendor?vendorId=${product.vendorId}&productName=${encodeURIComponent(product.name)}`} className="font-semibold text-primary hover:underline">{product.vendorId}</Link></p>
    </>
  );
}
