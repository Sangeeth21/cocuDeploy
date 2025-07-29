
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockProducts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { CustomizationArea, CustomizationValue } from "@/lib/types";
import { ArrowLeft, CheckCircle, ShoppingCart, Wand2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

type ImageSide = "front" | "back" | "left" | "right" | "top" | "bottom";

const imageSides: ImageSide[] = ["front", "back", "left", "right", "top", "bottom"];

export default function CustomizeProductPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToCart } = useCart();
    const { toast } = useToast();

    const id = params.id as string;
    const product = useMemo(() => mockProducts.find((p) => p.id === id), [id]);

    const [activeSide, setActiveSide] = useState<ImageSide>("front");
    const [customizations, setCustomizations] = useState<{ [key: string]: CustomizationValue }>({});

    useEffect(() => {
        // Set the initial active side to the first one that has an image
        if (product) {
            const firstAvailableSide = imageSides.find(side => product.images?.[imageSides.indexOf(side)]);
            if (firstAvailableSide) {
                setActiveSide(firstAvailableSide);
            }
        }
    }, [product]);

    const handleCustomizationChange = (areaId: string, value: CustomizationValue) => {
        setCustomizations(prev => ({ ...prev, [areaId]: value }));
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({ product, customizations });
        toast({
            title: "Customized Product Added!",
            description: `${product.name} has been added to your cart.`,
        });

        if (searchParams.get('buyNow') === 'true') {
            router.push('/checkout');
        } else {
            router.push('/cart');
        }
    };

    if (!product) {
        notFound();
    }
    
    const currentCustomizationAreas = product.customizationAreas?.[activeSide] || [];

    const CustomizationRenderer = ({ areas, productSrc }: { areas: CustomizationArea[], productSrc: string }) => {
        return (
            <div className="relative w-full h-full">
                <Image src={productSrc} alt={`${product.name} ${activeSide} view`} fill className="object-contain" />
                {areas.map(area => {
                    const value = customizations[area.id] as string || "";
                    
                    const SlicedText = () => (
                        <div style={{
                            position: 'absolute',
                            left: `${area.x}%`,
                            top: `${area.y}%`,
                            width: `${area.width}%`,
                            height: `${area.height}%`,
                            perspective: '500px',
                            transformStyle: 'preserve-3d',
                        }}>
                             <div className="w-full h-full flex items-center justify-center p-1 text-center"
                                style={{
                                    fontFamily: area.fontFamily,
                                    fontSize: `${area.fontSize}px`,
                                    fontWeight: area.fontWeight as React.CSSProperties['fontWeight'],
                                    color: area.textColor,
                                }}>
                                {value}
                            </div>
                        </div>
                    );

                    return <SlicedText key={area.id} />;
                })}
            </div>
        )
    }

    return (
        <div className="container py-12">
            <Button variant="outline" size="sm" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Product
            </Button>
            <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="lg:sticky top-24">
                    <Card>
                        <CardContent className="p-2">
                             <div className="aspect-square w-full bg-muted/20 rounded-lg flex items-center justify-center">
                                 {product.images?.[imageSides.indexOf(activeSide)] ? (
                                    <CustomizationRenderer 
                                        areas={currentCustomizationAreas} 
                                        productSrc={product.images[imageSides.indexOf(activeSide)]}
                                    />
                                 ) : (
                                    <p className="text-muted-foreground">No preview available</p>
                                 )}
                            </div>
                        </CardContent>
                    </Card>
                    <div className="mt-2">
                         <Tabs value={activeSide} onValueChange={(value) => setActiveSide(value as ImageSide)}>
                            <TabsList className="grid w-full grid-cols-6 h-auto p-1">
                                {imageSides.map(side => {
                                    const hasImage = !!product.images?.[imageSides.indexOf(side)];
                                    return (
                                        <TabsTrigger 
                                            key={side} 
                                            value={side} 
                                            className="capitalize aspect-square h-full w-full p-0 flex-col gap-1 text-xs"
                                            disabled={!hasImage}
                                        >
                                            <div className="relative w-10 h-10">
                                                {hasImage ? 
                                                    <Image src={product.images![imageSides.indexOf(side)]} alt={`${side} view thumbnail`} fill className="object-cover rounded-sm" /> 
                                                    : <div className="w-full h-full bg-muted rounded-sm"/>
                                                }
                                            </div>
                                            {side}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Wand2 className="text-primary"/> Personalize Your Product
                            </CardTitle>
                            <CardDescription>Add your custom text to the designated areas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {currentCustomizationAreas.length > 0 ? (
                                currentCustomizationAreas.map(area => (
                                    <div key={area.id} className="space-y-2">
                                        <Label htmlFor={area.id}>{area.label}</Label>
                                        <Input
                                            id={area.id}
                                            placeholder={`Enter text for ${area.label.toLowerCase()}...`}
                                            value={(customizations[area.id] as string) || ""}
                                            onChange={(e) => handleCustomizationChange(area.id, e.target.value)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No customizable areas defined for this side of the product.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle className="font-headline">Finalize & Purchase</CardTitle>
                         </CardHeader>
                         <CardContent className="flex flex-col gap-2">
                             <div className="flex justify-between items-baseline">
                                <span className="text-muted-foreground">Product Price</span>
                                <span className="font-bold text-xl">${product.price.toFixed(2)}</span>
                            </div>
                            <Button size="lg" className="w-full mt-4" onClick={handleAddToCart}>
                                <CheckCircle className="mr-2 h-5 w-5"/> Confirm Customization & Add to Cart
                            </Button>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
