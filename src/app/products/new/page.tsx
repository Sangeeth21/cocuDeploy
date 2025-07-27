
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { mockCategories } from "@/lib/mock-data"
import { Upload, X, PackageCheck, Rotate3d, CheckCircle } from "lucide-react"
import Image from "next/image"
import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"


type ImageSide = "front" | "back" | "left" | "right" | "top" | "bottom";

const imageSides: { key: ImageSide; label: string }[] = [
    { key: "front", label: "Front" },
    { key: "back", label: "Back" },
    { key: "left", label: "Left" },
    { key: "right", label: "Right" },
    { key: "top", label: "Top" },
    { key: "bottom", label: "Bottom" },
];

type ProductImages = {
    [key in ImageSide]?: string;
};

function ImagePreview3D({ images }: { images: ProductImages }) {
    const [rotation, setRotation] = useState({ x: -20, y: 30 });
    const isDragging = useRef(false);
    const prevMousePos = useRef({ x: 0, y: 0 });

    const hasTopAndBottom = images.top && images.bottom;
    const hasSides = images.left && images.right;

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
            x: prev.x - (hasTopAndBottom ? deltaY * 0.5 : 0),
            y: prev.y + deltaX * 0.5,
        }));
        prevMousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    useEffect(() => {
        const handleGlobalMouseUp = () => { isDragging.current = false };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    const getTransform = () => {
      if (hasTopAndBottom && hasSides) { // Full 3D box
        return `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
      }
      if (hasSides) { // Horizontal 360
        return `rotateY(${rotation.y}deg)`;
      }
      if (hasTopAndBottom) { // Vertical 360 (unlikely scenario, but handled)
         return `rotateX(${rotation.x}deg)`;
      }
      return `rotateY(${rotation.y}deg)`;
    }

    const cubeSize = 250;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div 
                className="w-full flex-1 flex items-center justify-center bg-muted/10 rounded-lg cursor-grab active:cursor-grabbing" 
                style={{ perspective: '1000px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            >
                <div className="relative transition-transform duration-75 ease-out" style={{ width: `${cubeSize}px`, height: `${cubeSize}px`, transformStyle: 'preserve-3d', transform: getTransform() }}>
                    {images.front && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.front})`, transform: `rotateY(0deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.back && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.back})`, transform: `rotateY(180deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.right && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.right})`, transform: `rotateY(90deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.left && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.left})`, transform: `rotateY(-90deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.top && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.top})`, transform: `rotateX(90deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.bottom && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.bottom})`, transform: `rotateX(-90deg) translateZ(${cubeSize / 2}px)` }} />}
                </div>
            </div>
            <div className="w-full px-8">
                <Label htmlFor="rotation-slider" className="text-sm text-muted-foreground mb-2 block text-center">Rotate View</Label>
                <Slider 
                    id="rotation-slider"
                    min={-180}
                    max={180}
                    step={1}
                    value={[rotation.y]}
                    onValueChange={(value) => setRotation(prev => ({...prev, y: value[0]}))}
                />
            </div>
        </div>
    );
}


export default function NewProductPage() {
    const [images, setImages] = useState<ProductImages>({});
    const [status, setStatus] = useState(false);
    const [show3DPreview, setShow3DPreview] = useState(false);
    const [is3DEnabled, setIs3DEnabled] = useState(true);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, side: ImageSide) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const src = URL.createObjectURL(file);
            setImages(prev => ({ ...prev, [side]: src }));
        }
    };

    const removeImage = (side: ImageSide) => {
        setImages(prev => {
            const newImages = { ...prev };
            delete newImages[side];
            return newImages;
        });
    };
    
    const canPreview3D = useMemo(() => {
       return is3DEnabled && images.front && ( (images.left && images.right) || (images.top && images.bottom) );
    }, [images, is3DEnabled]);

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
                    <CardDescription>Upload images for each side of your product to generate a 3D preview.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {imageSides.map(({ key, label }) => (
                            <div key={key} className="space-y-1">
                                <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
                                {images[key] ? (
                                    <div className="relative group aspect-square rounded-md border">
                                        <Image src={images[key]!} alt={`${label} view`} fill className="object-cover rounded-md" />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={(e) => { e.stopPropagation(); removeImage(key); }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label htmlFor={`image-upload-${key}`} className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                        <Upload className="h-8 w-8 text-muted-foreground"/>
                                        <span className="text-xs text-muted-foreground text-center mt-1">Upload</span>
                                        <input id={`image-upload-${key}`} type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(e, key)} />
                                    </label>
                                )}
                            </div>
                        ))}
                    </div>
                     <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-muted/40">
                        <div className="flex items-center space-x-3">
                            <Switch id="3d-toggle" checked={is3DEnabled} onCheckedChange={setIs3DEnabled} />
                            <Label htmlFor="3d-toggle" className="font-medium">Enable 3D Experience</Label>
                        </div>
                        <Button onClick={() => setShow3DPreview(true)} disabled={!canPreview3D} className="w-full sm:w-auto">
                            <Rotate3d className="mr-2" />
                            Preview 3D Model
                        </Button>
                    </div>
                    {!is3DEnabled && <p className="text-xs text-muted-foreground mt-2">Enable 3D Experience to preview the model.</p>}
                     {is3DEnabled && !canPreview3D && <p className="text-xs text-muted-foreground mt-2">Upload at least a 'Front' and both 'Left' & 'Right' images to enable the 3D preview.</p>}
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
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                            <Input id="price" type="number" placeholder="19.99" className="pl-6"/>
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
        <Button>
            Save as Draft
        </Button>
         <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <CheckCircle className="mr-2 h-4 w-4"/>
            Publish Product
        </Button>
      </div>
    </div>
    <Dialog open={show3DPreview} onOpenChange={setShow3DPreview}>
        <DialogContent className="max-w-3xl h-3/4 flex flex-col p-8">
            <DialogHeader>
                <DialogTitle>3D Rotatable Preview</DialogTitle>
            </DialogHeader>
            <ImagePreview3D images={images} />
        </DialogContent>
    </Dialog>
    </>
  );
}
