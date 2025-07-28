
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { mockCategories } from "@/lib/mock-data"
import { Upload, X, PackageCheck, Rotate3d, CheckCircle, Wand2, Loader2, BellRing, ShieldCheck, Image as ImageIcon, Video } from "lucide-react"
import Image from "next/image"
import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription as AlertDialogDescriptionComponent } from "@/components/ui/alert-dialog"

import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { generateProductImages } from "./actions"
import { Separator } from "@/components/ui/separator"
import { useVerification } from "@/context/vendor-verification-context"


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
    [key in ImageSide]?: {
        file?: File;
        src: string;
        isGenerated?: boolean;
    };
};

function ImagePreview3D({ images }: { images: ProductImages }) {
    const [rotation, setRotation] = useState({ x: -20, y: 30 });
    const isDragging = useRef(false);
    const prevMousePos = useRef({ x: 0, y: 0 });

    const hasTopAndBottom = images.top?.src && images.bottom?.src;
    const hasSides = images.left?.src && images.right?.src;

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
                    {images.front?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.front.src})`, transform: `rotateY(0deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.back?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.back.src})`, transform: `rotateY(180deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.right?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.right.src})`, transform: `rotateY(90deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.left?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.left.src})`, transform: `rotateY(-90deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.top?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.top.src})`, transform: `rotateX(90deg) translateZ(${cubeSize / 2}px)` }} />}
                    {images.bottom?.src && <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${images.bottom.src})`, transform: `rotateX(-90deg) translateZ(${cubeSize / 2}px)` }} />}
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

const getYoutubeEmbedUrl = (url: string) => {
    let embedUrl = null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
    return embedUrl;
}

export default function NewProductPage() {
    const { toast } = useToast();
    const { isVerified, addDraftProduct } = useVerification();
    
    const [images, setImages] = useState<ProductImages>({});
    const [status, setStatus] = useState(!isVerified); // Default to draft if not verified
    const [requiresConfirmation, setRequiresConfirmation] = useState(false);
    const [show3DPreview, setShow3DPreview] = useState(false);
    const [is3DEnabled, setIs3DEnabled] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isConfirmationAlertOpen, setIsConfirmationAlertOpen] = useState(false);
    const [isDraftInfoOpen, setIsDraftInfoOpen] = useState(false);
    
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");

    const [galleryImages, setGalleryImages] = useState<{file: File, src: string}[]>([]);
    const [videoUrl, setVideoUrl] = useState("");
    const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, side: ImageSide) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const src = URL.createObjectURL(file);
            setImages(prev => ({ ...prev, [side]: { file, src } }));
        }
    };
    
    const handleGalleryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const newImages = files.map(file => ({
                file,
                src: URL.createObjectURL(file)
            }));
            setGalleryImages(prev => [...prev, ...newImages]);
        }
    };
    
    const removeGalleryImage = (srcToRemove: string) => {
        setGalleryImages(prev => {
            const imageToRemove = prev.find(img => img.src === srcToRemove);
            if (imageToRemove) {
                 URL.revokeObjectURL(imageToRemove.src);
            }
            return prev.filter(img => img.src !== srcToRemove);
        });
    }
    
    const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setVideoUrl(url);
        const embedUrl = getYoutubeEmbedUrl(url);
        setVideoEmbedUrl(embedUrl);
    }

    const removeImage = (side: ImageSide) => {
        setImages(prev => {
            const newImages = {...prev};
            if (newImages[side]?.src.startsWith('blob:')) {
                URL.revokeObjectURL(newImages[side]!.src);
            }
            delete newImages[side];
            return newImages;
        })
    }
    
    const handleSaveDraft = () => {
        addDraftProduct({ id: Date.now().toString(), name: productName || "Unnamed Product" });
        if (!isVerified) {
            setIsDraftInfoOpen(true);
        } else {
            toast({ title: "Product Saved as Draft" });
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!images.front?.src) {
            toast({ variant: 'destructive', title: 'Please upload a front image first.' });
            return;
        }
        if (!productName.trim()) {
            toast({ variant: 'destructive', title: 'Please enter a product name.' });
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch(images.front.src);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const result = await generateProductImages({ 
                    productName, 
                    productDescription, 
                    imageDataUri: base64data 
                });

                if (result.error) {
                    throw new Error(result.error);
                }

                if (result.images) {
                    const generatedImages: ProductImages = {};
                    if(result.images.back && !images.back) generatedImages.back = {src: result.images.back, isGenerated: true};
                    if(result.images.left && !images.left) generatedImages.left = {src: result.images.left, isGenerated: true};
                    if(result.images.right && !images.right) generatedImages.right = {src: result.images.right, isGenerated: true};
                    
                    setImages(prev => ({...prev, ...generatedImages}));

                    toast({
                        title: 'Generation Complete',
                        description: 'Missing product views have been generated.',
                    });
                }
            };
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: error.message || 'An unknown error occurred.',
            });
        } finally {
            setIsGenerating(false);
        }
    }, [images, productName, productDescription, toast]);
    
    const canPreview3D = useMemo(() => {
       return is3DEnabled && images.front?.src && images.left?.src && images.right?.src;
    }, [images, is3DEnabled]);

    const handleConfirmationChange = (checked: boolean) => {
        if (checked) {
            setIsConfirmationAlertOpen(true);
        } else {
            setRequiresConfirmation(false);
        }
    };

    const handleConfirmAndEnable = () => {
        setRequiresConfirmation(true);
        toast({
            title: "Pre-Order Check Enabled",
            description: "You will be notified to confirm new orders for this product.",
        });
        setIsConfirmationAlertOpen(false);
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
                        <Input id="name" placeholder="e.g. Classic Leather Watch" value={productName} onChange={e => setProductName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe your product in detail..." rows={6} value={productDescription} onChange={e => setProductDescription(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Media</CardTitle>
                    <CardDescription>Upload images for each side of your product, or use AI to generate them.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {imageSides.map(side => (
                           <div key={side.key}>
                                <Label className="text-xs font-medium text-muted-foreground">{side.label}</Label>
                                {images[side.key]?.src ? (
                                    <div className="relative group aspect-square rounded-md border mt-1">
                                        <Image src={images[side.key]!.src} alt={`${side.label} product image`} fill className="object-cover rounded-md" />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={() => removeImage(side.key)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                         {images[side.key]!.isGenerated && (
                                            <div className="absolute bottom-0 w-full bg-primary/80 text-primary-foreground text-xs text-center py-0.5 rounded-b-md">AI</div>
                                        )}
                                    </div>
                                ) : (
                                    <label htmlFor={`image-upload-${side.key}`} className="mt-1 flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                        <Upload className="h-6 w-6 text-muted-foreground"/>
                                        <span className="text-xs text-muted-foreground text-center mt-1">Upload</span>
                                        <input id={`image-upload-${side.key}`} type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(e, side.key)} />
                                    </label>
                                )}
                           </div>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-muted/40">
                       <div className="text-center sm:text-left">
                           <h3 className="text-base font-semibold">AI-Powered 3D Preview</h3>
                           <p className="text-sm text-muted-foreground">Upload a Front image, then click to generate missing views.</p>
                       </div>
                        <Button onClick={handleGenerate} disabled={isGenerating || !images.front?.src || !productName.trim()}>
                            {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                            {isGenerating ? 'Generating...' : 'Generate Views'}
                        </Button>
                    </div>
                     <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Switch id="3d-toggle" checked={is3DEnabled} onCheckedChange={setIs3DEnabled} />
                            <Label htmlFor="3d-toggle" className="font-medium">Enable 3D Experience</Label>
                        </div>
                        <Button onClick={() => setShow3DPreview(true)} disabled={!canPreview3D} className="w-full sm:w-auto">
                            <Rotate3d className="mr-2" />
                            Preview 3D Model
                        </Button>
                    </div>
                     {is3DEnabled && !canPreview3D && <p className="text-xs text-muted-foreground mt-2">Upload or generate Front, Left, & Right images to enable the 3D preview.</p>}
                     <Separator className="my-6" />
                     
                     <div className="space-y-4">
                        <div>
                             <Label className="font-medium">Gallery Images</Label>
                             <p className="text-sm text-muted-foreground">Upload additional images for display in the product gallery.</p>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {galleryImages.map((image, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image src={image.src} alt={`Gallery image ${index + 1}`} fill className="object-cover rounded-md" />
                                     <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeGalleryImage(image.src)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                             <label htmlFor="gallery-upload" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                <ImageIcon className="h-6 w-6 text-muted-foreground"/>
                                <span className="text-xs text-muted-foreground">Add</span>
                            </label>
                            <input id="gallery-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleGalleryImageUpload} />
                        </div>
                     </div>

                     <Separator className="my-6" />

                     <div className="space-y-4">
                        <div>
                            <Label htmlFor="video-url" className="font-medium">Product Video</Label>
                             <p className="text-sm text-muted-foreground">Add a link to a promotional video on YouTube.</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Video className="h-5 w-5 text-muted-foreground"/>
                             <Input id="video-url" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={handleVideoUrlChange} />
                        </div>
                        {videoEmbedUrl && (
                            <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                <iframe
                                    src={videoEmbedUrl}
                                    title="Product Video Preview"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        )}
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
                            <Switch id="status" checked={!status} onCheckedChange={(checked) => setStatus(!checked)} disabled={!isVerified} />
                            <Label htmlFor="status" className="font-normal">{ status ? "Draft" : "Active"}</Label>
                        </div>
                         {!isVerified && <p className="text-xs text-muted-foreground">Complete verification to publish products.</p>}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Confirmation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4 p-2 border rounded-md">
                        <Switch id="requires-confirmation" checked={requiresConfirmation} onCheckedChange={handleConfirmationChange} />
                        <div className="grid gap-1.5">
                            <Label htmlFor="requires-confirmation" className="font-medium">Pre-Order Check</Label>
                            <p className="text-xs text-muted-foreground">If enabled, you must confirm that this product is deliverable on time before a customer can complete their purchase.</p>
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
        <Button onClick={handleSaveDraft}>
            Save as Draft
        </Button>
         <Button className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={!isVerified || status}>
            <CheckCircle className="mr-2 h-4 w-4"/>
            Publish Product
        </Button>
      </div>
    </div>
    <Dialog open={isDraftInfoOpen} onOpenChange={setIsDraftInfoOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Product Saved as Draft</DialogTitle>
                <DialogDescription>
                    Your new product has been saved. Please complete your account verification to publish it and start selling.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDraftInfoOpen(false)}>Okay</Button>
                <Button asChild><Link href="/vendor/verify">Complete Verification</Link></Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    <Dialog open={show3DPreview} onOpenChange={setShow3DPreview}>
        <DialogContent className="max-w-3xl h-3/4 flex flex-col p-8">
            <DialogHeader>
                <DialogTitle>3D Rotatable Preview</DialogTitle>
            </DialogHeader>
            <ImagePreview3D images={images} />
        </DialogContent>
    </Dialog>
    <AlertDialog open={isConfirmationAlertOpen} onOpenChange={setIsConfirmationAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><ShieldCheck className="text-primary"/> Enable Pre-Order Check?</AlertDialogTitle>
                <AlertDialogDescriptionComponent>
                    By enabling this, you commit to responding to customer requests within 5 hours. Failure to respond will result in the request being automatically rejected.
                </AlertDialogDescriptionComponent>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmAndEnable}>I Understand &amp; Enable</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
