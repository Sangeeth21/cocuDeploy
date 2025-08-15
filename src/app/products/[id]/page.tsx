
"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductInteractions } from "./_components/product-interactions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/context/wishlist-context";
import { useUser } from "@/context/user-context";
import { useAuthDialog } from "@/context/auth-dialog-context";
import { useMemo, useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DisplayProduct } from "@/lib/types";

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

const FrequentlyBoughtTogetherPreview = dynamic(() => import('./_components/frequently-bought-together-preview').then(mod => mod.FrequentlyBoughtTogetherPreview), {
    loading: () => <Skeleton className="h-[200px] w-full rounded-xl" />
});

const ReviewsPreview = dynamic(() => import('./_components/reviews-preview').then(mod => mod.ReviewsPreview), {
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />
});


export default function ProductDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<DisplayProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isLoggedIn } = useUser();
  const { openDialog } = useAuthDialog();
  
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
        setLoading(true);
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const productData = { id: docSnap.id, ...docSnap.data() } as DisplayProduct;
            setProduct(productData);

            // Fetch similar products
            if(productData.category) {
                const q = query(
                    collection(db, "products"), 
                    where("category", "==", productData.category),
                    where("__name__", "!=", id),
                    limit(4)
                );
                const querySnapshot = await getDocs(q);
                const fetchedSimilar: DisplayProduct[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedSimilar.push({ id: doc.id, ...doc.data() } as DisplayProduct);
                });
                setSimilarProducts(fetchedSimilar);
            }
        } else {
            console.log("No such document!");
        }
        setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const isCustomizable = useMemo(() => {
    if (!product) return false;
    return Object.values(product.customizationAreas || {}).some(areas => areas && areas.length > 0);
  }, [product]);

  const handleWishlistClick = () => {
      if (!isLoggedIn) {
          openDialog('login');
          return;
      }
      if (product) {
        toggleWishlist(product);
      }
  }

  if (loading) {
      return (
          <div className="container py-12">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div>
                     <Skeleton className="aspect-square w-full rounded-lg" />
                     <div className="grid grid-cols-5 gap-2 mt-4">
                         {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-md" />)}
                     </div>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                    <div className="flex flex-col gap-2">
                         <Skeleton className="h-12 w-full" />
                         <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
          </div>
      )
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" priority data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
             <Button 
                size="icon" 
                variant="secondary" 
                className="absolute top-4 right-4 rounded-full h-10 w-10"
                onClick={handleWishlistClick}
              >
                <Heart className={cn("h-5 w-5", isWishlisted(product.id) && "fill-destructive text-destructive")} />
            </Button>
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
          
          <ProductInteractions product={product} isCustomizable={isCustomizable} />
        </div>
      </div>
      
      <Separator className="my-12" />

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <ReviewsPreview productId={product.id} />
        </div>
        
        <div className="space-y-8">
            <FrequentlyBoughtTogetherPreview currentProduct={product} />
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
