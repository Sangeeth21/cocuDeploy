
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { DraftProduct } from "@/lib/types";
import Image from "next/image";

interface PublishDraftsDialogProps {
    drafts: DraftProduct[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPublish: (selectedIds: string[]) => void;
}

export function PublishDraftsDialog({ drafts, open, onOpenChange, onPublish }: PublishDraftsDialogProps) {
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const { toast } = useToast();

    const handleToggleSelect = (productId: string) => {
        setSelectedProductIds(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId) 
                : [...prev, productId]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProductIds(drafts.map(d => d.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSubmit = () => {
        if (selectedProductIds.length === 0) {
            toast({
                variant: "destructive",
                title: "No products selected",
                description: "Please select at least one product to publish.",
            });
            return;
        }
        onPublish(selectedProductIds);
        toast({
            title: "Products Submitted for Review",
            description: `${selectedProductIds.length} product(s) have been sent to the admin for approval.`,
        });
    };
    
    const allSelected = useMemo(() => selectedProductIds.length > 0 && selectedProductIds.length === drafts.length, [selectedProductIds, drafts]);
    const isIndeterminate = useMemo(() => selectedProductIds.length > 0 && selectedProductIds.length < drafts.length, [selectedProductIds, drafts]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Publish Your Drafts</DialogTitle>
                    <DialogDescription>
                        Congratulations on getting verified! Select which of your draft products you'd like to publish and send for review.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 border-b pb-2">
                    <Checkbox 
                        id="select-all" 
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all drafts"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                        Select All
                    </label>
                </div>
                <ScrollArea className="max-h-80">
                    <div className="space-y-4 pr-4">
                        {drafts.map(product => (
                            <div key={product.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                                <Checkbox 
                                    id={`product-${product.id}`} 
                                    checked={selectedProductIds.includes(product.id)}
                                    onCheckedChange={() => handleToggleSelect(product.id)}
                                />
                                <label htmlFor={`product-${product.id}`} className="flex items-center gap-4 cursor-pointer flex-1">
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                        <Image src={product.imageUrl || 'https://placehold.co/100x100.png'} alt={product.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Do It Later</Button>
                    <Button onClick={handleSubmit}>Publish {selectedProductIds.length} Product(s)</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
