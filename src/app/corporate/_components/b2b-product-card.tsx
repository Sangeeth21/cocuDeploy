
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { DisplayProduct } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Truck, Wand2, ShoppingCart, Scale, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useCart } from '@/context/cart-context';
import { useComparison } from '@/context/comparison-context';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { useAuthDialog } from '@/context/auth-dialog-context';
import { useBidRequest } from '@/context/bid-request-context';

interface ProductCardProps {
  product: DisplayProduct;
}

export function B2bProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleCompare, isComparing } = useComparison();
  const { addToBid, isInBid } = useBidRequest();
  const { toast } = useToast();
  const { isLoggedIn } = useUser();
  const { openDialog } = useAuthDialog();

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

  const lowestTierPrice = product.tierPrices && product.tierPrices.length > 0
    ? Math.min(...product.tierPrices.map(p => p.price))
    : product.price;

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
            <p className="text-xl font-semibold font-body">${lowestTierPrice.toFixed(2)} / unit</p>
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
