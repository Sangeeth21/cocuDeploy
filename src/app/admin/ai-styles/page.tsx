
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAiImageStyles } from "@/lib/mock-data";
import type { AiImageStyle } from "@/lib/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

function StyleDialog({ open, onOpenChange, style, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; style?: AiImageStyle | null; onSave: (style: Omit<AiImageStyle, 'id' | 'order'>) => void; }) {
    const [name, setName] = useState(style?.name || "");
    const [prompt, setPrompt] = useState(style?.backendPrompt || "");
    const [target, setTarget] = useState(style?.target || "both");
    
    const { toast } = useToast();

    const handleSave = () => {
        if (!name.trim() || !prompt.trim()) {
            toast({ variant: 'destructive', title: "Missing fields", description: "Please provide a name and a backend prompt for the style." });
            return;
        }
        onSave({ name, backendPrompt: prompt, target: target as AiImageStyle['target'] });
        onOpenChange(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{style ? 'Edit Style' : 'Create New Style'}</DialogTitle>
                    <DialogDescription>
                        Define a new style that customers can use for AI image generation.
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="style-name">Style Name</Label>
                        <Input id="style-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Ghibli Style" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="style-prompt">Backend Prompt</Label>
                        <Textarea id="style-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder=", ghibli style anime, painted, whimsical..." />
                         <p className="text-xs text-muted-foreground">This will be appended to the user's prompt. Start with a comma.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="style-target">Target Audience</Label>
                        <Select value={target} onValueChange={setTarget}>
                            <SelectTrigger id="style-target">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="both">Both</SelectItem>
                                <SelectItem value="personalized">Personalized</SelectItem>
                                <SelectItem value="corporate">Corporate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Style</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function SortableItem({ id, style, onEdit, onRemove }: { id: string, style: AiImageStyle, onEdit: (style: AiImageStyle) => void, onRemove: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const { name, backendPrompt, target } = style;
    
    const itemStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={itemStyle} className="flex items-center gap-2 p-3 bg-card border rounded-lg shadow-sm">
            <Button variant="ghost" className="cursor-grab active:cursor-grabbing p-1 h-auto" {...attributes} {...listeners}>
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-medium">{name}</p>
                    <Badge variant={target === 'corporate' ? 'secondary' : 'outline'}>{target}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{backendPrompt}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(style)}>
                <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    );
}

export default function AiStylesPage() {
    const [styles, setStyles] = useState<AiImageStyle[]>(mockAiImageStyles.sort((a,b) => a.order - b.order));
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStyle, setEditingStyle] = useState<AiImageStyle | null>(null);

    const { toast } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setStyles((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const reordered = arrayMove(items, oldIndex, newIndex);
                // Update order property after reordering
                return reordered.map((item, index) => ({ ...item, order: index + 1 }));
            });
        }
        setActiveId(null);
    };

    const handleSaveStyle = (styleData: Omit<AiImageStyle, 'id' | 'order'>) => {
        if (editingStyle) { // Update existing
            setStyles(styles.map(s => s.id === editingStyle.id ? { ...editingStyle, ...styleData } : s));
            toast({ title: "Style updated!" });
        } else { // Create new
            const newStyle: AiImageStyle = {
                id: `style-${Date.now()}`,
                ...styleData,
                order: styles.length + 1,
            };
            setStyles([...styles, newStyle]);
            toast({ title: "Style created!" });
        }
        setEditingStyle(null);
    };

    const handleAddNew = () => {
        setEditingStyle(null);
        setIsDialogOpen(true);
    };
    
    const handleEdit = (style: AiImageStyle) => {
        setEditingStyle(style);
        setIsDialogOpen(true);
    };
    
    const handleRemove = (id: string) => {
        setStyles(styles.filter(s => s.id !== id));
        toast({ title: "Style removed.", variant: "destructive"});
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">AI Image Styles</h1>
                    <p className="text-muted-foreground">Manage and reorder the AI styles available to customers.</p>
                </div>
                 <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Style
                </Button>
            </div>
            <Card>
                <CardContent className="p-4">
                     <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragStart={(e) => setActiveId(e.active.id as string)}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={styles.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {styles.map(style => <SortableItem key={style.id} id={style.id} style={style} onEdit={handleEdit} onRemove={handleRemove} />)}
                            </div>
                        </SortableContext>
                         <DragOverlay>
                            {activeId ? <div className="p-3 bg-card border rounded-lg shadow-sm"><p className="font-medium">{styles.find(s => s.id === activeId)?.name}</p></div> : null}
                        </DragOverlay>
                    </DndContext>
                </CardContent>
            </Card>
             {isDialogOpen && <StyleDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} style={editingStyle} onSave={handleSaveStyle} />}
        </div>
    )
}
