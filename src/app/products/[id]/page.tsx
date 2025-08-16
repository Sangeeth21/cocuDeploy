

"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Star, Heart, Info, Store, Loader2, MapPin, CheckCircle, Truck, Video, Minus, Plus, Tag } from "lucide-react";
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
import { collection, doc, getDoc, getDocs, query, where, limit, onSnapshot } from "firebase/firestore";
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

type MediaItem = {
    type: 'image' | 'video';
    src: string;
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
  const [quantity, setQuantity] = useState(1);
  
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
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
            setActiveMedia({ type: 'image', src: productData.imageUrl }); // Set initial active image

            if (productData.vendorId) {
                const vendorRef = doc(db, "users", productData.vendorId);
                const vendorSnap = await getDoc(vendorRef);
                if (vendorSnap.exists()) {
                    setVendor({ id: vendorSnap.id, ...vendorSnap.data() } as User);
                }
            }
            
            // In a real app, we'd fetch the template associated with this product
            // and set the thumbnailPosition from its layout properties.
            // For now, it's hardcoded above.

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
  
  const allMedia = useMemo((): MediaItem[] => {
    if (!product) return [];
    
    const media: MediaItem[] = [];
    const imageUrls = new Set<string>();

    // Add main image and other side images, ensuring no duplicates
    [product.imageUrl, ...(product.images || [])].forEach(url => {
        if (url && !imageUrls.has(url)) {
            media.push({ type: 'image', src: url });
            imageUrls.add(url);
        }
    });

    // Add gallery images, ensuring no duplicates
    (product.galleryImages || []).forEach(url => {
        if (url && !imageUrls.has(url)) {
            media.push({ type: 'image', src: url });
            imageUrls.add(url);
        }
    });

    // Add video
    if (product.videoUrl) {
        media.push({ type: 'video', src: product.videoUrl });
    }

    return media;
  }, [product]);

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

  const galleryLayoutClasses = {
      bottom: 'flex-col',
      left: 'flex-row-reverse',
      right: 'flex-row',
  };
  
  const thumbnailLayoutClasses = {
      bottom: 'flex-row w-full overflow-x-auto pt-4',
      left: 'flex-col h-full overflow-y-auto pr-4',
      right: 'flex-col h-full overflow-y-auto pl-4',
  }

  const mainImageOrderClasses = {
      bottom: 'order-1',
      left: 'order-1',
      right: 'order-2',
  }

  const thumbnailOrderClasses = {
      bottom: 'order-2',
      left: 'order-2',
      right: 'order-1',
  }


  return (
    <Dialog open={isVendorInfoOpen} onOpenChange={setIsVendorInfoOpen}>
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className={cn("flex gap-4 h-[600px]", galleryLayoutClasses[thumbnailPosition as keyof typeof galleryLayoutClasses])}>
           <div className={cn("relative flex-1 w-full h-full overflow-hidden rounded-lg shadow-lg", mainImageOrderClasses[thumbnailPosition as keyof typeof mainImageOrderClasses])}>
                {activeMedia?.type === 'image' && (
                    <Image src={activeMedia.src} alt={product.name} fill className="object-cover" priority data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
                )}
                {activeMedia?.type === 'video' && (
                    <iframe
                        src={activeMedia.src}
                        title="Product Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                )}
                 <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute top-4 right-4 rounded-full h-10 w-10"
                    onClick={handleWishlistClick}
                  >
                    <Heart className={cn("h-5 w-5", isWishlisted(product.id) && "fill-destructive text-destructive")} />
                </Button>
              </div>
          {allMedia.length > 1 && (
            <div className={cn("flex gap-2", thumbnailLayoutClasses[thumbnailPosition as keyof typeof thumbnailLayoutClasses], thumbnailOrderClasses[thumbnailPosition as keyof typeof thumbnailOrderClasses])}>
             {allMedia.map((media, index) => (
                 <button
                    key={index}
                    onClick={() => setActiveMedia(media)}
                    className={cn(
                        "relative aspect-square rounded-md overflow-hidden transition-all flex-shrink-0",
                        activeMedia?.src === media.src ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100",
                        thumbnailPosition === 'bottom' ? 'w-20' : 'w-16'
                    )}
                 >
                    <Image src={media.type === 'video' ? product.imageUrl : media.src} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                    {media.type === 'video' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Video className="h-6 w-6 text-white" />
                        </div>
                    )}
                 </button>
              ))}
            </div>
          )}
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
          
           <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center gap-2 max-w-[150px]">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)} className="h-9 text-center" />
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(q => q + 1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                <h3 className="font-semibold flex items-center gap-2"><Tag className="h-4 w-4 text-primary"/> Available Offers</h3>
                <p className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 10% off on your first order</p>
                 <div className="flex items-center gap-2">
                    <Input placeholder="Enter coupon code" className="h-9" />
                    <Button variant="secondary" className="h-9">Apply</Button>
                </div>
            </div>

           <ProductInteractions product={product} isCustomizable={isCustomizable} quantity={quantity} />

            <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="pincode-check" className="font-semibold">Check Delivery Options</Label>
                </div>
                <div className="flex items-center gap-2">
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
                    <div className="text-sm flex items-center gap-2 pt-1 text-muted-foreground">
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
