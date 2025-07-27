
"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { mockProducts, mockReviews } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Plus, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductInteractions } from "./_components/product-interactions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/context/wishlist-context";


const ProductCard = dynamic(() => import('@/components/product-card').then(mod => mod.ProductCard), {
  loading: () => <div className="flex flex-col space-y-3">
      <Skeleton className="h-[225px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
       <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-2/4" />
      </div>
    </div>,
});

export default function ProductDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const product = mockProducts.find((p) => p.id === id);

  const { isWishlisted, toggleWishlist } = useWishlist();

  if (!product) {
    notFound();
  }
  
  const otherProducts = mockProducts.filter(p => p.id !== product.id);
  const similarProducts = otherProducts.filter(p => p.category === product.category).slice(0, 4);
  const frequentlyBoughtTogether = otherProducts.slice(0, 2);

  const handleAddBothToCart = () => {
    toast({
      title: "Items Added!",
      description: `${product.name} and ${frequentlyBoughtTogether[0].name} have been added to your cart.`
    });
  }

  const handleWishlistClick = () => {
      toggleWishlist(product);
      toast({
          title: isWishlisted(product.id) ? "Removed from Wishlist" : "Added to Wishlist",
          description: product.name,
      });
  }

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
             <Button 
                size="icon" 
                variant="secondary" 
                className="absolute top-4 right-4 rounded-full h-10 w-10"
                onClick={handleWishlistClick}
              >
                <Heart className={cn("h-5 w-5", isWishlisted(product.id) && "fill-destructive text-destructive")} />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {product.images?.slice(0,4).map((img, index) => (
              <div key={index} className="aspect-square relative w-full overflow-hidden rounded-md border-2 hover:border-primary transition">
                <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-sm font-medium text-primary">{product.category}</p>
          <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn('h-5 w-5', i < Math.round(product.rating) ? 'text-accent fill-accent' : 'text-muted-foreground/30')} />
              ))}
            </div>
            <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>
          <p className="text-3xl font-bold font-body">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
          <ProductInteractions product={product} />
        </div>
      </div>

      <Separator className="my-12" />

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {mockReviews.map(review => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.avatarUrl} alt={review.author} data-ai-hint="person face" />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('h-4 w-4', i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/30')} />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-1">{review.title}</h3>
                  <p className="text-muted-foreground text-sm">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="space-y-8">
            <h2 className="text-2xl font-bold font-headline">Frequently Bought Together</h2>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center">
                        <ProductCardMini product={product} />
                        <Plus className="h-5 w-5 mx-2 text-muted-foreground" />
                        <ProductCardMini product={frequentlyBoughtTogether[0]} />
                    </div>
                    <div className="text-center mt-4">
                        <p className="text-lg font-semibold">Total Price: ${(product.price + frequentlyBoughtTogether[0].price).toFixed(2)}</p>
                        <Button className="mt-2" size="sm" onClick={handleAddBothToCart}>Add Both to Cart</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <Separator className="my-12" />

      <div>
        <h2 className="text-2xl font-bold font-headline mb-6">Similar Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}

function ProductCardMini({ product }: { product: typeof mockProducts[0] }) {
  return (
    <div className="flex-1 flex items-center gap-2 group">
        <Link href={`/products/${product.id}`} className="flex-1 flex items-center gap-2">
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
            </div>
            <div>
                <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary">{product.name}</p>
                <p className="text-sm font-bold">${product.price.toFixed(2)}</p>
            </div>
        </Link>
    </div>
  );
}
