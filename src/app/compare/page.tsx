
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useComparison } from "@/context/comparison-context";
import Image from "next/image";
import { Star, Wand2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";


export default function ComparePage() {
    const { comparisonItems, removeFromCompare, clearComparison } = useComparison();
    const { addToCart } = useCart();
    const router = useRouter();
    const { toast } = useToast();

    const handleAddToCart = (product: typeof comparisonItems[0]) => {
        addToCart({product, customizations: {}});
        toast({
            title: "Added to Cart!",
            description: `${product.name} has been added to your cart.`
        });
    }

    if (comparisonItems.length === 0) {
        return (
            <div className="container text-center py-16">
                <h1 className="text-4xl font-bold font-headline mb-4">Compare Products</h1>
                <p className="text-muted-foreground mb-6">You have no items in your comparison list.</p>
                <Button asChild>
                    <Link href="/corporate/products">Browse Products to Compare</Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="container py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold font-headline">Compare Products</h1>
                <Button variant="outline" onClick={clearComparison}>Clear All</Button>
            </div>
            <div className="overflow-x-auto">
                 <Table className="min-w-max">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Feature</TableHead>
                            {comparisonItems.map(item => (
                                <TableHead key={item.id} className="w-[250px] text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="relative h-24 w-24">
                                             <Image src={item.imageUrl} alt={item.name} fill className="object-contain" />
                                        </div>
                                        <Link href={`/corporate/products/${item.id}`} className="font-semibold hover:text-primary">{item.name}</Link>
                                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCompare(item.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-semibold">Price</TableCell>
                            {comparisonItems.map(item => (
                                <TableCell key={item.id} className="text-center font-medium">${item.price.toFixed(2)}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Rating</TableCell>
                            {comparisonItems.map(item => (
                                <TableCell key={item.id} className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {item.rating} <Star className="h-4 w-4 text-accent fill-accent" />
                                        <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-semibold">Minimum Order Quantity</TableCell>
                            {comparisonItems.map(item => (
                                <TableCell key={item.id} className="text-center">{item.moq?.toLocaleString() || 'N/A'}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Customizable</TableCell>
                            {comparisonItems.map(item => (
                                <TableCell key={item.id} className="text-center">
                                    {Object.values(item.customizationAreas || {}).some(areas => areas && areas.length > 0) ? (
                                        <span className="inline-flex items-center justify-center h-6 w-6 bg-green-100 rounded-full">
                                            <Check className="h-4 w-4 text-green-700"/>
                                        </span>
                                    ) : (
                                         <span className="inline-flex items-center justify-center h-6 w-6 bg-muted rounded-full">
                                            <X className="h-4 w-4 text-muted-foreground"/>
                                        </span>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                             {comparisonItems.map(item => (
                                <TableCell key={item.id} className="text-center">
                                    <Button size="sm" onClick={() => handleAddToCart(item)}>Add to Cart</Button>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
