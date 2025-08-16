
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockProducts } from "@/lib/mock-data";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useVerification } from "@/context/vendor-verification-context";
import { ProductDetailsPreview } from "./new/_components/product-details-preview";

type Template = {
    id: string;
    name: string;
    layout: string;
    thumbnailPosition: 'left' | 'right' | 'bottom';
    components: string[];
    hint?: string;
};

function TemplatePreview({ templateName, layout, thumbnailPosition }: { templateName: string, layout: string, thumbnailPosition: 'left' | 'right' | 'bottom' }) {
    // This is a simplified preview. In a real app, you'd render the actual components
    // based on the template.components array.
    return (
        <div className="bg-background text-foreground h-full overflow-y-auto">
           <ProductDetailsPreview layout={layout} thumbnailPosition={thumbnailPosition} />
           <Separator className="my-8" />
           <div className="container">
                <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
            </div>
        </div>
    );
}

const mockTemplateHints: { [key: string]: string } = {
    "Modern Minimal": "minimalist interior",
    "Bold & Vibrant": "vibrant abstract",
    "Classic Elegance": "classic architecture",
};

export default function VendorTemplatesPage() {
    const { vendorType } = useVerification();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const vendorId = "VDR001"; // Placeholder
        const q = query(collection(db, "templates"), where("vendorId", "==", vendorId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const templatesData: Template[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                templatesData.push({
                    id: doc.id,
                    hint: mockTemplateHints[data.name] || 'abstract design',
                    ...data,
                } as Template);
            });
            setTemplates(templatesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const dashboardLink = vendorType ? `/vendor/${vendorType}/dashboard` : '/vendor/login';

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-headline">Landing Page Templates</h1>
                    <p className="text-muted-foreground mt-2">Create, manage, and customize templates for your product pages.</p>
                </div>
                 <Button asChild>
                    <Link href="/vendor/both/templates/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Template
                    </Link>
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                     [...Array(3)].map((_, i) => (
                        <Card key={i}><CardContent className="h-64 animate-pulse bg-muted rounded-lg"></CardContent></Card>
                    ))
                ) : (
                    templates.map((template) => (
                        <Card key={template.id} className="overflow-hidden group">
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
                                            <TemplatePreview templateName={template.name} layout={template.layout} thumbnailPosition={template.thumbnailPosition} />
                                        </DialogContent>
                                </Dialog>
                                    <Button variant="secondary" size="sm" asChild>
                                    <Link href={`/vendor/templates/edit/${template.id}`}>Edit</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

             <div className="mt-12 text-center">
                 <Button variant="outline" asChild>
                    <Link href={dashboardLink}>
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
