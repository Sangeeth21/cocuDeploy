
"use client";

import { useState, useMemo } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { mockProducts } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';

export default function QuoteRequestPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;
    const product = useMemo(() => mockProducts.find((p) => p.id === id), [id]);

    const [quantity, setQuantity] = useState(product?.moq || 100);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const estimatedPrice = useMemo(() => {
        if (!product || !product.tierPrices) return product?.price || 0;
        const applicableTier = product.tierPrices
            .slice()
            .sort((a, b) => b.quantity - a.quantity)
            .find(tier => quantity >= tier.quantity);
        return applicableTier ? applicableTier.price : product.price;
    }, [product, quantity]);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setQuantity(isNaN(value) ? 0 : value);
    };

    const handleSubmitQuote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        if (quantity < product.moq!) {
            toast({
                variant: 'destructive',
                title: 'Quantity Too Low',
                description: `The minimum order quantity for this product is ${product.moq}.`,
            });
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: 'Quote Request Submitted!',
                description: `Your request for ${product.name} has been sent to the vendor.`,
            });
            router.push('/corporate/dashboard');
        }, 1500);
    };

    if (!product || !product.b2bEnabled) {
        notFound();
    }

    return (
        <>
             <Button variant="outline" size="sm" className="mb-4" asChild>
                <Link href="/corporate/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
                </Link>
            </Button>
            <form onSubmit={handleSubmitQuote}>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-headline">Request a Quote</CardTitle>
                                <CardDescription>Provide details for your bulk order inquiry.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input 
                                        id="quantity" 
                                        type="number" 
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        min={product.moq}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Minimum Order Quantity (MOQ): {product.moq} units
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Customization & Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Describe your customization needs, desired delivery date, or any other special requirements..."
                                        rows={5}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8 sticky top-24">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-20 h-20 rounded-md overflow-hidden">
                                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground">{product.category}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground">Estimated Price per Unit</p>
                                    <p className="text-3xl font-bold">${estimatedPrice.toFixed(2)}</p>
                                </div>
                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-4 w-4" />
                                    )}
                                    Submit Quote Request
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </>
    );
}
