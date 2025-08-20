

"use client";

import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Star, Truck, Wand2, DollarSign, Info, ShoppingCart, Scale, Gavel, Tag, Video, Minus, Plus, CheckCircle, MessageSquare, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import { useComparison } from "@/context/comparison-context";
import { useBidRequest } from "@/context/bid-request-context";
import { useCart } from "@/context/cart-context";
import { useMemo, useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, query, where, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BrandedLoader } from "@/components/branded-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getEstimatedDelivery } from "@/app/actions";
import { Loader2 } from 'lucide-react';
import { B2bProductCard } from "../../_components/b2b-product-card";
import type { DisplayProduct, User, Program, Coupon } from "@/lib/types";


const ReviewsPreview = dynamic(() => import('./_components/reviews-preview').then(mod => mod.ReviewsPreview), {
    loading: () => <Skeleton className="h-[300px] w-full" />
});

const FrequentlyBoughtTogetherPreview = dynamic(() => import('@/app/products/[id]/_components/frequently-bought-together-preview').then(mod => mod.FrequentlyBoughtTogetherPreview), {
    loading: () => <Skeleton className="h-[200px] w-full rounded-xl" />
});

function ProductPageCampaignBanner() {
    const [bannerCampaign, setBannerCampaign] = useState<any | null>(null);

    useEffect(() => {
        const campaignsQuery = query(collection(db, "marketingCampaigns"), where("status", "==", "Active"), where("placement", "==", "product-page-banner"), limit(1));
        const unsub = onSnapshot(campaignsQuery, (snapshot) => {
             if (!snapshot.empty) {
                setBannerCampaign({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                setBannerCampaign(null);
            }
        });
        return () => unsub();
    }, []);

    if (!bannerCampaign || !bannerCampaign.creatives || bannerCampaign.creatives.length === 0) {
        return null;
    }
    const creative = bannerCampaign.creatives[0];

    return (
        <div className="bg-accent/20 border border-accent rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 my-8">
            <div className="relative w-full md:w-24 h-32 md:h-24 rounded-md overflow-hidden flex-shrink-0">
                {creative.imageUrl && <Image src={creative.imageUrl} alt={creative.title} fill className="object-cover" />}
            </div>
            <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold">{creative.title}</h3>
                <p className="text-sm text-muted-foreground">{creative.description}</p>
            </div>
            <Button asChild><Link href={`/corporate/products?campaign=${bannerCampaign.id}`}>{creative.cta}</Link></Button>
        </div>
    );
}

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

export default function B2BProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const { commissionRates, user } = useUser();
  const { addToCart } = useCart();
  const { isComparing, toggleCompare } = useComparison();
  const { addToBid, isInBid } = useBidRequest();
  
  const [product, setProduct] = useState<DisplayProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<User | null>(null);
  const [promotions, setPromotions] = useState<Program[]>([]);
  const [publicCoupons, setPublicCoupons] = useState<Coupon[]>([]);
  const [similarProducts, setSimilarProducts] = useState<DisplayProduct[]>([]);
  const [vendorProducts, setVendorProducts] = useState<DisplayProduct[]>([]);

  const [quantity, setQuantity] = useState(100);
  const [isVendorInfoOpen, setIsVendorInfoOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const thumbnailPosition = "bottom"; 
  
   useEffect(() => {
        if (!id) return;
        setLoading(true);
        const productRef = doc(db, 'products', id);
        
        const unsubProduct = onSnapshot(productRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().b2bEnabled) {
                const productData = { id: docSnap.id, ...docSnap.data() } as DisplayProduct;
                setProduct(productData);
                setQuantity(productData.moq || 100);
                 if (productData.imageUrl) {
                    setActiveMedia({ type: 'image', src: productData.imageUrl });
                }
            } else {
                setProduct(null); // Triggers notFound()
            }
            setLoading(false);
        });

        const promotionsQuery = query(
            collection(db, "programs"), 
            where("status", "==", "Active"), 
            where("target", "==", "customer"),
            where("platform", "in", ["corporate", "both"])
        );
        const unsubCampaigns = onSnapshot(promotionsQuery, (snapshot) => {
            const campaignsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
            setPromotions(campaignsData as any); 
        });

        const couponsQuery = query(
            collection(db, "coupons"), 
            where("status", "==", "Active"), 
            where("isPublic", "==", true),
            where("platform", "in", ["corporate", "both"])
        );
        const unsubCoupons = onSnapshot(couponsQuery, snapshot => {
            setPublicCoupons(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Coupon)));
        });

        return () => {
            unsubProduct();
            unsubCampaigns();
            unsubCoupons();
        };
    }, [id]);
    
    // Fetch related data after product is loaded
    useEffect(() => {
        if (!product) return;

        // Fetch vendor
        if (product.vendorId) {
            const vendorRef = doc(db, "users", product.vendorId);
            getDoc(vendorRef).then(docSnap => {
                if (docSnap.exists()) {
                    setVendor({ id: docSnap.id, ...docSnap.data() } as User);
                }
            });
        }

        // Fetch similar products
        if (product.category) {
            const similarQuery = query(collection(db, "products"), where("category", "==", product.category), where("__name__", "!=", product.id), where("b2bEnabled", "==", true), limit(4));
            getDocs(similarQuery).then(snap => {
                setSimilarProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisplayProduct)));
            });
        }
        
        // Fetch more from vendor
        if (product.vendorId) {
             const vendorProductsQuery = query(collection(db, "products"), where("vendorId", "==", product.vendorId), where("__name__", "!=", product.id), where("b2bEnabled", "==", true), limit(4));
            getDocs(vendorProductsQuery).then(snap => {
                setVendorProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisplayProduct)));
            });
        }

    }, [product]);

  const isCustomizable = useMemo(() => {
    return Object.values(product?.customizationAreas || {}).some(areas => areas && areas.length > 0);
  }, [product]);

   const applicableDiscount = useMemo(() => {
        if (!product) return null;
        const salePromo = promotions.find(p => p.type === 'Sale' && (p.platform === 'corporate' || p.platform === 'both') && p.productScope.includes(product.id));
        if (salePromo) return salePromo;
        
        const genericPromo = promotions.find(p => p.type === 'discount' && p.productScope === 'all' && (p.platform === 'corporate' || p.platform === 'both'));
        return genericPromo || null;
    }, [promotions, product]);


  const getBufferedPrice = (basePrice: number) => {
      if (!product || !commissionRates) return basePrice;
      const commissionRule = commissionRates.corporate?.[product.category];
      if (commissionRule && commissionRule.buffer) {
          if (commissionRule.buffer.type === 'fixed') {
              return basePrice + commissionRule.buffer.value;
          } else {
              return basePrice * (1 + (commissionRule.buffer.value / 100));
          }
      }
      return basePrice;
  }

  const priceDetails = useMemo(() => {
    if (!product) return { original: 0, final: 0, hasDiscount: false, discountValue: 0 };
    
    const tierPrice = product.tierPrices
        ?.slice()
        .sort((a, b) => b.quantity - a.quantity)
        .find(tier => quantity >= tier.quantity)?.price || product.price;

    const originalPrice = getBufferedPrice(tierPrice);
    let finalPrice = originalPrice;
    
    let discountValue = 0;
    if (applicableDiscount?.type === 'Sale' || applicableDiscount?.type === 'discount') {
        discountValue = applicableDiscount?.reward.referrer?.value || 0;
    }
    
    if (applicableDiscount && discountValue > 0) {
        finalPrice *= (1 - (discountValue / 100));
    }
    
    return { original: originalPrice, final: finalPrice, hasDiscount: !!applicableDiscount && discountValue > 0, discountValue };
  }, [product, quantity, commissionRates, applicableDiscount]);


  const totalPrice = useMemo(() => {
    return priceDetails.final * quantity;
  }, [priceDetails, quantity]);

   const originalTotalPrice = useMemo(() => {
    return priceDetails.original * quantity;
  }, [priceDetails, quantity]);

  const allMedia = useMemo(() => {
    if (!product) return [];
    const media: MediaItem[] = [];
    const imageUrls = new Set<string>();

    [product.imageUrl, ...(product.images || [])].forEach(url => {
        if (url && !imageUrls.has(url)) {
            media.push({ type: 'image', src: url });
            imageUrls.add(url);
        }
    });

    (product.galleryImages || []).forEach(url => {
        if (url && !imageUrls.has(url)) {
            media.push({ type: 'image', src: url });
            imageUrls.add(url);
        }
    });

    if (product.videoUrl) {
        media.push({ type: 'video', src: product.videoUrl });
    }
    return media;
}, [product]);
  
  const handleQuantityChange = (value: string | number) => {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
          setQuantity(numValue);
      }
  }

  const handleRequestQuote = () => {
    if (isCustomizable) {
      router.push(`/corporate/customize/${product.id}`);
    } else {
      router.push(`/corporate/quote/${product.id}`);
    }
  }
  
  const handleAddToCart = () => {
      addToCart({product, customizations: {}, quantity});
      toast({title: "Added to Cart", description: `${quantity} x ${product.name} has been added to your cart.`});
  }

  const handleBuyNow = () => {
    // In a real B2B scenario, this might lead to a different checkout flow
    addToCart({product, customizations: {}, quantity});
    router.push('/checkout');
  }
  
  const handleAddToBid = () => {
      addToBid(product);
  }

  const handleCompareClick = () => {
      toggleCompare(product);
      toast({
          title: isComparing(product.id) ? "Removed from Comparison" : "Added to Comparison",
          description: product.name,
      });
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
  
  const handleMessageVendor = () => {
    router.push(`/account?tab=messages&vendorId=${product.vendorId}&productName=${encodeURIComponent(product.name)}&type=corporate`);
  }
  
  const handleRequestSample = () => {
    toast({
        title: "Sample Requested (Simulated)",
        description: `Your request for a sample of "${product.name}" has been sent to the vendor.`,
    });
  }

  if (loading) {
    return <BrandedLoader />;
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
      <div className="grid md:grid-cols-2 gap-12">
        <div className="flex gap-4 h-[600px] flex-col">
           <div className={cn("flex gap-4 h-full", galleryLayoutClasses[thumbnailPosition as keyof typeof galleryLayoutClasses])}>
                <div className={cn("relative flex-1 w-full h-full overflow-hidden rounded-lg shadow-lg", mainImageOrderClasses[thumbnailPosition as keyof typeof mainImageOrderClasses])}>
                        {activeMedia?.type === 'image' && activeMedia.src ? (
                            <Image src={activeMedia.src} alt={product.name} fill className="object-cover" priority data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
                        ) : activeMedia?.type === 'video' && activeMedia.src ? (
                            <iframe
                                src={activeMedia.src}
                                title="Product Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        ) : null}
                    {isCustomizable && (
                    <Badge variant="secondary" className="absolute top-4 left-4">
                        <Wand2 className="h-3 w-3 mr-1.5" />
                        Customizable
                    </Badge>
                    )}
                </div>
                {allMedia.length > 1 && (
                    <div className={cn("flex gap-2", thumbnailLayoutClasses[thumbnailPosition as keyof typeof thumbnailLayoutClasses], thumbnailOrderClasses[thumbnailPosition as keyof typeof thumbnailOrderClasses])}>
                    {allMedia.map((media, index) => {
                        const isVideo = media.type === 'video';
                        return (
                        <button
                            key={index}
                            onClick={() => setActiveMedia(media)}
                            className={cn(
                                "relative aspect-square rounded-md overflow-hidden transition-all flex-shrink-0",
                                activeMedia?.src === media.src ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100",
                                thumbnailPosition === 'bottom' ? 'w-20' : 'w-16'
                            )}
                        >
                            <Image src={isVideo ? product.imageUrl : media.src} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                            {isVideo && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Video className="h-6 w-6 text-white" />
                                </div>
                            )}
                        </button>
                    )})}
                    </div>
                )}
                </div>
        </div>

        <div className="space-y-6">
          <Link href={`/corporate/products?category=${encodeURIComponent(product.category)}`} className="text-sm font-medium text-primary hover:underline">
            {product.category}
          </Link>
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

          {(promotions.length > 0 || publicCoupons.length > 0) && (
              <Card className="bg-muted/30">
                  <CardHeader className="p-3 border-b">
                      <CardTitle className="text-sm flex items-center gap-2"><Tag className="h-4 w-4 text-primary"/> Available Offers</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 text-xs space-y-2">
                  {promotions.map(promo => {
                      if (promo.type === 'discount' || promo.type === 'Sale') {
                          return <p key={promo.id} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {promo.name}</p>
                      }
                      return null;
                  })}
                  {publicCoupons.map(coupon => (
                        <p key={coupon.id} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>
                              {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`} with code: <span className="font-bold font-mono">{coupon.code}</span>
                          </span>
                        </p>
                  ))}
                  </CardContent>
              </Card>
          )}
          
          <Card>
            <CardHeader>
                <CardTitle>Bulk Pricing Calculator</CardTitle>
                <CardDescription>Select a tier or enter a quantity to see your price.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Select Quantity Tier</Label>
                         <Select onValueChange={(value) => handleQuantityChange(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a tier" />
                            </SelectTrigger>
                            <SelectContent>
                                {product.tierPrices?.map((tier, index) => (
                                    <SelectItem key={index} value={String(tier.quantity)}>
                                        {tier.quantity.toLocaleString()}+ (at ${getBufferedPrice(tier.price).toFixed(2)} each)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="manual-quantity">Or Enter Quantity</Label>
                        <Input
                            id="manual-quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            min={product.moq}
                        />
                    </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Minimum Order Quantity (MOQ)</span>
                        <span className="font-semibold">{product.moq?.toLocaleString()} units</span>
                    </div>
                    <Separator/>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            Price per Unit
                            {priceDetails.hasDiscount && (
                                <Badge variant="destructive" className="text-[10px] h-auto px-1.5 py-0 leading-tight">
                                    <Tag className="mr-1 h-2.5 w-2.5" /> {priceDetails.discountValue}% OFF
                                </Badge>
                             )}
                        </span>
                         <div className="flex items-baseline gap-2">
                            {priceDetails.hasDiscount && (
                                <span className="text-base text-muted-foreground line-through">${priceDetails.original.toFixed(2)}</span>
                            )}
                            <span className="font-semibold text-base">${priceDetails.final.toFixed(2)}</span>
                        </div>
                    </div>
                    <Separator/>
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>Estimated Total</span>
                        <div className="flex items-baseline gap-2">
                            {priceDetails.hasDiscount && (
                                <span className="text-base text-muted-foreground line-through font-medium">${originalTotalPrice.toFixed(2)}</span>
                            )}
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
          
           <div className="space-y-2">
                <Button size="lg" className="w-full" onClick={handleRequestQuote}>
                    {isCustomizable ? 'Customize & Quote' : 'Request a Quote'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                    <Button size="lg" variant="secondary" className="w-full" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                    </Button>
                     <Button size="lg" variant="default" className="w-full" onClick={handleBuyNow}>
                        Buy Now
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button size="lg" variant="outline" className="w-full" onClick={handleAddToBid} disabled={isInBid(product.id)}>
                        <Gavel className="mr-2 h-5 w-5" />
                        {isInBid(product.id) ? 'Added to Bid' : 'Add to Bid'}
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={handleCompareClick}>
                        <Scale className="mr-2 h-5 w-5" />
                        {isComparing(product.id) ? 'Remove' : 'Compare'}
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button size="lg" variant="outline" className="w-full" onClick={handleMessageVendor}>
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Message Vendor
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={handleRequestSample}>
                        <Package className="mr-2 h-5 w-5" />
                        Request Sample
                    </Button>
                </div>
            </div>

             <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="pincode-check" className="font-semibold">Check Delivery Options</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Input 
                        id="pincode-check"
                        placeholder="Enter 6-digit pincode" 
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
            
            <div className="pt-6">
                <h2 className="font-bold text-xl font-headline mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
        </div>
      </div>

       <ProductPageCampaignBanner />

      <Separator className="my-12" />

      <div className="my-12 space-y-12">
        <ReviewsPreview productId={product.id} />
        <FrequentlyBoughtTogetherPreview currentProduct={product} />
        {vendorProducts.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold font-headline mb-6">More from {vendor?.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {vendorProducts.map(p => <B2bProductCard key={p.id} product={p} />)}
                </div>
            </div>
        )}
        {similarProducts.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold font-headline mb-6">Similar Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {similarProducts.map(p => <B2bProductCard key={p.id} product={p} />)}
                </div>
            </div>
        )}
      </div>
      
    </div>
    {vendor && <VendorInfoDialog vendor={vendor} />}
    </Dialog>
  );
}
