
"use client";

import { useState, useMemo, useCallback } from "react";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockProducts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { CustomizationArea, CustomizationValue } from "@/lib/types";
import { ArrowLeft, CheckCircle, ShoppingCart, Wand2, Bold, Italic, PilcrowLeft, Pilcrow, PilcrowRight } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

    // Find the first available side with customization areas and set it as active
    const firstCustomizableSide = useMemo(() => {
        if (!product?.customizationAreas) return "front";
        return imageSides.find(side => product.customizationAreas![side]?.length) || "front";
    }, [product]);

    // Set initial state for active side and customizations
    useState(() => {
        setActiveSide(firstCustomizableSide);
        if (product?.customizationAreas) {
            const initialCustomizations: { [key: string]: CustomizationValue } = {};
            Object.values(product.customizationAreas).flat().forEach(area => {
                if (area) {
                     initialCustomizations[area.id] = {
                        text: `Your ${area.label}`,
                        fontFamily: area.fontFamily,
                        fontSize: area.fontSize,
                        fontWeight: area.fontWeight,
                        textColor: area.textColor,
                        textAlign: 'center',
                        curveIntensity: 0,
                    };
                }
            });
            setCustomizations(initialCustomizations);
        }
    });

    const handleCustomizationChange = useCallback((areaId: string, value: Partial<CustomizationValue>) => {
        setCustomizations(prev => ({
            ...prev,
            [areaId]: { ...prev[areaId], ...value }
        }));
    }, []);

    const handleAddToCart = (buyNow = false) => {
        if (!product) return;
        addToCart({ product, customizations });
        toast({
            title: "Customized Product Added!",
            description: `${product.name} has been added to your cart.`,
        });

        if (buyNow || searchParams.get('buyNow') === 'true') {
            router.push('/checkout');
        } else {
            router.push('/cart');
        }
    };

    if (!product) {
        notFound();
    }
    
    const currentCustomizationAreas = product.customizationAreas?.[activeSide] || [];
    
    const ArchText = ({ text, curve, fontSize, areaWidth }: { text: string; curve: number; fontSize: number; areaWidth: number }) => {
        if (curve === 0 || !text) {
            return <>{text}</>;
        }

        const characters = text.split('');
        const totalAngle = Math.abs(curve) * 1.5; // Controls how much the text wraps
        const radius = (areaWidth * 180) / (totalAngle * Math.PI);
        const charSpacing = (text.length > 1 ? totalAngle / (text.length - 1) : 0);

        return (
            <div className="w-full h-full relative" style={{ fontSize: `${fontSize}px` }}>
                {characters.map((char, i) => {
                    const angle = -totalAngle / 2 + i * charSpacing;
                    const transformDirection = curve > 0 ? 1 : -1;
                    
                    return (
                        <span
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                                transform: `translate(-50%, ${transformDirection === 1 ? '-100%' : '0%'}) rotate(${angle}deg)`,
                                transformOrigin: `center ${transformDirection * radius}px`,
                                height: `${radius}px`,
                            }}
                        >
                            {char}
                        </span>
                    );
                })}
            </div>
        );
    };

    const CustomizationRenderer = ({ areas, productSrc }: { areas: CustomizationArea[], productSrc: string }) => {
        return (
            <div className="relative w-full h-full">
                <Image src={productSrc} alt={`${product.name} ${activeSide} view`} fill className="object-contain" />
                {areas.map(area => {
                    const value = customizations[area.id] as any;
                    if (!value || !value.text) return null;

                    return (
                         <div key={area.id} style={{
                            position: 'absolute',
                            left: `${area.x}%`,
                            top: `${area.y}%`,
                            width: `${area.width}%`,
                            height: `${area.height}%`,
                        }}>
                           <div className="w-full h-full flex items-center p-1"
                                 style={{
                                    fontFamily: value.fontFamily,
                                    fontSize: `${value.fontSize}px`,
                                    fontWeight: value.fontWeight,
                                    color: value.textColor,
                                    justifyContent: value.textAlign === 'left' ? 'flex-start' : value.textAlign === 'right' ? 'flex-end' : 'center',
                                    textAlign: value.textAlign,
                                    lineHeight: 1,
                                 }}
                            >
                               <ArchText text={value.text} curve={value.curveIntensity} fontSize={value.fontSize} areaWidth={area.width} />
                            </div>
                        </div>
                    )
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
                                    const hasAreas = !!product.customizationAreas?.[side]?.length;
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
                                                {hasAreas && <Wand2 className="absolute bottom-1 right-1 h-3 w-3 text-white bg-primary p-0.5 rounded-sm" />}
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
                        <CardContent>
                             <Tabs value={activeSide} onValueChange={(value) => setActiveSide(value as ImageSide)}>
                                 {currentCustomizationAreas.length > 0 ? (
                                    <TabsContent value={activeSide} className="mt-0">
                                        {currentCustomizationAreas.map(area => {
                                            const value = customizations[area.id] as any || {};
                                            return (
                                                <div key={area.id} className="space-y-4 border p-4 rounded-lg">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`text-${area.id}`}>{area.label}</Label>
                                                        <Input
                                                            id={`text-${area.id}`}
                                                            placeholder={`Enter text for ${area.label.toLowerCase()}...`}
                                                            value={value.text || ""}
                                                            onChange={(e) => handleCustomizationChange(area.id, { text: e.target.value })}
                                                            maxLength={area.maxLength || 50}
                                                        />
                                                        {area.maxLength && <p className="text-xs text-muted-foreground text-right">{(value.text?.length || 0)} / {area.maxLength}</p>}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                         <div className="space-y-2">
                                                            <Label>Font</Label>
                                                            <Select value={value.fontFamily} onValueChange={(v) => handleCustomizationChange(area.id, { fontFamily: v })}>
                                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                                                                    <SelectItem value="serif">Serif</SelectItem>
                                                                    <SelectItem value="monospace">Monospace</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Font Size: {value.fontSize}px</Label>
                                                            <Slider min={8} max={48} step={1} value={[value.fontSize]} onValueChange={([v]) => handleCustomizationChange(area.id, { fontSize: v })} />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 items-end">
                                                        <div className="space-y-2">
                                                            <Label>Text Style</Label>
                                                            <ToggleGroup type="multiple" value={value.fontWeight === 'bold' ? ['bold'] : []} onValueChange={(v) => handleCustomizationChange(area.id, { fontWeight: v.includes('bold') ? 'bold' : 'normal' })} className="w-full">
                                                                <ToggleGroupItem value="bold" className="flex-1"><Bold className="h-4 w-4"/></ToggleGroupItem>
                                                            </ToggleGroup>
                                                        </div>
                                                         <div className="space-y-2">
                                                            <Label>Color</Label>
                                                            <Input type="color" value={value.textColor} onChange={(e) => handleCustomizationChange(area.id, { textColor: e.target.value })} className="h-10 p-1" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Curvature: {value.curveIntensity}%</Label>
                                                        <Slider min={-100} max={100} step={1} value={[value.curveIntensity]} onValueChange={([v]) => handleCustomizationChange(area.id, { curveIntensity: v })} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </TabsContent>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No customizable areas defined for this side of the product.
                                    </p>
                                )}
                            </Tabs>
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
                            <Button size="lg" className="w-full mt-4" onClick={() => handleAddToCart()}>
                                <ShoppingCart className="mr-2 h-5 w-5"/> Add to Cart
                            </Button>
                            <Button size="lg" variant="secondary" className="w-full" onClick={() => handleAddToCart(true)}>
                                <CheckCircle className="mr-2 h-5 w-5"/> Buy Now
                            </Button>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
