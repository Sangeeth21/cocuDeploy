
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, X, Smartphone, Laptop, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ProductDetailsPreview } from "@/app/vendor/templates/new/_components/product-details-preview";
import { ReviewsPreview } from "@/app/products/[id]/_components/reviews-preview";
import { SimilarProductsPreview } from "@/app/vendor/templates/new/_components/similar-products-preview";
import { FrequentlyBoughtTogetherPreview } from "@/app/products/[id]/_components/frequently-bought-together-preview";
import { useVerification } from "@/context/vendor-verification-context";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mockProducts } from "@/lib/mock-data";


type ComponentMap = {
    [key: string]: { name: string; component: React.FC<any> };
}

const componentMap: ComponentMap = {
    'details': { name: "Product Details", component: ProductDetailsPreview },
    'frequently-bought': { name: "Frequently Bought Together", component: FrequentlyBoughtTogetherPreview },
    'reviews': { name: "Customer Reviews", component: ReviewsPreview },
    'similar': { name: "Similar Products", component: SimilarProductsPreview },
};


// --- Draggable Item Components ---

function DraggableItem({ id }: { id: string }) {
    const { name } = componentMap[id];
    return (
        <div className="flex items-center gap-2 p-3 bg-card border rounded-lg shadow-sm">
            <Button variant="ghost" className="cursor-grab active:cursor-grabbing p-1 h-auto">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </Button>
            <span className="font-medium flex-1">{name}</span>
        </div>
    );
}

function SortableItem({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <DraggableItem id={id} />
        </div>
    );
}


// --- Main Page Component ---

export default function NewTemplatePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { vendorType } = useVerification();
    const [templateName, setTemplateName] = useState("");
    const [layout, setLayout] = useState('standard');
    const [thumbnailPosition, setThumbnailPosition] = useState<'left' | 'right' | 'bottom'>('bottom');
    const [components, setComponents] = useState(['details', 'frequently-bought', 'reviews', 'similar']);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isPreviewMobile, setIsPreviewMobile] = useState(false);
    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }
    
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setComponents((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    }

    const handleSave = async () => {
        if (!templateName.trim()) {
            toast({
                variant: "destructive",
                title: "Template Name Required",
                description: "Please enter a name for your template before saving.",
            });
            return;
        }
        setIsLoading(true);
        try {
            await addDoc(collection(db, "templates"), {
                name: templateName,
                layout,
                thumbnailPosition,
                components,
                vendorId: "VDR001", // Placeholder for logged-in vendor
                createdAt: new Date(),
            });

            toast({
                title: "Template Saved!",
                description: `The "${templateName}" template has been saved successfully.`,
            });
            router.push("/vendor/templates");
        } catch (error) {
            console.error("Error saving template: ", error);
            toast({ variant: "destructive", title: "Failed to save template." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-headline">Create New Template</h1>
                    <p className="text-muted-foreground mt-2">Design a custom layout for your product pages.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                   <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push(`/vendor/templates`)}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                   <Button variant="outline" onClick={() => setIsPreviewMobile(!isPreviewMobile)} className="w-full sm:w-auto">
                        {isPreviewMobile ? (
                            <Laptop className="mr-2 h-4 w-4" />
                        ) : (
                            <Smartphone className="mr-2 h-4 w-4" />
                        )}
                        {isPreviewMobile ? 'Desktop View' : 'Mobile View'}
                    </Button>
                   <Button className="w-full sm:w-auto" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Template
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* --- Controls Column --- */}
                <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="template-name">Template Name</Label>
                                <Input id="template-name" placeholder="e.g., Summer Collection" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="layout-style">Details Layout</Label>
                                <Select value={layout} onValueChange={setLayout}>
                                    <SelectTrigger id="layout-style">
                                        <SelectValue placeholder="Select a layout" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="minimalist">Minimalist</SelectItem>
                                        <SelectItem value="full-width-image">Full-Width Image</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="thumbnail-pos">Thumbnail Position</Label>
                                <Select value={thumbnailPosition} onValueChange={(v) => setThumbnailPosition(v as any)}>
                                    <SelectTrigger id="thumbnail-pos">
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bottom">Bottom</SelectItem>
                                        <SelectItem value="left">Left</SelectItem>
                                        <SelectItem value="right">Right</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Page Sections</CardTitle>
                             <CardDescription>Drag and drop to reorder the sections of your product page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <DndContext 
                                sensors={sensors} 
                                collisionDetection={closestCenter} 
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={components} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {components.map(id => <SortableItem key={id} id={id} />)}
                                    </div>
                                </SortableContext>
                                 <DragOverlay>
                                    {activeId ? <DraggableItem id={activeId} /> : null}
                                </DragOverlay>
                            </DndContext>
                        </CardContent>
                    </Card>
                </div>

                {/* --- Preview Column --- */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Live Preview</CardTitle>
                        </CardHeader>
                        <CardContent className={cn(
                            "bg-muted/20 p-4 sm:p-8 rounded-lg border transition-all duration-300",
                             isPreviewMobile && "mx-auto"
                        )}>
                           <div className={cn(
                                "transition-all duration-300 prose prose-sm max-w-none prose-headings:font-headline", 
                                isPreviewMobile ? "max-w-sm w-full mx-auto" : "space-y-12"
                            )}>
                             {components.map((id, index) => {
                                const { component: Component } = componentMap[id];
                                let componentProps: any = {};
                                if (id === 'details') {
                                    componentProps = { layout, thumbnailPosition };
                                }
                                if(id === 'reviews') {
                                    // Pass a mock product ID for the preview
                                    componentProps = { productId: mockProducts[0].id };
                                }
                                 if(id === 'frequently-bought') {
                                    componentProps = { currentProduct: mockProducts[0] };
                                }
                                
                                return (
                                    <div key={id} className={cn(
                                        !isPreviewMobile && layout === 'minimalist' && "max-w-4xl mx-auto",
                                        !isPreviewMobile && layout === 'full-width-image' && id === 'details' && "max-w-full",
                                        "py-6"
                                    )}>
                                        <Component {...componentProps} />
                                        {index < components.length -1 && !isPreviewMobile && <Separator className="my-12" />}
                                    </div>
                                )
                             })}
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
