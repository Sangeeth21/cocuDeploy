
"use client";

import { useState, useMemo, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockCorporateBids } from '@/lib/mock-data';
import type { CorporateBid, VendorBid } from '@/lib/types';
import { ArrowLeft, Clock, CheckCircle, Hourglass, XCircle, Gavel, Users, Info, Award, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


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

export default function BidDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;
    
    // In a real app, you'd fetch this data. For now, we find it in mock data.
    const [bid, setBid] = useState<CorporateBid | undefined>(() => mockCorporateBids.find(b => b.id === id));
    
    const getStatusInfo = (status: CorporateBid['status']) => {
        switch(status) {
            case 'Active': return { icon: Hourglass, color: 'text-blue-500', label: 'Active' };
            case 'Awarded': return { icon: CheckCircle, color: 'text-green-500', label: 'Awarded' };
            case 'Expired': return { icon: XCircle, color: 'text-destructive', label: 'Expired' };
            default: return { icon: Gavel, color: 'text-muted-foreground', label: 'Unknown' };
        }
    };

    const handleAwardBid = (vendor: VendorBid) => {
        if (!bid) return;
        setBid(prev => prev ? { ...prev, status: 'Awarded' } : undefined);
        toast({
            title: 'Bid Awarded!',
            description: `You have awarded the bid to ${vendor.alias}. They have been notified to proceed.`,
        });
    }

    if (!bid) {
        notFound();
    }

    const { icon: StatusIcon, color: statusColor, label: statusLabel } = getStatusInfo(bid.status);

    return (
        <div>
            <Button variant="outline" size="sm" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Bids
            </Button>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                         <CardHeader>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold font-headline font-mono">{bid.id}</h1>
                                    <p className="text-muted-foreground">Created on {new Date(bid.createdAt).toLocaleDateString()}</p>
                                </div>
                                <Badge variant={bid.status === 'Awarded' ? 'default' : 'secondary'} className="text-base">
                                    <StatusIcon className={`mr-2 h-4 w-4 ${statusColor}`} />
                                    {statusLabel}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="grid sm:grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Quantity</p>
                                    <p className="text-xl font-bold">{bid.quantity.toLocaleString()} units</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Responses</p>
                                    <p className="text-xl font-bold">{bid.responses.length}</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Time Left</p>
                                    <p className="text-xl font-bold"><CountdownTimer expiryDate={bid.expiresAt} /></p>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor Responses</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Price/Unit</TableHead>
                                        <TableHead>Delivery ETA</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bid.responses.map(res => (
                                        <TableRow key={res.vendorId}>
                                            <TableCell className="font-medium">{res.alias}</TableCell>
                                            <TableCell>${res.pricePerUnit.toFixed(2)}</TableCell>
                                            <TableCell>{res.estimatedDelivery}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                         <Button size="sm" disabled={bid.status !== 'Active'}>
                                                            <Award className="mr-2 h-4 w-4" /> Award
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Award Bid to {res.alias}?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will notify the vendor to proceed with the order at the quoted price of ${res.pricePerUnit.toFixed(2)} per unit. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleAwardBid(res)}>Confirm & Award</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {bid.responses.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                Awaiting vendor responses...
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 sticky top-24">
                     <Card>
                        <CardHeader>
                            <CardTitle>Products in Bid</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {bid.products.map(p => (
                                <div key={p.id} className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                        <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                                    </div>
                                    <p className="text-sm font-medium">{p.name}</p>
                                </div>
                            ))}
                        </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    );
}
