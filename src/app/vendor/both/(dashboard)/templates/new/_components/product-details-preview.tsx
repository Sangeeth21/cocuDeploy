
"use client";

import { Button } from "@/components/ui/button";
import { mockProducts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Star, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ProductDetailsPreview({ layout, thumbnailPosition = 'bottom' }: { layout: string, thumbnailPosition: 'left' | 'right' | 'bottom' }) {
    const product = mockProducts[0];
    const allImages = [product.imageUrl, ...(product.images || [])].filter((img, index, self) => img && self.indexOf(img) === index).slice(0, 5);
    const [activeImage, setActiveImage] = useState(allImages[0]);

    const isFullWidth = layout === 'full-width-image';

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
        <div className={cn(
            "grid items-start gap-12",
            isFullWidth ? "grid-cols-1" : "md:grid-cols-2"
        )}>
            <div className={cn("flex gap-4 h-[600px]", galleryLayoutClasses[thumbnailPosition])}>
                 <div className={cn("relative flex-1 w-full h-full overflow-hidden rounded-lg shadow-lg", mainImageOrderClasses[thumbnailPosition])}>
                    {activeImage && <Image src={activeImage} alt={product.name} fill className="object-cover" data-ai-hint="product image" />}
                </div>
                 <div className={cn("flex gap-2", thumbnailLayoutClasses[thumbnailPosition], thumbnailOrderClasses[thumbnailPosition])}>
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
            </div>
            <div className={cn("space-y-6", isFullWidth && "text-center")}>
              <p className="text-sm font-medium text-primary">{product.category}</p>
              <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
              <div className={cn("flex items-center gap-2", isFullWidth && "justify-center")}>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn('h-5 w-5', i < Math.round(product.rating) ? 'text-accent fill-accent' : 'text-muted-foreground/30')} />
                  ))}
                </div>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
              <p className="text-3xl font-bold font-body">${product.price.toFixed(2)}</p>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Add to Cart</Button>
                <Button size="lg" variant="outline" className="w-full">Message Vendor</Button>
              </div>
            </div>
        </div>
    )
}
