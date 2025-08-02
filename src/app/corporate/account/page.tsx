
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

export default function CorporateAccountPage() {
  const recentBids = mockProducts.slice(0, 3).filter(p => p.b2bEnabled);

  return (
    <div className="container">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Account Dashboard</h1>
         <Button asChild>
          <Link href="/corporate/products">
            <Search className="mr-2 h-4 w-4" /> Browse Products
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mb-8">
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
                <CardTitle>Recent Bids & Quick Actions</CardTitle>
                <CardDescription>
                Quickly place new bids on previously quoted items.
                </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/corporate/bids">
                View All Bids
                <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Last Quoted Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recentBids.map(product => (
                    <TableRow key={product.id}>
                        <TableCell>
                             <div className="flex items-center gap-4">
                                <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                     <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                </div>
                                <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Vendor: {product.vendorId}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">${(product.price * 0.9).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/corporate/quote/${product.id}`}>Request New Quote</Link>
                                </Button>
                                <PlaceBidDialog product={product} />
                           </div>
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
