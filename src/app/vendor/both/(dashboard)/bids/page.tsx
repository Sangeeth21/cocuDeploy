
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
import { MoreHorizontal, Search, Gavel, Users, Clock, Trash2, ShieldAlert, Plus, CheckCircle, Hourglass, XCircle, AlertTriangle, FileText, Send, Loader2 } from 'lucide-react';
import type { CorporateBid, VendorBid } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.keys(timeLeft)
        .filter(interval => timeLeft[interval] > 0)
        .map(interval => (
            <span key={interval} className="font-semibold">{timeLeft[interval]}{interval.charAt(0)}</span>
        ));
    
    if (!timerComponents.length) {
        return <span className="text-destructive font-semibold">Expired</span>;
    }

    return <>{timerComponents.join(' ')}</>;
}

function PlaceBidDialog({ bid, onBidPlaced }: { bid: CorporateBid; onBidPlaced: (bidId: string, response: VendorBid) => void }) {
    const [open, setOpen] = useState(false);
    const [pricePerUnit, setPricePerUnit] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

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
                    <Gavel className="mr-2 h-4 w-4" /> Place Bid
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Place Your Bid for: {bid.id}</DialogTitle>
                    <DialogDescription>
                        Review the products and submit your best offer.
                    </DialogDescription>
                </DialogHeader>
                 <div className="grid md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Products in this Bid</h4>
                        {bid.products.map(p => (
                            <div key={p.id} className="flex items-center gap-2 text-xs p-2 border rounded-md">
                                <div className="relative h-10 w-10 shrink-0"><Image src={p.imageUrl} alt={p.name} fill className="object-cover rounded-md" /></div>
                                <p className="font-medium">{p.name}</p>
                            </div>
                        ))}
                        <div className="p-2 bg-muted/50 rounded-md text-xs">
                            <span className="font-semibold">Required Quantity:</span> {bid.quantity} units per product
                        </div>
                    </div>
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="price">Your Price per Unit ($)</Label>
                            <Input id="price" type="number" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} placeholder="e.g., 150.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery">Estimated Delivery</Label>
                            <Input id="delivery" value={estimatedDelivery} onChange={e => setEstimatedDelivery(e.target.value)} placeholder="e.g., 10-12 business days" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Bulk discounts available" />
                        </div>
                    </div>
                 </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Bid
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function BothVendorBidsPage() {
    const [bids, setBids] = useState<CorporateBid[]>(mockCorporateBids);

    const handleBidPlaced = (bidId: string, response: VendorBid) => {
        setBids(prev => prev.map(bid => {
            if (bid.id === bidId) {
                // Check if this vendor has already bid to avoid duplicates
                if (bid.responses.some(r => r.alias === "You")) {
                    return bid; // Already bid, do nothing
                }
                return {
                    ...bid,
                    responses: [...bid.responses, response],
                };
            }
            return bid;
        }));
    };
    
     const getStatusInfo = (status: CorporateBid['status']) => {
        switch(status) {
            case 'Active': return { icon: Hourglass, variant: 'secondary' as const, label: 'Active' };
            case 'Awarded': return { icon: CheckCircle, variant: 'default' as const, label: 'Awarded' };
            case 'Expired': return { icon: XCircle, variant: 'outline' as const, label: 'Expired' };
            default: return { icon: Gavel, variant: 'secondary' as const, label: 'Unknown' };
        }
    };
    
    const hasVendorBid = (bid: CorporateBid) => {
        // In a real app, you'd check against the logged-in vendor's ID.
        return bid.responses.some(r => r.alias === "You");
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Corporate Bidding</h1>
                    <p className="text-muted-foreground">Review and bid on active corporate requests.</p>
                </div>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bid ID</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Time Left</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bids.map(bid => {
                                const { icon: StatusIcon, variant: statusVariant, label: statusLabel } = getStatusInfo(bid.status);
                                const alreadyBid = hasVendorBid(bid);

                                return (
                                <TableRow key={bid.id}>
                                    <TableCell className="font-mono">{bid.id}</TableCell>
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
                                            <Badge variant={statusVariant}>
                                            <StatusIcon className="mr-2 h-4 w-4" />
                                            {statusLabel}
                                        </Badge>
                                        </TableCell>
                                    <TableCell className="text-right"><CountdownTimer expiryDate={bid.expiresAt} /></TableCell>
                                    <TableCell className="text-right">
                                        {alreadyBid ? (
                                            <Button size="sm" variant="outline" disabled>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Bid Submitted
                                            </Button>
                                        ) : (
                                            <PlaceBidDialog bid={bid} onBidPlaced={handleBidPlaced} />
                                        )}
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    