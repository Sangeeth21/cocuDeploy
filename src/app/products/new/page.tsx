
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { mockCategories } from "@/lib/mock-data"
import { Upload, X, DollarSign, PackageCheck, Box, Rotate3d } from "lucide-react"
import Image from "next/image"
import { useState, useMemo, useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type ImagePreview = {
    src: string;
    is3D: boolean;
};

function ImagePreview3D({ src, alt }: { src: string, alt: string }) {
    const [rotation, setRotation] = useState({ x: 15, y: -30 });
    const isDragging = useRef(false);
    const prevMousePos = useRef({ x: 0, y: 0 });

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
            x: prev.x - deltaY * 0.5,
            y: prev.y + deltaX * 0.5,
        }));

        prevMousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    return (
        <div 
            className="w-full h-full flex items-center justify-center bg-muted/10 rounded-lg cursor-grab active:cursor-grabbing" 
            style={{ perspective: '1000px' }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
        >
            <div className="relative w-4/5 h-4/5 transition-transform duration-75 ease-out" style={{ transformStyle: 'preserve-3d', transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
                <Image src={src} alt={alt} fill className="object-contain rounded-md shadow-2xl border" />
            </div>
        </div>
    );
}

export default function NewProductPage() {
    const [images, setImages] = useState<ImagePreview[]>([]);
    const [status, setStatus] = useState(false);
    const [previewedImage, setPreviewedImage] = useState<ImagePreview | null>(null);


    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const newImagePreviews = files.map(file => ({
                src: URL.createObjectURL(file),
                is3D: false,
            }));
            setImages(prev => [...prev, ...newImagePreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggle3D = (index: number) => {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, is3D: !img.is3D } : img));
    };

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
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" placeholder="e.g. Classic Leather Watch" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe your product in detail..." rows={6} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Media</CardTitle>
                    <CardDescription>Upload high-quality images of your product.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="space-y-2">
                                <div 
                                    className="relative group aspect-square rounded-md border"
                                    onClick={() => img.is3D && setPreviewedImage(img)}
                                >
                                    <Image src={img.src} alt={`Product image ${index + 1}`} fill className="object-cover rounded-md" />
                                    {img.is3D && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-md">
                                            <Rotate3d className="h-8 w-8 text-white" />
                                        </div>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                    <Label htmlFor={`3d-toggle-${index}`} className="text-xs">3D</Label>
                                    <Switch id={`3d-toggle-${index}`} checked={img.is3D} onCheckedChange={() => toggle3D(index)} />
                                </div>
                            </div>
                        ))}
                         <label htmlFor="image-upload" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                            <Upload className="h-8 w-8 text-muted-foreground"/>
                            <span className="text-xs text-muted-foreground text-center mt-1">Upload</span>
                            <input id="image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} />
                        </label>
                    </div>
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
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="price" type="number" placeholder="19.99" className="pl-8"/>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Organize</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select>
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
                            <Switch id="status" checked={status} onCheckedChange={setStatus} />
                            <Label htmlFor="status" className="font-normal">{ status ? "Active" : "Draft"}</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </aside>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline" asChild>
            <Link href="/vendor/dashboard">Cancel</Link>
        </Button>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Save Product
        </Button>
         <Button>
            <PackageCheck className="mr-2 h-4 w-4"/>
            Publish
        </Button>
      </div>
    </div>
    <Dialog open={!!previewedImage} onOpenChange={(isOpen) => !isOpen && setPreviewedImage(null)}>
        <DialogContent className="max-w-3xl h-3/4 flex flex-col">
            <DialogHeader>
                <DialogTitle>3D Rotatable Preview</DialogTitle>
            </DialogHeader>
            {previewedImage && <ImagePreview3D src={previewedImage.src} alt="3D preview" />}
        </DialogContent>
    </Dialog>
    </>
  );
}
