
"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from "@/lib/mock-data";
import type { DisplayProduct } from "@/lib/types";
import { useVerification } from "@/context/vendor-verification-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function getStockStatus(stock: number): { text: string; variant: "default" | "secondary" | "destructive" } {
    if (stock === 0) return { text: "Out of Stock", variant: "destructive" };
    if (stock < 10) return { text: "Low Stock", variant: "secondary" };
    return { text: "In Stock", variant: "default" };
}

function InventoryTable({ products: initialProducts }: { products: DisplayProduct[] }) {
    const { toast } = useToast();
    const [products, setProducts] = useState<DisplayProduct[]>(initialProducts);
    const [editingQuantities, setEditingQuantities] = useState<{ [key: string]: string }>({});

    const handleQuantityChange = (productId: string, value: string) => {
        setEditingQuantities(prev => ({ ...prev, [productId]: value }));
    };

    const handleSaveQuantity = (productId: string) => {
        const newQuantity = parseInt(editingQuantities[productId], 10);
        if (isNaN(newQuantity) || newQuantity < 0) {
            toast({
                variant: "destructive",
                title: "Invalid Quantity",
                description: "Please enter a valid non-negative number for the stock.",
            });
            return;
        }

        setProducts(prevProducts =>
            prevProducts.map(p => (p.id === productId ? { ...p, stock: newQuantity } : p))
        );

        toast({
            title: "Inventory Updated",
            description: `Stock for product ${productId} has been set to ${newQuantity}.`,
        });

        setEditingQuantities(prev => {
            const newEditingQuantities = { ...prev };
            delete newEditingQuantities[productId];
            return newEditingQuantities;
        });
    };

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[150px]">Quantity</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(product => {
                            const status = getStockStatus(product.stock ?? 0);
                            const isEditing = editingQuantities[product.id] !== undefined;

                            return (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell p-2">
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{product.sku ?? 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={status.variant}>{status.text}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={editingQuantities[product.id] ?? product.stock ?? 0}
                                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                            className="h-9"
                                            min="0"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isEditing && (
                                            <Button size="sm" onClick={() => handleSaveQuantity(product.id)}>
                                                Save
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


export default function BothVendorInventoryPage() {
    const { vendorType } = useVerification();
    
    const personalProducts = mockProducts.filter(p => !p.b2bEnabled);
    const corporateProducts = mockProducts.filter(p => p.b2bEnabled);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Inventory Management</h1>
                <p className="text-muted-foreground">Track and update your product stock levels.</p>
            </div>
            
            <Tabs defaultValue="personalized" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personalized">Personalized Retail</TabsTrigger>
                    <TabsTrigger value="corporate">Corporate & Bulk</TabsTrigger>
                </TabsList>
                <TabsContent value="personalized" className="mt-4">
                     <InventoryTable products={personalProducts} />
                </TabsContent>
                <TabsContent value="corporate" className="mt-4">
                    <InventoryTable products={corporateProducts} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
