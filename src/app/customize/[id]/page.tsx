
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
import { ArrowLeft, CheckCircle, ShoppingCart, Wand2, Bold, Italic, Type, Upload, Paintbrush, StickyNote, ZoomIn, Pilcrow, PilcrowLeft, PilcrowRight, Layers, Trash2, Brush, Smile, Star as StarIcon, PartyPopper, Undo2, Redo2, Copy, AlignCenter, AlignLeft, AlignRight, ChevronsUp, ChevronsDown, Shapes, Waves, Flag, CaseUpper } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ColorPicker } from "@/components/ui/color-picker";

type TextShape = 'normal' | 'arch' | 'valley' | 'bulge' | 'pinch' | 'perspective-left' | 'perspective-right' | 'wave' | 'flag' | 'slant-up' | 'slant-down';

type DesignElement = {
    id: string;
    type: 'text' | 'image' | 'art';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    // Text properties
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    textColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    textShape?: TextShape;
    shapeIntensity?: number;
    outlineColor?: string;
    outlineWidth?: number;
    // Image properties
    imageUrl?: string;
    originalAreaId?: string; // Links text element back to a vendor-defined area
}

// Custom hook for managing state with undo/redo
function useHistoryState<T>(initialState: T): [T, (newState: T | ((prevState: T) => T)) => void, () => void, () => void, boolean, boolean] {
    const historyRef = useRef<{past: T[], present: T, future: T[]}>({
        past: [],
        present: initialState,
        future: []
    });
    
    const [, forceUpdate] = useState({});

    const set = useCallback((newState: T | ((prevState: T) => T)) => {
        const { past, present } = historyRef.current;
        const newPresent = typeof newState === 'function' ? (newState as (prevState: T) => T)(present) : newState;
        
        if (JSON.stringify(newPresent) === JSON.stringify(present)) {
            return;
        }

        historyRef.current = {
            past: [...past, present],
            present: newPresent,
            future: [],
        };
        forceUpdate({});
    }, []);

    const undo = useCallback(() => {
        const { past, present, future } = historyRef.current;
        if (past.length === 0) return;
        const newPresent = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        historyRef.current = {
            past: newPast,
            present: newPresent,
            future: [present, ...future],
        };
        forceUpdate({});
    }, []);

    const redo = useCallback(() => {
        const { past, present, future } = historyRef.current;
        if (future.length === 0) return;
        const newPresent = future[0];
        const newFuture = future.slice(1);
        historyRef.current = {
            past: [...past, present],
            present: newPresent,
            future: newFuture,
        };
        forceUpdate({});
    }, []);

    const { past, future } = historyRef.current;
    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    return [historyRef.current.present, set, undo, redo, canUndo, canRedo];
}


type ImageSide = "front" | "back" | "left" | "right" | "top" | "bottom";

const imageSides: ImageSide[] = ["front", "back", "left", "right", "top", "bottom"];

const TextRenderer = ({ element }: { element: DesignElement }) => {
    const { 
        text, 
        fontFamily, 
        fontSize, 
        fontWeight, 
        textColor, 
        textAlign, 
        textShape = 'normal',
        shapeIntensity = 50,
        outlineColor,
        outlineWidth,
    } = element;
    
    const svgFilterId = `outline-${element.id}`;
    
    const textStyle: React.CSSProperties = {
        fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight as React.CSSProperties['fontWeight'],
        color: textColor,
        textAlign,
        lineHeight: 1,
        filter: outlineColor && outlineWidth && outlineWidth > 0 ? `url(#${svgFilterId})` : 'none',
        display: 'inline-block',
        whiteSpace: 'pre-wrap',
    };

    const intensity = (shapeIntensity - 50) / 50; // Map slider 0-100 to -1 to 1

    const getTransformStyle = (): React.CSSProperties => {
        switch (textShape) {
             case 'bulge':
                return { transform: `scaleY(${1 + intensity * 0.5})` };
            case 'pinch':
                return { transform: `scaleY(${1 - Math.abs(intensity * 0.5)})` };
            case 'perspective-left':
                return { transform: `perspective(150px) rotateY(${intensity * 30}deg)` };
            case 'perspective-right':
                return { transform: `perspective(150px) rotateY(${-intensity * 30}deg)` };
            case 'slant-up':
                return { transform: `skewY(${-intensity * 15}deg)` };
            case 'slant-down':
                return { transform: `skewY(${intensity * 15}deg)` };
            default:
                return {};
        }
    };
    
    const getPathData = (): string | null => {
        switch (textShape) {
            case 'arch':
                return `M 0,${50 - intensity * 25} C ${intensity * 50},${50 - intensity * 75} ${100 - intensity * 50},${50 - intensity * 75} 100,${50 - intensity * 25}`;
            case 'valley':
                 return `M 0,50 C 25,${50 + intensity * 50} 75,${50 + intensity * 50} 100,50`;
            case 'wave':
                 return `M 0,50 C 25,${50 - intensity * 25} 50,${50 + intensity * 25} 75,${50 - intensity * 25} 100,50`;
            case 'flag':
                 return `M 0,${50 + intensity * 15} C 25,${50 - intensity * 15} 50,${50 + intensity * 15} 75,${50 - intensity * 15} 100,${50 + intensity * 15}`;
            default:
                return null;
        }
    }
    
    const pathData = getPathData();

    if (pathData) {
        return (
             <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                 {outlineColor && outlineWidth && outlineWidth > 0 && (
                    <defs>
                        <filter id={svgFilterId} x="-50%" y="-50%" width="200%" height="200%">
                            <feMorphology operator="dilate" radius={outlineWidth} in="SourceAlpha" result="dilated" />
                            <feFlood floodColor={outlineColor} result="color" />
                            <feComposite in="color" in2="dilated" operator="in" result="outline" />
                            <feMerge>
                                <feMergeNode in="outline" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                 )}
                 <path id={`path-${element.id}`} d={pathData} fill="transparent" />
                 <text style={{...textStyle, filter: 'none'}} dy={textShape === 'arch' ? fontSize!*0.25 : 0} fill={textColor}>
                    <textPath href={`#path-${element.id}`} startOffset="50%" textAnchor="middle">{text}</textPath>
                 </text>
             </svg>
        )
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-1" style={getTransformStyle()}>
            {outlineColor && outlineWidth && outlineWidth > 0 && (
                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                    <defs>
                        <filter id={svgFilterId} x="-50%" y="-50%" width="200%" height="200%">
                            <feMorphology operator="dilate" radius={outlineWidth} in="SourceAlpha" result="dilated" />
                            <feFlood floodColor={outlineColor} result="color" />
                            <feComposite in="color" in2="dilated" operator="in" result="outline" />
                            <feMerge>
                                <feMergeNode in="outline" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
            )}
            <span style={textStyle}>{text}</span>
        </div>
    );
};

const CustomizationRenderer = ({ product, activeSide, designElements }: { product: any, activeSide: ImageSide, designElements: DesignElement[] }) => {
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
            {designElements.map((element) => {
                if(element.type === 'text' && element.originalAreaId) return null; // These are handled by vendor areas

                return (
                    <div key={element.id} style={{
                        position: 'absolute',
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        width: `${element.width}%`,
                        height: `${element.height}%`,
                        transform: `rotate(${element.rotation}deg)`,
                    }}>
                        {element.type === 'image' && element.imageUrl && (
                            <Image src={element.imageUrl} alt="Uploaded art" fill className="object-contain"/>
                        )}
                        {element.type === 'art' && element.imageUrl && (
                            <Image src={element.imageUrl} alt="Clipart" fill className="object-contain"/>
                        )}
                        {element.type === 'text' && <TextRenderer element={element} />}
                    </div>
                )
            })}
            {product.customizationAreas?.[activeSide]?.map((area: any) => {
                 const element = designElements.find(el => el.originalAreaId === area.id);
                 if (!element) return null;

                 return (
                     <div key={area.id} style={{
                        position: 'absolute',
                        left: `${area.x}%`,
                        top: `${area.y}%`,
                        width: `${area.width}%`,
                        height: `${area.height}%`,
                    }}>
                        <TextRenderer element={element} />
                    </div>
                 )
            })}
        </div>
    )
}

const mockArt = [
    { id: 'art-1', src: '/art/smile.svg', icon: Smile },
    { id: 'art-2', src: '/art/star.svg', icon: StarIcon },
    { id: 'art-3', src: '/art/party.svg', icon: PartyPopper },
    { id: 'art-4', src: '/art/brush.svg', icon: Brush },
];

const textShapes: { id: TextShape; label: string; icon: React.ElementType }[] = [
    { id: 'normal', label: 'Normal', icon: Type },
    { id: 'arch', label: 'Arch', icon: Pilcrow },
    { id: 'valley', label: 'Valley', icon: Pilcrow },
    { id: 'bulge', label: 'Bulge', icon: Pilcrow },
    { id: 'pinch', label: 'Pinch', icon: Pilcrow },
    { id: 'wave', label: 'Wave', icon: Waves },
    { id: 'flag', label: 'Flag', icon: Flag },
    { id: 'slant-up', label: 'Slant Up', icon: CaseUpper },
    { id: 'slant-down', label: 'Slant Down', icon: CaseUpper },
    { id: 'perspective-left', label: 'Perspective Left', icon: PilcrowLeft },
    { id: 'perspective-right', label: 'Perspective Right', icon: PilcrowRight },
];

const ShapePreview = ({ shape, intensity, label, isSelected, onClick }: { shape: TextShape, intensity: number, label: string, isSelected: boolean, onClick: () => void }) => {
    const previewElement: DesignElement = {
        id: `preview-${shape}`, type: 'text',
        x: 0, y: 0, width: 100, height: 100, rotation: 0,
        text: 'Text', fontFamily: 'sans-serif', fontSize: 24, fontWeight: 'bold', textColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))', textAlign: 'center',
        textShape: shape, shapeIntensity: intensity,
    }
    
    return (
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onClick}>
            <div className={cn("w-full h-20 bg-muted/50 rounded-md border-2 p-2", isSelected ? "border-primary" : "border-transparent")}>
                <TextRenderer element={previewElement} />
            </div>
            <span className="text-xs font-medium">{label}</span>
        </div>
    )
}

function TextShapeDialog({ open, onOpenChange, element, onElementChange }: { open: boolean, onOpenChange: (open: boolean) => void, element: DesignElement | undefined, onElementChange: (id: string, value: Partial<DesignElement>) => void }) {
    if (!element) return null;

    const [currentShape, setCurrentShape] = useState(element.textShape || 'normal');
    const [currentIntensity, setCurrentIntensity] = useState(element.shapeIntensity || 50);

    const handleDone = () => {
        onElementChange(element.id, { textShape: currentShape, shapeIntensity: currentIntensity });
        onOpenChange(false);
    }
    
    const handleRemoveShape = () => {
        onElementChange(element.id, { textShape: 'normal', shapeIntensity: 50 });
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Choose Text Shape</DialogTitle>
                </DialogHeader>
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 py-4">
                    {textShapes.map(shape => (
                        <ShapePreview 
                            key={shape.id} 
                            shape={shape.id}
                            label={shape.label}
                            intensity={currentIntensity}
                            isSelected={currentShape === shape.id}
                            onClick={() => setCurrentShape(shape.id)}
                        />
                    ))}
                </div>
                 <div className="space-y-2 pt-4">
                    <Label>Intensity</Label>
                    <Slider value={[currentIntensity]} onValueChange={([val]) => setCurrentIntensity(val)} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleRemoveShape}>Remove Shape</Button>
                    <Button onClick={handleDone}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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

    const [designElements, setDesignElements, undo, redo, canUndo, canRedo] = useHistoryState<DesignElement[]>([]);
    const [activeSide, setActiveSide] = useState<ImageSide>("front");
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isTextShapeOpen, setIsTextShapeOpen] = useState(false);

    const firstCustomizableSide = useMemo(() => {
        if (!product?.customizationAreas) return "front";
        return imageSides.find(side => product.customizationAreas![side]?.length) || "front";
    }, [product]);

    useEffect(() => {
        setActiveSide(firstCustomizableSide);
        if (product?.customizationAreas) {
            const initialElements: DesignElement[] = [];
            Object.values(product.customizationAreas).flat().forEach(area => {
                if (area) {
                     initialElements.push({
                        id: `text-${area.id}`,
                        type: 'text',
                        originalAreaId: area.id,
                        x: area.x, y: area.y, width: area.width, height: area.height,
                        rotation: 0,
                        text: `Your ${area.label}`,
                        fontFamily: area.fontFamily || 'sans-serif',
                        fontSize: area.fontSize || 14,
                        fontWeight: 'normal',
                        textColor: '#000000',
                        textAlign: 'center',
                        textShape: 'normal',
                        shapeIntensity: 50
                    });
                }
            });
            setDesignElements(initialElements);
            if(initialElements.length > 0) {
                setSelectedElementId(initialElements[0].id)
            }
        }
    }, [product, setDesignElements, firstCustomizableSide]);

    const handleElementChange = useCallback((elementId: string, value: Partial<DesignElement>) => {
        setDesignElements(prev => prev.map(el => el.id === elementId ? { ...el, ...value } : el));
    }, [setDesignElements]);
    
    const addTextElement = () => {
        const newElement: DesignElement = {
            id: `text-${Date.now()}`,
            type: 'text',
            x: 25, y: 40, width: 50, height: 20, rotation: 0,
            text: 'New Text',
            fontFamily: 'sans-serif',
            fontSize: 24,
            fontWeight: 'normal',
            textColor: '#000000',
            textAlign: 'center',
            textShape: 'normal',
            shapeIntensity: 50,
            outlineColor: '#FFFFFF',
            outlineWidth: 0,
        };
        setDesignElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    }
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const newElement: DesignElement = {
                id: `image-${Date.now()}`,
                type: 'image',
                x: 25, y: 25, width: 50, height: 50, rotation: 0,
                imageUrl: URL.createObjectURL(file)
            }
            setDesignElements(prev => [...prev, newElement]);
            setSelectedElementId(newElement.id);
        }
    };
    
    const addArtElement = (artSrc: string) => {
         const newElement: DesignElement = {
            id: `art-${Date.now()}`,
            type: 'art',
            x: 35, y: 35, width: 30, height: 30, rotation: 0,
            imageUrl: artSrc,
        }
        setDesignElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    }
    
    const removeElement = (elementId: string) => {
        setDesignElements(prev => prev.filter(el => el.id !== elementId));
        if (selectedElementId === elementId) {
            setSelectedElementId(null);
        }
    }
    
    const reorderElement = (elementId: string, direction: 'up' | 'down') => {
        const index = designElements.findIndex(el => el.id === elementId);
        if(index === -1) return;

        const newIndex = direction === 'up' ? index + 1 : index - 1;
        if(newIndex < 0 || newIndex >= designElements.length) return;

        const newElements = [...designElements];
        const element = newElements.splice(index, 1)[0];
        newElements.splice(newIndex, 0, element);
        setDesignElements(newElements);
    };
    
    const duplicateElement = (elementId: string) => {
        const elementToCopy = designElements.find(el => el.id === elementId);
        if (!elementToCopy) return;

        const newElement = {
            ...elementToCopy,
            id: `${elementToCopy.type}-${Date.now()}`,
            x: elementToCopy.x + 5,
            y: elementToCopy.y + 5,
        };
        
        setDesignElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    };
    
    const selectedElement = useMemo(() => designElements.find(el => el.id === selectedElementId), [designElements, selectedElementId]);

    const handleAddToCart = (buyNow = false) => {
        if (!product) return;
        const customizationsForCart: { [key: string]: Partial<CustomizationValue> } = {};
        designElements.forEach(el => {
            if (el.type === 'text' && el.originalAreaId) {
                customizationsForCart[el.originalAreaId] = {
                    text: el.text,
                    fontFamily: el.fontFamily,
                    fontSize: el.fontSize,
                    fontWeight: el.fontWeight,
                    textColor: el.textColor,
                    textAlign: el.textAlign,
                }
            }
        });
        
        addToCart({ product, customizations: customizationsForCart });
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
    
    const currentVendorCustomizationAreas = product.customizationAreas?.[activeSide] || [];
    const textElementsForCurrentSide = designElements.filter(el => 
        el.type === 'text' && el.originalAreaId && currentVendorCustomizationAreas.some(area => `text-${area.id}` === el.id)
    );

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
                        <CustomizationRenderer product={product} activeSide={activeSide} designElements={designElements} />
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
                        
                        <div className="flex items-center p-2 border-b">
                            <span className="text-sm font-semibold pl-2">Edit Text</span>
                            <div className="ml-auto flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={!canUndo}><Undo2 className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={!canRedo}><Redo2 className="h-4 w-4"/></Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4">
                                <TabsContent value="text" className="mt-0 space-y-4">
                                {selectedElement?.type === 'text' ? (
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Your text here"
                                            value={selectedElement.text || ""}
                                            onChange={(e) => handleElementChange(selectedElementId!, { text: e.target.value })}
                                        />
                                        <Separator/>
                                        <div className="space-y-2">
                                            <Label>Font</Label>
                                            <Select value={selectedElement.fontFamily} onValueChange={(v) => handleElementChange(selectedElementId!, { fontFamily: v })}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                                                    <SelectItem value="serif">Serif</SelectItem>
                                                    <SelectItem value="monospace">Monospace</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Text Color</Label>
                                            <ColorPicker value={selectedElement.textColor || '#000000'} onChange={(color) => handleElementChange(selectedElementId!, { textColor: color })} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Rotation</Label>
                                            <div className="flex items-center gap-2">
                                                <Slider min={-180} max={180} step={1} value={[selectedElement.rotation || 0]} onValueChange={([v]) => handleElementChange(selectedElementId!, { rotation: v })} />
                                                <Input type="number" value={selectedElement.rotation || 0} onChange={e => handleElementChange(selectedElementId!, { rotation: parseInt(e.target.value) || 0})} className="w-20 h-9" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Outline</Label>
                                            <div className="space-y-2">
                                                <ColorPicker value={selectedElement.outlineColor || '#ffffff'} onChange={(color) => handleElementChange(selectedElementId!, { outlineColor: color })} />
                                                <Slider min={0} max={5} step={0.1} value={[selectedElement.outlineWidth || 0]} onValueChange={([v]) => handleElementChange(selectedElementId!, { outlineWidth: v })} />
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Text Shape</Label>
                                            <Button variant="outline" className="w-full justify-start" onClick={() => setIsTextShapeOpen(true)}>
                                                <Shapes className="mr-2 h-4 w-4" />
                                                <span className="capitalize">{selectedElement.textShape?.replace('-', ' ') || 'Normal'}</span>
                                            </Button>
                                        </div>
                                        <Separator/>
                                         <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" size="sm" onClick={() => duplicateElement(selectedElementId!)}>Duplicate</Button>
                                            <div className="col-span-2">
                                                <ToggleGroup type="single" value={selectedElement.textAlign} onValueChange={(v) => v && handleElementChange(selectedElementId!, {textAlign: v as any})} className="w-full">
                                                    <ToggleGroupItem value="left" className="flex-1"><AlignLeft className="h-4 w-4"/></ToggleGroupItem>
                                                    <ToggleGroupItem value="center" className="flex-1"><AlignCenter className="h-4 w-4"/></ToggleGroupItem>
                                                    <ToggleGroupItem value="right" className="flex-1"><AlignRight className="h-4 w-4"/></ToggleGroupItem>
                                                </ToggleGroup>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Select a text layer to edit it, or add new text.</p>
                                        <Button variant="secondary" className="mt-4" onClick={addTextElement}>Add Text</Button>
                                    </div>
                                )}
                                </TabsContent>

                                <TabsContent value="upload" className="mt-0">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Upload Your Image</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <label htmlFor="customer-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                                <Upload className="h-8 w-8 text-muted-foreground"/>
                                                <span className="text-sm text-muted-foreground text-center mt-1">Click to upload</span>
                                            </label>
                                            <input id="customer-image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="art" className="mt-0">
                                     <Card>
                                        <CardHeader><CardTitle className="text-base">Add Clipart</CardTitle></CardHeader>
                                        <CardContent className="grid grid-cols-4 gap-2">
                                            {mockArt.map(art => {
                                                const ArtIcon = art.icon;
                                                return (
                                                <Button key={art.id} variant="outline" className="h-16 flex-col" onClick={() => addArtElement(art.src)}>
                                                    <ArtIcon className="h-8 w-8 text-muted-foreground" />
                                                </Button>
                                            )})}
                                        </CardContent>
                                    </Card>
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
                        </ScrollArea>
                        <div className="p-4 border-t">
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between p-2">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><Layers className="h-4 w-4"/> Layers</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!selectedElementId} onClick={() => reorderElement(selectedElementId!, 'up')}><ChevronsUp className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!selectedElementId} onClick={() => reorderElement(selectedElementId!, 'down')}><ChevronsDown className="h-4 w-4"/></Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-2 space-y-2 max-h-48 overflow-y-auto">
                                    {designElements.length > 0 ? (
                                        [...designElements].reverse().map(element => (
                                            <div 
                                                key={element.id}
                                                className={cn("flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer", selectedElementId === element.id ? "bg-accent" : "hover:bg-muted/50")}
                                                onClick={() => setSelectedElementId(element.id)}
                                            >
                                                {element.type === 'text' && <Type className="h-4 w-4 text-muted-foreground"/>}
                                                {element.type === 'image' && <Upload className="h-4 w-4 text-muted-foreground"/>}
                                                {element.type === 'art' && <Wand2 className="h-4 w-4 text-muted-foreground"/>}
                                                <span className="text-sm truncate flex-1">
                                                    {element.type === 'text' ? (element.text || 'Untitled Text') : (element.type === 'image' ? 'Uploaded Image' : 'Clipart')}
                                                </span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); removeElement(element.id)}}><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground text-center py-4">Your design is empty.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </Tabs>
                </div>
            </main>
            <TextShapeDialog 
                open={isTextShapeOpen} 
                onOpenChange={setIsTextShapeOpen}
                element={selectedElement}
                onElementChange={handleElementChange}
            />
        </div>
    );
}
