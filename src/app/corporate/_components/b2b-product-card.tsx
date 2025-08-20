
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { DisplayProduct, Program } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Truck, Wand2, ShoppingCart, Scale, Gavel, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useComparison } from '@/context/comparison-context';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { useAuthDialog } from '@/context/auth-dialog-context';
import { useBidRequest } from '@/context/bid-request-context';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';


interface ProductCardProps {
  product: DisplayProduct;
}

const getFinalPrice = (product: DisplayProduct, commissionRates: any, applicableDiscount?: Program | null, type: 'personalized' | 'corporate' = 'corporate') => {
    const commissionRule = commissionRates?.[type]?.[product.category];
    let finalPrice = product.price;
    if (commissionRule && commissionRule.buffer) {
        if (commissionRule.buffer.type === 'fixed') {
            finalPrice += commissionRule.buffer.value;
        } else {
            finalPrice *= (1 + (commissionRule.buffer.value / 100));
        }
    }
    const originalPrice = finalPrice;
    
    if (applicableDiscount && applicableDiscount.reward.referrer?.value) {
        finalPrice *= (1 - (applicableDiscount.reward.referrer.value / 100));
    }
    
    return { original: originalPrice, final: finalPrice, hasDiscount: !!applicableDiscount, discountValue: applicableDiscount?.reward.referrer?.value };
}


export function TinyB2bProductCard({ product }: ProductCardProps) {
    const { toggleCompare, isComparing } = useComparison();
    const { toast } = useToast();
    const { commissionRates } = useUser();
    const [promotions, setPromotions] = useState<Program[]>([]);

    useEffect(() => {
        const promotionsQuery = query(collection(db, "programs"), where("status", "==", "Active"), where("target", "==", "customer"));
        const unsubscribe = onSnapshot(promotionsQuery, (snapshot) => {
            const activePromos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
            const relevantPromos = activePromos.filter(p => p.productScope === 'all' && (p.platform === 'corporate' || p.platform === 'both'));
            setPromotions(relevantPromos);
        });
        return () => unsubscribe();
    }, []);

    const applicableDiscount = useMemo(() => {
        return promotions.find(p => p.type === 'discount');
    }, [promotions]);

    const priceDetails = useMemo(() => {
        const basePrice = product.tierPrices && product.tierPrices.length > 0
            ? Math.min(...product.tierPrices.map(p => p.price))
            : product.price;
        return getFinalPrice({ ...product, price: basePrice }, commissionRates, applicableDiscount, 'corporate');
    }, [product, commissionRates, applicableDiscount]);
    
    const handleToggleCompare = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        toggleCompare(product);
        toast({
          title: isComparing(product.id) ? "Removed from Comparison" : "Added to Comparison",
          description: product.name,
        });
    }

    return (
        <Card className="overflow-hidden h-full">
            <Link href={`/corporate/products/${product.id}`} className="block group h-full flex flex-col relative">
                 <Button 
                    size="icon" 
                    variant={isComparing(product.id) ? "secondary" : "ghost"}
                    className="absolute top-1 right-1 h-6 w-6 z-10"
                    onClick={handleToggleCompare}
                    aria-label="Compare product"
                >
                    <Scale className="h-3 w-3" />
                </Button>
                <div className="relative aspect-square w-full overflow-hidden">
                     <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                     {priceDetails.hasDiscount && (
                        <Badge variant="destructive" className="absolute top-2 left-2 text-[10px] h-auto px-1.5 py-0">
                            <Tag className="mr-1 h-3 w-3"/> {priceDetails.discountValue}% OFF
                        </Badge>
                     )}
                </div>
                 <div className="p-2 flex-grow flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-medium leading-tight line-clamp-2">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">MOQ: {product.moq}</p>
                    </div>
                     <div>
                        <p className="text-xs text-muted-foreground">Starts from</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <p className="text-sm font-bold">${priceDetails.final.toFixed(2)}</p>
                             {priceDetails.hasDiscount && (
                                <p className="text-xs text-muted-foreground line-through">${priceDetails.original.toFixed(2)}</p>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </Card>
    )
}

export function B2bProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleCompare, isComparing } = useComparison();
  const { addToBid, isInBid } = useBidRequest();
  const { toast } = useToast();
  const { isLoggedIn, commissionRates } = useUser();
  const { openDialog } = useAuthDialog();
  const [promotions, setPromotions] = useState<Program[]>([]);

  useEffect(() => {
    const promotionsQuery = query(collection(db, "programs"), where("status", "==", "Active"), where("target", "==", "customer"));
    const unsubscribe = onSnapshot(promotionsQuery, (snapshot) => {
        const activePromos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
        const relevantPromos = activePromos.filter(p => p.productScope === 'all' && (p.platform === 'corporate' || p.platform === 'both'));
        setPromotions(relevantPromos);
    });
    return () => unsubscribe();
  }, []);

  const applicableDiscount = useMemo(() => {
    return promotions.find(p => p.type === 'discount');
  }, [promotions]);

  const isCustomizable = useMemo(() => {
    return Object.values(product.customizationAreas || {}).some(areas => areas && areas.length > 0);
  }, [product]);

  const handleRequestQuote = () => {
    if (isCustomizable) {
        router.push(`/corporate/customize/${product.id}`);
    } else {
        router.push(`/corporate/quote/${product.id}`);
    }
  };

  const handleAddToCart = () => {
    addToCart({product, customizations: {}});
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`
    });
  }

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      openDialog('login');
      return;
    }
    addToCart({product, customizations: {}});
    router.push('/checkout');
  };

  const handleToggleCompare = () => {
      toggleCompare(product);
      toast({
          title: isComparing(product.id) ? "Removed from Comparison" : "Added to Comparison",
          description: product.name,
      });
  }
  
  const handleAddToBid = () => {
      addToBid(product);
  }

  const priceDetails = useMemo(() => {
    const basePrice = product.tierPrices && product.tierPrices.length > 0
        ? Math.min(...product.tierPrices.map(p => p.price))
        : product.price;
    return getFinalPrice({ ...product, price: basePrice }, commissionRates, applicableDiscount, 'corporate');
  }, [product, commissionRates, applicableDiscount]);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 border-b">
        <Link href={`/corporate/products/${product.id}`} className="block group">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`}
            />
             {isCustomizable && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <Wand2 className="h-3 w-3" />
                <span>Customizable</span>
              </div>
            )}
            {priceDetails.hasDiscount && (
                <Badge variant="destructive" className="absolute top-2 right-2">
                    <Tag className="mr-1 h-3 w-3"/> {priceDetails.discountValue}% OFF
                </Badge>
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <h3 className="mt-1 text-base font-headline font-semibold leading-tight flex-grow">
          <Link href={`/corporate/products/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>MOQ: {product.moq} units</span>
        </div>
      </CardContent>
       <CardFooter className="p-2 pt-0 flex flex-col items-start gap-2">
         <div className='w-full px-2'>
            <p className="text-xs text-muted-foreground">Starts from</p>
             <div className="flex items-baseline gap-2">
                <p className="text-xl font-semibold font-body">${priceDetails.final.toFixed(2)}</p>
                 {priceDetails.hasDiscount && (
                    <p className="text-base font-medium text-muted-foreground line-through">${priceDetails.original.toFixed(2)}</p>
                )}
                 <span className="text-sm text-muted-foreground">/ unit</span>
            </div>
         </div>
        <div className="w-full flex flex-col gap-2">
            <Button size="sm" className="w-full" onClick={handleRequestQuote}>
                {isCustomizable ? 'Customize & Quote' : 'Request a Quote'}
            </Button>
            <div className="grid grid-cols-2 gap-2">
                 <Button size="sm" variant="secondary" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
                 <Button size="sm" variant="secondary" onClick={handleBuyNow}>
                    Buy Now
                </Button>
            </div>
             <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="w-full" onClick={handleToggleCompare}>
                    <Scale className="h-4 w-4 mr-2" />
                    {isComparing(product.id) ? 'Remove' : 'Compare'}
                </Button>
                 <Button size="sm" variant="outline" className="w-full" onClick={handleAddToBid} disabled={isInBid(product.id)}>
                    <Gavel className="h-4 w-4 mr-2" />
                    {isInBid(product.id) ? 'Added to Bid' : 'Add to Bid'}
                </Button>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
