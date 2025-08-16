
"use client";

import { MoreHorizontal, PlusCircle, ExternalLink, Copy, Archive, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import type { DisplayProduct } from "@/lib/types";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

function ProductTable({ products, loading, type }: { products: DisplayProduct[], loading: boolean, type: 'Personalized' | 'Corporate' }) {
    const { toast } = useToast();
    const [productToDelete, setProductToDelete] = useState<DisplayProduct | null>(null);

    const handleDelete = async () => {
        if (!productToDelete) return;

        await deleteDoc(doc(db, "products", productToDelete.id));

        toast({
            variant: "destructive",
            title: "Product Deleted",
            description: `"${productToDelete.name}" has been deleted.`,
        });
        setProductToDelete(null);
    }
    
    if (loading) {
        return <p className="text-center text-muted-foreground p-4">Loading products...</p>
    }

    if (products.length === 0) {
        return <p className="text-center text-muted-foreground p-4">No {type.toLowerCase()} products found.</p>
    }

    return (
        <AlertDialog>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Price</TableHead>
                        <TableHead className="hidden md:table-cell">Inventory</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map(product => (
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
                            <TableCell>
                                <Badge variant={product.status === 'Needs Review' ? 'destructive' : product.status === 'Live' ? 'default' : 'secondary'}>{product.status}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">${product.price.toFixed(2)}</TableCell>
                            <TableCell className="hidden md:table-cell">{product.stock} in stock</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/vendor/both/products/new?id=${product.id}`}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/products/${product.id}`} target="_blank">
                                                View Live Page <ExternalLink className="ml-auto h-3 w-3"/>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {product.status === 'Draft' || product.status === 'Archived' ? (
                                            <>
                                            <DropdownMenuItem>Publish</DropdownMenuItem>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive" onSelect={() => setProductToDelete(product)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            </>
                                        ) : (
                                            <DropdownMenuItem>
                                                <Archive className="mr-2 h-4 w-4" /> Archive
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product
                        "{productToDelete?.name}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function VendorProductsPage() {
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
            console.error("Error fetching vendor products: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [vendorId]);
    
    const personalProducts = useMemo(() => allProducts.filter(p => !p.b2bEnabled), [allProducts]);
    const corporateProducts = useMemo(() => allProducts.filter(p => p.b2bEnabled), [allProducts]);

    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Products</h1>
                <p className="text-muted-foreground">Manage your product listings for all sales channels.</p>
            </div>
            <Button asChild>
                <Link href="/vendor/both/products/new">
                    <PlusCircle className="mr-2"/> Add Product
                </Link>
            </Button>
        </div>
        
        <Tabs defaultValue="personalized" className="flex-1 flex flex-col">
            <TabsList>
                <TabsTrigger value="personalized">Personalized Retail</TabsTrigger>
                <TabsTrigger value="corporate">Corporate & Bulk</TabsTrigger>
            </TabsList>
            <Card className="mt-4 flex-1 flex flex-col">
                <TabsContent value="personalized" className="flex-1">
                    <CardContent className="p-0 h-full">
                         <ProductTable products={personalProducts} loading={loading} type="Personalized" />
                    </CardContent>
                </TabsContent>
                <TabsContent value="corporate" className="flex-1">
                    <CardContent className="p-0 h-full">
                        <ProductTable products={corporateProducts} loading={loading} type="Corporate" />
                    </CardContent>
                </TabsContent>
            </Card>
        </Tabs>
      </div>
    );
}
