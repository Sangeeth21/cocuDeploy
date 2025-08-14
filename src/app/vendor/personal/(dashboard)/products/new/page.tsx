

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { mockCategories, customizationOptions, categoryCustomizationMap } from "@/lib/mock-data"
import { Upload, X, PackageCheck, Rotate3d, CheckCircle, Wand2, Loader2, BellRing, ShieldCheck, Image as ImageIcon, Video, Square, Circle as CircleIcon, Info, Bold, Italic, Undo2, Redo2, Trash2, PlusCircle, PilcrowLeft, PilcrowRight, Pilcrow, Type, Truck, Box, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { generateProductImages } from "./actions"
import { Separator } from "@/components/ui/separator"
import { useVerification } from "@/context/vendor-verification-context"
import type { CustomizationArea, CustomizationOption, DisplayProduct } from "@/lib/types";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertTitle, AlertDescription as AlertDesc } from "@/components/ui/alert";


type ImageSide = "front" | "back" | "left" | "right" | "top" | "bottom";

const imageSides: { key: ImageSide; label: string }[] = [
    { key: "front", label: "Front" },
    { key: "back", label: "Back" },
    { key: "left", label: "Left" },
    { key: "right", label: "Right" },
    { key: "top", label: "Top" },
    { key: "bottom", label: "Bottom" },
];

type ProductImage = {
    file?: File;
    src: string;
    isGenerated?: boolean;
    customAreas?: CustomizationArea[];
}

type ProductImages = {
    [key in ImageSide]?: ProductImage
};

// Custom hook for managing state with undo/redo
function useHistoryState<T>(initialState: T): [T, (newState: T | ((prevState: T) => T)) => void, () => void, () => void, boolean, boolean] {
    const historyRef = useRef([initialState]);
    const [index, setIndex] = useState(0);

    const setState = useCallback((newState: T | ((prevState: T) => T)) => {
        const currentState = historyRef.current[index];
        const newHistory = historyRef.current.slice(0, index + 1);
        const resolvedState = typeof newState === 'function' ? (newState as (prevState: T) => T)(currentState) : newState;
        newHistory.push(resolvedState);
        historyRef.current = newHistory;
        setIndex(newHistory.length - 1);
    }, [index]);

    const undo = () => {
        if (index > 0) {
            setIndex(index - 1);
        }
    };

    const redo = () => {
        if (index < historyRef.current.length - 1) {
            setIndex(index + 1);
        }
    };
    
    const canUndo = index > 0;
    const canRedo = index < historyRef.current.length - 1;

    return [historyRef.current[index], setState, undo, redo, canUndo, canRedo];
}


function CustomizationAreaEditor({ image, onSave, onCancel }: { image: ProductImage, onSave: (areas: CustomizationArea[]) => void, onCancel: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [areas, setAreas, undo, redo, canUndo, canRedo] = useHistoryState<CustomizationArea[]>(image.customAreas || []);
    const [liveAreas, setLiveAreas] = useState<CustomizationArea[]>(image.customAreas || []);
    const startAreaRef = useRef<CustomizationArea | null>(null);

    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [activeInteraction, setActiveInteraction] = useState<{ id: string, type: 'drag' | 'resize', handle: string } | null>(null);
    const startMousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        setLiveAreas(areas);
    }, [areas]);

    const selectedArea = useMemo(() => areas.find(a => a.id === selectedAreaId), [areas, selectedAreaId]);
    
    const updateAreaProperty = useCallback(<K extends keyof Omit<CustomizationArea, 'id'>> (id: string, property: K, value: CustomizationArea[K]) => {
        setAreas(prevAreas => prevAreas.map(a => a.id === id ? { ...a, [property]: value } : a));
    }, [setAreas]);

    // Add keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifierKey = isMac ? event.metaKey : event.ctrlKey;

            if (modifierKey) {
                if (event.key.toLowerCase() === 'z') {
                    event.preventDefault();
                    event.shiftKey ? redo() : undo();
                } else if (event.key.toLowerCase() === 'y') {
                    event.preventDefault();
                    redo();
                } else if (event.key.toLowerCase() === 'b') {
                    event.preventDefault();
                    if (selectedArea) {
                        const newWeight = selectedArea.fontWeight === 'bold' ? 'normal' : 'bold';
                        updateAreaProperty(selectedArea.id, 'fontWeight', newWeight);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo, selectedArea, updateAreaProperty]);

    const handleAddArea = (shape: 'rect' | 'ellipse') => {
        const newArea: CustomizationArea = {
            id: `area-${Date.now()}`,
            shape,
            x: 35,
            y: 35,
            width: 30,
            height: 30,
            label: `New ${shape}`,
            fontFamily: 'sans-serif',
            fontSize: 14,
            fontWeight: 'normal',
            textColor: '#000000',
            curveIntensity: 0,
        };
        setAreas(prevAreas => [...prevAreas, newArea]);
        setSelectedAreaId(newArea.id);
    };

    const handlePointerDown = (e: React.PointerEvent, id: string, type: 'drag' | 'resize', handle = 'body') => {
        e.preventDefault();
        e.stopPropagation();
        
        startMousePos.current = { x: e.clientX, y: e.clientY };
        const currentArea = liveAreas.find(a => a.id === id);
        if (!currentArea) return;

        startAreaRef.current = { ...currentArea };
        setActiveInteraction({ id, type, handle });
        setSelectedAreaId(id);
        document.body.style.cursor = handle.includes('resize') ? `${handle}-resize` : 'grabbing';
    }

     const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!activeInteraction || !startAreaRef.current) return;
        e.preventDefault();
        
        const containerWidth = containerRef.current?.clientWidth || 1;
        const containerHeight = containerRef.current?.clientHeight || 1;

        const dx = (e.clientX - startMousePos.current.x) / containerWidth * 100;
        const dy = (e.clientY - startMousePos.current.y) / containerHeight * 100;

        setLiveAreas(currentLiveAreas => {
            return currentLiveAreas.map(area => {
                 if (area.id !== activeInteraction.id) return area;

                 const newArea = { ...area };
                 const initialArea = startAreaRef.current;

                 if (!initialArea) return area;

                if (activeInteraction.type === 'drag') {
                    newArea.x = Math.max(0, Math.min(100 - initialArea.width, initialArea.x + dx));
                    newArea.y = Math.max(0, Math.min(100 - initialArea.height, initialArea.y + dy));
                } else { // resize
                    const handle = activeInteraction.handle;
                    if (handle.includes('e')) newArea.width = Math.max(5, Math.min(100 - initialArea.x, initialArea.width + dx));
                    if (handle.includes('w')) {
                        const newWidth = Math.max(5, initialArea.width - dx);
                        newArea.x = initialArea.x + dx;
                        newArea.width = newWidth;
                    }
                    if (handle.includes('s')) newArea.height = Math.max(5, Math.min(100 - initialArea.y, initialArea.height + dy));
                    if (handle.includes('n')) {
                        const newHeight = Math.max(5, initialArea.height - dy);
                        newArea.y = initialArea.y + dy;
                        newArea.height = newHeight;
                    }
                }
                 return newArea;
            });
        });
    }, [activeInteraction]);


    const handlePointerUp = useCallback(() => {
        if(activeInteraction) {
            setAreas(liveAreas);
        }
        setActiveInteraction(null);
        startAreaRef.current = null;
        document.body.style.cursor = 'default';
    }, [activeInteraction, liveAreas, setAreas]);

    useEffect(() => {
        if (activeInteraction) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);

            return () => {
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
            };
        }
    }, [activeInteraction, handlePointerMove, handlePointerUp]);

    const handleRemoveArea = (idToRemove: string) => {
        setAreas(prevAreas => prevAreas.filter(a => a.id !== idToRemove));
        if (selectedAreaId === idToRemove) {
            setSelectedAreaId(null);
        }
    }
    
    const DraggableArea = ({ area }: { area: CustomizationArea }) => {
        const isSelected = selectedAreaId === area.id;
        const resizeHandles = [
            { cursor: 'nwse-resize', position: 'top-0 left-0', handle: 'nw' },
            { cursor: 'ns-resize', position: 'top-0 left-1/2 -translate-x-1/2', handle: 'n' },
            { cursor: 'nesw-resize', position: 'top-0 right-0', handle: 'ne' },
            { cursor: 'ew-resize', position: 'top-1/2 -translate-y-1/2 left-0', handle: 'w' },
            { cursor: 'ew-resize', position: 'top-1/2 -translate-y-1/2 right-0', handle: 'e' },
            { cursor: 'nesw-resize', position: 'bottom-0 left-0', handle: 'sw' },
            { cursor: 'ns-resize', position: 'bottom-0 left-1/2 -translate-y-1/2', handle: 's' },
            { cursor: 'nwse-resize', position: 'bottom-0 right-0', handle: 'se' },
        ];
        
        const curveIntensity = area.curveIntensity ?? 0;
        const numSlices = 20;

        const Content = () => (
             <div
                className="w-full h-full flex items-center justify-center p-1"
                style={{
                    fontFamily: area.fontFamily,
                    fontSize: `${area.fontSize}px`,
                    fontWeight: area.fontWeight as React.CSSProperties['fontWeight'],
                    color: area.textColor,
                }}
            >
                <span className="truncate">{area.label}</span>
            </div>
        );

        const SlicedContent = () => (
            <>
                {Array.from({ length: numSlices }).map((_, i) => {
                    const sliceAngle = ((i - numSlices / 2 + 0.5) / numSlices) * curveIntensity;
                    return (
                        <div
                            key={i}
                            className="absolute w-full h-full overflow-hidden"
                            style={{
                                left: `${(i / numSlices) * 100}%`,
                                width: `${100 / numSlices}%`,
                                transform: `rotateY(${sliceAngle}deg)`,
                                transformOrigin: `50% 50% -${area.width / 2}px`,
                            }}
                        >
                            <div
                                className="absolute w-full h-full flex items-center justify-center p-1 pointer-events-none"
                                style={{
                                    left: `-${i * 100}%`,
                                    width: `${numSlices * 100}%`,
                                    fontFamily: area.fontFamily,
                                    fontSize: `${area.fontSize}px`,
                                    fontWeight: area.fontWeight as React.CSSProperties['fontWeight'],
                                    color: area.textColor,
                                    background: isSelected ? 'rgba(66, 133, 244, 0.2)' : 'transparent',
                                }}
                            >
                                <span className="truncate">{area.label}</span>
                            </div>
                        </div>
                    );
                })}
            </>
        );


        return (
             <div
                style={{
                    position: 'absolute',
                    left: `${area.x}%`,
                    top: `${area.y}%`,
                    width: `${area.width}%`,
                    height: `${area.height}%`,
                }}
                className={cn(
                    "cursor-grab active:cursor-grabbing",
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                onPointerDown={(e) => handlePointerDown(e, area.id, 'drag')}
            >
                <div
                    className={cn(
                        "w-full h-full border-2 border-dashed border-primary",
                         area.shape === 'ellipse' && "rounded-full"
                    )}
                     style={{
                        perspective: curveIntensity > 0 ? '500px' : undefined,
                        transformStyle: curveIntensity > 0 ? 'preserve-3d' : undefined,
                        background: (isSelected && curveIntensity === 0) ? 'rgba(66, 133, 244, 0.2)' : 'transparent',
                     }}
                >
                    {curveIntensity > 0 ? <SlicedContent /> : <Content />}
                </div>

                {isSelected && resizeHandles.map(handle => (
                    <div
                        key={handle.handle}
                        className={cn("absolute h-3 w-3 bg-primary border border-background rounded-full -m-1.5 z-10", handle.position)}
                        style={{ cursor: `${handle.handle}-resize` }}
                        onPointerDown={(e) => handlePointerDown(e, area.id, 'resize', handle.handle)}
                    />
                ))}
            </div>
        )
    }

    return (
        <>
            <DialogHeader className="p-4 pr-16 border-b flex-shrink-0">
                <div className="flex items-center gap-2">
                    <DialogTitle>Define Customizable Areas</DialogTitle>
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Info className="h-4 w-4"/></Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent><p>How to use the editor</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </DialogHeader>

            <div className="grid grid-cols-5 gap-6 p-6 flex-1 min-h-0">
                <div className="col-span-3 flex flex-col gap-4">
                    <div ref={containerRef} className="flex-1 relative w-full h-full bg-muted/20 rounded-lg overflow-hidden flex items-center justify-center" onPointerDown={() => setSelectedAreaId(null)}>
                        <Image src={image.src} alt="Product to customize" fill className="object-contain select-none" />
                        {liveAreas.map(area => <DraggableArea key={area.id} area={area} />)}
                    </div>
                     <Card>
                        <CardHeader className="p-2 border-b">
                            <CardTitle className="text-sm font-semibold px-2">Defined Areas</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                        {areas.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {areas.map(area => (
                                    <div 
                                        key={area.id}
                                        className={cn("flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors",
                                            selectedAreaId === area.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                                        )}
                                        onClick={() => setSelectedAreaId(area.id)}
                                    >
                                        <span>{area.label}</span>
                                        <button onClick={(e) => {e.stopPropagation(); handleRemoveArea(area.id)}} className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-black/20">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">No areas defined yet.</p>
                        )}
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-2 flex flex-col gap-4">
                     <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">Tools</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex items-center gap-2">
                             <Button variant="outline" onClick={() => handleAddArea('rect')} className="flex-1"><Square className="mr-2 h-4 w-4" /> Rectangle</Button>
                             <Button variant="outline" onClick={() => handleAddArea('ellipse')} className="flex-1"><CircleIcon className="mr-2 h-4 w-4" /> Ellipse</Button>
                             <Separator orientation="vertical" className="h-6" />
                             <TooltipProvider>
                                 <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}><Undo2 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Undo (Ctrl+Z)</p></TooltipContent></Tooltip>
                                 <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}><Redo2 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Redo (Ctrl+Y)</p></TooltipContent></Tooltip>
                             </TooltipProvider>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-1">
                            {selectedArea ? (
                                <ScrollArea className="h-[45vh] pr-2">
                                <div className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="area-label">Area Label</Label>
                                        <Input id="area-label" value={selectedArea.label} onChange={(e) => updateAreaProperty(selectedArea.id, 'label', e.target.value)} />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label>Curvature</Label>
                                            <span className="text-xs text-muted-foreground">{selectedArea.curveIntensity || 0}%</span>
                                        </div>
                                        <Slider
                                            min={0}
                                            max={100}
                                            step={1}
                                            value={[selectedArea.curveIntensity || 0]}
                                            onValueChange={(value) => updateAreaProperty(selectedArea.id, 'curveIntensity', value[0])}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Font</Label>
                                            <Select value={selectedArea.fontFamily} onValueChange={(v) => updateAreaProperty(selectedArea.id, 'fontFamily', v)}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                                                    <SelectItem value="serif">Serif</SelectItem>
                                                    <SelectItem value="monospace">Monospace</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="font-size">Font Size</Label>
                                            <Input id="font-size" type="number" value={selectedArea.fontSize} onChange={e => updateAreaProperty(selectedArea.id, 'fontSize', parseInt(e.target.value, 10))} />
                                        </div>
                                    </div>

                                     <div className="grid grid-cols-2 gap-4 items-center">
                                         <div className="space-y-2">
                                            <Label>Text Style</Label>
                                            <ToggleGroup type="single" value={selectedArea.fontWeight} onValueChange={(v) => updateAreaProperty(selectedArea.id, 'fontWeight', v || 'normal')} className="w-full">
                                                <ToggleGroupItem value="bold" className="flex-1"><Bold className="h-4 w-4"/></ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="text-color">Text Color</Label>
                                            <div className="flex items-center gap-2">
                                                <Input id="text-color" type="color" value={selectedArea.textColor} onChange={e => updateAreaProperty(selectedArea.id, 'textColor', e.target.value)} className="p-1 h-10 w-14" />
                                                <Input value={selectedArea.textColor} onChange={e => updateAreaProperty(selectedArea.id, 'textColor', e.target.value)} className="flex-1" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Button variant="destructive" size="sm" className="w-full !mt-6" onClick={() => handleRemoveArea(selectedArea.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove Selected Area
                                    </Button>
                                </div>
                                </ScrollArea>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center h-full flex items-center justify-center">Select an area to edit its properties.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
             <DialogFooter className="p-4 border-t flex-shrink-0">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSave(areas)}>Save Changes</Button>
            </DialogFooter>

             <Dialog>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>How to Use the Editor</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-muted-foreground space-y-4 py-2">
                        <p><strong className="text-foreground">1. Add a Shape:</strong> Use the "Rectangle" or "Ellipse" buttons to add a new area.</p>
                        <p><strong className="text-foreground">2. Position & Resize:</strong> Click and drag an area on the image to move it. Drag the handles on its edges to resize it.</p>
                        <p><strong className="text-foreground">3. Customize:</strong> Select an area (by clicking it on the image or on its tag below) to edit its properties. Use "Curvature" for items like mugs.</p>
                        <p><strong className="text-foreground">4. Undo/Redo:</strong> Use the undo/redo buttons or keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Y) to step through your changes.</p>
                        <p><strong className="text-foreground">5. Save:</strong> When you're finished, click "Save Changes" to apply your work to this image.</p>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button>Got it</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ImagePreview3D({ images }: { images: ProductImages }) {
    const [rotation, setRotation] = useState({ x: -20, y: 30 });
    const isDragging = useRef(false);
    const prevMousePos = useRef({ x: 0, y: 0 });

    const hasTopAndBottom = images.top?.src && images.bottom?.src;
    const hasSides = images.left?.src && images.right?.src;

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const deltaX = e.clientX - prevMousePos.current.x;
        const deltaY = e.clientY - prevMousePos.current.y;
        setRotation(prev => ({
            x: prev.x - (hasTopAndBottom ? deltaY * 0.5 : 0),
            y: prev.y + deltaX * 0.5,
        }));
        prevMousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    useEffect(() => {
        const handleGlobalMouseUp = () => { isDragging.current = false };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    const getTransform = () => {
      if (hasTopAndBottom && hasSides) { // Full 3D box
        return `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
      }
      if (hasSides) { // Horizontal 360
        return `rotateY(${rotation.y}deg)`;
      }
      if (hasTopAndBottom) { // Vertical 360 (unlikely scenario, but handled)
         return `rotateX(${rotation.x}deg)`;
      }
      return `rotateY(${rotation.y}deg)`;
    }

    const cubeSize = 250;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div 
                className="w-full flex-1 flex items-center justify-center bg-muted/10 rounded-lg cursor-grab active:cursor-grabbing" 
                style={{ perspective: '1000px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            >
                <div className="relative transition-transform duration-75 ease-out" style={{ width: `${cubeSize}px`, height: `${cubeSize}px`, transformStyle: 'preserve-3d', transform: getTransform() }}>
                    {images.front?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.front.src})`, transform: `rotateY(0deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.back?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.back.src})`, transform: `rotateY(180deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.right?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.right.src})`, transform: `rotateY(90deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.left?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.left.src})`, transform: `rotateY(-90deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.top?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.top.src})`, transform: `rotateX(90deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.bottom?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.bottom.src})`, transform: `rotateX(-90deg) translateZ(${cubeSize / 2}px)` }} />}
                </div>
            </div>
            <div className="w-full px-8">
                <Label htmlFor="rotation-slider" className="text-sm text-muted-foreground mb-2 block text-center">Rotate View</Label>
                <Slider 
                    id="rotation-slider"
                    min={-180}
                    max={180}
                    step={1}
                    value={[rotation.y]}
                    onValueChange={(value) => setRotation(prev => ({...prev, y: value[0]}))}
                />
            </div>
        </div>
    );
}

const getYoutubeEmbedUrl = (url: string) => {
    let embedUrl = null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
    return embedUrl;
}

export default function NewProductPage() {
    const { toast } = useToast();
    const { isVerified, addDraftProduct, vendorType } = useVerification();
    
    const [images, setImages] = useState<ProductImages>({});
    const [status, setStatus] = useState<DisplayProduct['status']>(isVerified ? 'Live' : 'Draft');
    const [requiresConfirmation, setRequiresConfirmation] = useState(false);
    const [show3DPreview, setShow3DPreview] = useState(false);
    const [is3DEnabled, setIs3DEnabled] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isConfirmationAlertOpen, setIsConfirmationAlertOpen] = useState(false);
    const [isDraftInfoOpen, setIsDraftInfoOpen] = useState(false);
    const [editingSide, setEditingSide] = useState<ImageSide | null>(null);
    const [isCustomizable, setIsCustomizable] = useState(true);
    
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    
    const [b2bEnabled, setB2bEnabled] = useState(vendorType === 'corporate' || vendorType === 'both');
    const [moq, setMoq] = useState(50);
    const [tierPrices, setTierPrices] = useState<{quantity: number, price: number}[]>([]);


    const [galleryImages, setGalleryImages] = useState<{file: File, src: string}[]>([]);
    const [videoUrl, setVideoUrl] = useState("");
    const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null);
    const [deliveryType, setDeliveryType] = useState('vendor_pays');
    
    const [packageWeight, setPackageWeight] = useState("");
    const [packageLength, setPackageLength] = useState("");
    const [packageWidth, setPackageWidth] = useState("");
    const [packageHeight, setPackageHeight] = useState("");
    
    const canSave = productName && packageWeight && packageLength && packageWidth && packageHeight;

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, side: ImageSide) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const src = URL.createObjectURL(file);
            setImages(prev => ({ ...prev, [side]: { file, src, customAreas: [] } }));
        }
    };
    
    const handleGalleryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const newImages = files.map(file => ({
                file,
                src: URL.createObjectURL(file)
            }));
            setGalleryImages(prev => [...prev, ...newImages]);
        }
    };
    
    const removeGalleryImage = (srcToRemove: string) => {
        setGalleryImages(prev => {
            const imageToRemove = prev.find(img => img.src === srcToRemove);
            if (imageToRemove) {
                 URL.revokeObjectURL(imageToRemove.src);
            }
            return prev.filter(img => img.src !== srcToRemove);
        });
    }
    
    const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setVideoUrl(url);
        const embedUrl = getYoutubeEmbedUrl(url);
        setVideoEmbedUrl(embedUrl);
    }

    const removeImage = (side: ImageSide) => {
        setImages(prev => {
            const newImages = {...prev};
            if (newImages[side]?.src.startsWith('blob:')) {
                URL.revokeObjectURL(newImages[side]!.src);
            }
            delete newImages[side];
            return newImages;
        })
    }
    
    const handleSaveDraft = () => {
        addDraftProduct({ id: Date.now().toString(), name: productName || "Unnamed Product", imageUrl: images.front?.src });
        toast({ title: "Product Saved as Draft" });
        if (!isVerified) {
            setIsDraftInfoOpen(true);
        }
    };
    
    const handlePublish = () => {
        toast({ title: "Product Submitted!", description: "Your product has been submitted for admin review." });
    }
    
    const handleSaveCustomArea = (areas: CustomizationArea[]) => {
        if (editingSide) {
            setImages(prev => ({
                ...prev,
                [editingSide!]: {
                    ...prev[editingSide!]!,
                    customAreas: areas,
                }
            }));
            setEditingSide(null);
            toast({ title: "Customization areas saved!" });
        }
    };


    const handleGenerate = useCallback(async () => {
        if (!productName.trim()) {
            toast({ variant: 'destructive', title: 'Product Name Required', description: 'Please enter a product name before generating images.' });
            return;
        }
        if (!images.front?.file) {
            toast({ variant: 'destructive', title: 'Front Image Required', description: 'Please upload a front image file first.' });
            return;
        }

        setIsGenerating(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(images.front.file);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const result = await generateProductImages({ 
                    productName, 
                    productDescription, 
                    imageDataUri: base64data 
                });

                if (result.error) {
                    throw new Error(result.error);
                }

                if (result.images) {
                    const newImages: ProductImages = {};
                    if (result.images.back) newImages.back = { src: result.images.back, isGenerated: true, customAreas: [] };
                    if (result.images.left) newImages.left = { src: result.images.left, isGenerated: true, customAreas: [] };
                    if (result.images.right) newImages.right = { src: result.images.right, isGenerated: true, customAreas: [] };

                    setImages(prev => ({
                        ...prev,
                        ...(!prev.back && newImages.back ? { back: newImages.back } : {}),
                        ...(!prev.left && newImages.left ? { left: newImages.left } : {}),
                        ...(!prev.right && newImages.right ? { right: newImages.right } : {}),
                    }));

                    toast({
                        title: 'Generation Complete',
                        description: 'Missing product views have been generated.',
                    });
                }
            };
            reader.onerror = (error) => {
                 console.error("FileReader error:", error);
                throw new Error('Failed to read the uploaded image file.');
            };
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: error.message || 'An unknown error occurred.',
            });
        } finally {
            setIsGenerating(false);
        }
    }, [images.front, productName, productDescription, toast]);

    const canPreview3D = useMemo(() => {
       return is3DEnabled && images.front?.src && images.left?.src && images.right?.src;
    }, [images, is3DEnabled]);

    const handleConfirmationChange = (checked: boolean) => {
        if (checked) {
            setIsConfirmationAlertOpen(true);
        } else {
            setRequiresConfirmation(false);
        }
    };

    const handleConfirmAndEnable = () => {
        setRequiresConfirmation(true);
        toast({
            title: "Pre-Order Check Enabled",
            description: "You will be notified to confirm new orders for this product.",
        });
        setIsConfirmationAlertOpen(false);
    };

    
    useEffect(() => {
        setStatus(isVerified ? 'Live' : 'Draft');
    }, [isVerified]);
    
    useEffect(() => {
        setB2bEnabled(vendorType === 'corporate' || vendorType === 'both');
    }, [vendorType]);

  return (
    <>
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline">Add New Product</h1>
            <p className="text-muted-foreground mt-2">Fill out the details below to list a new item.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Product Details</CardTitle>
                    <CardDescription>Enter the name and a compelling description for your product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name <span className="text-destructive">*</span></Label>
                        <Input id="name" placeholder="e.g. Classic Leather Watch" value={productName} onChange={e => setProductName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe your product in detail..." rows={6} value={productDescription} onChange={e => setProductDescription(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Media &amp; Customization</CardTitle>
                     <div className="flex items-center space-x-2 pt-2">
                        <Switch id="is-customizable" checked={isCustomizable} onCheckedChange={setIsCustomizable}/>
                        <Label htmlFor="is-customizable">Is this product customizable?</Label>
                    </div>
                </CardHeader>
                <CardContent>
                     {isCustomizable ? (
                        <>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {imageSides.map(side => (
                               <div key={side.key} className="space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">{side.label}</Label>
                                    {images[side.key]?.src ? (
                                        <div className="relative group aspect-square rounded-md border mt-1">
                                            <Image src={images[side.key]!.src} alt={`${side.label} product image`} fill className="object-cover rounded-md" />
                                            {images[side.key]?.customAreas && images[side.key]!.customAreas!.map(area => (
                                                <div 
                                                    key={area.id}
                                                    className={cn(
                                                        "absolute border-2 border-dashed border-primary/70 bg-primary/10 pointer-events-none",
                                                        area.shape === 'ellipse' && 'rounded-full'
                                                    )}
                                                    style={{
                                                        left: `${area.x}%`,
                                                        top: `${area.y}%`,
                                                        width: `${area.width}%`,
                                                        height: `${area.height}%`,
                                                    }}
                                                />
                                            ))}
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                onClick={() => removeImage(side.key)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                             {images[side.key]!.isGenerated && (
                                                <div className="absolute bottom-0 w-full bg-primary/80 text-primary-foreground text-xs text-center py-0.5 rounded-b-md">AI</div>
                                            )}
                                        </div>
                                    ) : (
                                        <label htmlFor={`image-upload-${side.key}`} className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                            <Upload className="h-8 w-8 text-muted-foreground"/>
                                            <span className="text-xs text-muted-foreground text-center mt-1">Upload</span>
                                            <input id={`image-upload-${side.key}`} type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(e, side.key)} />
                                        </label>
                                    )}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                 <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full text-xs h-7"
                                                    disabled={!images[side.key]}
                                                    onClick={() => setEditingSide(side.key)}
                                                >
                                                    <Square className="mr-1.5 h-3 w-3"/>
                                                    Define Area
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Define customizable areas on this image.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                               </div>
                            ))}
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-muted/40">
                           <div className="text-center sm:text-left">
                               <h3 className="text-base font-semibold">AI-Powered Image Generation</h3>
                               <p className="text-sm text-muted-foreground">Upload a Front image, then click to generate missing views.</p>
                           </div>
                            <Button onClick={handleGenerate} disabled={isGenerating || !images.front?.file || !productName.trim()}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2" />}
                                {isGenerating ? 'Generating...' : 'Generate Views'}
                            </Button>
                        </div>
                         <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Switch id="3d-toggle" checked={is3DEnabled} onCheckedChange={setIs3DEnabled} />
                                <Label htmlFor="3d-toggle" className="font-medium">Enable 3D Experience</Label>
                            </div>
                            <Button onClick={() => setShow3DPreview(true)} disabled={!canPreview3D} className="w-full sm:w-auto">
                                <Rotate3d className="mr-2" />
                                Preview 3D Model
                            </Button>
                        </div>
                         {is3DEnabled && !canPreview3D && <p className="text-xs text-muted-foreground mt-2">Upload or generate Front, Left, &amp; Right images to enable the 3D preview.</p>}
                         <Separator className="my-6" />
                        </>
                     ) : (
                        <Alert variant="default" className="bg-muted/50">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertDesc>Customization tools are disabled. Enable the "Is this product customizable?" switch to define customization areas.</AlertDesc>
                        </Alert>
                     )}
                     
                     <div className="space-y-4">
                        <div>
                             <Label className="font-medium">Gallery Images</Label>
                             <p className="text-sm text-muted-foreground">Upload additional images for display in the product gallery.</p>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {galleryImages.map((image, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image src={image.src} alt={`Gallery image ${index + 1}`} fill className="object-cover rounded-md" />
                                     <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeGalleryImage(image.src)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                             <label htmlFor="gallery-upload" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                <ImageIcon className="h-6 w-6 text-muted-foreground"/>
                                <span className="text-xs text-muted-foreground">Add</span>
                            </label>
                            <input id="gallery-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleGalleryImageUpload} />
                        </div>
                     </div>

                     <Separator className="my-6" />

                     <div className="space-y-4">
                        <div>
                            <Label htmlFor="video-url" className="font-medium">Product Video</Label>
                             <p className="text-sm text-muted-foreground">Add a link to a promotional video on YouTube.</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Video className="h-5 w-5 text-muted-foreground"/>
                             <Input id="video-url" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={handleVideoUrlChange} />
                        </div>
                        {videoEmbedUrl && (
                            <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                <iframe
                                    src={videoEmbedUrl}
                                    title="Product Video Preview"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        )}
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Customization Types</CardTitle>
                    <CardDescription>Select the personalization methods available for this product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-4">This section has been deprecated. Please use the "Define Area" buttons under each product image in the Media section to create customizable zones.</p>
                </CardContent>
            </Card>
        </div>

        <aside className="md:col-span-1 grid gap-8 sticky top-24">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                            <Input id="price" type="number" placeholder="19.99" className="pl-6"/>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Package & Shipping</CardTitle>
                    <CardDescription>Weight and dimensions for logistics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg) <span className="text-destructive">*</span></Label>
                        <Input id="weight" type="number" placeholder="0.5" value={packageWeight} onChange={e => setPackageWeight(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Dimensions (cm) <span className="text-destructive">*</span></Label>
                        <div className="flex gap-2">
                            <Input type="number" placeholder="L" value={packageLength} onChange={e => setPackageLength(e.target.value)} />
                            <Input type="number" placeholder="W" value={packageWidth} onChange={e => setPackageWidth(e.target.value)} />
                            <Input type="number" placeholder="H" value={packageHeight} onChange={e => setPackageHeight(e.target.value)} />
                        </div>
                    </div>
                    <Alert variant="destructive">
                        <Box className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDesc>
                            Please provide accurate details. Any price difference in shipping due to incorrect information will be deducted from your payout.
                        </AlertDesc>
                    </Alert>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Organize</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockCategories.map(category => (
                                    <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input id="tags" placeholder="e.g. watch, leather, timeless" />
                    </div>
                    <div className="space-y-2">
                        <Label>Product Status</Label>
                        <div className="flex items-center gap-4 p-2 border rounded-md">
                            <Switch 
                                id="status" 
                                checked={status === 'Live'} 
                                onCheckedChange={(checked) => setStatus(checked ? 'Live' : 'Draft')}
                                disabled={!isVerified} 
                            />
                            <Label htmlFor="status" className="font-normal">{status}</Label>
                        </div>
                         {!isVerified && <p className="text-xs text-muted-foreground">Complete verification to publish products.</p>}
                    </div>
                </CardContent>
            </Card>

            {(vendorType === 'corporate' || vendorType === 'both') && (
                <Card>
                    <CardHeader>
                        <CardTitle>B2B Settings</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="b2b-enabled" className="font-medium">Enable for Corporate</Label>
                            <Switch id="b2b-enabled" checked={b2bEnabled} onCheckedChange={setB2bEnabled} />
                        </div>
                        {b2bEnabled && (
                            <div className="space-y-4 pt-4 border-t">
                                 <div className="space-y-2">
                                    <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
                                    <Input id="moq" type="number" value={moq} onChange={(e) => setMoq(Number(e.target.value))} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Tiered Pricing</Label>
                                    <div className="space-y-2">
                                        {tierPrices.map((tier, index) => (
                                             <div key={index} className="flex items-center gap-2">
                                                <Input type="number" placeholder="Quantity" value={tier.quantity} onChange={(e) => setTierPrices(current => current.map((t, i) => i === index ? {...t, quantity: Number(e.target.value)} : t))} />
                                                <Input type="number" placeholder="Price" value={tier.price} onChange={(e) => setTierPrices(current => current.map((t, i) => i === index ? {...t, price: Number(e.target.value)} : t))} />
                                                <Button variant="ghost" size="icon" onClick={() => setTierPrices(current => current.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                             </div>
                                        ))}
                                        <Button variant="outline" size="sm" className="w-full" onClick={() => setTierPrices(current => [...current, {quantity: 0, price: 0}])}>
                                            <PlusCircle className="mr-2 h-4 w-4"/> Add Tier
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Confirmation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4 p-2 border rounded-md">
                        <Switch id="requires-confirmation" checked={requiresConfirmation} onCheckedChange={handleConfirmationChange} />
                        <div className="grid gap-1.5">
                            <Label htmlFor="requires-confirmation" className="font-medium">Pre-Order Check</Label>
                            <p className="text-xs text-muted-foreground">If enabled, you must confirm that this product is deliverable on time before a customer can complete their purchase.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </aside>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline" asChild>
            <Link href="/vendor/personal/dashboard">Cancel</Link>
        </Button>
        <Button onClick={handleSaveDraft} disabled={!canSave}>
            Save as Draft
        </Button>
         <Button onClick={handlePublish} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={!isVerified || status === 'Draft' || !canSave}>
            <CheckCircle className="mr-2 h-4 w-4"/>
            Publish Product
        </Button>
      </div>
    </div>
    
    <Dialog open={!!editingSide} onOpenChange={(open) => !open && setEditingSide(null)}>
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        {editingSide && images[editingSide] && (
            <CustomizationAreaEditor 
                image={images[editingSide]!}
                onSave={handleSaveCustomArea}
                onCancel={() => setEditingSide(null)}
            />
        )}
        </DialogContent>
    </Dialog>

    <Dialog open={show3DPreview} onOpenChange={setShow3DPreview}>
        <DialogContent className="max-w-3xl h-3/4 flex flex-col p-8">
            <DialogHeader>
                <DialogTitle>3D Rotatable Preview</DialogTitle>
            </DialogHeader>
            <ImagePreview3D images={images} />
        </DialogContent>
    </Dialog>

    <Dialog open={isDraftInfoOpen} onOpenChange={setIsDraftInfoOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Product Saved as Draft</DialogTitle>
                <DialogDescription>
                    Your new product has been saved. Please complete your account verification to publish it and start selling.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDraftInfoOpen(false)}>Okay</Button>
                <Button asChild><Link href="/vendor/verify">Complete Verification</Link></Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    <AlertDialog open={isConfirmationAlertOpen} onOpenChange={setIsConfirmationAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary"/> Enable Pre-Order Check?
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription>
            By enabling this, you commit to responding to customer requests within 5 hours. Failure to respond will result in the request being automatically rejected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmAndEnable}>I Understand &amp; Enable</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

