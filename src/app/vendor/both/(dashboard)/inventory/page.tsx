
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { DisplayProduct } from "@/lib/types";
import { useVerification } from "@/context/vendor-verification-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

function getStockStatus(stock: number): { text: string; variant: "default" | "secondary" | "destructive" } {
    if (stock === 0) return { text: "Out of Stock", variant: "destructive" };
    if (stock < 10) return { text: "Low Stock", variant: "secondary" };
    return { text: "In Stock", variant: "default" };
}

function InventoryTable({ products, loading }: { products: DisplayProduct[], loading: boolean }) {
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
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">Loading inventory...</TableCell>
                            </TableRow>
                        ) : products.map(product => {
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
                                            <Button size="sm" onClick={() => handleSaveQuantity(product.id)} disabled={savingId === product.id}>
                                                {savingId === product.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Save'}
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
    const [personalProducts, setPersonalProducts] = useState<DisplayProduct[]>([]);
    const [corporateProducts, setCorporateProducts] = useState<DisplayProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const vendorId = "VDR001"; // Placeholder for logged-in vendor

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "products"), where("vendorId", "==", vendorId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allProducts: DisplayProduct[] = [];
            querySnapshot.forEach((doc) => {
                allProducts.push({ id: doc.id, ...doc.data() } as DisplayProduct);
            });
            
            setPersonalProducts(allProducts.filter(p => !p.b2bEnabled));
            setCorporateProducts(allProducts.filter(p => p.b2bEnabled));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching inventory:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [vendorId]);
    

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
                     <InventoryTable products={personalProducts} loading={loading} />
                </TabsContent>
                <TabsContent value="corporate" className="mt-4">
                    <InventoryTable products={corporateProducts} loading={loading} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
