
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, Save, X, Move } from "lucide-react";
import { mockProducts, mockReviews } from "@/lib/mock-data";
import Image from "next/image";
import { Star, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


// --- Reusable Preview Components ---

function ProductDetailsPreview() {
    const product = mockProducts[0];
    return (
        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint="product image" />
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-sm font-medium text-primary">{product.category}</p>
              <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn('h-5 w-5', i < Math.round(product.rating) ? 'text-accent fill-accent' : 'text-muted-foreground/30')} />
                  ))}
                </div>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
              <p className="text-3xl font-bold font-body">${product.price.toFixed(2)}</p>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <div className="flex gap-2"><Button size="lg" className="w-full">Add to Cart</Button><Button size="lg" variant="outline" className="w-full">Message Vendor</Button></div>
            </div>
        </div>
    )
}

function ReviewsPreview() {
    return (
        <div>
          <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {mockReviews.slice(0, 2).map(review => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden"><Image src={review.avatarUrl} alt={review.author} fill data-ai-hint="person face" /></div>
                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('h-4 w-4', i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/30')} />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-1">{review.title}</h3>
                  <p className="text-muted-foreground text-sm">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    )
}

function SimilarProductsPreview() {
    return (
         <div>
            <h2 className="text-2xl font-bold font-headline mb-6">Similar Products</h2>
            <p className="text-muted-foreground text-center">Preview of similar products would appear here.</p>
        </div>
    )
}


const componentMap: Record<string, { name: string; component: React.FC }> = {
    'details': { name: "Product Details", component: ProductDetailsPreview },
    'reviews': { name: "Customer Reviews", component: ReviewsPreview },
    'similar': { name: "Similar Products", component: SimilarProductsPreview },
};

// --- Draggable Item Component ---

function SortableItem({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const { name } = componentMap[id];

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 bg-card border rounded-lg">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1"><GripVertical className="h-5 w-5 text-muted-foreground" /></button>
            <span className="font-medium flex-1">{name}</span>
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
    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setComponents((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-headline">Create New Template</h1>
                    <p className="text-muted-foreground mt-2">Design a custom layout for your product pages.</p>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" onClick={() => router.push('/vendor/templates')}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                   <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save Template
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* --- Controls Column --- */}
                <div className="lg:col-span-1 space-y-8 sticky top-24">
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
                             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={components} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {components.map(id => <SortableItem key={id} id={id} />)}
                                    </div>
                                </SortableContext>
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
                             {components.map((id) => {
                                const { component: Component } = componentMap[id];
                                return (
                                    <div key={id}>
                                        <Component />
                                        {id !== components[components.length - 1] && <Separator className="my-12" />}
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


    