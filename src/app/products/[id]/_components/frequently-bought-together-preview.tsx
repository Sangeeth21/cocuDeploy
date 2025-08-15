
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DisplayProduct } from "@/lib/types";

function ProductCardMini({ product }: { product: DisplayProduct }) {
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

export function FrequentlyBoughtTogetherPreview({ currentProduct }: { currentProduct: DisplayProduct }) {
    const { toast } = useToast();
    const [relatedProduct, setRelatedProduct] = useState<DisplayProduct | null>(null);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!currentProduct.category) return;
            // A more sophisticated version would analyze order data.
            // For now, we fetch another product from the same category.
            const q = query(
                collection(db, "products"),
                where("category", "==", currentProduct.category),
                where("__name__", "!=", currentProduct.id),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setRelatedProduct({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as DisplayProduct);
            }
        };
        fetchRelated();
    }, [currentProduct]);

    if (!relatedProduct) {
        return null; // Or a loading skeleton
    }

    const totalPrice = currentProduct.price + relatedProduct.price;

    const handleAddBothToCart = () => {
        // This would dispatch to a cart context in a real app
        toast({
            title: "Items Added!",
            description: `${currentProduct.name} and ${relatedProduct.name} have been added to your cart.`
        });
    }

    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-6">Frequently Bought Together</h2>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center">
                        <ProductCardMini product={currentProduct} />
                        <Plus className="h-5 w-5 mx-2 text-muted-foreground" />
                        <ProductCardMini product={relatedProduct} />
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
