
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { PlusCircle, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockProducts } from "@/lib/mock-data";


const templates = [
    { name: "Modern Minimal", hint: "minimalist interior", layout: "standard" },
    { name: "Bold & Vibrant", hint: "vibrant abstract", layout: "split" },
    { name: "Classic Elegance", hint: "classic architecture", layout: "gallery" }
];

function TemplatePreview({ templateName }: { templateName: string }) {
    const product = mockProducts[0]; 

    return (
        <div className="bg-background text-foreground h-full overflow-y-auto">
            <div className={cn("container py-8", 
                templateName === "Bold & Vibrant" && "grid md:grid-cols-2 gap-12 items-center",
                templateName === "Classic Elegance" && "max-w-6xl"
            )}>
                 {templateName === "Classic Elegance" && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="md:col-span-2 relative aspect-video">
                             <Image src={product.imageUrl} alt={product.name} fill className="object-cover rounded-lg" data-ai-hint="product image" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative aspect-square"><Image src={product.images?.[1] || 'https://placehold.co/400x400.png'} alt="thumbnail 1" fill className="object-cover rounded-lg" data-ai-hint="product image" /></div>
                            <div className="relative aspect-square"><Image src={product.images?.[2] || 'https://placehold.co/400x400.png'} alt="thumbnail 2" fill className="object-cover rounded-lg" data-ai-hint="product image" /></div>
                        </div>
                    </div>
                 )}

                <div className={cn(templateName === "Bold & Vibrant" && "md:order-2")}>
                     {templateName !== "Classic Elegance" && (
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg mb-4">
                             <Image src={product.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint="product image" />
                         </div>
                     )}
                </div>
               
                <div className={cn("space-y-6", templateName === "Bold & Vibrant" && "md:order-1")}>
                     <p className="text-sm font-medium text-primary">{product.category}</p>
                     <h1 className={cn("font-bold font-headline",
                         templateName === "Bold & Vibrant" ? "text-5xl" : "text-4xl"
                     )}>{product.name}</h1>
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
                     <div className="flex flex-col sm:flex-row gap-2">
                        <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Add to Cart</Button>
                        <Button size="lg" variant="outline" className="w-full">Message Vendor</Button>
                     </div>
                </div>
            </div>
            <Separator className="my-8" />
             <div className="container">
                <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
            </div>
        </div>
    );
}


export default function VendorTemplatesPage() {

    return (
        <div className="container py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-headline">Landing Page Templates</h1>
                    <p className="text-muted-foreground mt-2">Create, manage, and customize templates for your product pages.</p>
                </div>
                 <Button asChild>
                    <Link href="/vendor/templates/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Template
                    </Link>
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                    <Card key={template.name} className="overflow-hidden group">
                        <CardHeader className="p-0">
                             <div className="relative aspect-video w-full overflow-hidden">
                                <Image 
                                    src={`https://placehold.co/600x400.png`} 
                                    alt={`${template.name} Template Preview`} 
                                    fill 
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={template.hint}
                                />
                             </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <CardTitle className="font-headline text-xl">{template.name}</CardTitle>
                            <div className="flex justify-end gap-2 mt-4">
                               <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">Preview</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-6xl h-[90vh] p-0">
                                         <DialogHeader className="p-4 border-b flex-row items-center justify-between">
                                            <DialogTitle>Preview: {template.name}</DialogTitle>
                                            <DialogClose asChild>
                                                 <Button variant="ghost" size="icon"><X/></Button>
                                            </DialogClose>
                                         </DialogHeader>
                                        <TemplatePreview templateName={template.name} />
                                    </DialogContent>
                               </Dialog>
                                <Button variant="secondary" size="sm" asChild>
                                  <Link href="/vendor/templates/new">Edit</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

             <div className="mt-12 text-center">
                 <Button variant="outline" asChild>
                    <Link href="/vendor/dashboard">
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
