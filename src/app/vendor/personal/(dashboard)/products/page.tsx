
"use client";

import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { mockProducts } from "@/lib/mock-data";
import Image from "next/image";
import { useMemo } from "react";
import type { DisplayProduct } from "@/lib/types";


export default function VendorProductsPage() {
    
    const liveProducts = useMemo(() => mockProducts.filter(p => p.status === 'Live' || p.status === 'Needs Review'), []);
    const draftProducts = useMemo(() => mockProducts.filter(p => p.status === 'Draft' || p.status === 'Archived'), []);

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
                                    <DropdownMenuItem>Delete</DropdownMenuItem>
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
                <Link href="/vendor/personal/products/new">
                    <PlusCircle className="mr-2"/> Add Product
                </Link>
            </Button>
        </div>
        
        <div className="space-y-8">
            {renderProductTable(liveProducts, "Live & Needs Review Products")}
            {renderProductTable(draftProducts, "Drafts & Archived Products")}
        </div>
      </div>
    );
}
