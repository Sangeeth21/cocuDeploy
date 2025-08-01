
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockProducts } from "@/lib/mock-data";
import { Gavel, DollarSign, ListChecks, ArrowUpRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";


function PlaceBidDialog({ product }: { product: typeof mockProducts[0] }) {
    const [quantity, setQuantity] = useState(100);
    const [price, setPrice] = useState(product.price * 0.8); // Default bid 20% off
    const { toast } = useToast();

    const handlePlaceBid = () => {
        toast({
            title: "Bid Placed!",
            description: `Your bid for ${quantity} units of ${product.name} at $${price.toFixed(2)} each has been submitted.`
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm">Place Bid</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Place Bid for: {product.name}</DialogTitle>
                    <DialogDescription>
                        Enter the quantity and your bid price per unit. Your bid will be sent to the platform for review.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="50" />
                         <p className="text-xs text-muted-foreground">Minimum bid quantity: 50 units</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Bid Price (per unit)</Label>
                        <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                        <p className="text-xs text-muted-foreground">Current retail price: ${product.price.toFixed(2)}</p>
                    </div>
                </div>
                 <DialogFooter>
                    <Button onClick={handlePlaceBid}>Submit Bid</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function CorporateDashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 my-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Budget Spent (YTD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,789.00</div>
            <p className="text-xs text-muted-foreground">
              +15% from last year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Bids
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Awaiting vendor response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders Placed</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              In the last 12 months
            </p>
          </CardContent>
        </Card>
      </div>
       <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Bidding Module</CardTitle>
                    <CardDescription>Browse products available for bulk corporate bidding.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." className="pl-8" />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="hidden md:table-cell">Vendor</TableHead>
                            <TableHead className="text-right">Retail Price</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockProducts.slice(0,5).map(product => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md" data-ai-hint={`${product.tags?.[0] || ''} ${product.tags?.[1] || ''}`} />
                                        <Link href={`/products/${product.id}`} className="font-medium hover:underline">{product.name}</Link>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{product.category}</TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">{product.vendorId}</TableCell>
                                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <PlaceBidDialog product={product} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </>
  );
}
