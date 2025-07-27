
import { Button } from "@/components/ui/button";
import { mockProducts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";

export function ProductDetailsPreview() {
    const product = mockProducts[0];
    return (
        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint="product image" />
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
              <div className="flex gap-2">
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Add to Cart</Button>
                <Button size="lg" variant="outline" className="w-full">Message Vendor</Button>
              </div>
            </div>
        </div>
    )
}
