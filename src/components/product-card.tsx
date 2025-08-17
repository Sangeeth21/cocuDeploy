
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { DisplayProduct } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, Wand2, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useUser } from '@/context/user-context';
import { useAuthDialog } from '@/context/auth-dialog-context';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface ProductCardProps {
  product: DisplayProduct;
}

export function MiniProductCard({ product }: ProductCardProps) {
    return (
        <Card className="overflow-hidden">
            <Link href={`/products/${product.id}`} className="block group">
                <div className="relative aspect-square w-full overflow-hidden">
                     <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                 <div className="p-2">
                    <p className="text-xs font-medium leading-tight truncate">{product.name}</p>
                    <p className="text-xs font-bold">${product.price.toFixed(2)}</p>
                </div>
            </Link>
        </Card>
    )
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isLoggedIn } = useUser();
  const { openDialog } = useAuthDialog();
  const router = useRouter();
  
  const isCustomizable = useMemo(() => {
    // A product is customizable if it has any defined customization areas on any side.
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
         <p className="text-xl font-semibold font-body mt-2">${product.price.toFixed(2)}</p>
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
