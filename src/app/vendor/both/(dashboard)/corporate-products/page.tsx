
"use client";

import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { DisplayProduct } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function VendorCorporateProductsPage() {
    
    const [products, setProducts] = useState<DisplayProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const vendorId = "VDR001"; // Placeholder for logged-in vendor

    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, "products"), 
            where("vendorId", "==", vendorId),
            where("b2bEnabled", "==", true)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData: DisplayProduct[] = [];
            querySnapshot.forEach((doc) => {
                productsData.push({ id: doc.id, ...doc.data() } as DisplayProduct);
            });
            setProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching corporate products: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [vendorId]);


    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Corporate Products</h1>
                <p className="text-muted-foreground">Manage your product listings for bulk and corporate sales.</p>
            </div>
            <Button asChild>
                <Link href="/vendor/both/products/new">
                    <PlusCircle className="mr-2"/> Add Product
                </Link>
            </Button>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>B2B-Enabled Products</CardTitle>
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
                            <TableHead className="hidden md:table-cell">MOQ</TableHead>
                            <TableHead className="hidden md:table-cell">Tiers</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">Loading products...</TableCell>
                        </TableRow>
                    ) : products.length > 0 ? (
                        products.map(product => (
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
                                <TableCell className="hidden md:table-cell">{product.moq}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.tierPrices?.length || 0}</TableCell>
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
                                        <DropdownMenuItem>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">No B2B products found.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    );
}
