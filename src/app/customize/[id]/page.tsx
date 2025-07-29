
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockProducts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { CustomizationValue } from "@/lib/types";
import { ArrowLeft, CheckCircle, ShoppingCart, Wand2, Bold, Italic, Type, Upload, Paintbrush, StickyNote, ZoomIn, Pilcrow, PilcrowLeft, PilcrowRight } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Textarea } from "@/components/ui/textarea";

type ImageSide = "front" | "back" | "left" | "right" | "top" | "bottom";

const imageSides: ImageSide[] = ["front", "back", "left", "right", "top", "bottom"];

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

const CustomizationRenderer = ({ product, activeSide, customizations }: { product: any, activeSide: ImageSide, customizations: { [key: string]: CustomizationValue } }) => {
    const currentCustomizationAreas = product.customizationAreas?.[activeSide] || [];
    const productSrc = product.images?.[imageSides.indexOf(activeSide)];

    if (!productSrc) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">No preview available for this side.</p>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full">
            <Image src={productSrc} alt={`${product.name} ${activeSide} view`} fill className="object-contain" />
            {currentCustomizationAreas.map((area: any) => {
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
                                textAlign: value.textAlign as any,
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
    useEffect(() => {
        setActiveSide(firstCustomizableSide);
        if (product?.customizationAreas) {
            const initialCustomizations: { [key: string]: CustomizationValue } = {};
            Object.values(product.customizationAreas).flat().forEach(area => {
                if (area) {
                     initialCustomizations[area.id] = {
                        text: `Your ${area.label}`,
                        fontFamily: area.fontFamily || 'sans-serif',
                        fontSize: area.fontSize || 14,
                        fontWeight: area.fontWeight || 'normal',
                        textColor: area.textColor || '#000000',
                        textAlign: 'center',
                        curveIntensity: 0,
                    };
                }
            });
            setCustomizations(initialCustomizations);
        }
    }, [firstCustomizableSide, product]);

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

    return (
        <div className="h-screen flex flex-col bg-muted/40">
            <header className="bg-background border-b shadow-sm flex-shrink-0">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                     <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Product
                    </Button>
                     <p className="hidden md:block text-sm font-medium">{product.name}</p>
                    <div className="flex items-center gap-2">
                         <Button size="sm" variant="secondary" onClick={() => handleAddToCart()}>
                            <ShoppingCart className="mr-2 h-4 w-4"/> Add to Cart
                        </Button>
                        <Button size="sm" onClick={() => handleAddToCart(true)}>
                            Buy Now
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 overflow-hidden">
                {/* Left Panel: Preview */}
                <div className="md:col-span-2 lg:col-span-3 h-full flex flex-col items-center justify-center gap-4">
                     <div className="relative h-full flex-1 w-full flex items-center justify-center bg-background rounded-lg shadow-md p-4">
                        <CustomizationRenderer product={product} activeSide={activeSide} customizations={customizations} />
                    </div>
                     <div className="flex-shrink-0 flex items-center justify-center gap-2 bg-background p-2 rounded-lg shadow-md">
                         {imageSides.map(side => {
                            const hasImage = !!product.images?.[imageSides.indexOf(side)];
                            return (
                                <button 
                                    key={side}
                                    onClick={() => setActiveSide(side)}
                                    disabled={!hasImage}
                                    className={cn(
                                        "relative w-16 h-16 rounded-md border-2 overflow-hidden disabled:opacity-50 transition-all",
                                        activeSide === side ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
                                    )}
                                >
                                    {hasImage ? (
                                        <Image src={product.images![imageSides.indexOf(side)]} alt={`${side} view thumbnail`} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground capitalize">{side}</div>
                                    )}
                                </button>
                            )
                         })}
                         <button className="w-16 h-16 rounded-md border flex flex-col items-center justify-center text-xs text-muted-foreground hover:bg-muted">
                            <ZoomIn className="h-5 w-5 mb-1" />
                            Zoom
                         </button>
                    </div>
                </div>

                {/* Right Panel: Tools */}
                <div className="lg:col-span-1 bg-background rounded-lg shadow-md h-full flex flex-col">
                    <Tabs defaultValue="text" className="flex flex-col h-full">
                        <TabsList className="grid w-full grid-cols-5 p-1 h-auto">
                            <TabsTrigger value="text" className="flex-col h-14"><Type className="h-5 w-5 mb-1"/>Text</TabsTrigger>
                            <TabsTrigger value="upload" className="flex-col h-14"><Upload className="h-5 w-5 mb-1"/>Upload</TabsTrigger>
                            <TabsTrigger value="art" className="flex-col h-14"><Wand2 className="h-5 w-5 mb-1"/>Art</TabsTrigger>
                            <TabsTrigger value="colors" className="flex-col h-14"><Paintbrush className="h-5 w-5 mb-1"/>Colors</TabsTrigger>
                            <TabsTrigger value="notes" className="flex-col h-14"><StickyNote className="h-5 w-5 mb-1"/>Notes</TabsTrigger>
                        </TabsList>
                        
                        <div className="flex-1 overflow-y-auto p-4">
                            <TabsContent value="text" className="mt-0 space-y-4">
                               {currentCustomizationAreas.length > 0 ? (
                                    currentCustomizationAreas.map((area: any) => {
                                        const value = customizations[area.id] as any || {};
                                        return (
                                            <div key={area.id} className="space-y-4 border p-4 rounded-lg">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`text-${area.id}`}>{area.label}</Label>
                                                    <Input
                                                        id={`text-${area.id}`}
                                                        placeholder={`Enter text...`}
                                                        value={value.text || ""}
                                                        onChange={(e) => handleCustomizationChange(area.id, { text: e.target.value })}
                                                        maxLength={area.maxLength || 50}
                                                    />
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
                                                        <Label>Font Size</Label>
                                                        <Input type="number" value={value.fontSize} onChange={(e) => handleCustomizationChange(area.id, { fontSize: parseInt(e.target.value) || 14 })}/>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Alignment</Label>
                                                        <ToggleGroup type="single" value={value.textAlign} onValueChange={(v) => v && handleCustomizationChange(area.id, {textAlign: v as any})} className="w-full">
                                                            <ToggleGroupItem value="left" className="flex-1"><PilcrowLeft className="h-4 w-4"/></ToggleGroupItem>
                                                            <ToggleGroupItem value="center" className="flex-1"><Pilcrow className="h-4 w-4"/></ToggleGroupItem>
                                                            <ToggleGroupItem value="right" className="flex-1"><PilcrowRight className="h-4 w-4"/></ToggleGroupItem>
                                                        </ToggleGroup>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Style</Label>
                                                         <ToggleGroup type="multiple" value={value.fontWeight === 'bold' ? ['bold'] : []} onValueChange={(v) => handleCustomizationChange(area.id, {fontWeight: v.includes('bold') ? 'bold' : 'normal'})} className="w-full">
                                                            <ToggleGroupItem value="bold" className="flex-1"><Bold className="h-4 w-4"/></ToggleGroupItem>
                                                        </ToggleGroup>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label>Color</Label>
                                                    <Input type="color" value={value.textColor} onChange={(e) => handleCustomizationChange(area.id, { textColor: e.target.value })} className="h-10 p-1" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Curvature</Label>
                                                    <Slider min={-100} max={100} step={1} value={[value.curveIntensity]} onValueChange={([v]) => handleCustomizationChange(area.id, { curveIntensity: v })} />
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No customizable text areas on this side.
                                    </p>
                                )}
                            </TabsContent>

                            <TabsContent value="upload" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Upload Your Image</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                            <Upload className="h-8 w-8 text-muted-foreground"/>
                                            <span className="text-sm text-muted-foreground text-center mt-1">Click to upload</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                             <TabsContent value="art" className="mt-0 text-center text-sm text-muted-foreground py-8">
                                Clipart library coming soon!
                            </TabsContent>
                             <TabsContent value="colors" className="mt-0 text-center text-sm text-muted-foreground py-8">
                                Product color options coming soon!
                            </TabsContent>
                             <TabsContent value="notes" className="mt-0">
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Design Notes</CardTitle>
                                        <CardDescription className="text-xs">Add any special instructions for the vendor.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                       <Textarea placeholder="e.g. 'Please match the text color to the main logo.'" />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
