
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { DisplayProduct, Program } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, Wand2, ShoppingCart, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useUser } from '@/context/user-context';
import { useAuthDialog } from '@/context/auth-dialog-context';
import { useRouter } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: DisplayProduct;
}

const getFinalPrice = (product: DisplayProduct, commissionRates: any, applicableDiscount?: Program | null) => {
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
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isLoggedIn, commissionRates } = useUser();
  const { openDialog } = useAuthDialog();
  const router = useRouter();
  const [promotions, setPromotions] = useState<Program[]>([]);

  useEffect(() => {
    const promotionsQuery = query(collection(db, "programs"), where("status", "==", "Active"), where("target", "==", "customer"));
    const unsubscribe = onSnapshot(promotionsQuery, (snapshot) => {
        const activePromos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
        const relevantPromos = activePromos.filter(p => p.productScope === 'all' && (p.platform === 'personalized' || p.platform === 'both'));
        setPromotions(relevantPromos);
    });
    return () => unsubscribe();
  }, []);

  const applicableDiscount = useMemo(() => {
    return promotions.find(p => p.type === 'discount');
  }, [promotions]);

  const priceDetails = getFinalPrice(product, commissionRates, applicableDiscount);

  const isCustomizable = useMemo(() => {
    return Object.values(product.customizationAreas || {}).some(areas => areas && areas.length > 0);
  }, [product]);

  const handleAddToCart = () => {
    addToCart({product, customizations: {}});
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      openDialog('login');
      return;
    }
    addToCart({product, customizations: {}});
    router.push('/checkout');
  };
  
  const handleCustomize = () => {
    if (!isLoggedIn) {
        openDialog('login');
        return;
    }
    router.push(`/customize/${product.id}`);
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation when clicking the heart
    e.stopPropagation();
    if (!isLoggedIn) {
        openDialog('login');
        return;
    }
    toggleWishlist(product);
    toast({
        title: isWishlisted(product.id) ? "Removed from Wishlist" : "Added to Wishlist",
        description: product.name,
    });
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 border-b">
        <Link href={`/products/${product.id}`} className="block group">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`}
            />
            {priceDetails.hasDiscount && (
                <Badge variant="destructive" className="absolute top-2 left-2">
                    <Tag className="mr-1 h-3 w-3"/> {priceDetails.discountValue}% OFF
                </Badge>
            )}
            <Button 
                size="icon" 
                variant="secondary" 
                className="absolute top-2 right-2 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleWishlistClick}
              >
                <Heart className={cn("h-4 w-4", isWishlisted(product.id) && "fill-destructive text-destructive")} />
            </Button>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <h3 className="mt-1 text-lg font-headline font-semibold leading-tight flex-grow">
          <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn('h-4 w-4', i < Math.round(product.rating) ? 'text-accent fill-accent' : 'text-muted-foreground/30')} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-2">({product.reviewCount})</span>
        </div>
         <div className="flex items-baseline gap-2 mt-2">
            <p className="text-xl font-semibold font-body">${priceDetails.final.toFixed(2)}</p>
             {priceDetails.hasDiscount && (
                <p className="text-base font-medium text-muted-foreground line-through">${priceDetails.original.toFixed(2)}</p>
            )}
        </div>
      </CardContent>
       <CardFooter className="p-2 pt-0 flex flex-col gap-2">
        {isCustomizable ? (
            <div className="w-full flex flex-col gap-2">
                <Button size="sm" className="w-full" onClick={handleCustomize}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Customize Now
                </Button>
                 <div className="w-full flex gap-2">
                    <Button variant="secondary" size="sm" className="w-full" onClick={handleAddToCart}>Add to Cart</Button>
                    <Button variant="secondary" size="sm" className="w-full" onClick={handleBuyNow}>Buy Now</Button>
                </div>
            </div>
        ) : (
            <div className="w-full flex gap-2">
                <Button variant="secondary" size="sm" className="w-full" onClick={handleAddToCart}>Add to Cart</Button>
                <Button size="sm" className="w-full" onClick={handleBuyNow}>Buy Now</Button>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
