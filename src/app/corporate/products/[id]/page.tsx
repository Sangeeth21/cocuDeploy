

"use client";

import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Truck, Wand2, DollarSign, Info, ShoppingCart, Scale, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReviewsPreview } from "./_components/reviews-preview";
import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useComparison } from "@/context/comparison-context";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { CorporateProductInteractions } from "./_components/product-interactions";
import { useBidRequest } from "@/context/bid-request-context";
import { collection, doc, getDoc, getDocs, query, where, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DisplayProduct, MarketingCampaign } from "@/lib/types";
import { BrandedLoader } from "@/components/branded-loader";
import { useUser } from "@/context/user-context";


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
  const { commissionRates } = useUser();
  
  const [product, setProduct] = useState<DisplayProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(100);
  
  const { addToCart } = useCart();
  const { isComparing, toggleCompare } = useComparison();
  const { addToBid, isInBid } = useBidRequest();
  
   useEffect(() => {
        if (!id) return;
        setLoading(true);
        const productRef = doc(db, 'products', id);
        const unsubscribe = onSnapshot(productRef, (docSnap) => {
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
        return () => unsubscribe();
    }, [id]);

  const isCustomizable = useMemo(() => {
    return Object.values(product?.customizationAreas || {}).some(areas => areas && areas.length > 0);
  }, [product]);

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

  const pricePerUnit = useMemo(() => {
    if (!product) return 0;
    const basePrice = product.tierPrices
        ?.slice()
        .sort((a, b) => b.quantity - a.quantity)
        .find(tier => quantity >= tier.quantity)?.price || product.price;
    return getBufferedPrice(basePrice);
  }, [product, quantity, commissionRates]);

  const totalPrice = useMemo(() => {
    return pricePerUnit * quantity;
  }, [pricePerUnit, quantity]);
  
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
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                <span>Customizable</span>
              </div>
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
                        <span className="font-semibold">${pricePerUnit.toFixed(2)}</span>
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

      <ReviewsPreview />
    </div>
  );
}
