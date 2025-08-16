
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { DisplayProduct } from "@/lib/types";
import { MoreHorizontal, Edit, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function getStockStatus(stock: number): { text: string; variant: "default" | "secondary" | "destructive" } {
    if (stock === 0) return { text: "Out of Stock", variant: "destructive" };
    if (stock < 50) return { text: "Low Stock", variant: "secondary" };
    return { text: "In Stock", variant: "default" };
}

function InventoryTable({ products, loading, type }: { products: DisplayProduct[], loading: boolean, type: 'Personalized' | 'Corporate' }) {
    const { toast } = useToast();
    const [editingQuantities, setEditingQuantities] = useState<{ [key: string]: string }>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    const handleQuantityChange = (productId: string, value: string) => {
        setEditingQuantities(prev => ({ ...prev, [productId]: value }));
    };

    const handleSaveQuantity = async (productId: string) => {
        const newQuantityStr = editingQuantities[productId];
        const newQuantity = parseInt(newQuantityStr, 10);
        
        if (isNaN(newQuantity) || newQuantity < 0) {
            toast({
                variant: "destructive",
                title: "Invalid Quantity",
                description: "Please enter a valid non-negative number for the stock.",
            });
            return;
        }

        setSavingId(productId);
        try {
            const productRef = doc(db, "products", productId);
            await updateDoc(productRef, {
                stock: newQuantity
            });

            toast({
                title: "Inventory Updated",
                description: `Stock for product ${productId} has been set to ${newQuantity}.`,
            });
            
            setEditingQuantities(prev => {
                const newEditingQuantities = { ...prev };
                delete newEditingQuantities[productId];
                return newEditingQuantities;
            });

        } catch (error) {
            console.error("Error updating stock:", error);
            toast({ variant: "destructive", title: "Failed to update stock" });
        } finally {
            setSavingId(null);
        }
    };
    
    if (loading) {
        return <p className="text-center text-muted-foreground p-4">Loading inventory...</p>
    }

    if (products.length === 0) {
        return <p className="text-center text-muted-foreground p-4">No {type.toLowerCase()} products found.</p>
    }


    return (
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
                                {isEditing ? (
                                    <Button size="sm" onClick={() => handleSaveQuantity(product.id)} disabled={savingId === product.id}>
                                        {savingId === product.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Save'}
                                    </Button>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/vendor/both/products/new?id=${product.id}`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Product
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })
            }
            </TableBody>
        </Table>
    );
}

export default function BothVendorInventoryPage() {
    const [allProducts, setAllProducts] = useState<DisplayProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const vendorId = "VDR001"; // Placeholder for logged-in vendor

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "products"), where("vendorId", "==", vendorId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData: DisplayProduct[] = [];
            querySnapshot.forEach((doc) => {
                productsData.push({ id: doc.id, ...doc.data() } as DisplayProduct);
            });
            setAllProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching inventory:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [vendorId]);

    const personalProducts = useMemo(() => allProducts.filter(p => !p.b2bEnabled), [allProducts]);
    const corporateProducts = useMemo(() => allProducts.filter(p => p.b2bEnabled), [allProducts]);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Inventory Management</h1>
                <p className="text-muted-foreground">Track and update your product stock levels.</p>
            </div>
            
            <Tabs defaultValue="personalized" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personalized">Personalized Retail</TabsTrigger>
                    <TabsTrigger value="corporate">Corporate & Bulk</TabsTrigger>
                </TabsList>
                <Card className="mt-4 flex-1">
                    <TabsContent value="personalized" className="h-full">
                        <CardContent className="p-0 h-full">
                            <InventoryTable products={personalProducts} loading={loading} type="Personalized" />
                        </CardContent>
                    </TabsContent>
                    <TabsContent value="corporate" className="h-full">
                       <CardContent className="p-0 h-full">
                            <InventoryTable products={corporateProducts} loading={loading} type="Corporate" />
                       </CardContent>
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    );
}

    