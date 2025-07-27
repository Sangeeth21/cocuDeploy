

"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { mockProducts, mockReviews } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Plus, MessageSquare, Paperclip, X, File as FileIcon, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";


const ProductCard = dynamic(() => import('@/components/product-card').then(mod => mod.ProductCard), {
  loading: () => <div className="flex flex-col space-y-3">
      <Skeleton className="h-[225px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
       <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-2/4" />
      </div>
    </div>,
});

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find((p) => p.id === params.id);
  const { toast } = useToast();
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const MAX_MESSAGE_LENGTH = 1200; // Approx 200 words

  if (!product) {
    notFound();
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        if (attachments.length + newFiles.length > 5) {
             toast({
                variant: "destructive",
                title: "Attachment Limit Exceeded",
                description: "You can only attach up to 5 files.",
            });
            return;
        }
        setAttachments(prev => [...prev, ...newFiles]);
    }
  }

  const removeAttachment = (fileToRemove: File) => {
    setAttachments(prev => prev.filter(file => file !== fileToRemove));
  }

  const handleSendMessage = () => {
     if (!message.trim() && attachments.length === 0) return;
    toast({
      title: "Message Sent!",
      description: `Your message about ${product.name} has been sent to the vendor.`,
    });
    setMessage("");
    setAttachments([]);
    setIsMessageOpen(false);
  };

  const similarProducts = mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  const frequentlyBoughtTogether = mockProducts.filter(p => p.id !== product.id).slice(0, 2);

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {product.images?.slice(0,4).map((img, index) => (
              <div key={index} className="aspect-square relative w-full overflow-hidden rounded-md border-2 hover:border-primary transition">
                <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-sm font-medium text-primary">{product.category}</p>
          <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
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
            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="w-full">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Message Vendor
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Message Vendor: {product.vendorId}</DialogTitle>
                        <DialogDescription>
                            Have a question about the "{product.name}"?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 space-y-4">
                       <div className="space-y-2">
                            <Label htmlFor="message">Your Message</Label>
                            <div className="relative">
                                <Textarea 
                                    id="message" 
                                    rows={5} 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={MAX_MESSAGE_LENGTH}
                                    placeholder={`Hi, I have a question about the ${product.name}...`}
                                />
                                <p className="text-xs text-muted-foreground text-right mt-1">
                                    {message.length} / {MAX_MESSAGE_LENGTH}
                                </p>
                            </div>
                       </div>
                       <div className="space-y-2">
                            <Label>Attachments ({attachments.length}/5)</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {attachments.map((file, index) => (
                                    <div key={index} className="relative group border rounded-md p-2 flex items-center gap-2">
                                        {file.type.startsWith('image/') ? (
                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        ) : (
                                            <FileIcon className="h-6 w-6 text-muted-foreground" />
                                        )}
                                        <p className="text-xs text-muted-foreground truncate">{file.name}</p>
                                        <Button size="icon" variant="ghost" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100" onClick={() => removeAttachment(file)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {attachments.length < 5 && (
                                    <Label htmlFor="file-upload" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                        <Paperclip className="h-6 w-6 text-muted-foreground"/>
                                        <span className="text-xs text-muted-foreground mt-1">Add File</span>
                                    </Label>
                                )}
                            </div>
                            <input id="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                       </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSendMessage}>Send Message</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-muted-foreground">Sold by <span className="font-semibold text-primary">Vendor ID: {product.vendorId}</span></p>
        </div>
      </div>

      <Separator className="my-12" />

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {mockReviews.map(review => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.avatarUrl} alt={review.author} data-ai-hint="person face" />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('h-4 w-4', i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/30')} />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-1">{review.title}</h3>
                  <p className="text-muted-foreground text-sm">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="space-y-8">
            <h2 className="text-2xl font-bold font-headline">Frequently Bought Together</h2>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center">
                        <ProductCardMini product={product} />
                        <Plus className="h-5 w-5 mx-2 text-muted-foreground" />
                        <ProductCardMini product={frequentlyBoughtTogether[0]} />
                    </div>
                    <div className="text-center mt-4">
                        <p className="text-lg font-semibold">Total Price: $223.99</p>
                        <Button className="mt-2" size="sm">Add Both to Cart</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <Separator className="my-12" />

      <div>
        <h2 className="text-2xl font-bold font-headline mb-6">Similar Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
          <ProductCard product={mockProducts[0]}/>
        </div>
      </div>
    </div>
  );
}

function ProductCardMini({ product }: { product: typeof mockProducts[0] }) {
  return (
    <div className="flex-1 flex items-center gap-2">
      <div className="relative w-16 h-16 rounded-md overflow-hidden">
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint={`${product.tags?.[0] || 'product'} ${product.tags?.[1] || ''}`} />
      </div>
      <div>
        <p className="text-sm font-semibold line-clamp-2">{product.name}</p>
        <p className="text-sm font-bold">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}

    