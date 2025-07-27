
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, Active } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ProductDetailsPreview } from "./_components/product-details-preview";
import { ReviewsPreview } from "./_components/reviews-preview";
import { SimilarProductsPreview } from "./_components/similar-products-preview";

const componentMap: Record<string, { name: string; component: React.FC }> = {
    'details': { name: "Product Details", component: ProductDetailsPreview },
    'reviews': { name: "Customer Reviews", component: ReviewsPreview },
    'similar': { name: "Similar Products", component: SimilarProductsPreview },
};


// --- Draggable Item Components ---

function DraggableItem({ id, isOverlay = false }: { id: string, isOverlay?: boolean }) {
    const { name } = componentMap[id];
    return (
        <div className={cn("flex items-center gap-2 p-3 bg-card border rounded-lg shadow-sm", isOverlay && "shadow-lg scale-105 rotate-1")}>
             <GripVertical className="h-5 w-5 text-muted-foreground" />
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-2 p-3 bg-card border rounded-lg shadow-sm cursor-grab active:cursor-grabbing">
             <GripVertical className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium flex-1">{componentMap[id].name}</span>
        </div>
    );
}


// --- Main Page Component ---

export default function NewTemplatePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [templateName, setTemplateName] = useState("");
    const [layout, setLayout] = useState('standard');
    const [components, setComponents] = useState(['details', 'reviews', 'similar']);
    const [activeId, setActiveId] = useState<string | null>(null);
    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    function handleDragStart(event: any) {
        setActiveId(event.active.id);
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
    
    function handleDragCancel() {
        setActiveId(null);
    }

    const handleSave = () => {
        if (!templateName.trim()) {
            toast({
                variant: "destructive",
                title: "Template Name Required",
                description: "Please enter a name for your template before saving.",
            });
            return;
        }
        toast({
            title: "Template Saved!",
            description: `The "${templateName}" template has been saved successfully.`,
        });
        router.push("/vendor/templates");
    };

    return (
        <div className="container py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-headline">Create New Template</h1>
                    <p className="text-muted-foreground mt-2">Design a custom layout for your product pages.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                   <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/vendor/templates')}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                   <Button className="w-full sm:w-auto" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save Template
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
                                <Label htmlFor="layout-style">Layout Style</Label>
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
                                onDragCancel={handleDragCancel}
                            >
                                <SortableContext items={components} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {components.map(id => <SortableItem key={id} id={id} />)}
                                    </div>
                                </SortableContext>
                                 <DragOverlay>
                                    {activeId ? <DraggableItem id={activeId} isOverlay /> : null}
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
                        <CardContent className="bg-muted/20 p-4 sm:p-8 rounded-lg border">
                           <div className={cn("space-y-12", layout === "minimalist" && "max-w-4xl mx-auto text-center")}>
                             {components.map((id, index) => {
                                const { component: Component } = componentMap[id];
                                return (
                                    <div key={id}>
                                        <Component />
                                        {index < components.length -1 && <Separator className="my-12" />}
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
