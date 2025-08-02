
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { DisplayProduct } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Truck, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: DisplayProduct;
}

export function B2bProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleRequestQuote = () => {
    router.push(`/corporate/quote/${product.id}`);
  };

  const lowestTierPrice = product.tierPrices && product.tierPrices.length > 0
    ? Math.min(...product.tierPrices.map(p => p.price))
    : product.price;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 border-b">
        <Link href={`/corporate/products/${product.id}`} className="block group">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <h3 className="mt-1 text-base font-headline font-semibold leading-tight flex-grow">
          <Link href={`/corporate/products/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>MOQ: {product.moq} units</span>
        </div>
      </CardContent>
       <CardFooter className="p-2 pt-0 flex flex-col items-start gap-2">
         <div className='w-full px-2'>
            <p className="text-xs text-muted-foreground">Starts from</p>
            <p className="text-xl font-semibold font-body">${lowestTierPrice.toFixed(2)} / unit</p>
         </div>
        <Button size="sm" className="w-full" onClick={handleRequestQuote}>
            Request a Quote
        </Button>
      </CardFooter>
    </Card>
  );
}
