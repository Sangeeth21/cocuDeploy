
"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from "@/lib/mock-data";
import type { DisplayProduct } from "@/lib/types";

function getStockStatus(stock: number): { text: string; variant: "default" | "secondary" | "destructive" } {
    if (stock === 0) return { text: "Out of Stock", variant: "destructive" };
    if (stock < 50) return { text: "Low Stock", variant: "secondary" };
    return { text: "In Stock", variant: "default" };
}

export default function CorporateInventoryPage() {
    const { toast } = useToast();
    const [products, setProducts] = useState<DisplayProduct[]>(mockProducts.filter(p => p.b2bEnabled));
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
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Corporate Inventory</h1>
                <p className="text-muted-foreground">Track stock levels for your bulk products.</p>
            </div>
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
        </div>
    );
}
