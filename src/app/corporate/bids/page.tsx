
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { mockCorporateBids } from "@/lib/mock-data";
import type { CorporateBid, VendorBid } from "@/lib/types";
import Image from "next/image";
import { Clock, Eye, Gavel, Plus, Users, CheckCircle, Hourglass, XCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import NewBidPage from './new/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = Object.keys(timeLeft)
        .filter(interval => timeLeft[interval] > 0)
        .map(interval => (
            <span key={interval}>
                {timeLeft[interval]}{interval.charAt(0)}
            </span>
        ));
    
    if(!timerComponents.length) {
        return <span className="text-destructive">Expired</span>;
    }

    return <>{timerComponents.join(' ')}</>;
}

function BidDetailsDialog({ bid }: { bid: CorporateBid }) {
    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Bid Summary: {bid.id}</DialogTitle>
                <DialogDescription>
                    A quick overview of your bid request and vendor responses.
                </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto">
                <div>
                     <h4 className="font-semibold mb-2">Products in Bid</h4>
                     <div className="space-y-2">
                        {bid.products.map(p => (
                            <div key={p.id} className="flex items-center gap-2 p-2 border rounded-md">
                                <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="rounded-md" />
                                <p className="text-xs font-medium">{p.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Vendor Responses ({bid.responses.length})</h4>
                    {bid.responses.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Price/Unit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bid.responses.map(res => (
                                     <TableRow key={res.vendorId}>
                                        <TableCell className="p-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6"><AvatarImage src={res.vendorAvatar} /><AvatarFallback>{res.vendorName.charAt(0)}</AvatarFallback></Avatar>
                                                <span className="text-xs">{res.vendorName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 text-xs">${res.pricePerUnit.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">No responses from vendors yet.</p>
                    )}
                </div>
            </div>
             <div className="flex justify-end">
                <Button asChild>
                    <Link href={`/corporate/bids/${bid.id}`}>
                        View Full Details <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </DialogContent>
    )
}

function BidCard({ bid }: { bid: CorporateBid }) {
    const router = useRouter();

    const getStatusInfo = () => {
        switch(bid.status) {
            case 'Active': return { icon: Hourglass, color: 'text-blue-500', label: 'Active' };
            case 'Awarded': return { icon: CheckCircle, color: 'text-green-500', label: 'Awarded' };
            case 'Expired': return { icon: XCircle, color: 'text-destructive', label: 'Expired' };
            default: return { icon: Gavel, color: 'text-muted-foreground', label: 'Unknown' };
        }
    }

    const { icon: StatusIcon, color: statusColor, label: statusLabel } = getStatusInfo();
    
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-mono text-lg">{bid.id}</CardTitle>
                        <CardDescription>Created: {new Date(bid.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                     <Badge variant="outline" className="flex items-center gap-1.5">
                        <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                        {statusLabel}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className="flex -space-x-4">
                    {bid.products.map((product, index) => (
                    <div key={index} className="relative h-16 w-16 rounded-full border-2 border-background shadow-sm overflow-hidden" title={product.name}>
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    </div>
                    ))}
                </div>
                <div>
                     {bid.products.map((product, index) => (
                        <p key={index} className="text-sm font-medium truncate inline">{product.name}{index < bid.products.length -1 ? <Plus className="h-4 w-4 inline mx-1 text-muted-foreground" /> : ''}</p>
                    ))}
                    <p className="text-xs text-muted-foreground">Quantity: {bid.quantity} units</p>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4"/>
                        <span>{bid.responses.length} Vendor Responses</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <CountdownTimer expiryDate={bid.expiresAt} />
                    </div>
                </div>
            </CardContent>
             <CardContent>
                 <Dialog>
                    <DialogTrigger asChild>
                         <Button className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            View Bid
                        </Button>
                    </DialogTrigger>
                    <BidDetailsDialog bid={bid} />
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default function BidsPage() {
    const [bids] = useState<CorporateBid[]>(mockCorporateBids);

    const filteredBids = (status: CorporateBid['status'] | 'all') => {
        if (status === 'all') return bids;
        return bids.filter(bid => bid.status === status);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">My Bid Requests</h1>
                    <p className="text-muted-foreground">
                        Track the status of your active and past bid requests.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                         <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create New Bid
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl h-[90vh]">
                        <NewBidPage />
                    </DialogContent>
                </Dialog>
            </div>
            <Tabs defaultValue="active">
                <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="awarded">Awarded</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {filteredBids('Active').map((bid) => <BidCard key={bid.id} bid={bid} />)}
                        {filteredBids('Active').length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No active bids.</p>}
                    </div>
                </TabsContent>
                 <TabsContent value="expired">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {filteredBids('Expired').map((bid) => <BidCard key={bid.id} bid={bid} />)}
                         {filteredBids('Expired').length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No expired bids.</p>}
                    </div>
                </TabsContent>
                 <TabsContent value="awarded">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {filteredBids('Awarded').map((bid) => <BidCard key={bid.id} bid={bid} />)}
                         {filteredBids('Awarded').length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No awarded bids.</p>}
                    </div>
                </TabsContent>
                <TabsContent value="all">
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {filteredBids('all').map((bid) => <BidCard key={bid.id} bid={bid} />)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
