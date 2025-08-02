
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCorporateBids } from "@/lib/mock-data";
import type { CorporateBid } from "@/lib/types";
import Image from "next/image";
import { Clock, Eye, Gavel, Plus, Users, CheckCircle, Hourglass, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function CountdownTimer({ expiryDate }: { expiryDate: string }) {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryDate) - +new Date();
        let timeLeft = {};

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

    const timerComponents: any[] = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval as keyof typeof timeLeft]) {
            return;
        }

        timerComponents.push(
            <span key={interval}>
                {timeLeft[interval as keyof typeof timeLeft]}{interval.charAt(0)}
            </span>
        );
    });
    
    if(!timerComponents.length) {
        return <span className="text-destructive">Expired</span>;
    }

    return <>{timerComponents.join(' ')}</>;
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
                        <p key={index} className="text-sm font-medium truncate">{product.name}{index < bid.products.length -1 ? <Plus className="h-4 w-4 inline mx-1 text-muted-foreground" /> : ''}</p>
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
                <Button className="w-full" onClick={() => router.push(`/corporate/bids/${bid.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Bids
                </Button>
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">My Bid Requests</h1>
                <p className="text-muted-foreground">
                    Track the status of your active and past bid requests.
                </p>
            </div>
            <Tabs defaultValue="active">
                <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                    <TabsTrigger value="awarded">Awarded</TabsTrigger>
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
