import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VendorTemplatesPage() {
    return (
        <div className="container py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-headline">Landing Page Templates</h1>
                    <p className="text-muted-foreground mt-2">Create, manage, and customize templates for your product pages.</p>
                </div>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Template
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    {name: "Modern Minimal", hint: "minimalist interior"}, 
                    {name: "Bold & Vibrant", hint: "vibrant abstract"}, 
                    {name: "Classic Elegance", hint: "classic architecture"}
                ].map((template) => (
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
                                <Button variant="outline" size="sm">Preview</Button>
                                <Button variant="secondary" size="sm">Edit</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center mt-12">
                <Link href="/vendor">
                    <Button variant="outline">
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        Back to Vendor Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
}
