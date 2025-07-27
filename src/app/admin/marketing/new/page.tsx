
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockProducts, mockReviews } from "@/lib/mock-data";
import type { DisplayProduct } from "@/lib/types";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Save, ArrowLeft, Search, X, Image as ImageIcon, Video, Eye, Smartphone, Laptop, ArrowRight, Star, Store, ShoppingCart, User, PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import type { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const getYoutubeEmbedUrl = (url: string) => {
    let embedUrl = null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
    return embedUrl;
}

type Creative = {
    id: number;
    title: string;
    description: string;
    cta: string;
    image: { file: File, src: string } | null;
    videoUrl: string;
    embedUrl: string | null;
};


export default function NewCampaignPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [date, setDate] = useState<DateRange | undefined>({ from: new Date(), to: addDays(new Date(), 7) });
    const [selectedProducts, setSelectedProducts] = useState<DisplayProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [creatives, setCreatives] = useState<Creative[]>([
        { id: 1, title: 'Campaign Title', description: 'Campaign description goes here.', cta: 'Shop Now', image: null, videoUrl: '', embedUrl: null }
    ]);
    
    const [isPreviewMobile, setIsPreviewMobile] = useState(false);
    const [placement, setPlacement] = useState('hero');

    const handleCreateCampaign = () => {
        toast({
            title: "Campaign Created!",
            description: "The new marketing campaign has been saved successfully.",
        });
        router.push("/admin/marketing");
    };
    
    const handleProductSelect = (product: DisplayProduct) => {
        if (!selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(prev => [...prev, product]);
        }
        setSearchTerm("");
    }
    
    const removeProduct = (productId: string) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    }
    
    const handleAddCreative = () => {
        setCreatives(prev => [...prev, {
            id: Date.now(),
            title: `Creative #${prev.length + 1}`,
            description: 'A new creative description.',
            cta: 'Learn More',
            image: null,
            videoUrl: '',
            embedUrl: null
        }]);
    };
    
    const handleRemoveCreative = (id: number) => {
        if (creatives.length > 1) {
            setCreatives(prev => prev.filter(c => c.id !== id));
        } else {
            toast({ variant: "destructive", title: "Cannot remove the last creative." });
        }
    };

    const handleCreativeChange = (id: number, field: keyof Omit<Creative, 'id' | 'embedUrl'>, value: any) => {
        setCreatives(prev => prev.map(c => {
            if (c.id === id) {
                const updatedCreative = { ...c, [field]: value };
                if (field === 'image' && value !== null) {
                    updatedCreative.videoUrl = '';
                    updatedCreative.embedUrl = null;
                }
                if (field === 'videoUrl') {
                    if (value) {
                       updatedCreative.image = null;
                       updatedCreative.embedUrl = getYoutubeEmbedUrl(value);
                    } else {
                       updatedCreative.embedUrl = null;
                    }
                }
                return updatedCreative;
            }
            return c;
        }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const src = URL.createObjectURL(file);
            handleCreativeChange(id, 'image', { file, src });
        }
    };

    const searchResults = searchTerm
        ? mockProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];
        
    const mockProductForPreview = mockProducts[0];
    const mockReviewForPreview = mockReviews[0];
    const canPreview = creatives.length > 0;


    return (
        <div>
            <Button variant="outline" size="sm" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
            </Button>
            <div className="mb-4">
                <h1 className="text-3xl font-bold font-headline">Create New Campaign</h1>
                <p className="text-muted-foreground">Configure and launch a new marketing initiative.</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 flex flex-col gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Campaign Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="campaign-name">Campaign Name</Label>
                                <Input id="campaign-name" placeholder="e.g. Summer Flash Sale" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="campaign-type">Campaign Type</Label>
                                <Select>
                                    <SelectTrigger id="campaign-type">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sale">Sale</SelectItem>
                                        <SelectItem value="promotion">Promotion</SelectItem>
                                        <SelectItem value="flash-sale">Flash Sale</SelectItem>
                                        <SelectItem value="freebie">Freebie</SelectItem>
                                        <SelectItem value="combo-offer">Combo Offer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date-range">Date Range</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="date-range" variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (
                                                date.to ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")
                                            ) : (<span>Pick a date</span>)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="range" selected={date} onSelect={setDate} numberOfMonths={2} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="campaign-placement">Placement</Label>
                                <Select value={placement} onValueChange={setPlacement}>
                                    <SelectTrigger id="campaign-placement">
                                        <SelectValue placeholder="Select where to display" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hero">Homepage Hero Carousel</SelectItem>
                                        <SelectItem value="banner">Top Announcement Banner</SelectItem>
                                        <SelectItem value="popup">Popup Modal</SelectItem>
                                        <SelectItem value="inline-banner">Inline Homepage Banner</SelectItem>
                                        <SelectItem value="product-page-banner">Product Page Banner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Campaign Creatives</CardTitle>
                                <CardDescription>Add one or more visuals for your campaign.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleAddCreative}><PlusCircle className="mr-2 h-4 w-4"/>Add Creative</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {creatives.map((creative, index) => (
                                <Accordion key={creative.id} type="single" collapsible defaultValue="item-1" className="border rounded-md px-4">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                                                    {creative.image?.src ? <Image src={creative.image.src} alt="thumbnail" width={48} height={48} className="rounded-md object-cover"/> : <ImageIcon className="h-6 w-6 text-muted-foreground"/>}
                                                </div>
                                                <span className="font-semibold text-lg">{creative.title}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label>Creative Title</Label>
                                                <Input value={creative.title} onChange={(e) => handleCreativeChange(creative.id, 'title', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Creative Description</Label>
                                                <Input value={creative.description} onChange={(e) => handleCreativeChange(creative.id, 'description', e.target.value)} />
                                            </div>
                                             <div className="space-y-2">
                                                <Label>CTA Text</Label>
                                                <Input value={creative.cta} onChange={(e) => handleCreativeChange(creative.id, 'cta', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Creative Image</Label>
                                                {creative.image?.src ? (
                                                    <div className="relative group aspect-video rounded-md border">
                                                        <Image src={creative.image.src} alt="Creative preview" fill className="object-contain rounded-md" />
                                                        <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => handleCreativeChange(creative.id, 'image', null)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <label htmlFor={`image-upload-${creative.id}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                                        <ImageIcon className="h-8 w-8 text-muted-foreground"/>
                                                        <span className="text-sm text-muted-foreground text-center mt-1">Click to upload an image</span>
                                                        <input id={`image-upload-${creative.id}`} type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(e, creative.id)} />
                                                    </label>
                                                )}
                                             </div>
                                             <div className="space-y-2">
                                                 <Label>Video URL (YouTube)</Label>
                                                 <Input placeholder="https://www.youtube.com/watch?v=..." value={creative.videoUrl} onChange={(e) => handleCreativeChange(creative.id, 'videoUrl', e.target.value)} />
                                                 {creative.embedUrl && (
                                                     <div className="aspect-video rounded-md overflow-hidden border">
                                                         <iframe src={creative.embedUrl} title="Video Preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                                                     </div>
                                                 )}
                                             </div>
                                             <div className="flex justify-end">
                                                <Button variant="destructive" size="sm" onClick={() => handleRemoveCreative(creative.id)}><Trash2 className="mr-2 h-4 w-4" /> Remove</Button>
                                             </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Associated Products</CardTitle>
                            <CardDescription>Select which products are part of this campaign.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Search for products..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                               {searchResults.length > 0 && searchTerm && (
                                   <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                                       <ul>
                                           {searchResults.map(product => (
                                               <li key={product.id} className="px-3 py-2 text-sm hover:bg-accent cursor-pointer" onClick={() => handleProductSelect(product)}>
                                                   {product.name}
                                               </li>
                                           ))}
                                       </ul>
                                   </div>
                               )}
                            </div>
                             <div className="mt-4 space-y-2">
                                {selectedProducts.length > 0 ? (
                                    selectedProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-2 border rounded-md">
                                             <div className="flex items-center gap-2">
                                                <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded" />
                                                <span className="text-sm font-medium">{product.name}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeProduct(product.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No products selected.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-1 sticky top-24">
                     <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Review your campaign settings before saving or publishing.</p>
                            <div className="flex flex-col gap-2">
                                <Button onClick={handleCreateCampaign}><Save className="mr-2 h-4 w-4" /> Save Campaign</Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                         <Button variant="outline" disabled={!canPreview}><Eye className="mr-2 h-4 w-4" /> Preview</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                                        <DialogHeader>
                                            <DialogTitle>Campaign Preview</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex justify-center items-center gap-2 border-b pb-2">
                                            <Button variant={!isPreviewMobile ? 'secondary' : 'ghost'} size="sm" onClick={() => setIsPreviewMobile(false)}><Laptop className="mr-2 h-4 w-4" /> Desktop</Button>
                                            <Button variant={isPreviewMobile ? 'secondary' : 'ghost'} size="sm" onClick={() => setIsPreviewMobile(true)}><Smartphone className="mr-2 h-4 w-4" /> Mobile</Button>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center p-4 bg-muted/20 rounded-lg overflow-auto">
                                            <div className={cn("bg-background shadow-lg rounded-lg transition-all duration-300 ease-in-out w-full h-full overflow-y-auto", isPreviewMobile && "max-w-[375px] max-h-[667px] mx-auto")}>
                                               {placement === 'hero' && (
                                                    <Carousel className="w-full h-full" opts={{loop: true}}>
                                                        <CarouselContent>
                                                            {creatives.map((creative) => (
                                                                <CarouselItem key={creative.id}>
                                                                    <div className="relative w-full h-full">
                                                                        <div className="relative" style={{height: isPreviewMobile ? '100%' : '100%'}}>
                                                                            {creative.image?.src && <Image src={creative.image.src} alt={creative.title} fill className="object-cover" />}
                                                                            {creative.embedUrl && !creative.image?.src && <iframe src={creative.embedUrl} title="Video Preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>}
                                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                                            <div className="absolute inset-0 flex items-center justify-center text-center">
                                                                                <div className="text-white p-4">
                                                                                    <h1 className={cn("font-bold font-headline drop-shadow-lg", isPreviewMobile ? "text-2xl" : "text-4xl")}>{creative.title}</h1>
                                                                                    <p className={cn("mx-auto mb-4 drop-shadow-md", isPreviewMobile ? "text-sm" : "text-lg")}>{creative.description}</p>
                                                                                    <Button size={isPreviewMobile ? 'sm' : 'lg'} className="bg-accent text-accent-foreground hover:bg-accent/90">{creative.cta}<ArrowRight className="ml-2 h-4 w-4" /></Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CarouselItem>
                                                            ))}
                                                        </CarouselContent>
                                                        {creatives.length > 1 && <>
                                                          <CarouselPrevious className="left-4" />
                                                          <CarouselNext className="right-4" />
                                                        </>}
                                                    </Carousel>
                                                )}
                                                {placement === 'banner' && (
                                                     <div className="w-full h-full flex flex-col">
                                                         <style>
                                                            {`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }`}
                                                        </style>
                                                        <div className="bg-primary text-primary-foreground p-2 text-sm flex items-center relative overflow-hidden whitespace-nowrap">
                                                             <div className="flex-shrink-0 absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-primary"><X className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" /></div>
                                                            <div className="flex items-center gap-4 animate-[marquee_25s_linear_infinite]">
                                                               {creatives.concat(creatives).map((creative, index) => (
                                                                    <div key={`${creative.id}-${index}`} className="flex items-center gap-2 mx-4">
                                                                        {creative.image?.src && <Image src={creative.image.src} alt="Banner Image" width={40} height={40} className="rounded-md object-cover h-8 w-auto inline-block"/>}
                                                                        <span className="font-semibold">{creative.title}</span>
                                                                        <Button variant="link" className="text-primary-foreground h-auto p-0 text-xs hover:underline">{creative.cta}</Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="p-4 flex-1">
                                                            <header className="flex justify-between items-center p-4 border-b">
                                                                <div className="flex items-center gap-2"><Store className="h-6 w-6"/> <span className="font-bold">ShopSphere</span></div>
                                                                <div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5"/> <User className="h-5 w-5"/></div>
                                                            </header>
                                                            <p className="text-sm text-center text-muted-foreground pt-8">Page content...</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {placement === 'popup' && (
                                                    <div className="w-full h-full flex items-center justify-center bg-black/50">
                                                        <div className="bg-background rounded-lg shadow-xl p-0 w-full max-w-sm text-center relative overflow-hidden">
                                                            <button className="absolute top-2 right-2 z-10 bg-background/50 rounded-full p-1"><X className="h-4 w-4"/></button>
                                                            <Carousel className="w-full" opts={{loop: creatives.length > 1}}>
                                                                <CarouselContent>
                                                                    {creatives.map(creative => (
                                                                        <CarouselItem key={creative.id}>
                                                                            <div className="flex flex-col items-center">
                                                                                {creative.image?.src && <Image src={creative.image.src} alt="Popup Image" width={400} height={200} className="w-full h-auto object-cover" />}
                                                                                {creative.embedUrl && !creative.image?.src && (
                                                                                    <div className="aspect-video w-full">
                                                                                        <iframe src={creative.embedUrl} title="Video Preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                                                                                    </div>
                                                                                )}
                                                                                <div className="p-6">
                                                                                    <h2 className="text-lg font-bold font-headline mb-2">{creative.title}</h2>
                                                                                    <p className="text-sm text-muted-foreground mb-4">{creative.description}</p>
                                                                                    <Button>{creative.cta}</Button>
                                                                                </div>
                                                                            </div>
                                                                        </CarouselItem>
                                                                    ))}
                                                                </CarouselContent>
                                                                {creatives.length > 1 && <>
                                                                    <CarouselPrevious className="left-2" />
                                                                    <CarouselNext className="right-2" />
                                                                </>}
                                                            </Carousel>
                                                        </div>
                                                    </div>
                                                )}
                                                {placement === 'inline-banner' && (
                                                    <div className="w-full h-full p-4 md:p-8 space-y-8">
                                                        <div className="text-center">
                                                            <h1 className="text-3xl font-bold font-headline">Homepage Content</h1>
                                                            <p className="text-muted-foreground">This is a section of the homepage.</p>
                                                        </div>
                                                        <Carousel className="w-full max-w-4xl mx-auto" opts={{loop: true}}>
                                                            <CarouselContent>
                                                                {creatives.map(creative => (
                                                                     <CarouselItem key={creative.id}>
                                                                        <div className="relative aspect-video md:aspect-[2.4/1] w-full rounded-lg overflow-hidden">
                                                                            {creative.image?.src && <Image src={creative.image.src} alt={creative.title} fill className="object-cover" />}
                                                                            {creative.embedUrl && !creative.image?.src && <iframe src={creative.embedUrl} title="Video Preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>}
                                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white p-4 text-center">
                                                                                <div>
                                                                                    <h2 className={cn("font-bold font-headline", isPreviewMobile ? "text-xl" : "text-3xl")}>{creative.title}</h2>
                                                                                    <p className={cn(isPreviewMobile ? "text-xs" : "text-sm", "mt-1 mb-2")}>{creative.description}</p>
                                                                                    <Button size="sm">{creative.cta}</Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                     </CarouselItem>
                                                                ))}
                                                            </CarouselContent>
                                                             {creatives.length > 1 && <>
                                                                <CarouselPrevious className="left-[-50px]" />
                                                                <CarouselNext className="right-[-50px]" />
                                                             </>}
                                                        </Carousel>
                                                        <div className="text-center">
                                                            <h2 className="text-2xl font-bold font-headline">Another Section</h2>
                                                            <p className="text-muted-foreground">More content follows below.</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {placement === 'product-page-banner' && (
                                                    <div className="w-full h-full p-4 md:p-8 space-y-8">
                                                        {/* Mock Product Details */}
                                                        <div className={cn("grid gap-6", isPreviewMobile ? "grid-cols-1" : "grid-cols-2")}>
                                                            <div className="aspect-square bg-muted rounded-lg"></div>
                                                            <div className="space-y-3">
                                                                <h1 className="text-2xl font-bold font-headline">{mockProductForPreview.name}</h1>
                                                                <p className="text-2xl">${mockProductForPreview.price.toFixed(2)}</p>
                                                                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><Star className="w-4 h-4 text-accent fill-accent" /><Star className="w-4 h-4 text-accent fill-accent" /><Star className="w-4 h-4 text-accent fill-accent" /><Star className="w-4 h-4 text-muted" /> <span className="text-xs text-muted-foreground ml-1">({mockProductForPreview.reviewCount} reviews)</span></div>
                                                                <p className="text-sm text-muted-foreground">{mockProductForPreview.description.substring(0, 100)}...</p>
                                                                <Button className="w-full">Add to Cart</Button>
                                                            </div>
                                                        </div>
                                                        <Separator />
                                                        {/* Campaign Banner - Carousel for multiple creatives */}
                                                         <Carousel className="w-full" opts={{loop: creatives.length > 1}}>
                                                            <CarouselContent>
                                                                {creatives.map(creative => (
                                                                    <CarouselItem key={creative.id}>
                                                                        <div className="bg-accent/20 border border-accent rounded-lg p-4 flex flex-col md:flex-row items-center gap-4">
                                                                            {creative.image?.src && <Image src={creative.image.src} alt={creative.title} width={100} height={100} className="rounded-md object-cover w-full md:w-24 h-auto md:h-24" />}
                                                                            <div className="flex-1 text-center md:text-left">
                                                                                <h3 className="font-bold">{creative.title}</h3>
                                                                                <p className="text-sm text-muted-foreground">{creative.description}</p>
                                                                            </div>
                                                                            <Button>{creative.cta}</Button>
                                                                        </div>
                                                                    </CarouselItem>
                                                                ))}
                                                            </CarouselContent>
                                                             {creatives.length > 1 && <>
                                                                <CarouselPrevious className="left-2" />
                                                                <CarouselNext className="right-2" />
                                                             </>}
                                                         </Carousel>
                                                         {/* Mock Reviews */}
                                                        <div>
                                                            <h2 className="text-xl font-bold font-headline mb-4">Customer Reviews</h2>
                                                             <Card>
                                                                <CardHeader>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-full bg-muted"></div>
                                                                        <p className="font-semibold text-sm">{mockReviewForPreview.author}</p>
                                                                    </div>
                                                                </CardHeader>
                                                                <CardContent>
                                                                    <p className="text-xs text-muted-foreground">{mockReviewForPreview.comment}</p>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="secondary">Save as Draft</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

    