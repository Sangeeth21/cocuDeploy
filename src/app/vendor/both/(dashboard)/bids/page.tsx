
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockCorporateBids } from "@/lib/mock-data";
import { CheckCircle, Clock, Gavel, Loader2, Send } from 'lucide-react';
import type { CorporateBid, VendorBid } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


function CountdownTimer({ expiryDate }: { expiryDate: string }) {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryDate) - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

    useEffect(() => {
        if (new Date(expiryDate) < new Date()) return;
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000 * 60); // Update every minute
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft)
        .filter(([key, value]) => value > 0)
        .map(([key, value]) => (
            <span key={key} className="font-semibold">{value}{key.charAt(0)}</span>
        ));
    
    if (!timerComponents.length) {
        return <span className="text-destructive font-semibold">Expired</span>;
    }

    return <div className="flex gap-1">{timerComponents}</div>;
}

function PlaceBidDialog({ bid, onBidPlaced, existingBid }: { bid: CorporateBid; onBidPlaced: (bidId: string, response: VendorBid) => void; existingBid?: VendorBid }) {
    const [open, setOpen] = useState(false);
    const [pricePerUnit, setPricePerUnit] = useState(existingBid?.pricePerUnit.toString() || "");
    const [estimatedDelivery, setEstimatedDelivery] = useState(existingBid?.estimatedDelivery || "");
    const [notes, setNotes] = useState(existingBid?.notes || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const competitorBids = useMemo(() => {
        return bid.responses
            .filter(r => r.alias !== 'You') // Exclude the current vendor's bid
            .sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    }, [bid.responses]);

    const handleSubmit = () => {
        if (!pricePerUnit || !estimatedDelivery) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide both price and delivery estimates.' });
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            const newBidResponse: VendorBid = {
                alias: "You", // This would be the logged-in vendor's alias
                vendorId: "VDR001-SELF", // Logged-in vendor ID
                vendorName: "Timeless Co.",
                vendorAvatar: 'https://placehold.co/40x40.png',
                pricePerUnit: Number(pricePerUnit),
                estimatedDelivery,
                notes,
            };
            onBidPlaced(bid.id, newBidResponse);
            setIsSubmitting(false);
            setOpen(false);
            toast({ title: 'Bid Submitted!', description: `Your bid for ${bid.id} has been placed.` });
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" disabled={bid.status !== 'Active'}>
                    <Gavel className="mr-2 h-4 w-4" /> {existingBid ? 'Update Bid' : 'Place Bid'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Place Your Bid for: {bid.id}</DialogTitle>
                    <DialogDescription>
                        Review the products and submit your best offer. All other bids are anonymous.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto">
                    {/* Left Column: Product Info & Competitor Bids */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Products in this Bid</h4>
                        <div className="space-y-2">
                            {bid.products.map(p => (
                                <div key={p.id} className="flex items-center gap-2 text-xs p-2 border rounded-md">
                                    <div className="relative h-10 w-10 shrink-0"><Image src={p.imageUrl} alt={p.name} fill className="object-cover rounded-md" /></div>
                                    <p className="font-medium">{p.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-muted/50 rounded-md text-sm">
                            <span className="font-semibold">Required Quantity:</span> {bid.quantity.toLocaleString()} units per product
                        </div>
                        <Card>
                             <CardHeader className="p-3">
                                <CardTitle className="text-sm">Competitor Bids</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                {competitorBids.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="h-8">Price/Unit</TableHead>
                                                <TableHead className="h-8">Est. Delivery</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {competitorBids.map((b, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="py-1">${b.pricePerUnit.toFixed(2)}</TableCell>
                                                    <TableCell className="py-1">{b.estimatedDelivery}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-xs text-muted-foreground">Be the first to bid!</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    {/* Right Column: Your Bid */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Your Offer</h4>
                        <div className="space-y-2">
                            <Label htmlFor="price">Your Price per Unit ($) <span className="text-destructive">*</span></Label>
                            <Input id="price" type="number" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} placeholder="e.g., 150.00" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery">Estimated Delivery <span className="text-destructive">*</span></Label>
                            <Input id="delivery" value={estimatedDelivery} onChange={e => setEstimatedDelivery(e.target.value)} placeholder="e.g., 10-12 business days" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes to Customer (Optional)</Label>
                            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Bulk discounts available for future orders." />
                        </div>
                        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                            <CardContent className="p-3">
                                <p className="text-xs text-blue-800 dark:text-blue-300">
                                    <span className="font-bold">Tip:</span> The lowest bid doesn't always win. Corporate clients value reliability, quality, and clear communication. Put your best foot forward!
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {existingBid ? 'Update Bid' : 'Submit Bid'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function BidList({ bids, onBidPlaced }: { bids: CorporateBid[]; onBidPlaced: (bidId: string, response: VendorBid) => void }) {
    
    if (bids.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No bids in this category.</p>
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Bid ID</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Time Left</TableHead>
                    <TableHead>Competitors</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bids.map(bid => {
                    const vendorBid = bid.responses.find(r => r.alias === 'You');
                    const competitorCount = bid.responses.filter(r => r.alias !== 'You').length;
                    const isWinning = vendorBid && bid.responses.length > 0 && Math.min(...bid.responses.map(r => r.pricePerUnit)) === vendorBid.pricePerUnit;
                    
                    return (
                        <TableRow key={bid.id}>
                            <TableCell>
                                <div className="font-mono text-sm">{bid.id}</div>
                                {vendorBid && (
                                     <Badge variant={isWinning ? "default" : "secondary"}>{isWinning ? "Winning" : "Submitted"}</Badge>
                                )}
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
                            <TableCell><CountdownTimer expiryDate={bid.expiresAt} /></TableCell>
                            <TableCell>{competitorCount}</TableCell>
                            <TableCell className="text-right">
                                <PlaceBidDialog bid={bid} onBidPlaced={onBidPlaced} existingBid={vendorBid} />
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    );
}

export default function BothVendorBidsPage() {
    const [bids, setBids] = useState<CorporateBid[]>(mockCorporateBids);

    const handleBidPlaced = (bidId: string, response: VendorBid) => {
        setBids(prev => prev.map(bid => {
            if (bid.id === bidId) {
                // Check if this vendor has already bid to update it, otherwise add it.
                const existingBidIndex = bid.responses.findIndex(r => r.alias === "You");
                const newResponses = [...bid.responses];

                if (existingBidIndex > -1) {
                    newResponses[existingBidIndex] = response;
                } else {
                    newResponses.push(response);
                }
                
                return { ...bid, responses: newResponses };
            }
            return bid;
        }));
    };
    
    const activeBids = useMemo(() => bids.filter(b => b.status === 'Active'), [bids]);
    const awardedBids = useMemo(() => bids.filter(b => b.status === 'Awarded' && b.responses.some(r => r.alias === 'You')), [bids]);
    const pastBids = useMemo(() => bids.filter(b => b.status === 'Expired' || (b.status === 'Awarded' && !b.responses.some(r => r.alias === 'You'))), [bids]);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Corporate Bidding</h1>
                    <p className="text-muted-foreground">Review and bid on active corporate requests.</p>
                </div>
            </div>
             <Tabs defaultValue="active">
                <TabsList>
                    <TabsTrigger value="active">Active Bids</TabsTrigger>
                    <TabsTrigger value="awarded">Awarded</TabsTrigger>
                    <TabsTrigger value="past">Past Bids</TabsTrigger>
                </TabsList>
                <Card className="mt-4">
                    <CardContent className="p-0">
                         <TabsContent value="active">
                            <BidList bids={activeBids} onBidPlaced={handleBidPlaced} />
                        </TabsContent>
                         <TabsContent value="awarded">
                             <BidList bids={awardedBids} onBidPlaced={handleBidPlaced} />
                        </TabsContent>
                         <TabsContent value="past">
                            <BidList bids={pastBids} onBidPlaced={handleBidPlaced} />
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
