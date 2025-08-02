
"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { mockProducts } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReviewsPreview } from "./_components/reviews-preview";

export default function B2BProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const product = mockProducts.find((p) => p.id === id);

  if (!product || !product.b2bEnabled) {
    notFound();
  }
  
  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" priority data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
          </div>
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
          
          <Button size="lg" className="w-full" asChild>
            <Link href={`/corporate/quote/${product.id}`}>Request a Quote</Link>
          </Button>
        </div>
      </div>

      <Separator className="my-12" />

      <ReviewsPreview />
    </div>
  );
}
