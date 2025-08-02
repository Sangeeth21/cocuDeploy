
"use client";

import { useState, useMemo, useCallback } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import type { CustomizationArea } from '@/lib/types';


type CustomizationValues = {
    [areaId: string]: string;
};

type ImageSide = "front" | "back" | "left" | "right" | "top" | "bottom";

const imageSides: ImageSide[] = ["front", "back", "left", "right", "top", "bottom"];

export default function CorporateCustomizePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;
    const product = useMemo(() => mockProducts.find((p) => p.id === id), [id]);

    const firstCustomizableSide = useMemo(() => {
        if (!product?.customizationAreas) return "front";
        return imageSides.find(side => product.customizationAreas![side]?.length) || "front";
    }, [product]);

    const [activeSide, setActiveSide] = useState<ImageSide>(firstCustomizableSide);
    const [quantity, setQuantity] = useState(product?.moq || 100);
    const [notes, setNotes] = useState("");
    const [customizationValues, setCustomizationValues] = useState<CustomizationValues>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCustomizationChange = (areaId: string, value: string) => {
        setCustomizationValues(prev => ({ ...prev, [areaId]: value }));
    };

    const estimatedPrice = useMemo(() => {
        if (!product || !product.tierPrices) return product?.price || 0;
        const applicableTier = product.tierPrices
            .slice()
            .sort((a, b) => b.quantity - a.quantity)
            .find(tier => quantity >= tier.quantity);
        return applicableTier ? applicableTier.price : product.price;
    }, [product, quantity]);

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
    
    const allCustomizationAreas = useMemo(() => {
        if (!product.customizationAreas) return [];
        return imageSides.flatMap(side => 
            (product.customizationAreas?.[side] || []).map(area => ({ ...area, side }))
        );
    }, [product.customizationAreas]);

    const currentSideAreas = product.customizationAreas?.[activeSide] || [];
    
    const CustomizationPreview = () => (
         <div className="relative w-full h-full">
            <Image src={product.images?.[imageSides.indexOf(activeSide)] || product.imageUrl} alt={`${product.name} ${activeSide} view`} fill className="object-contain" />
            {currentSideAreas.map((area: CustomizationArea) => (
                 <div
                    key={area.id}
                    className="absolute border-2 border-dashed border-primary/70 bg-primary/10 pointer-events-none flex items-center justify-center p-1"
                    style={{
                        left: `${area.x}%`,
                        top: `${area.y}%`,
                        width: `${area.width}%`,
                        height: `${area.height}%`,
                        fontFamily: area.fontFamily,
                        fontSize: `${area.fontSize}px`,
                        fontWeight: area.fontWeight as any,
                        color: area.textColor,
                        borderRadius: area.shape === 'ellipse' ? '50%' : '0'
                    }}
                 >
                    <span className="truncate w-full h-full text-center">
                        {customizationValues[area.id] || area.label}
                    </span>
                 </div>
            ))}
        </div>
    );

    return (
         <div className="container py-12">
             <Button variant="outline" size="sm" className="mb-4" asChild>
                <Link href={`/corporate/products/${product.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Product
                </Link>
            </Button>
            <form onSubmit={handleSubmitQuote}>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                         <Card>
                             <CardHeader>
                                <CardTitle className="text-2xl font-headline">Live Preview</CardTitle>
                                <CardDescription>Your customizations will appear here instantly.</CardDescription>
                            </CardHeader>
                             <CardContent className="h-96">
                                <CustomizationPreview />
                            </CardContent>
                             <CardContent>
                               <Tabs value={activeSide} onValueChange={(value) => setActiveSide(value as ImageSide)}>
                                    <TabsList className="grid w-full grid-cols-6">
                                        {imageSides.map(side => (
                                             <TabsTrigger key={side} value={side} disabled={!product.customizationAreas?.[side] || product.customizationAreas[side]!.length === 0} className="capitalize">
                                                {side}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-headline">Enter Details</CardTitle>
                                <CardDescription>Fill out the customization fields and desired quantity.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <div className="space-y-4">
                                {allCustomizationAreas.map(area => (
                                    <div key={area.id}>
                                        <Label htmlFor={area.id}>{area.label} ({area.side})</Label>
                                        <Input
                                            id={area.id}
                                            placeholder={`Enter text for ${area.label}...`}
                                            value={customizationValues[area.id] || ''}
                                            onChange={(e) => handleCustomizationChange(area.id, e.target.value)}
                                            maxLength={area.maxLength}
                                        />
                                    </div>
                                ))}
                               </div>
                               <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Special instructions, desired delivery date, etc..."
                                        rows={4}
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
                                <CardTitle>Quote Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input 
                                        id="quantity" 
                                        type="number" 
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        min={product.moq}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Minimum Order Quantity (MOQ): {product.moq} units
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground">Estimated Price per Unit</p>
                                    <p className="text-3xl font-bold">${estimatedPrice.toFixed(2)}</p>
                                </div>
                                 <div className="p-4 bg-muted/50 rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground">Estimated Total</p>
                                    <p className="text-3xl font-bold">${(estimatedPrice * quantity).toFixed(2)}</p>
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
        </div>
    );
}
