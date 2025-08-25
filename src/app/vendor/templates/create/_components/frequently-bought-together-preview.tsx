
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockProducts } from "@/lib/mock-data";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

function ProductCardMini({ product }: { product: typeof mockProducts[0] }) {
  return (
    <div className="flex-1 flex items-center gap-2 group">
        <Link href={`/products/${product.id}`} className="flex-1 flex items-center gap-2">
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
            </div>
            <div>
                <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary">{product.name}</p>
                <p className="text-sm font-bold">${product.price.toFixed(2)}</p>
            </div>
        </Link>
    </div>
  );
}


export function FrequentlyBoughtTogetherPreview() {
    const { toast } = useToast();
    const product = mockProducts[0];
    const frequentlyBoughtTogether = mockProducts.slice(1, 2);
    const totalPrice = product.price + frequentlyBoughtTogether[0].price;

     const handleAddBothToCart = () => {
        toast({
        title: "Items Added!",
        description: `${product.name} and ${frequentlyBoughtTogether[0].name} have been added to your cart.`
        });
    }

    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-6">Frequently Bought Together</h2>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center">
                        <ProductCardMini product={product} />
                        <Plus className="h-5 w-5 mx-2 text-muted-foreground" />
                        <ProductCardMini product={frequentlyBoughtTogether[0]} />
                    </div>
                    <div className="text-center mt-4">
                        <p className="text-lg font-semibold">Total Price: ${totalPrice.toFixed(2)}</p>
                        <Button className="mt-2" size="sm" onClick={handleAddBothToCart}>Add Both to Cart</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
