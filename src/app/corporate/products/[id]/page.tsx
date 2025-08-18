

"use client";

import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Star, Truck, Wand2, DollarSign, Info, ShoppingCart, Scale, Gavel, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { CorporateProductInteractions } from "./_components/product-interactions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useUser } from "@/context/user-context";
import { useAuthDialog } from "@/context/auth-dialog-context";
import { useMemo, useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, query, where, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DisplayProduct, MarketingCampaign } from "@/lib/types";
import { BrandedLoader } from "@/components/branded-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComparison } from "@/context/comparison-context";
import { useBidRequest } from "@/context/bid-request-context";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

const ReviewsPreview = dynamic(() => import('./_components/reviews-preview').then(mod => mod.ReviewsPreview), {
    loading: () => <Skeleton className="h-[300px] w-full" />
});

function ProductPageCampaignBanner() {
    const [bannerCampaign, setBannerCampaign] = useState<MarketingCampaign | null>(null);

    useEffect(() => {
        const campaignsQuery = query(collection(db, "marketingCampaigns"), where("status", "==", "Active"), where("placement", "==", "product-page-banner"), limit(1));
        const unsub = onSnapshot(campaignsQuery, (snapshot) => {
            if (!snapshot.empty) {
                setBannerCampaign({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MarketingCampaign);
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

export default function B2BProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const { commissionRates, user } = useUser();
  
  const [product, setProduct] = useState<DisplayProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<MarketingCampaign[]>([]);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(100);
  
  const { addToCart } = useCart();
  const { isComparing, toggleCompare } = useComparison();
  const { addToBid, isInBid } = useBidRequest();
  
   useEffect(() => {
        if (!id) return;
        setLoading(true);
        const productRef = doc(db, 'products', id);
        
        const unsubProduct = onSnapshot(productRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().b2bEnabled) {
                const productData = { id: docSnap.id, ...docSnap.data() } as DisplayProduct;
                setProduct(productData);
                setActiveImage(productData.imageUrl);
                setQuantity(productData.moq || 100);
            } else {
                setProduct(null); // Triggers notFound()
            }
            setLoading(false);
        });

        const campaignsQuery = query(collection(db, "marketingCampaigns"), where("status", "==", "Active"));
        const unsubCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
            const campaignsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketingCampaign));
            setPromotions(campaignsData);
        });

        return () => {
            unsubProduct();
            unsubCampaigns();
        };
    }, [id]);

  const isCustomizable = useMemo(() => {
    return Object.values(product?.customizationAreas || {}).some(areas => areas && areas.length > 0);
  }, [product]);

   const applicableDiscount = useMemo(() => {
    if (!product) return null;
    return promotions.find(p => p.type === 'Sale' && (p.placement === 'corporate-banner' || p.placement === 'hero') && p.associatedProducts?.includes(product.id));
  }, [promotions, product]);


  const getBufferedPrice = (basePrice: number) => {
      if (!product || !commissionRates) return basePrice;
      const commissionRule = commissionRates.corporate?.[product.category];
      if (commissionRule && commissionRule.buffer) {
          if (commissionRule.buffer.type === 'fixed') {
              return basePrice + commissionRule.buffer.value;
          } else {
              return basePrice * (1 + commissionRule.buffer.value / 100);
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
    
    // Simplistic discount logic: assumes first found 'Sale' campaign applies
    const discountValue = applicableDiscount?.creatives?.[0]?.title ? parseInt(applicableDiscount.creatives[0].title, 10) : 0;
    
    if (applicableDiscount && discountValue) {
        finalPrice *= (1 - (discountValue / 100));
    }
    
    return { original: originalPrice, final: finalPrice, hasDiscount: !!applicableDiscount && discountValue > 0, discountValue };
  }, [product, quantity, commissionRates, applicableDiscount]);


  const totalPrice = useMemo(() => {
    return priceDetails.final * quantity;
  }, [priceDetails, quantity]);
  
  const handleQuantityChange = (value: string | number) => {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
          setQuantity(numValue);
      }
  }

  if (loading) {
    return <BrandedLoader />;
  }
  
  if (!product) {
    notFound();
  }
  
  const handleRequestQuote = () => {
    if (isCustomizable) {
      router.push(`/corporate/customize/${product.id}`);
    } else {
      router.push(`/corporate/quote/${product.id}`);
    }
  }
  
  const handleAddToCart = () => {
      addToCart({product, customizations: {}});
      toast({title: "Added to Cart", description: `${product.name} has been added to your cart.`});
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

  const allImages = [product.imageUrl, ...(product.images || [])].filter((img, index, self) => img && self.indexOf(img) === index);

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
            {activeImage && <Image src={activeImage} alt={product.name} fill className="object-cover" priority data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />}
             {isCustomizable && (
              <Badge variant="secondary" className="absolute top-4 left-4">
                <Wand2 className="h-3 w-3 mr-1.5" />
                Customizable
              </Badge>
            )}
             {priceDetails.hasDiscount && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                    <Tag className="mr-1 h-3 w-3"/> {priceDetails.discountValue}% OFF
                </Badge>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-4">
              {allImages.map((img, index) => (
                 <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                        "relative aspect-square w-full rounded-md overflow-hidden transition-all",
                        activeImage === img ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
                    )}
                 >
                    <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                 </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Link href={`/corporate/products?category=${encodeURIComponent(product.category)}`} className="text-sm font-medium text-primary hover:underline">
            {product.category}
          </Link>
          <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className='h-5 w-5 text-accent fill-accent' />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground text-sm">({product.reviewCount} reviews)</span>
            </div>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
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
                        <span className="text-muted-foreground">Price per Unit</span>
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
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
          </Card>
          
           <div className="space-y-2">
            <Button size="lg" className="w-full" onClick={handleRequestQuote}>
                {isCustomizable ? 'Customize & Quote' : 'Request a Quote'}
            </Button>
             <Button size="lg" variant="secondary" className="w-full" onClick={handleAddToBid} disabled={isInBid(product.id)}>
                <Gavel className="mr-2 h-5 w-5" />
                {isInBid(product.id) ? 'Added to Bid Request' : 'Add to Bid Request'}
            </Button>
            <div className="grid grid-cols-2 gap-2">
                <Button size="lg" variant="outline" className="w-full" onClick={handleCompareClick}>
                    <Scale className="mr-2 h-5 w-5" />
                    {isComparing(product.id) ? 'Remove from Compare' : 'Add to Compare'}
                </Button>
                <Button size="lg" variant="secondary" className="w-full" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                </Button>
            </div>
            <CorporateProductInteractions product={product} isCustomizable={isCustomizable} />
          </div>
        </div>
      </div>

       <ProductPageCampaignBanner />

      <Separator className="my-12" />

      <ReviewsPreview productId={product.id} />
    </div>
  );
}
