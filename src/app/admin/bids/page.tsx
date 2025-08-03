
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { mockCorporateBids, mockUsers } from "@/lib/mock-data";
import { MoreHorizontal, Search, Gavel, Users, Clock, Trash2, ShieldAlert, Plus, CheckCircle, Hourglass, XCircle, AlertTriangle } from 'lucide-react';
import type { CorporateBid, VendorBid } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function BidDetailsDialog({ bid }: { bid: CorporateBid }) {
    const { toast } = useToast();
    const customer = mockUsers.find(u => u.name === "Corporate Client" || u.id === bid.responses[0]?.vendorId); // Placeholder logic

    const handleFlagBid = () => {
        toast({ variant: 'destructive', title: 'Bid Flagged', description: `Bid ${bid.id} has been flagged for review.` });
    };

    const handleDeleteBid = () => {
        toast({ variant: 'destructive', title: 'Bid Deleted', description: `Bid ${bid.id} has been permanently deleted.` });
    };

    return (
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Bid Details: {bid.id}</DialogTitle>
                <DialogDescription>
                    Review all vendor responses for this bid request.
                </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-3 gap-6 py-4 max-h-[70vh] overflow-y-auto">
                <div className="md:col-span-1 space-y-4">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Bid Info</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Customer</span>
                                <span>{customer?.name || 'Corporate Client'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Expires</span>
                                <span>{new Date(bid.expiresAt).toLocaleString()}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity</span>
                                <span>{bid.quantity} units</span>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Products in Bid</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {bid.products.map((p, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="relative h-10 w-10 rounded-md overflow-hidden"><Image src={p.imageUrl} alt={p.name} fill className="object-cover" /></div>
                                    <p className="text-xs font-medium truncate">{p.name}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                             <CardTitle className="text-base">Moderation Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                             <Button variant="outline" size="sm" onClick={handleFlagBid}><ShieldAlert className="mr-2 h-4 w-4"/>Flag Bid</Button>
                             <Button variant="destructive" size="sm" onClick={handleDeleteBid}><Trash2 className="mr-2 h-4 w-4"/>Delete Entry</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-base">Vendor Responses ({bid.responses.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Price/Unit</TableHead>
                                        <TableHead>Delivery ETA</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bid.responses.map(res => (
                                        <TableRow key={res.vendorId}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8"><AvatarImage src={res.vendorAvatar} /><AvatarFallback>{res.vendorName.charAt(0)}</AvatarFallback></Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{res.vendorName}</span>
                                                        <span className="text-xs text-muted-foreground">{res.vendorId}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>${res.pricePerUnit.toFixed(2)}</TableCell>
                                            <TableCell>{res.estimatedDelivery}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DialogContent>
    );
}


export default function AdminBidsPage() {
    const [bids] = useState<CorporateBid[]>(mockCorporateBids);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const filteredBids = useMemo(() => {
        let filtered = bids;
        if (activeTab !== 'all') {
            filtered = filtered.filter(b => b.status.toLowerCase() === activeTab);
        }
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(b => 
                b.id.toLowerCase().includes(lowercasedFilter) ||
                b.responses.some(r => r.vendorName.toLowerCase().includes(lowercasedFilter))
            );
        }
        return filtered;
    }, [bids, activeTab, searchTerm]);

    const getStatusInfo = (status: CorporateBid['status']) => {
        switch(status) {
            case 'Active': return { icon: Hourglass, variant: 'secondary' as const, label: 'Active' };
            case 'Awarded': return { icon: CheckCircle, variant: 'default' as const, label: 'Awarded' };
            case 'Expired': return { icon: XCircle, variant: 'outline' as const, label: 'Expired' };
            default: return { icon: Gavel, variant: 'secondary' as const, label: 'Unknown' };
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Corporate Bids</h1>
                    <p className="text-muted-foreground">Monitor and manage all corporate bid requests.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center gap-4">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="awarded">Awarded</TabsTrigger>
                        <TabsTrigger value="expired">Expired</TabsTrigger>
                    </TabsList>
                     <div className="ml-auto flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Bid ID or Vendor..."
                                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                 <TabsContent value={activeTab}>
                    <Card className="mt-4">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bid ID</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Responses</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBids.map(bid => {
                                        const { icon: StatusIcon, variant: statusVariant, label: statusLabel } = getStatusInfo(bid.status);
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
                                            <TableCell className="text-right">{bid.responses.length}</TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Toggle menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DialogTrigger asChild><DropdownMenuItem>View Details</DropdownMenuItem></DialogTrigger>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <BidDetailsDialog bid={bid} />
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    