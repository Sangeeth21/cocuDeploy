
"use client";

import { MoreHorizontal, PlusCircle, ExternalLink, Copy, Archive, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import type { DisplayProduct } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function VendorProductsPage() {
    const [products, setProducts] = useState<DisplayProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const vendorId = "VDR001"; // Placeholder for logged-in vendor

    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, "products"), 
            where("vendorId", "==", vendorId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData: DisplayProduct[] = [];
            querySnapshot.forEach((doc) => {
                productsData.push({ id: doc.id, ...doc.data() } as DisplayProduct);
            });
            setProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [vendorId]);
    
    const liveProducts = useMemo(() => products.filter(p => p.status === 'Live' || p.status === 'Needs Review'), [products]);
    const draftProducts = useMemo(() => products.filter(p => p.status === 'Draft' || p.status === 'Archived'), [products]);

    const renderProductTable = (products: DisplayProduct[], title: string) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
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
                                        <DropdownMenuItem className="text-destructive" onClick={() => console.log('delete')}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
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
                {products.length === 0 && <p className="text-center text-muted-foreground p-4">No products in this category.</p>}
            </CardContent>
        </Card>
    );
    
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Products</h1>
                <p className="text-muted-foreground">Manage your product listings.</p>
            </div>
            <Button asChild>
                <Link href="/vendor/products/new">
                    <PlusCircle className="mr-2"/> Add Product
                </Link>
            </Button>
        </div>
        
        {loading ? (
             <p className="text-center text-muted-foreground p-4">Loading products...</p>
        ) : (
            <div className="space-y-8">
                {renderProductTable(liveProducts, "Live & Needs Review Products")}
                {renderProductTable(draftProducts, "Drafts & Archived Products")}
            </div>
        )}
      </div>
    );
}
