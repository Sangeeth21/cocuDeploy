
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { mockProducts } from "@/lib/mock-data";
import { useSearchParams, notFound, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Bot, Check, Info, Loader2, Save, ThumbsDown, ThumbsUp, X } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const mockFreebies = [
    { id: 'fb001', name: 'Branded Keychain', cost: 15, stock: 100 },
    { id: 'fb002', name: 'Premium Note Card', cost: 20, stock: 50 },
    { id: 'fb003', name: 'Discount Coupon', cost: 25, stock: 0 }, // Out of stock
    { id: 'fb004', name: 'Artisan Chocolate Bar', cost: 40, stock: 20 },
];

type AISuggestion = {
    model: string;
    suggestedSP: number;
    suggestedDiscount: number;
    reasoning: string;
}

const mockAISuggestions: AISuggestion[] = [
    { model: 'Gemini', suggestedSP: 499, suggestedDiscount: 10, reasoning: 'Competitive pricing based on market data. A 10% discount aligns with launch offers for similar products.' },
    { model: 'ChatGPT', suggestedSP: 529, suggestedDiscount: 15, reasoning: 'Slightly premium positioning. Higher discount to attract initial buyers and reviews.' },
    { model: 'Claude', suggestedSP: 479, suggestedDiscount: 5, reasoning: 'Aggressive pricing to capture market share quickly. Lower discount maintains perceived value.' },
];

export default function SmartPricingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const productId = searchParams.get('productId');

    // Find product immediately. If not found, this will be null.
    const product = useMemo(() => {
        if (!productId) return null;
        return mockProducts.find(p => p.id === productId) || null;
    }, [productId]);

    // Form State with safe defaults
    const [vendorSP, setVendorSP] = useState<number>(0);
    const [platformBuffer, setPlatformBuffer] = useState<number>(15);
    const [discount, setDiscount] = useState<number>(0);
    const [finalSP, setFinalSP] = useState<number>(0);
    const [selectedFreebies, setSelectedFreebies] = useState<string[]>([]);
    
    // Control flow state
    const [isCalculating, setIsCalculating] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [needsRecalculation, setNeedsRecalculation] = useState(true);

    // Costs
    const pgFeesRate = 0.03; // 3%
    const logisticsCost = 50;
    const payoutFee = 30;
    const razorpayFee = 15;
    const platformCommissionRate = 0.05; // 5%

    // Effect to safely set initial state once product is loaded
    useEffect(() => {
        if (product) {
            setVendorSP(product.price || 0);
            setNeedsRecalculation(true); 
        }
    }, [product]);

     // Recalculate finalSP whenever its core dependencies change
    useEffect(() => {
        const mrp = vendorSP * (1 + platformBuffer / 100);
        const newFinalSP = mrp * (1 - discount / 100);
        setFinalSP(newFinalSP);
    }, [vendorSP, platformBuffer, discount]);


    // Effect to flag for recalculation anytime a pricing input changes
    useEffect(() => {
        setNeedsRecalculation(true);
    }, [vendorSP, platformBuffer, discount, selectedFreebies]);

    const freebieCost = useMemo(() => {
        return selectedFreebies.reduce((total, fbId) => {
            const freebie = mockFreebies.find(f => f.id === fbId);
            return total + (freebie?.cost || 0);
        }, 0);
    }, [selectedFreebies]);

    const calculations = useMemo(() => {
        const mrp = vendorSP * (1 + platformBuffer / 100);
        const pgFee = finalSP * pgFeesRate;
        const platformCommission = vendorSP * platformCommissionRate;
        const totalExpenses = logisticsCost + freebieCost + pgFee + payoutFee + platformCommission + razorpayFee;
        const platformProfit = finalSP - vendorSP - totalExpenses;
        const netMargin = finalSP > 0 ? (platformProfit / finalSP) * 100 : 0;
        return { mrp, finalPrice: finalSP, pgFee, platformCommission, totalExpenses, platformProfit, netMargin };
    }, [vendorSP, platformBuffer, finalSP, freebieCost, platformCommissionRate]);

    const handleSendToAI = () => {
        if(selectedFreebies.length === 0) {
            toast({ variant: 'destructive', title: 'Please select at least one freebie before sending to AI.'});
            return;
        }
        setIsCalculating(true);
        setTimeout(() => {
            setShowSuggestions(true);
            setIsCalculating(false);
            toast({ title: 'AI Suggestions Received', description: 'Select a suggestion or adjust manually.'});
        }, 1500);
    }
    
    const handleSelectSuggestion = (suggestion: AISuggestion) => {
        const mrp = vendorSP * (1 + platformBuffer / 100);
        const suggestedFinalSP = suggestion.suggestedSP;
        const suggestedDiscount = mrp > 0 ? ((mrp - suggestedFinalSP) / mrp) * 100 : 0;
        
        setFinalSP(suggestedFinalSP);
        setDiscount(parseFloat(suggestedDiscount.toFixed(2)));
    }

    const handleRecalculate = () => {
        setNeedsRecalculation(false);
        toast({ title: 'Margin Recalculated', description: 'You can now approve the new pricing.'});
    }
    
    const isMarginLow = calculations.netMargin < 11;
    const isApproveDisabled = isMarginLow || needsRecalculation;

    // Guard clause: If product isn't found, render the 404 page.
    if (!product) {
        return notFound();
    }

    return (
        <div>
            <Button variant="outline" size="sm" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Button>
            <div className="mb-4">
                <h1 className="text-3xl font-bold font-headline">Smart Pricing Engine</h1>
                <p className="text-muted-foreground">Review and set the optimal price for products.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Product Name</p>
                                    <p className="font-semibold">{product.name}</p>
                                </div>
                                 <div>
                                    <p className="text-sm text-muted-foreground">Product ID</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                             <p className="font-semibold text-primary cursor-pointer hover:underline">{product.id}</p>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-2xl">
                                            <DialogHeader><DialogTitle>Full Product Details</DialogTitle></DialogHeader>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                 <Image src={product.imageUrl} alt={product.name} width={300} height={300} className="rounded-lg" data-ai-hint="product image" />
                                                 <div>
                                                     <h3 className="font-bold">{product.name}</h3>
                                                     <p className="text-sm text-muted-foreground">{product.description}</p>
                                                 </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                 <div>
                                    <p className="text-sm text-muted-foreground">Vendor SP</p>
                                    <p className="font-semibold">${product.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-semibold"><Badge variant="destructive">{product.status}</Badge></p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                             <CardTitle>Admin Inputs</CardTitle>
                             <CardDescription>Provide optional inputs to guide the AI pricing models.</CardDescription>
                        </CardHeader>
                         <CardContent className="grid sm:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Competitor Price Range</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="Min $" type="number"/>
                                    <Input placeholder="Max $" type="number"/>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label>Competitor Discount %</Label>
                                <Input placeholder="e.g., 15" type="number"/>
                             </div>
                             <div className="space-y-2">
                                <Label>Estimated Delivery Time (EDT)</Label>
                                <Input placeholder="e.g., 3-5 days" />
                             </div>
                              <div className="space-y-2">
                                <Label>Offer Type</Label>
                                <Input placeholder="e.g., Festival, Launch Offer" />
                             </div>
                             <div className="sm:col-span-2 space-y-2">
                                 <Label>Freebie Selection</Label>
                                <Select onValueChange={(value) => setSelectedFreebies([value])}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select freebies to offer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                        {mockFreebies.map(fb => (
                                            <SelectItem key={fb.id} value={fb.id} disabled={fb.stock === 0}>
                                                {fb.name} (Cost: ${fb.cost}) {fb.stock === 0 && '(Out of Stock)'}
                                            </SelectItem>
                                        ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                             </div>
                         </CardContent>
                         <CardFooter>
                              <Button onClick={handleSendToAI} disabled={isCalculating || selectedFreebies.length === 0}>
                                {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
                                {isCalculating ? 'Asking AI...' : 'Send to AI'}
                            </Button>
                         </CardFooter>
                    </Card>
                    
                    {showSuggestions && (
                         <Card>
                            <CardHeader>
                                <CardTitle>AI Suggestion Panel</CardTitle>
                                <CardDescription>Choose a suggestion below to auto-fill the pricing, or adjust manually.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-3 gap-4">
                                {mockAISuggestions.map(suggestion => (
                                     <Card key={suggestion.model} className="flex flex-col">
                                         <CardHeader>
                                             <CardTitle className="text-lg">{suggestion.model}</CardTitle>
                                         </CardHeader>
                                         <CardContent className="flex-grow">
                                             <p><span className="font-semibold">Suggested SP:</span> ${suggestion.suggestedSP.toFixed(2)}</p>
                                             <p><span className="font-semibold">Discount %:</span> {suggestion.suggestedDiscount}%</p>
                                             <p className="text-xs text-muted-foreground mt-2">{suggestion.reasoning}</p>
                                         </CardContent>
                                         <CardFooter>
                                             <Button size="sm" className="w-full" onClick={() => handleSelectSuggestion(suggestion)}>Select</Button>
                                         </CardFooter>
                                     </Card>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-1 lg:sticky top-24 space-y-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Margin Calculation</CardTitle>
                            <CardDescription>Review the final pricing and margin breakdown.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Vendor SP</TableCell>
                                        <TableCell className="text-right"><Input className="w-24 h-8 text-right" value={vendorSP} onChange={e => setVendorSP(Number(e.target.value))} /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Platform Buffer (%)</TableCell>
                                        <TableCell className="text-right"><Input className="w-24 h-8 text-right" value={platformBuffer} onChange={e => setPlatformBuffer(Number(e.target.value))} /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>MRP (Auto-calculated)</TableCell>
                                        <TableCell className="text-right font-semibold">${calculations.mrp.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Discount (%)</TableCell>
                                        <TableCell className="text-right"><Input className="w-24 h-8 text-right" value={discount} onChange={e => setDiscount(Number(e.target.value))}/></TableCell>
                                    </TableRow>
                                    <TableRow className="bg-muted/50">
                                        <TableCell>Final Selling Price</TableCell>
                                        <TableCell className="text-right font-bold">${finalSP.toFixed(2)}</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell className="text-muted-foreground text-xs">PG Fees (3%)</TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs">- ${calculations.pgFee.toFixed(2)}</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell className="text-muted-foreground text-xs">Logistics Cost</TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs">- ${logisticsCost.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-muted-foreground text-xs">Freebie Cost</TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs">- ${freebieCost.toFixed(2)}</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell className="text-muted-foreground text-xs">Platform Commission</TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs">- ${calculations.platformCommission.toFixed(2)}</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell className="text-muted-foreground text-xs">Payout & Razorpay Fees</TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs">- ${(payoutFee + razorpayFee).toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow className="font-bold border-t-2">
                                        <TableCell>Net Margin</TableCell>
                                        <TableCell className={cn("text-right", isMarginLow ? "text-destructive" : "text-green-600")}>
                                            {needsRecalculation ? '...' : `${calculations.netMargin.toFixed(2)}%`}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                     {needsRecalculation && (
                         <Alert variant="default" className="bg-yellow-100 border-yellow-300 dark:bg-yellow-950">
                             <Info className="h-4 w-4" />
                            <AlertTitle>Recalculation Needed</AlertTitle>
                            <AlertDescription>
                                Pricing fields have been edited. Click Recalculate to verify the new margin.
                            </AlertDescription>
                        </Alert>
                     )}
                    {isMarginLow && !needsRecalculation && (
                        <Alert variant="destructive">
                             <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Margin Alert</AlertTitle>
                            <AlertDescription>
                                Net margin is below the required 11%. Approval is disabled.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                       <Button onClick={handleRecalculate} disabled={!needsRecalculation}>
                           <Save className="mr-2 h-4 w-4"/> Recalculate
                       </Button>
                        <Button disabled={isApproveDisabled}><Check className="mr-2 h-4 w-4"/> Approve</Button>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline"><X className="mr-2 h-4 w-4"/> Edit Again</Button>
                        <Button variant="destructive"><ThumbsDown className="mr-2 h-4 w-4"/> Reject</Button>
                     </div>
                </div>
            </div>
        </div>
    )
}
