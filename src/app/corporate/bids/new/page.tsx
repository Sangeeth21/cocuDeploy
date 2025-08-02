
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockProducts } from '@/lib/mock-data';
import type { DisplayProduct } from '@/lib/types';
import { ArrowLeft, Search, X, Package, DollarSign, Save, Trash2, CheckCircle, PlusCircle, Link as LinkIcon, Truck, Building, Copy, Loader2, Calendar, Clock, FileUp, Users } from "lucide-react";
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type GroupedProduct = {
    name: string;
    category: string;
    imageUrl: string;
    vendorCount: number;
    lowestMoq?: number;
    priceRange: [number, number];
};

export default function NewBidPage() {
    const router = useRouter();
    const { toast } = useToast();

    // State
    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<GroupedProduct[]>([]);
    const [quantity, setQuantity] = useState(100);
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const [deliveryPreference, setDeliveryPreference] = useState("");
    const [biddingDuration, setBiddingDuration] = useState<"24" | "48">("24");
    const [notes, setNotes] = useState("");
    const [brief, setBrief] = useState<File | null>(null);

    const groupedProducts = useMemo(() => {
        const productMap = new Map<string, { product: DisplayProduct, count: number, moqs: number[], prices: number[] }>();

        mockProducts.forEach(p => {
            if (!p.b2bEnabled) return;
            const existing = productMap.get(p.name);
            if (existing) {
                existing.count++;
                if (p.moq) existing.moqs.push(p.moq);
                existing.prices.push(p.price);
            } else {
                productMap.set(p.name, {
                    product: p,
                    count: 1,
                    moqs: p.moq ? [p.moq] : [],
                    prices: [p.price],
                });
            }
        });
        
        const results: GroupedProduct[] = [];
        productMap.forEach(({ product, count, moqs, prices }) => {
            results.push({
                name: product.name,
                category: product.category,
                imageUrl: product.imageUrl,
                vendorCount: count,
                lowestMoq: moqs.length > 0 ? Math.min(...moqs) : undefined,
                priceRange: [Math.min(...prices), Math.max(...prices)],
            });
        });

        return results;
    }, []);

    const productSearchResults = useMemo(() => {
        if (!productSearchTerm) return [];
        let results = groupedProducts.filter(p =>
            p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
        );

        // If products are already selected, filter results to match their category
        if (selectedProducts.length > 0) {
            const category = selectedProducts[0].category;
            results = results.filter(p => p.category === category);
        }

        return results;
    }, [productSearchTerm, selectedProducts, groupedProducts]);
    
    const handleProductSelect = (product: GroupedProduct) => {
        if (selectedProducts.length > 0 && selectedProducts[0].category !== product.category) {
            toast({
                variant: 'destructive',
                title: 'Category Mismatch',
                description: 'You can only select products from the same category for a single bid.',
            });
            return;
        }

        if (selectedProducts.length >= 4) {
             toast({
                variant: 'destructive',
                title: 'Selection Limit Reached',
                description: 'You can select a maximum of 4 products per bid.',
            });
            return;
        }

        if (!selectedProducts.find(p => p.name === product.name)) {
            setSelectedProducts(prev => [...prev, product]);
        }
        setProductSearchTerm("");
    };

    const handleRemoveProduct = (productName: string) => {
        setSelectedProducts(prev => prev.filter(p => p.name !== productName));
    }
    
    const handleCreateBid = () => {
        toast({
            title: "Bid Submitted!",
            description: "Vendors have been notified and will respond within your selected timeframe.",
        });
        router.push("/corporate/bids");
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Create New Bid Request</h1>
                <p className="text-muted-foreground">Select products and specify your requirements to receive competitive bids from vendors.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Product Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Products</CardTitle>
                            <CardDescription>
                                Choose up to 4 products from the same category for this bid request. Your bid will be sent to all vendors who offer these items.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="relative mb-4">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input
                                   placeholder="Search for a product type (e.g., 'Leather Watch')..."
                                   className="pl-8"
                                   value={productSearchTerm}
                                   onChange={(e) => setProductSearchTerm(e.target.value)}
                               />
                                {productSearchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        <ul>
                                            {productSearchResults.map(product => (
                                                <li key={product.name} className="p-2 hover:bg-accent cursor-pointer flex items-center gap-3" onClick={() => handleProductSelect(product)}>
                                                    <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-sm" />
                                                    <div className='flex-1'>
                                                        <p className="text-sm font-medium">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{product.category}</p>
                                                    </div>
                                                    <Badge variant="secondary">{product.vendorCount} Vendors</Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                {selectedProducts.length > 0 ? (
                                    selectedProducts.map(item => (
                                        <div key={item.name} className="flex items-center gap-4 p-2 border rounded-md">
                                            <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md" />
                                            <div className="flex-grow">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.category}</p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                    <div className="flex items-center gap-1.5"><Users className="h-3 w-3" />{item.vendorCount} Vendors</div>
                                                    {item.lowestMoq && <div className="flex items-center gap-1.5"><Truck className="h-3 w-3" />Lowest MOQ: {item.lowestMoq}</div>}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.name)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">No products selected.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bid Details */}
                    <Card>
                         <CardHeader>
                            <CardTitle>Bid Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity (per product)</Label>
                                <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Delivery Location</Label>
                                <Input id="location" placeholder="e.g., City, State, ZIP" value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} />
                            </div>
                             <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="eta">Delivery Preference (ETA)</Label>
                                <Input id="eta" placeholder="e.g., 'Within 2 weeks', 'Before end of month'" value={deliveryPreference} onChange={e => setDeliveryPreference(e.target.value)} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Bidding Duration</Label>
                                 <RadioGroup value={biddingDuration} onValueChange={(v) => setBiddingDuration(v as any)} className="flex gap-4">
                                    <Label htmlFor="24h" className="flex items-center gap-2 p-3 border rounded-md cursor-pointer flex-1">
                                        <RadioGroupItem value="24" id="24h" />
                                        <Clock className="h-4 w-4" /> 24 Hours
                                    </Label>
                                     <Label htmlFor="48h" className="flex items-center gap-2 p-3 border rounded-md cursor-pointer flex-1">
                                        <RadioGroupItem value="48" id="48h" />
                                        <Clock className="h-4 w-4" /> 48 Hours
                                    </Label>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 sticky top-24 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" placeholder="Any special instructions or details for vendors..." value={notes} onChange={e => setNotes(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brief">Upload Brief (Optional)</Label>
                                <label htmlFor="brief" className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/50">
                                    <FileUp className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground truncate">{brief ? brief.name : "Upload a file..."}</span>
                                </label>
                                <Input id="brief" type="file" className="sr-only" onChange={(e) => e.target.files && setBrief(e.target.files[0])} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Submit Bid</CardTitle>
                             <CardDescription>Your request will be sent to all relevant vendors.</CardDescription>
                         </CardHeader>
                         <CardContent>
                            <Button className="w-full" onClick={handleCreateBid} disabled={selectedProducts.length === 0}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Submit Bid Request
                            </Button>
                         </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    );
}
