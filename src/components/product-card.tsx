
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { DisplayProduct } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';

interface ProductCardProps {
  product: DisplayProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  
  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation when clicking the heart
    e.stopPropagation();
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
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-semibold font-body">${product.price.toFixed(2)}</p>
        <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddToCart}>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}
