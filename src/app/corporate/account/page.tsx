
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockProducts, mockCorporateBids } from "@/lib/mock-data";
import { Gavel, DollarSign, ListChecks, ArrowUpRight, Search, Plus, CheckCircle, Hourglass, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


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
    const recentBids = mockCorporateBids.slice(0, 3);
    
    const getStatusInfo = (status: CorporateBid['status']) => {
        switch(status) {
            case 'Active': return { icon: Hourglass, variant: 'secondary' as const, label: 'Active' };
            case 'Awarded': return { icon: CheckCircle, variant: 'default' as const, label: 'Awarded' };
            case 'Expired': return { icon: XCircle, variant: 'outline' as const, label: 'Expired' };
            default: return { icon: Gavel, variant: 'secondary' as const, label: 'Unknown' };
        }
    };


  return (
    <>
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
                <CardTitle>Recent Bid Requests</CardTitle>
                <CardDescription>
                Review your recent bid requests and their status.
                </CardDescription>
            </div>
             <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/corporate/bids/new">
                    <Plus className="h-4 w-4" /> Create New Bid
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Bid ID</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recentBids.map(bid => {
                    const { icon: StatusIcon, variant, label } = getStatusInfo(bid.status);
                    return (
                        <TableRow key={bid.id}>
                            <TableCell>
                                <div className="font-mono">{bid.id}</div>
                                <div className="text-xs text-muted-foreground">{new Date(bid.createdAt).toLocaleDateString()}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center -space-x-2">
                                    {bid.products.slice(0, 3).map(p => (
                                        <Avatar key={p.id} className="border-2 border-background">
                                            <AvatarImage src={p.imageUrl} alt={p.name} />
                                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {bid.products.length > 3 && (
                                        <Avatar className="border-2 border-background">
                                            <AvatarFallback>+{bid.products.length - 3}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={variant}>
                                    <StatusIcon className="mr-2 h-4 w-4" />
                                    {label}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button variant="outline" size="sm" asChild>
                                    <Link href={`/corporate/bids/${bid.id}`}>View Bid</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </>
  );
}
