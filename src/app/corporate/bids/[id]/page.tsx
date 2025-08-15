
"use client";

import { useState, useMemo, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CorporateBid, VendorBid } from '@/lib/types';
import { ArrowLeft, Clock, CheckCircle, Hourglass, XCircle, Gavel, Users, Info, Award, MessageSquare, Package } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BrandedLoader } from '@/components/branded-loader';

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
        .filter(interval => timeLeft[interval] >= 0)
        .map(interval => (
            <span key={interval} className="font-semibold">{timeLeft[interval]}{interval.charAt(0)}</span>
        ));
    
    if (!timerComponents.length) {
        return <span className="text-destructive font-semibold">Expired</span>;
    }

    return <>{timerComponents.join(' ')}</>;
}

function RequestSamplesDialog({ bid }: { bid: CorporateBid }) {
    const { toast } = useToast();
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    
    const handleToggleProduct = (productId: string) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            if (prev.length < 3) {
                return [...prev, productId];
            }
            toast({
                variant: 'destructive',
                title: "Selection Limit Reached",
                description: "You can select a maximum of 3 products for samples."
            });
            return prev;
        })
    };
    
    const handleRequest = () => {
         toast({
            title: "Sample Request Sent!",
            description: `Vendors have been notified about your sample request for ${selectedProducts.length} product(s).`,
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><Package className="mr-2 h-4 w-4"/> Request Samples</Button>
            </DialogTrigger>
             <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Samples from Bid</DialogTitle>
                    <DialogDescription>
                        Select up to 3 products from this bid to request paid samples. Vendors will contact you with details.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {bid.products.map(p => (
                        <div key={p.id} className="flex items-center gap-4">
                            <Checkbox 
                                id={`sample-${p.id}`}
                                onCheckedChange={() => handleToggleProduct(p.id)}
                                checked={selectedProducts.includes(p.id)}
                            />
                            <Label htmlFor={`sample-${p.id}`} className="flex items-center gap-2 cursor-pointer">
                                <div className="relative h-10 w-10 flex-shrink-0">
                                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover rounded-md" />
                                </div>
                                <span className="text-xs font-medium">{p.name}</span>
                            </Label>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                         <Button onClick={handleRequest} disabled={selectedProducts.length === 0}>
                            Request {selectedProducts.length} Sample(s)
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function BidDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;
    
    const [bid, setBid] = useState<CorporateBid | undefined | null>(undefined);

    useEffect(() => {
        if (!id) return;
        const bidRef = doc(db, 'corporateBids', id);
        const unsubscribe = onSnapshot(bidRef, (docSnap) => {
            if (docSnap.exists()) {
                setBid({ id: docSnap.id, ...docSnap.data() } as CorporateBid);
            } else {
                setBid(null);
            }
        });
        return () => unsubscribe();
    }, [id]);
    
    const getStatusInfo = (status: CorporateBid['status']) => {
        switch(status) {
            case 'Active': return { icon: Hourglass, color: 'text-blue-500', label: 'Active' };
            case 'Awarded': return { icon: CheckCircle, color: 'text-green-500', label: 'Awarded' };
            case 'Expired': return { icon: XCircle, color: 'text-destructive', label: 'Expired' };
            default: return { icon: Gavel, color: 'text-muted-foreground', label: 'Unknown' };
        }
    };

    const handleAwardBid = async (vendor: VendorBid) => {
        if (!bid) return;
        const bidRef = doc(db, 'corporateBids', id);
        try {
            await updateDoc(bidRef, { status: 'Awarded', awardedTo: vendor.vendorId });
            toast({
                title: 'Bid Awarded!',
                description: `You have awarded the bid to ${vendor.alias}. They have been notified to proceed.`,
            });
        } catch (error) {
            console.error("Error awarding bid:", error);
            toast({ variant: 'destructive', title: 'Failed to award bid.' });
        }
    }

    if (bid === undefined) {
        return <BrandedLoader />;
    }

    if (bid === null) {
        notFound();
    }

    const { icon: StatusIcon, color: statusColor, label: statusLabel } = getStatusInfo(bid.status);
    const awardedVendor = bid.status === 'Awarded' ? bid.responses.find(r => r.vendorId === bid.awardedTo) : null;

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
                                <div className="flex items-center gap-2">
                                     <RequestSamplesDialog bid={bid} />
                                    <Badge variant={bid.status === 'Awarded' ? 'default' : 'secondary'} className="text-base">
                                        <StatusIcon className={`mr-2 h-4 w-4 ${statusColor}`} />
                                        {statusLabel}
                                    </Badge>
                                </div>
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
                                        <TableRow key={res.vendorId} className={awardedVendor?.vendorId === res.vendorId ? "bg-green-100/50 dark:bg-green-900/20" : ""}>
                                            <TableCell className="font-medium">{res.alias} {awardedVendor?.vendorId === res.vendorId && <span className="text-green-600 font-bold">(Awarded)</span>}</TableCell>
                                            <TableCell>${res.pricePerUnit.toFixed(2)}</TableCell>
                                            <TableCell>{res.estimatedDelivery}</TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                {bid.status === 'Awarded' && awardedVendor?.vendorId === res.vendorId && (
                                                    <Button size="sm" variant="secondary"><MessageSquare className="mr-2 h-4 w-4" /> Chat</Button>
                                                )}
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
