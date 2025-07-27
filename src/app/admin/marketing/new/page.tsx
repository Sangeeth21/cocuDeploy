

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockProducts, mockReviews, mockCampaigns } from "@/lib/mock-data";
import type { DisplayProduct, MarketingCampaign } from "@/lib/types";
import { format, addDays, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Save, ArrowLeft, Search, X, Image as ImageIcon, Video, Eye, Smartphone, Laptop, ArrowRight, Star, Store, ShoppingCart, User, PlusCircle, Trash2, Clock, Settings } from "lucide-react";
import Image from "next/image";
import type { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Switch } from "@/components/ui/switch";


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
    image: { file?: File, src: string } | null;
    videoUrl: string;
    embedUrl: string | null;
};

const CountdownTimerPreview = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 15, hours: 10, minutes: 32, seconds: 54 });

    useEffect(() => {
        // This is a static preview, but a real implementation would use an interval
    }, []);
    
    return (
        <div className="flex items-center gap-2 justify-center">
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-mono">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground">Days</span>
            </div>
            <span className="text-2xl font-bold">:</span>
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground">Hours</span>
            </div>
             <span className="text-2xl font-bold">:</span>
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground">Mins</span>
            </div>
             <span className="text-2xl font-bold">:</span>
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground">Secs</span>
            </div>
        </div>
    )
}

function IndependentTimerPreview({ title, description, ctaLink }: { title: string; description: string; ctaLink: string }) {
    return (
        <Card className="shadow-lg">
            <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 text-center md:text-left">
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <CountdownTimerPreview />
                <Button asChild size="sm">
                    <Link href={ctaLink}>Get Offer</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function NewCampaignPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [pageTitle, setPageTitle] = useState("Create New Campaign");

    const [campaignName, setCampaignName] = useState("");
    const [campaignType, setCampaignType] = useState<MarketingCampaign['type'] | ''>('');
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [startTime, setStartTime] = useState("00:00");
    const [endTime, setEndTime] = useState("23:59");
    
    // Countdown state
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdownPlacement, setCountdownPlacement] = useState('on-creative');
    const [isTimerConfigOpen, setIsTimerConfigOpen] = useState(false);
    const [timerTitle, setTimerTitle] = useState("Limited Time Offer!");
    const [timerDescription, setTimerDescription] = useState("Don't miss out on these amazing deals.");
    const [timerCtaLink, setTimerCtaLink] = useState("#");
    const [timerIndependentPlacement, setTimerIndependentPlacement] = useState("floating-banner");

    const [selectedProducts, setSelectedProducts] = useState<DisplayProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [creatives, setCreatives] = useState<Creative[]>([
        { id: 1, title: 'Campaign Title', description: 'Campaign description goes here.', cta: 'Shop Now', image: null, videoUrl: '', embedUrl: null }
    ]);
    
    const [isPreviewMobile, setIsPreviewMobile] = useState(false);
    const [placement, setPlacement] = useState('hero');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewingCreative, setPreviewingCreative] = useState<Creative | null>(null);

     useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            const existingCampaign = mockCampaigns.find(c => c.id === id);
            if (existingCampaign) {
                setCampaignId(id);
                setPageTitle(`Editing: ${existingCampaign.name}`);
                setCampaignName(existingCampaign.name);
                setCampaignType(existingCampaign.type);
                setDate({
                    from: parseISO(existingCampaign.startDate),
                    to: parseISO(existingCampaign.endDate),
                });
                setStartTime(existingCampaign.startTime || "00:00");
                setEndTime(existingCampaign.endTime || "23:59");
                setShowCountdown(existingCampaign.showCountdown || false);
            }
        } else {
            // Set initial date on client-side to avoid hydration mismatch
            setDate({ from: new Date(), to: addDays(new Date(), 7) });
        }
    }, [searchParams]);

    const handleCreateCampaign = () => {
        const toastTitle = campaignId ? "Campaign Updated!" : "Campaign Created!";
        const toastDescription = campaignId 
            ? `The campaign "${campaignName}" has been updated successfully.`
            : "The new marketing campaign has been saved successfully.";

        toast({
            title: toastTitle,
            description: toastDescription,
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
    
    const handlePreviewClick = (creative: Creative) => {
        setPreviewingCreative(creative);
        setIsPreviewOpen(true);
    }
    
    const renderMarqueeContent = (creative: Creative) => (
         <div className="flex items-center gap-2 mx-4">
            {showCountdown && countdownPlacement === 'on-creative' && <Clock className="h-4 w-4 text-primary-foreground inline-block"/>}
            {creative.image?.src && <Image src={creative.image.src} alt={creative.title} width={40} height={40} className="rounded-md object-cover h-8 w-auto inline-block"/>}
            <span className="font-semibold">{creative.title}</span>
            <Button variant="link" className="text-primary-foreground h-auto p-0 text-xs hover:underline">{creative.cta}</Button>
        </div>
    );

    return (
        <div>
            <Button variant="outline" size="sm" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
            </Button>
            <div className="mb-4">
                <h1 className="text-3xl font-bold font-headline">{pageTitle}</h1>
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
                                <Input id="campaign-name" placeholder="e.g. Summer Flash Sale" value={campaignName} onChange={e => setCampaignName(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="campaign-type">Campaign Type</Label>
                                <Select value={campaignType} onValueChange={(value) => setCampaignType(value as MarketingCampaign['type'])}>
                                    <SelectTrigger id="campaign-type">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sale">Sale</SelectItem>
                                        <SelectItem value="Promotion">Promotion</SelectItem>
                                        <SelectItem value="Flash Sale">Flash Sale</SelectItem>
                                        <SelectItem value="Freebie">Freebie</SelectItem>
                                        <SelectItem value="Combo Offer">Combo Offer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Date Range</Label>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-time">Start Time</Label>
                                    <Input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="end-time">End Time</Label>
                                    <Input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="campaign-placement">Creative Placement</Label>
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
                            <div className="sm:col-span-2 flex flex-col gap-4 p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Switch id="show-countdown" checked={showCountdown} onCheckedChange={setShowCountdown} />
                                     <Label htmlFor="show-countdown" className="font-medium">Show Countdown Timer</Label>
                                </div>
                                {showCountdown && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pl-10">
                                         <div className="space-y-2">
                                            <Label htmlFor="countdown-placement">Timer Placement</Label>
                                            <Select value={countdownPlacement} onValueChange={setCountdownPlacement}>
                                                <SelectTrigger id="countdown-placement">
                                                    <SelectValue placeholder="Select timer placement" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="on-creative">On Creative</SelectItem>
                                                    <SelectItem value="independent">Independent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         {countdownPlacement === 'independent' && (
                                            <Dialog open={isTimerConfigOpen} onOpenChange={setIsTimerConfigOpen}>
                                                <DialogTrigger asChild>
                                                     <Button variant="outline" className="mt-auto"><Settings className="mr-2 h-4 w-4"/>Configure Timer</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Configure Independent Timer</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid md:grid-cols-2 gap-6 py-4">
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label>Placement</Label>
                                                                <Select value={timerIndependentPlacement} onValueChange={setTimerIndependentPlacement}>
                                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="floating-banner">Floating Bottom Banner</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="timer-title">Title</Label>
                                                                <Input id="timer-title" value={timerTitle} onChange={(e) => setTimerTitle(e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="timer-desc">Description</Label>
                                                                <Input id="timer-desc" value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="timer-cta">CTA Link</Label>
                                                                <Input id="timer-cta" value={timerCtaLink} onChange={(e) => setTimerCtaLink(e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <Label>Preview</Label>
                                                            <div className="p-4 bg-muted rounded-lg h-full flex items-center justify-center">
                                                                 <IndependentTimerPreview title={timerTitle} description={timerDescription} ctaLink={timerCtaLink} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                         )}
                                    </div>
                                )}
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
                            {creatives.map((creative) => (
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
                                             <div className="flex justify-end items-center gap-2">
                                                <Button variant="secondary" size="sm" onClick={() => handlePreviewClick(creative)} disabled={!creative.image && !creative.embedUrl}>
                                                    <Eye className="mr-2 h-4 w-4"/> Preview Creative
                                                </Button>
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
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Creative Preview: {previewingCreative?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center items-center gap-2 border-b pb-2">
                        <Button variant={!isPreviewMobile ? 'secondary' : 'ghost'} size="sm" onClick={() => setIsPreviewMobile(false)}><Laptop className="mr-2 h-4 w-4" /> Desktop</Button>
                        <Button variant={isPreviewMobile ? 'secondary' : 'ghost'} size="sm" onClick={() => setIsPreviewMobile(true)}><Smartphone className="mr-2 h-4 w-4" /> Mobile</Button>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4 bg-muted/20 rounded-lg overflow-auto">
                        {previewingCreative && (
                            <div className={cn("bg-background shadow-lg rounded-lg transition-all duration-300 ease-in-out w-full h-full overflow-y-auto", isPreviewMobile && "max-w-[375px] max-h-[667px] mx-auto")}>
                                {placement === 'hero' && (
                                    <div className="relative w-full h-full">
                                        <div className="relative" style={{height: '100%'}}>
                                            <Image src={previewingCreative.image!.src} alt={previewingCreative.title} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute inset-0 flex items-center justify-center text-center">
                                                <div className="text-white p-4">
                                                    {showCountdown && countdownPlacement === 'on-creative' && <div className="mb-4 p-2 bg-black/30 rounded-lg backdrop-blur-sm inline-block"><CountdownTimerPreview /></div>}
                                                    <h1 className={cn("font-bold font-headline drop-shadow-lg", isPreviewMobile ? "text-2xl" : "text-4xl")}>{previewingCreative.title}</h1>
                                                    <p className={cn("mx-auto mb-4 drop-shadow-md", isPreviewMobile ? "text-sm" : "text-lg")}>{previewingCreative.description}</p>
                                                    <Button size={isPreviewMobile ? 'sm' : 'lg'} className="bg-accent text-accent-foreground hover:bg-accent/90">{previewingCreative.cta}<ArrowRight className="ml-2 h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {placement === 'banner' && (
                                     <div className="w-full h-full flex flex-col">
                                        <div className="bg-primary text-primary-foreground p-2 text-sm flex items-center relative whitespace-nowrap overflow-x-hidden">
                                            <div className="flex animate-marquee">
                                                <div className="flex shrink-0">{renderMarqueeContent(previewingCreative)}</div>
                                                <div className="flex shrink-0" aria-hidden="true">{renderMarqueeContent(previewingCreative)}</div>
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
                                        <Card className="bg-background rounded-lg shadow-xl p-0 w-full max-w-sm text-center relative overflow-hidden">
                                            <button className="absolute top-2 right-2 z-10 bg-background/50 rounded-full p-1"><X className="h-4 w-4"/></button>
                                            <div className="flex flex-col items-center">
                                                <Image src={previewingCreative.image!.src} alt="Popup Image" width={400} height={200} className="w-full h-auto object-cover" />
                                                <div className="p-6">
                                                    <h2 className="text-lg font-bold font-headline mb-2">{previewingCreative.title}</h2>
                                                    {showCountdown && countdownPlacement === 'on-creative' && <div className="mb-4"><CountdownTimerPreview /></div>}
                                                    <p className="text-sm text-muted-foreground mb-4">{previewingCreative.description}</p>
                                                    <Button>{previewingCreative.cta}</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}
                                 {placement === 'inline-banner' && (
                                    <div className="w-full h-full p-4 md:p-8 space-y-8">
                                        <div className="text-center">
                                            <h1 className="text-3xl font-bold font-headline">Homepage Content</h1>
                                            <p className="text-muted-foreground">This is a section of the homepage.</p>
                                        </div>
                                        <div className="relative aspect-video md:aspect-[2.4/1] w-full rounded-lg overflow-hidden">
                                            <Image src={previewingCreative.image!.src} alt={previewingCreative.title} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white p-4 text-center">
                                                <div>
                                                    <h2 className={cn("font-bold font-headline", isPreviewMobile ? "text-xl" : "text-3xl")}>{previewingCreative.title}</h2>
                                                    {showCountdown && countdownPlacement === 'on-creative' && <div className="my-2 p-1 bg-black/30 rounded-lg backdrop-blur-sm inline-block"><CountdownTimerPreview /></div>}
                                                    <p className={cn(isPreviewMobile ? "text-xs" : "text-sm", "mt-1 mb-2")}>{previewingCreative.description}</p>
                                                    <Button size="sm">{previewingCreative.cta}</Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold font-headline">Another Section</h2>
                                            <p className="text-muted-foreground">More content follows below.</p>
                                        </div>
                                    </div>
                                )}
                                {placement === 'product-page-banner' && (
                                    <div className="w-full h-full p-4 md:p-8 space-y-8">
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
                                        <div className="bg-accent/20 border border-accent rounded-lg p-4 flex flex-col md:flex-row items-center gap-4">
                                            <Image src={previewingCreative.image!.src} alt={previewingCreative.title} width={100} height={100} className="rounded-md object-cover w-full md:w-24 h-auto md:h-24" />
                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="font-bold">{previewingCreative.title}</h3>
                                                {showCountdown && countdownPlacement === 'on-creative' && <div className="my-2"><CountdownTimerPreview /></div>}
                                                <p className="text-sm text-muted-foreground">{previewingCreative.description}</p>
                                            </div>
                                            <Button>{previewingCreative.cta}</Button>
                                        </div>
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
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <style jsx>{`
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                    display: flex;
                    width: 200%;
                }
                 .animate-marquee > div {
                    width: 50%;
                 }
            `}</style>
        </div>
    );
}

