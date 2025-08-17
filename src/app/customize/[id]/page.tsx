

"use client";

import * as React from "react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockProducts, mockAiImageStyles } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { CustomizationValue, CustomizationArea, AiImageStyle, DesignElement } from "@/lib/types";
import { ArrowLeft, CheckCircle, ShoppingCart, Wand2, Bold, Italic, Type, Upload, Paintbrush, StickyNote, ZoomIn, Pilcrow, PilcrowLeft, PilcrowRight, Layers, Trash2, Brush, Smile, Star as StarIcon, PartyPopper, Undo2, Redo2, Copy, AlignCenter, AlignLeft, AlignRight, ChevronsUp, ChevronsDown, Shapes, Waves, Flag, CaseUpper, Circle, CornerDownLeft, CornerDownRight, ChevronsUpDown, Maximize, FoldVertical, Expand, CopyIcon, X, SprayCan, Heart, Pizza, Car, Sparkles, Building, Cat, Dog, Music, Gamepad2, Plane, Cloud, TreePine, Bot, QrCode, Save } from "lucide-react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import tinycolor from 'tinycolor2';
import { generateImageWithStyle } from '@/ai/flows/generate-image-with-style-flow';
import { Loader2 } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useUser } from "@/context/user-context";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";


type TextShape = 'normal' | 'arch-up' | 'arch-down' | 'circle' | 'bulge' | 'pinch' | 'wave' | 'flag' | 'slant-up' | 'slant-down' | 'perspective-left' | 'perspective-right' | 'triangle-up' | 'triangle-down' | 'fade-left' | 'fade-right' | 'fade-up' | 'fade-down' | 'bridge' | 'funnel-in' | 'funnel-out' | 'stairs-up' | 'stairs-down';

// Custom hook for managing state with undo/redo
function useHistoryState<T>(initialState: T): [T, (newState: T | ((prevState: T) => T)) => void, () => void, () => void, boolean, boolean] {
    const historyRef = useRef<{
        past: T[],
        present: T,
        future: T[]
    }>({
        past: [],
        present: initialState,
        future: [],
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

const fontOptions = [
    // Sans-Serif
    { value: 'var(--font-pt-sans)', label: 'PT Sans' },
    { value: 'var(--font-roboto)', label: 'Roboto' },
    { value: 'var(--font-lato)', label: 'Lato' },
    { value: 'var(--font-montserrat)', label: 'Montserrat' },
    { value: 'var(--font-poppins)', label: 'Poppins' },
    { value: 'var(--font-nunito-sans)', label: 'Nunito Sans' },
    { value: 'var(--font-raleway)', label: 'Raleway' },
    { value: 'var(--font-rubik)', label: 'Rubik' },
    { value: 'var(--font-work-sans)', label: 'Work Sans' },
    // Serif
    { value: 'var(--font-playfair-display)', label: 'Playfair Display' },
    { value: 'var(--font-merriweather)', label: 'Merriweather' },
    { value: 'var(--font-lora)', label: 'Lora' },
    { value: 'var(--font-cormorant-garamond)', label: 'Cormorant Garamond' },
    { value: 'var(--font-bitter)', label: 'Bitter' },
    { value: 'var(--font-arvo)', label: 'Arvo' },
    // Display
    { value: 'var(--font-oswald)', label: 'Oswald' },
    { value: 'var(--font-anton)', label: 'Anton' },
    { value: 'var(--font-bebas-neue)', label: 'Bebas Neue' },
    { value: 'var(--font-alfa-slab-one)', label: 'Alfa Slab One' },
    // Script & Handwriting
    { value: 'var(--font-lobster)', label: 'Lobster' },
    { value: 'var(--font-pacifico)', label: 'Pacifico' },
    { value: 'var(--font-dancing-script)', label: 'Dancing Script' },
    { value: 'var(--font-caveat)', label: 'Caveat' },
    { value: 'var(--font-satisfy)', label: 'Satisfy' },
    { value: 'var(--font-sacramento)', label: 'Sacramento' },
    // Monospace
    { value: 'var(--font-inconsolata)', label: 'Inconsolata' },
    { value: 'var(--font-jetbrains-mono)', label: 'JetBrains Mono' },
];

const artLibrary = {
    'Smileys & People': [
        { type: 'emoji', content: '😀' }, { type: 'emoji', content: '😂' }, { type: 'emoji', content: '😍' }, { type: 'emoji', content: '😎' },
        { type: 'emoji', content: '🤔' }, { type: 'emoji', content: '😢' }, { type: 'emoji', content: '🥳' }, { type: 'emoji', content: '🤯' },
        { type: 'emoji', content: '👍' }, { type: 'emoji', content: '👎' }, { type: 'emoji', content: '❤️' }, { type: 'emoji', content: '🔥' },
        { type: 'emoji', content: '💯' }, { type: 'emoji', content: '🙏' }, { type: 'emoji', content: '🎉' }, { type: 'emoji', content: '✨' },
    ],
    'Animals & Nature': [
        { type: 'icon', content: Cat }, { type: 'icon', content: Dog }, { type: 'icon', content: TreePine }, { type: 'icon', content: Cloud },
        { type: 'emoji', content: '🌸' }, { type: 'emoji', content: '🌍' }, { type: 'emoji', content: '☀️' }, { type: 'emoji', content: '🌙' },
        { type: 'emoji', content: '🐳' }, { type: 'emoji', content: '🦋' }, { type: 'emoji', content: '🦁' }, { type: 'emoji', content: '🦄' },
    ],
    'Food & Drink': [
        { type: 'icon', content: Pizza }, { type: 'emoji', content: '🍔' }, { type: 'emoji', content: '🍟' }, { type: 'emoji', content: '🍩' },
        { type: 'emoji', content: '☕️' }, { type: 'emoji', content: '🍺' }, { type: 'emoji', content: '🍹' }, { type: 'emoji', content: '🍾' },
    ],
    'Objects & Symbols': [
        { type: 'icon', content: Music }, { type: 'icon', content: Gamepad2 }, { type: 'icon', content: Plane }, { type: 'icon', content: Car },
        { type: 'icon', content: Building }, { type: 'icon', content: Sparkles }, { type: 'icon', content: Heart }, { type: 'icon', content: StarIcon },
        { type: 'emoji', content: '💻' }, { type: 'emoji', content: '📱' }, { type: 'emoji', content: '💰' }, { type: 'emoji', content: '💡' },
    ]
};

const TextRenderer = ({ element }: { element: DesignElement }) => {
    const { 
        text, 
        fontFamily, 
        fontWeight, 
        textColor, 
        textAlign, 
        textShape = 'normal',
        shapeIntensity = 50,
        outlineColor,
        outlineWidth,
    } = element;
    
    const containerRef = useRef<HTMLDivElement>(null);
    const [dynamicFontSize, setDynamicFontSize] = useState(element.fontSize);

     useEffect(() => {
        if (!containerRef.current) return;

        if (!getPathData()) {
           const newSize = (containerRef.current.clientHeight * 0.7); 
           setDynamicFontSize(newSize);
        } else {
            setDynamicFontSize(element.fontSize || 14);
        }
    }, [element.height, element.width, textShape, element.fontSize]);


    const svgFilterId = `outline-${element.id}`;
    
    const textStyle: React.CSSProperties = {
        fontFamily,
        fontSize: `${dynamicFontSize}px`,
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
            case 'funnel-in':
                 return { transform: `perspective(100px) rotateX(${intensity * 20}deg)` };
            case 'funnel-out':
                 return { transform: `perspective(100px) rotateX(${-intensity * 20}deg)` };
            default:
                return {};
        }
    };
    
    function getPathData(): string | null {
        switch (textShape) {
            case 'arch-up':
                return `M 0,${50 - intensity * 25} C ${intensity * 50},${50 - intensity * 75} ${100 - intensity * 50},${50 - intensity * 75} 100,${50 - intensity * 25}`;
            case 'arch-down':
                 return `M 0,50 C 25,${50 + intensity * 50} 75,${50 + intensity * 50} 100,50`;
            case 'circle':
                 const radius = 50 - Math.abs(intensity * 20);
                 return `M ${50 - radius}, 50 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`;
            case 'wave':
                 return `M 0,50 C 25,${50 - intensity * 25} 50,${50 + intensity * 25} 75,${50 - intensity * 25} 100,50`;
            case 'flag':
                 return `M 0,${50 + intensity * 15} C 25,${50 - intensity * 15} 50,${50 + intensity * 15} 75,${50 - intensity * 15} 100,${50 + intensity * 15}`;
            case 'bridge':
                 return `M 0,${50 + intensity * 25} C 25,${50 - intensity * 25} 75,${50 - intensity * 25} 100,${50 + intensity * 25}`;
            case 'triangle-up':
                 return `M 0,${50 + intensity * 25} L 50,${50 - intensity * 25} L 100,${50 + intensity * 25}`;
            case 'triangle-down':
                 return `M 0,${50 - intensity * 25} L 50,${50 + intensity * 25} L 100,${50 - intensity * 25}`;
            case 'stairs-up':
                return `M 0,75 L 25,75 L 25,50 L 50,50 L 50,25 L 75,25 L 75,0`;
            case 'stairs-down':
                return `M 0,0 L 25,0 L 25,25 L 50,25 L 50,50 L 75,50 L 75,75`;
            default:
                return null;
        }
    }
    
    const pathData = getPathData();

    if (pathData) {
        return (
             <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" preserveAspectRatio="none">
                 {outlineColor && outlineWidth && outlineWidth > 0 && (
                    <defs>
                        <filter id={svgFilterId} x="-50%" y="-50%" width="200%" height="200%">
                            <feMorphology operator="dilate" radius={outlineWidth / 10} in="SourceAlpha" result="dilated" />
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
                 <text style={{...textStyle, fontSize: `${element.fontSize}px`, filter: 'none'}} dy={textShape === 'arch-up' ? (element.fontSize || 14) * 0.25 : 0} fill={textColor} filter={outlineColor && outlineWidth && outlineWidth > 0 ? `url(#${svgFilterId})` : 'none'}>
                    <textPath href={`#path-${element.id}`} startOffset="50%" textAnchor="middle">{text}</textPath>
                 </text>
             </svg>
        )
    }

    if (textShape?.startsWith('fade-')) {
         const fadeDirection = textShape.split('-')[1];
         let maskImage = '';
         if (fadeDirection === 'left') maskImage = 'linear-gradient(to right, transparent, black 70%)';
         if (fadeDirection === 'right') maskImage = 'linear-gradient(to left, transparent, black 70%)';
         if (fadeDirection === 'up') maskImage = 'linear-gradient(to bottom, transparent, black 70%)';
         if (fadeDirection === 'down') maskImage = 'linear-gradient(to top, transparent, black 70%)';
         
         const fadedStyle = { ...textStyle, maskImage, WebkitMaskImage: maskImage };
         return <div ref={containerRef} className="w-full h-full flex items-center justify-center p-1 pointer-events-none"><span style={fadedStyle}>{text}</span></div>
    }

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center p-1 pointer-events-none" style={getTransformStyle()}>
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
            <span style={textStyle}>{text}</span>
        </div>
    );
};

const DraggableElement = ({
    element,
    isSelected,
    onSelect,
    onDelete,
    onDuplicate,
    onUpdate,
}: {
    element: DesignElement;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onUpdate: (id: string, updates: Partial<DesignElement>) => void;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [interactionState, setInteractionState] = useState<{
        type: 'drag' | 'resize';
        startX: number;
        startY: number;
        startLeft: number;
        startTop: number;
        startWidth?: number;
        startHeight?: number;
    } | null>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, type: 'drag' | 'resize') => {
        onSelect(element.id);
        e.stopPropagation();
        const parentRect = ref.current?.offsetParent?.getBoundingClientRect();
        if (!parentRect) return;

        setInteractionState({
            type,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: (element.x / 100) * parentRect.width,
            startTop: (element.y / 100) * parentRect.height,
            startWidth: type === 'resize' ? (element.width / 100) * parentRect.width : undefined,
            startHeight: type === 'resize' ? (element.height / 100) * parentRect.height : undefined,
        });
    };

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (!interactionState) return;
            const parentRect = ref.current?.offsetParent?.getBoundingClientRect();
            if (!parentRect) return;

            const dx = e.clientX - interactionState.startX;
            const dy = e.clientY - interactionState.startY;

            if (interactionState.type === 'drag') {
                const newLeft = Math.max(0, Math.min(parentRect.width - (element.width/100 * parentRect.width), interactionState.startLeft + dx));
                const newTop = Math.max(0, Math.min(parentRect.height - (element.height/100 * parentRect.height), interactionState.startTop + dy));
                onUpdate(element.id, { x: (newLeft / parentRect.width) * 100, y: (newTop / parentRect.height) * 100 });
            } else if (interactionState.type === 'resize' && interactionState.startWidth && interactionState.startHeight) {
                if (element.type === 'qr') {
                    // For QR codes, maintain a 1:1 aspect ratio.
                    // We can use the larger of the two dimensions' change.
                    const maxDelta = dx > dy ? dx : dy;
                    const newSize = Math.max(20, interactionState.startWidth + maxDelta);
                    
                    onUpdate(element.id, { 
                        width: (newSize / parentRect.width) * 100, 
                        height: (newSize / parentRect.width) * 100 // Use width's relation to parent for height to maintain aspect ratio
                    });
                } else {
                    const newWidth = Math.max(20, interactionState.startWidth + dx);
                    const newHeight = Math.max(20, interactionState.startHeight + dy);
                    onUpdate(element.id, { width: (newWidth / parentRect.width) * 100, height: (newHeight / parentRect.height) * 100 });
                }
            }
        };

        const handlePointerUp = () => {
            setInteractionState(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [interactionState, element.id, element.type, element.width, element.height, onUpdate]);

    return (
        <div
            ref={ref}
            onPointerDown={(e) => {
                onSelect(element.id);
                e.stopPropagation();
                handlePointerDown(e, 'drag');
            }}
            style={{
                position: 'absolute',
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.width}%`,
                height: `${element.height}%`,
                transform: `rotate(${element.rotation}deg)`,
                outline: isSelected ? '1px solid hsl(var(--primary))' : 'none',
                cursor: interactionState?.type === 'drag' ? 'grabbing' : 'grab',
            }}
        >
            <div className="w-full h-full pointer-events-none">
                {element.type === 'image' && element.imageUrl && (
                    <Image src={element.imageUrl} alt="Uploaded art" fill className="object-contain" />
                )}
                 {element.type === 'art' && (
                    element.artType === 'emoji' ? (
                         <div className="w-full h-full flex items-center justify-center text-6xl" style={{fontSize: 'min(15vw, 15vh)'}}>{element.artContent}</div>
                    ) : (
                        React.createElement(element.artContent as React.FC<any>, { className: "w-full h-full object-contain text-foreground" })
                    )
                )}
                 {element.type === 'qr' && element.text && (
                     <div className="w-full h-full bg-transparent p-2">
                        <QRCode value={element.text} style={{ width: '100%', height: '100%' }} bgColor="transparent" fgColor={element.textColor || "#000000"} level="Q" />
                     </div>
                )}
                {element.type === 'text' && <TextRenderer element={element} />}
            </div>

            {isSelected && (
                <>
                    {/* Delete Button */}
                    <button
                        onPointerDown={(e) => { e.stopPropagation(); onDelete(element.id); }}
                        className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-background border shadow-md flex items-center justify-center cursor-pointer"
                    >
                        <X className="h-4 w-4 text-destructive" />
                    </button>
                    {/* Duplicate Button */}
                    <button
                        onPointerDown={(e) => { e.stopPropagation(); onDuplicate(element.id); }}
                        className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-background border shadow-md flex items-center justify-center cursor-pointer"
                    >
                        <CopyIcon className="h-4 w-4 text-primary" />
                    </button>
                    {/* Resize Handle */}
                    <div
                        onPointerDown={(e) => handlePointerDown(e, 'resize')}
                        className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-background border shadow-md flex items-center justify-center cursor-nwse-resize"
                    >
                        <Expand className="h-4 w-4 text-primary" />
                    </div>
                </>
            )}
        </div>
    );
};

const CustomizationRenderer = ({ product, activeSide, designElements, selectedElementId, onSelect, onDelete, onDuplicate, onUpdate }: { product: any, activeSide: ImageSide, designElements: DesignElement[], selectedElementId: string | null, onSelect: (id: string) => void, onDelete: (id: string) => void, onDuplicate: (id: string) => void, onUpdate: (id: string, updates: Partial<DesignElement>) => void; }) => {
    const productSrc = product.images?.[imageSides.indexOf(activeSide)];

    if (!productSrc) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">No preview available for this side.</p>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full" onClick={() => onSelect('')}>
            <Image src={productSrc} alt={`${product.name} ${activeSide} view`} fill className="object-contain pointer-events-none" />
            {designElements.map((element) => {
                const isVendorArea = !!element.originalAreaId;
                const elementIsOnActiveSide = product.customizationAreas?.[activeSide]?.some((area: CustomizationArea) => area.id === element.originalAreaId);

                if (isVendorArea && !elementIsOnActiveSide) return null; // Don't render vendor areas on wrong side
                
                return (
                    <DraggableElement
                        key={element.id}
                        element={element}
                        isSelected={selectedElementId === element.id}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onUpdate={onUpdate}
                    />
                )
            })}
        </div>
    )
}

const textShapes: { id: TextShape; label: string; icon: React.ElementType }[] = [
    { id: 'normal', label: 'Normal', icon: Type },
    { id: 'arch-up', label: 'Arch Up', icon: Pilcrow },
    { id: 'arch-down', label: 'Arch Down', icon: Pilcrow },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'bulge', label: 'Bulge', icon: ChevronsUpDown },
    { id: 'pinch', label: 'Pinch', icon: FoldVertical },
    { id: 'wave', label: 'Wave', icon: Waves },
    { id: 'flag', label: 'Flag', icon: Flag },
    { id: 'slant-up', label: 'Slant Up', icon: CornerDownRight },
    { id: 'slant-down', label: 'Slant Down', icon: CornerDownLeft },
    { id: 'perspective-left', label: 'Perspective Left', icon: PilcrowLeft },
    { id: 'perspective-right', label: 'Perspective Right', icon: PilcrowRight },
    { id: 'triangle-up', label: 'Triangle Up', icon: Pilcrow },
    { id: 'triangle-down', label: 'Triangle Down', icon: Pilcrow },
    { id: 'fade-left', label: 'Fade Left', icon: Type },
    { id: 'fade-right', label: 'Fade Right', icon: Type },
    { id: 'fade-up', label: 'Fade Up', icon: Type },
    { id: 'fade-down', label: 'Fade Down', icon: Type },
    { id: 'bridge', label: 'Bridge', icon: Pilcrow },
    { id: 'funnel-in', label: 'Funnel In', icon: Maximize },
    { id: 'funnel-out', label: 'Funnel Out', icon: Maximize },
    { id: 'stairs-up', label: 'Stairs Up', icon: CornerDownRight },
    { id: 'stairs-down', label: 'Stairs Down', icon: CornerDownLeft },
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
    const { user, isLoggedIn } = useUser();

    const id = params.id as string;
    const product = useMemo(() => mockProducts.find((p) => p.id === id), [id]);

    const [designElements, setDesignElements, undo, redo, canUndo, canRedo] = useHistoryState<DesignElement[]>([]);
    const [activeSide, setActiveSide] = useState<ImageSide>("front");
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
    const [isTextShapeOpen, setIsTextShapeOpen] = useState(false);
    const [qrValue, setQrValue] = useState("");
    const [qrColor, setQrColor] = useState("#000000");

    // AI Image Generation State
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiStyle, setAiStyle] = useState("");
    const [aiReferenceImage, setAiReferenceImage] = useState<{ file: File, src: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const availableStyles = useMemo(() => mockAiImageStyles.filter(s => s.target === 'personalized' || s.target === 'both'), []);

    const firstCustomizableSide = useMemo(() => {
        if (!product?.customizationAreas) return "front";
        return imageSides.find(side => product.customizationAreas![side]?.length) || "front";
    }, [product]);

    // Firestore interaction
    const tempCustomizationId = useMemo(() => {
        if (!user?.id || !product?.id) return null;
        // In a real app, you'd use a crypto library for a proper hash
        return `${user.id}_${product.id}`;
    }, [user, product]);
    
    // Load initial draft from Firestore
    useEffect(() => {
        if (!tempCustomizationId) return;
        const docRef = doc(db, 'tempCustomizations', tempCustomizationId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setDesignElements(data.designJSON ? JSON.parse(data.designJSON) : []);
            }
        });
        return () => unsubscribe();
    }, [tempCustomizationId, setDesignElements]);
    
    const saveDesign = useCallback(async () => {
        if (!tempCustomizationId || !user?.id || !product?.id) return;
        const docRef = doc(db, 'tempCustomizations', tempCustomizationId);
        await setDoc(docRef, {
            userId: user.id,
            productId: product.id,
            designJSON: JSON.stringify(designElements),
            updatedAt: new Date(),
        }, { merge: true });
    }, [tempCustomizationId, user?.id, product?.id, designElements]);
    
    // Auto-save on any change to design elements
    useEffect(() => {
        const handler = setTimeout(() => {
            saveDesign();
        }, 1000); // Autosave after 1 second of inactivity

        return () => {
            clearTimeout(handler);
        };
    }, [designElements, saveDesign]);

    
     useEffect(() => {
        setSelectedElementId(null);
    }, [activeSide]);

    const handleElementChange = useCallback((elementId: string, value: Partial<DesignElement>) => {
        setDesignElements(prev => prev.map(el => el.id === elementId ? { ...el, ...value } : el));
    }, [setDesignElements]);
    
    const addVendorTextElement = (area: CustomizationArea) => {
        const newElement: DesignElement = {
            id: `text-${area.id}`,
            layerName: area.label,
            type: 'text',
            originalAreaId: area.id,
            x: area.x, y: area.y, width: area.width, height: area.height,
            rotation: 0,
            text: '', // Start with empty text
            fontFamily: `var(--font-${(area.fontFamily || 'pt-sans').replace(/ /g, '-').toLowerCase()})`,
            fontSize: area.fontSize || 14,
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
    
    const addTextElement = () => {
        const newElement: DesignElement = {
            id: `text-${Date.now()}`,
            layerName: 'New Text',
            type: 'text',
            x: 25, y: 40, width: 50, height: 20, rotation: 0,
            text: 'New Text',
            fontFamily: 'var(--font-pt-sans)',
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
                layerName: file.name,
                type: 'image',
                x: 25, y: 25, width: 50, height: 50, rotation: 0,
                imageUrl: URL.createObjectURL(file)
            }
            setDesignElements(prev => [...prev, newElement]);
            setSelectedElementId(newElement.id);
        }
    };
    
    const addArtElement = (art: { type: 'emoji', content: string } | { type: 'icon', content: React.FC<any> }) => {
        const newElement: DesignElement = {
            id: `art-${Date.now()}`,
            layerName: 'Clipart',
            type: 'art',
            x: 35, y: 35, width: 30, height: 30, rotation: 0,
            artType: art.type,
            artContent: art.content,
            textColor: '#000000', // for icons
        }
        setDesignElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    }

     const addQrElement = () => {
        if (!qrValue.trim()) {
            toast({
                variant: 'destructive',
                title: 'QR Code Error',
                description: 'Please enter a URL or text for the QR code.',
            });
            return;
        }
        const newElement: DesignElement = {
            id: `qr-${Date.now()}`,
            layerName: 'QR Code',
            type: 'qr',
            x: 35, y: 35, width: 30, height: 30, rotation: 0,
            text: qrValue,
            textColor: qrColor,
        };
        setDesignElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    };
    
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
            layerName: `${elementToCopy.layerName} (Copy)`,
            x: elementToCopy.x + 5,
            y: elementToCopy.y + 5,
        };
        
        setDesignElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    };
    
    const selectedElement = useMemo(() => designElements.find(el => el.id === selectedElementId), [designElements, selectedElementId]);

    const handleAddToCart = (buyNow = false) => {
        if (!product) return;
        
        addToCart({
            product,
            quantity: 1,
            customizations: {
                // Pass the unique ID of the temporary customization workspace
                customizationRequestId: tempCustomizationId || undefined,
            }
        });
        
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
    
     const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    const handleGenerateAiImage = async () => {
        if (!aiPrompt.trim() && !aiReferenceImage) {
            toast({ variant: 'destructive', title: 'A prompt or reference image is required.' });
            return;
        }
        setIsGenerating(true);
        try {
            const style = availableStyles.find(s => s.id === aiStyle);
            const referenceImageDataUri = aiReferenceImage ? await fileToDataUri(aiReferenceImage.file) : undefined;
            
            const result = await generateImageWithStyle({
                prompt: aiPrompt,
                styleBackendPrompt: style?.backendPrompt || 'photorealistic',
                referenceImageDataUri
            });

            if (result.error) throw new Error(result.error);
            if (!result.imageUrl) throw new Error("AI did not return an image.");

            const newElement: DesignElement = {
                id: `image-${Date.now()}`,
                layerName: aiPrompt.substring(0, 20) || 'AI Image',
                type: 'image',
                x: 25, y: 25, width: 50, height: 50, rotation: 0,
                imageUrl: result.imageUrl,
            };
            setDesignElements(prev => [...prev, newElement]);
            setSelectedElementId(newElement.id);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Generation Failed', description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };
    
    useEffect(() => {
        // Redirect if user is not logged in.
        if (!isLoggedIn) {
            router.push(`/products/${id}`);
            toast({
                title: "Login Required",
                description: "You must be logged in to customize products.",
                variant: "destructive"
            });
        }
    }, [isLoggedIn, id, router, toast]);

    if (!isLoggedIn || !product) {
        // Render a loader or null while redirecting
        return null;
    }
    
    const currentVendorCustomizationAreas = product.customizationAreas?.[activeSide] || [];
    const addedVendorAreaIds = designElements.filter(el => el.originalAreaId).map(el => el.originalAreaId);
    
    const getElementDefaultName = (element: DesignElement) => {
        if (element.layerName) return element.layerName;
        if (element.type === 'text') return element.text || 'Untitled Text';
        if (element.type === 'image') return 'Uploaded Image';
        if (element.type === 'qr') return 'QR Code';
        if (element.type === 'art') return 'Clipart';
        return 'Untitled Layer';
    };

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

            <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6 min-h-0">
                {/* Left Panel: Preview */}
                 <ScrollArea className="md:col-span-2 lg:col-span-4 bg-background rounded-lg shadow-md h-full">
                    <div className="h-full flex flex-col items-center justify-start gap-4 p-4">
                        <div className="relative w-full max-h-full aspect-square flex items-center justify-center">
                            <CustomizationRenderer 
                                product={product} 
                                activeSide={activeSide} 
                                designElements={designElements} 
                                selectedElementId={selectedElementId}
                                onSelect={setSelectedElementId}
                                onDelete={removeElement}
                                onDuplicate={duplicateElement}
                                onUpdate={handleElementChange}
                            />
                        </div>
                    </div>
                    <div className="sticky bottom-0 flex-shrink-0 flex items-center justify-center gap-2 bg-muted/50 p-2 rounded-b-lg border-t mt-auto">
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
                </ScrollArea>

                {/* Right Panel: Tools */}
                 <div className="lg:col-span-1 bg-background rounded-lg shadow-md h-full flex flex-col min-h-0">
                    <Tabs defaultValue="text" className="flex flex-col h-full">
                         <div className="flex-shrink-0">
                            <TabsList className="grid w-full grid-cols-6 p-1 h-auto">
                                <TabsTrigger value="text" className="flex-col h-14"><Type className="h-5 w-5 mb-1"/>Text</TabsTrigger>
                                <TabsTrigger value="ai-image" className="flex-col h-14"><Bot className="h-5 w-5 mb-1"/>AI Image</TabsTrigger>
                                <TabsTrigger value="upload" className="flex-col h-14"><Upload className="h-5 w-5 mb-1"/>Upload</TabsTrigger>
                                <TabsTrigger value="qr" className="flex-col h-14"><QrCode className="h-5 w-5 mb-1"/>QR</TabsTrigger>
                                <TabsTrigger value="art" className="flex-col h-14"><Wand2 className="h-5 w-5 mb-1"/>Art</TabsTrigger>
                                <TabsTrigger value="notes" className="flex-col h-14"><StickyNote className="h-5 w-5 mb-1"/>Notes</TabsTrigger>
                            </TabsList>
                            
                            <div className="flex items-center p-2 border-b">
                                <span className="text-sm font-semibold pl-2">Edit Tools</span>
                                <div className="ml-auto flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={!canUndo}><Undo2 className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={!canRedo}><Redo2 className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        </div>
                        
                         <div className="flex-1 flex flex-col min-h-0">
                            <ScrollArea className="flex-grow">
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
                                                        {fontOptions.map(font => (
                                                            <SelectItem key={font.value} value={font.value}>
                                                                <span style={{ fontFamily: font.value }}>{font.label}</span>
                                                            </SelectItem>
                                                        ))}
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
                                                    <Slider min={-180} max={180} step={1} value={[selectedElement.rotation ?? 0]} onValueChange={([v]) => handleElementChange(selectedElementId!, { rotation: v })} />
                                                    <Input type="number" value={selectedElement.rotation ?? ''} onChange={e => handleElementChange(selectedElementId!, { rotation: parseInt(e.target.value) || 0})} className="w-20 h-9" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Outline</Label>
                                                <div className="space-y-3">
                                                    <ColorPicker value={selectedElement.outlineColor || '#ffffff'} onChange={(color) => handleElementChange(selectedElementId!, { outlineColor: color })} />
                                                    <Slider 
                                                        aria-label="Outline thickness"
                                                        min={0} 
                                                        max={5} 
                                                        step={0.1} 
                                                        value={[selectedElement.outlineWidth || 0]} 
                                                        onValueChange={([v]) => handleElementChange(selectedElementId!, { outlineWidth: v })} 
                                                    />
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
                                        <div className="text-center py-4 text-muted-foreground space-y-4">
                                            {currentVendorCustomizationAreas.length > 0 && (
                                                <Card className="text-left">
                                                    <CardHeader className="p-2"><CardTitle className="text-sm font-semibold">Vendor Areas</CardTitle></CardHeader>
                                                    <CardContent className="p-2 space-y-2">
                                                        {currentVendorCustomizationAreas.map(area => (
                                                            <Button 
                                                                key={area.id}
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full justify-start"
                                                                onClick={() => addVendorTextElement(area)}
                                                                disabled={addedVendorAreaIds.includes(area.id)}
                                                            >
                                                                Add text to "{area.label}"
                                                            </Button>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            )}
                                             <div className="space-y-2 pt-4">
                                                 <p className="text-sm">Select a layer or add a new one.</p>
                                                 <Button variant="secondary" className="w-full" onClick={addTextElement}>Add Freeform Text</Button>
                                             </div>
                                        </div>
                                    )}
                                    </TabsContent>
                                    <TabsContent value="ai-image" className="mt-0">
                                         <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">AI Image Generator</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ai-prompt">Description Prompt</Label>
                                                    <Textarea id="ai-prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g., A majestic dragon flying over a forest" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Style</Label>
                                                    <Select value={aiStyle} onValueChange={setAiStyle}>
                                                        <SelectTrigger><SelectValue placeholder="Select a style..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {availableStyles.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Reference Image (Optional)</Label>
                                                    {aiReferenceImage ? (
                                                        <div className="relative group aspect-video rounded-md border">
                                                            <Image src={aiReferenceImage.src} alt="AI reference" fill className="object-contain rounded-md" />
                                                            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 z-10" onClick={() => setAiReferenceImage(null)}><X className="h-4 w-4"/></Button>
                                                        </div>
                                                    ) : (
                                                        <label htmlFor="ai-ref-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                                                            <Upload className="h-6 w-6 text-muted-foreground"/>
                                                            <span className="text-xs text-muted-foreground mt-1">Upload Reference</span>
                                                        </label>
                                                    )}
                                                    <input id="ai-ref-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files && setAiReferenceImage({ file: e.target.files[0], src: URL.createObjectURL(e.target.files[0])})} />
                                                </div>
                                                <Button className="w-full" disabled={isGenerating || (!aiPrompt.trim() && !aiReferenceImage)} onClick={handleGenerateAiImage}>
                                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                                    {isGenerating ? 'Generating...' : 'Generate Image'}
                                                </Button>
                                            </CardContent>
                                        </Card>
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
                                     <TabsContent value="qr" className="mt-0 space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">QR Code Generator</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                 {selectedElement?.type === 'qr' ? (
                                                     <div className="space-y-2">
                                                        <Label>QR Code Color</Label>
                                                        <ColorPicker value={selectedElement.textColor || '#000000'} onChange={(color) => handleElementChange(selectedElementId!, { textColor: color })} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="qr-value">URL or Text</Label>
                                                            <Input
                                                                id="qr-value"
                                                                value={qrValue}
                                                                onChange={(e) => setQrValue(e.target.value)}
                                                                placeholder="https://example.com"
                                                            />
                                                        </div>
                                                         <div className="space-y-2">
                                                            <Label>QR Code Color</Label>
                                                            <ColorPicker value={qrColor} onChange={setQrColor} />
                                                        </div>
                                                        <Button className="w-full" onClick={addQrElement}>
                                                            Add Transparent QR Code
                                                        </Button>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                     </TabsContent>
                                    <TabsContent value="art" className="mt-0">
                                        <Accordion type="multiple" defaultValue={['Smileys & People']}>
                                            {Object.entries(artLibrary).map(([category, items]) => (
                                                <AccordionItem key={category} value={category}>
                                                    <AccordionTrigger>{category}</AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="grid grid-cols-5 gap-2 pt-2">
                                                            {items.map((art, index) => (
                                                                <button
                                                                    key={`${category}-${index}`}
                                                                    className="flex items-center justify-center h-12 rounded-md hover:bg-accent"
                                                                    onClick={() => addArtElement(art)}
                                                                >
                                                                    {art.type === 'emoji' ? (
                                                                        <span className="text-3xl">{art.content}</span>
                                                                    ) : (
                                                                        React.createElement(art.content, { className: "h-6 w-6 text-muted-foreground" })
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
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
                            
                            <div className="p-4 border-t flex-shrink-0">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between p-2">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2"><Layers className="h-4 w-4"/> Layers</CardTitle>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!selectedElementId} onClick={() => reorderElement(selectedElementId!, 'up')}><ChevronsUp className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!selectedElementId} onClick={() => reorderElement(selectedElementId!, 'down')}><ChevronsDown className="h-4 w-4"/></Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        <ScrollArea className="max-h-48">
                                            <div className="space-y-2 pr-2">
                                            {designElements.length > 0 ? (
                                                [...designElements].reverse().map(element => (
                                                    <div 
                                                        key={element.id}
                                                        className={cn("flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer", selectedElementId === element.id ? "bg-accent" : "hover:bg-muted/50")}
                                                        onClick={() => setSelectedElementId(element.id)}
                                                        onDoubleClick={() => setEditingLayerId(element.id)}
                                                    >
                                                        {element.type === 'text' && <Type className="h-4 w-4 text-muted-foreground"/>}
                                                        {element.type === 'image' && <Upload className="h-4 w-4 text-muted-foreground"/>}
                                                        {element.type === 'art' && <Wand2 className="h-4 w-4 text-muted-foreground"/>}
                                                        {element.type === 'qr' && <QrCode className="h-4 w-4 text-muted-foreground"/>}
                                                        
                                                        {editingLayerId === element.id ? (
                                                            <Input
                                                                autoFocus
                                                                value={element.layerName || ''}
                                                                onChange={(e) => handleElementChange(element.id, { layerName: e.target.value })}
                                                                onBlur={() => setEditingLayerId(null)}
                                                                onKeyDown={(e) => e.key === 'Enter' && setEditingLayerId(null)}
                                                                className="h-7 text-sm"
                                                            />
                                                        ) : (
                                                            <span className="text-sm truncate flex-1">
                                                                {getElementDefaultName(element)}
                                                            </span>
                                                        )}
                                                        
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); removeElement(element.id)}}><Trash2 className="h-4 w-4"/></Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground text-center py-4">Your design is empty.</p>
                                            )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
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
