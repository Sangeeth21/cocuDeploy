
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { ListChecks, LineChart, Package, MessageSquare, Sparkles, X, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { mockProducts } from "@/lib/mock-data";
import { Separator } from "@/components/ui/separator";


const previewTemplates = [
    { name: "Modern Minimal", hint: "minimalist interior" },
    { name: "Bold & Vibrant", hint: "vibrant abstract" },
    { name: "Classic Elegance", hint: "classic architecture" }
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


export default function VendorPage() {
  return (
    <div className="container py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Vendor Portal</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Manage your products, track sales, and connect with your customers all in one place.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/vendor/login">Access Your Dashboard</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Product Listing</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Easily add, edit, and manage your product inventory.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Order Management</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Fulfill orders, manage returns, and track shipments.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sales Tracking</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Analyze your sales data with powerful analytics tools.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customer Communication</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Communicate directly with your customers to build loyalty.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline">Landing Page Templates</CardTitle>
            <CardDescription>
              Create beautiful, custom landing pages for your products with our easy-to-use template generator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature allows vendors to create new templates for product detail pages to better showcase their items.
            </p>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                        Explore Templates
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Template Gallery</DialogTitle>
                        <DialogDescription>
                            Here are some of the layouts available to vendors. Sign up to create your own!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                        {previewTemplates.map((template) => (
                            <Dialog key={template.name}>
                                <DialogTrigger asChild>
                                    <Card className="overflow-hidden group cursor-pointer">
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
                                            <CardTitle className="font-headline text-lg">{template.name}</CardTitle>
                                        </CardContent>
                                    </Card>
                                </DialogTrigger>
                                <DialogContent className="p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                                     <DialogHeader>
                                        <DialogTitle className="sr-only">Preview of {template.name} template</DialogTitle>
                                    </DialogHeader>
                                    <div className="relative w-[375px] max-w-[90vw] h-[667px] max-h-[80vh] scale-[0.8] rounded-2xl overflow-hidden border-4 border-foreground bg-background">
                                      <TemplatePreview templateName={template.name} />
                                       <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary text-white bg-black/50 z-10">
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Close</span>
                                        </DialogClose>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                         <Card className="overflow-hidden group border-primary border-2">
                                <CardHeader className="p-0 bg-primary/10">
                                     <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center">
                                        <Sparkles className="h-16 w-16 text-primary" />
                                     </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="font-headline text-lg">Your Custom Template</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">This feature allows you to fully customize the layout and components of your product page.</p>
                                </CardContent>
                            </Card>
                    </div>
                </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
