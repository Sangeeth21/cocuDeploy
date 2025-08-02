
"use client";

import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { mockProducts } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Truck, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReviewsPreview } from "./_components/reviews-preview";
import { useMemo, useState } from "react";

export default function B2BProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const product = mockProducts.find((p) => p.id === id);

  const [activeImage, setActiveImage] = useState(product?.imageUrl || 'https://placehold.co/600x600.png');

  const isCustomizable = useMemo(() => {
    return Object.values(product?.customizationAreas || {}).some(areas => areas && areas.length > 0);
  }, [product]);

  if (!product || !product.b2bEnabled) {
    notFound();
  }
  
  const handleRequestQuote = () => {
    if (isCustomizable) {
      router.push(`/corporate/customize/${product.id}`);
    } else {
      router.push(`/corporate/quote/${product.id}`);
    }
  }

  const allImages = [product.imageUrl, ...(product.images || [])].filter((img, index, self) => img && self.indexOf(img) === index);

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
            <Image src={activeImage} alt={product.name} fill className="object-cover" priority data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
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
          <p className="text-sm font-medium text-primary">{product.category}</p>
          <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className='h-5 w-5 text-accent fill-accent' />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground text-sm">({product.reviewCount} reviews)</span>
            </div>
             <div className="flex items-center gap-1">
              <Truck className='h-5 w-5 text-muted-foreground' />
              <span className="font-semibold">MOQ: {product.moq}</span>
            </div>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
          <Card>
            <CardHeader>
                <CardTitle>Bulk Pricing Tiers</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Price per Unit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {product.tierPrices?.map((tier, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{tier.quantity.toLocaleString()}+</TableCell>
                                <TableCell className="text-right font-semibold">${tier.price.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
          
          <Button size="lg" className="w-full" onClick={handleRequestQuote}>
             {isCustomizable ? 'Customize & Quote' : 'Request a Quote'}
          </Button>
        </div>
      </div>

      <Separator className="my-12" />

      <ReviewsPreview />
    </div>
  );
}
