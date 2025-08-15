
"use client";

import { MoreHorizontal, PlusCircle, ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { DisplayProduct } from "@/lib/types";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from 'next/navigation'


export default function AdminProductsPage() {
    const searchParams = useSearchParams()
    const category = searchParams.get('category')
    const [products, setProducts] = useState<DisplayProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageTitle, setPageTitle] = useState("All Products");

    useEffect(() => {
        let q = query(collection(db, "products"));

        if (category) {
            q = query(q, where("category", "==", category));
            setPageTitle(`Products in: ${category}`);
        } else {
            setPageTitle("All Products");
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData: DisplayProduct[] = [];
            querySnapshot.forEach((doc) => {
                productsData.push({ id: doc.id, ...doc.data() } as DisplayProduct);
            });
            setProducts(productsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [category]);
    
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">{pageTitle}</h1>
                <p className="text-muted-foreground">Manage all product listings on the platform.</p>
            </div>
            <Button asChild>
                <Link href="/admin/products/new">
                    <PlusCircle className="mr-2"/> Add Product
                </Link>
            </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Price</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {loading ? (
                       <TableRow>
                           <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading products...</TableCell>
                       </TableRow>
                   ) : products.map(product => (
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
                        <TableCell className="text-muted-foreground">{product.vendorId}</TableCell>
                        <TableCell>
                             <Badge variant={product.status === 'Needs Review' ? 'destructive' : product.status === 'Live' ? 'default' : 'secondary'}>{product.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">${product.price.toFixed(2)}</TableCell>
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
                                    <DropdownMenuItem>Unpublish</DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/products/${product.id}`} target="_blank">View Live Page <ExternalLink className="ml-auto h-3 w-3"/></Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                   ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
}
