
"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Star, Heart, Info, Store, Loader2, MapPin, CheckCircle, Truck } from "lucide-react";
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
import type { DisplayProduct, CommissionRule, User } from "@/lib/types";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getEstimatedDelivery } from "@/app/actions";
import { Label } from "@/components/ui/label";


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

function VendorInfoDialog({ vendor }: { vendor: User }) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{vendor.name}</DialogTitle>
                <DialogDescription>
                    {vendor.bio || "This vendor hasn't added a bio yet."}
                </DialogDescription>
            </DialogHeader>
        </DialogContent>
    );
}

export default function ProductDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<DisplayProduct | null>(null);
  const [vendor, setVendor] = useState<User | null>(null);
  const [similarProducts, setSimilarProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionRule, setCommissionRule] = useState<CommissionRule | null>(null);
  const [isVendorInfoOpen, setIsVendorInfoOpen] = useState(false);
  
  const [pincode, setPincode] = useState("");
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  // This would be fetched from the vendor's template settings
  const thumbnailPosition = "bottom"; 

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isLoggedIn } = useUser();
  const { openDialog } = useAuthDialog();
  
  useEffect(() => {
    if (!id) return;

    const fetchProductAndCommission = async () => {
        setLoading(true);
        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            const productData = { id: productSnap.id, ...productSnap.data() } as DisplayProduct;
            setProduct(productData);
            setActiveImage(productData.imageUrl); // Set initial active image

            if (productData.vendorId) {
                const vendorRef = doc(db, "users", productData.vendorId);
                const vendorSnap = await getDoc(vendorRef);
                if (vendorSnap.exists()) {
                    setVendor({ id: vendorSnap.id, ...vendorSnap.data() } as User);
                }
            }

            // Fetch commission rule hierarchy
            const productCommissionRef = doc(db, "productCommissionOverrides", id);
            const productCommissionSnap = await getDoc(productCommissionRef);
            if (productCommissionSnap.exists()) {
                setCommissionRule(productCommissionSnap.data().rule as CommissionRule);
            } else {
                const vendorCommissionQuery = query(collection(db, "vendorCommissionOverrides"), where("vendorId", "==", productData.vendorId), limit(1));
                const vendorCommissionSnap = await getDocs(vendorCommissionQuery);
                if (!vendorCommissionSnap.empty) {
                    setCommissionRule(vendorCommissionSnap.docs[0].data().rule as CommissionRule);
                } else {
                    const categoryCommissionRef = doc(db, "commissions", "categories");
                    const categoryCommissionSnap = await getDoc(categoryCommissionRef);
                    if (categoryCommissionSnap.exists()) {
                        const allRules = categoryCommissionSnap.data();
                        setCommissionRule(allRules[productData.category] || null);
                    }
                }
            }


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

    fetchProductAndCommission();
  }, [id]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.price;
    if (commissionRule?.buffer) {
        if (commissionRule.buffer.type === 'fixed') {
            price += commissionRule.buffer.value;
        } else {
            price *= (1 + commissionRule.buffer.value / 100);
        }
    }
    return price;
  }, [product, commissionRule]);

  const isCustomizable = useMemo(() => {
    if (!product) return false;
    return Object.values(product.customizationAreas || {}).some(areas => areas && areas.length > 0);
  }, [product]);

  const handleWishlistClick = (e: React.MouseEvent) => {
      e.preventDefault(); // prevent navigation when clicking the heart
      e.stopPropagation();
      if (!isLoggedIn) {
          openDialog('login');
          return;
      }
      if (product) {
        toggleWishlist(product);
      }
  }

  const handleCheckDelivery = async () => {
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
        toast({ variant: 'destructive', title: 'Invalid Pincode', description: 'Please enter a valid 6-digit pincode.'});
        return;
    }
    setIsCheckingPincode(true);
    setDeliveryEstimate(null);
    const result = await getEstimatedDelivery(id, pincode);
    if(result.error) {
        toast({ variant: 'destructive', title: 'Delivery Check Failed', description: result.error });
        setDeliveryEstimate('Currently not deliverable to this pincode.');
    } else {
        setDeliveryEstimate(result.estimate || 'Could not determine delivery date.');
    }
    setIsCheckingPincode(false);
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

  const allImages = [product.imageUrl, ...(product.images || [])].filter((img, index, self) => img && self.indexOf(img) === index);

  const galleryLayoutClasses = {
      bottom: 'flex-col',
      left: 'flex-row-reverse',
      right: 'flex-row',
  };
  
  const thumbnailLayoutClasses = {
      bottom: 'flex-row w-full',
      left: 'flex-col h-full',
      right: 'flex-col h-full',
  }

  return (
    <Dialog open={isVendorInfoOpen} onOpenChange={setIsVendorInfoOpen}>
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className={cn("flex gap-4 h-[600px]", galleryLayoutClasses[thumbnailPosition as keyof typeof galleryLayoutClasses])}>
          <div className={cn("flex gap-2", thumbnailLayoutClasses[thumbnailPosition as keyof typeof thumbnailLayoutClasses])}>
             {allImages.map((img, index) => (
                 <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                        "relative aspect-square rounded-md overflow-hidden transition-all flex-shrink-0",
                        activeImage === img ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100",
                        thumbnailPosition === 'bottom' ? 'w-20' : 'w-16'
                    )}
                 >
                    <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                 </button>
              ))}
          </div>
          <div className="relative flex-1 w-full h-full overflow-hidden rounded-lg shadow-lg">
            {activeImage && <Image src={activeImage} alt={product.name} fill className="object-cover" priority data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />}
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
          
          {vendor && (
              <DialogTrigger asChild>
                <button className="text-sm text-muted-foreground hover:text-primary">
                    Sold by <span className="font-semibold underline">{vendor.name}</span>
                </button>
              </DialogTrigger>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className='h-5 w-5 text-accent fill-accent' />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground text-sm">({product.reviewCount} reviews)</span>
            </div>
          </div>
           <div className="flex items-center gap-2">
            <p className="text-3xl font-bold font-body">${finalPrice.toFixed(2)}</p>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Price includes taxes and platform fees.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
          <ProductInteractions product={product} isCustomizable={isCustomizable} />
          
          <div className="pt-2">
            <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="pincode-check" className="font-semibold">Delivery Options</Label>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4 text-muted-foreground"/>
                <Input 
                    id="pincode-check"
                    placeholder="Enter pincode" 
                    className="h-9" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                />
                <Button variant="outline" size="sm" className="h-9" onClick={handleCheckDelivery} disabled={isCheckingPincode}>
                    {isCheckingPincode ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Check'}
                </Button>
            </div>
            {deliveryEstimate && (
            <div className="text-sm flex items-center gap-2 mt-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600"/>
                <span>{deliveryEstimate}</span>
            </div>
            )}
          </div>
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
    {vendor && <VendorInfoDialog vendor={vendor} />}
    </Dialog>
  );
}
