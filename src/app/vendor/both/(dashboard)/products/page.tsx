
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BothProductsPage() {
    
    const personalProducts = useMemo(() => mockProducts.filter(p => !p.b2bEnabled), []);
    const corporateProducts = useMemo(() => mockProducts.filter(p => p.b2bEnabled), []);

    const renderProductTable = (products: DisplayProduct[], isCorporate: boolean) => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">
                                <span className="sr-only">Image</span>
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">{isCorporate ? "MOQ" : "Price"}</TableHead>
                            <TableHead className="hidden md:table-cell">{isCorporate ? "Tiers" : "Inventory"}</TableHead>
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
                            <TableCell className="hidden md:table-cell">{isCorporate ? product.moq : `$${product.price.toFixed(2)}`}</TableCell>
                            <TableCell className="hidden md:table-cell">{isCorporate ? product.tierPrices?.length || 0 : `${product.stock} in stock`}</TableCell>
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
                <p className="text-muted-foreground">Manage all your product listings.</p>
            </div>
            <Button asChild>
                <Link href="/vendor/both/products/new">
                    <PlusCircle className="mr-2"/> Add Product
                </Link>
            </Button>
        </div>
        
        <Tabs defaultValue="personal">
            <TabsList>
                <TabsTrigger value="personal">Personalized Retail</TabsTrigger>
                <TabsTrigger value="corporate">Corporate & Bulk</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="mt-4">
                {renderProductTable(personalProducts, false)}
            </TabsContent>
            <TabsContent value="corporate" className="mt-4">
                {renderProductTable(corporateProducts, true)}
            </TabsContent>
        </Tabs>
      </div>
    );
}
