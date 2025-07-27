
"use client";

import { useState } from "react";
import { mockOrderedCombos, mockWishlistedCombos } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Plus, ShoppingCart, Heart, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { OrderedCombo, WishlistedCombo } from "@/lib/types";


function ComboCard({
  products,
  count,
  type,
  details,
}: {
  products: any[];
  count: number;
  type: "ordered" | "wishlisted";
  details: any;
}) {
  const Icon = type === "ordered" ? ShoppingCart : Heart;
  const description =
    type === "ordered"
      ? `${count} times`
      : `${count} wishlists`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex -space-x-4">
            {products.map((product, index) => (
            <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border-2 border-background shadow-sm">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
            ))}
        </div>
        <div className="mt-4">
            {products.map((product, index) => (
                 <div key={index} className="flex items-center gap-2 text-sm">
                    <p className="font-medium truncate">{product.name}</p>
                    {index < products.length -1 && <Plus className="h-4 w-4 text-muted-foreground" />}
                </div>
            ))}
        </div>
      </CardContent>
      <CardHeader className="flex flex-row items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span>{description}</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </DialogTrigger>
          <ComboDetailsDialog type={type} details={details} products={products} />
        </Dialog>
      </CardHeader>
    </Card>
  );
}

function ComboDetailsDialog({ type, details, products }: { type: 'ordered' | 'wishlisted', details: any, products: any[] }) {
    const title = type === 'ordered' ? "Orders Featuring This Combo" : "Wishlists Featuring This Combo";
    
    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                    {products.map(p => p.name).join(' + ')}
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            {type === 'ordered' && <TableHead>Order ID</TableHead>}
                            <TableHead>Vendor</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {details.map((item: any, index: number) => (
                             <TableRow key={index}>
                                <TableCell>
                                     <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={item.customer.avatar} alt={item.customer.name} />
                                            <AvatarFallback>{item.customer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{item.customer.name}</div>
                                    </div>
                                </TableCell>
                                {type === 'ordered' && <TableCell><Link href={`/admin/orders?search=${item.orderId}`} className="text-primary hover:underline">{item.orderId}</Link></TableCell>}
                                <TableCell>{item.vendorId}</TableCell>
                                <TableCell className="text-right">{item.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </DialogContent>
    )
}

export default function ProductCombosPage() {
  const [orderedCombos] = useState<OrderedCombo[]>(mockOrderedCombos);
  const [wishlistedCombos] = useState<WishlistedCombo[]>(mockWishlistedCombos);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Product Combo Analysis</h1>
        <p className="text-muted-foreground">
          Discover which products are frequently bought or wishlisted together.
        </p>
      </div>
      <Tabs defaultValue="ordered">
        <TabsList>
          <TabsTrigger value="ordered">Ordered Together</TabsTrigger>
          <TabsTrigger value="wishlisted">Wishlisted Together</TabsTrigger>
        </TabsList>
        <TabsContent value="ordered">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {orderedCombos.map((combo) => (
              <ComboCard
                key={combo.id}
                products={combo.products}
                count={combo.orderCount}
                type="ordered"
                details={combo.orders}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="wishlisted">
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {wishlistedCombos.map((combo) => (
              <ComboCard
                key={combo.id}
                products={combo.products}
                count={combo.wishlistCount}
                type="wishlisted"
                details={combo.customers}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
