
"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { mockProducts, mockReviews } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Plus, MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, Check, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Attachment, Message } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";


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

export default function ProductDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const productId = typeof params.id === 'string' ? params.id : '';
  const product = mockProducts.find((p) => p.id === productId);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const MAX_MESSAGE_LENGTH = 1500; // Approx 250 words

  const initializeChat = () => {
    setMessages([
        { 
            sender: "vendor",
            text: `Hi! Thanks for your interest in the "${product?.name}". How can I help you today?`,
            status: "read",
        }
    ]);
    setNewMessage("");
    setAttachments([]);
  };

  useEffect(() => {
    if (isChatOpen) {
      initializeChat();
    }
  }, [isChatOpen, product?.name]);

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
  };

  const removeAttachment = (fileToRemove: File) => {
    setAttachments(prev => prev.filter(file => file !== fileToRemove));
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;

    const newAttachments: Attachment[] = attachments.map(file => ({
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "file",
        url: URL.createObjectURL(file),
    }));

    const sentMessage: Message = { 
        sender: "customer", 
        text: newMessage,
        status: "sent",
        ...(newAttachments.length > 0 && {attachments: newAttachments})
    };

    setMessages(prev => [...prev, sentMessage]);
    setNewMessage("");
    setAttachments([]);
    
    // Simulate message delivery and read receipt
    setTimeout(() => {
        setMessages(prev => prev.map(m => m === sentMessage ? {...m, status: 'delivered'} : m));
        
        // Simulate vendor seeing the message
        setTimeout(() => {
             setMessages(prev => prev.map(m => m.status === 'delivered' ? {...m, status: 'read'} : m));

             // Simulate vendor reply
             setTimeout(() => {
                const reply: Message = {
                    sender: "vendor",
                    text: "Thanks for your message! We'll get back to you shortly.",
                    status: "read"
                };
                setMessages(prev => [...prev, reply]);
             }, 1000);
        }, 1500);
    }, 500);
  };
  
  const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
      switch(status) {
          case 'read':
              return <Eye className="h-4 w-4 text-primary" />;
          case 'delivered':
              return <EyeOff className="h-4 w-4" />;
          case 'sent':
              return <Check className="h-4 w-4" />;
          default:
              return null;
      }
  }
  
  useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [newMessage]);

    useEffect(() => {
        if (scrollAreaRef.current) {
             const scrollableView = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
             if(scrollableView){
                 scrollableView.scrollTop = scrollableView.scrollHeight;
             }
        }
    }, [messages]);


  if (!product) {
    notFound();
  }

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
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Message Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0">
                 <DialogHeader className="p-4 border-b">
                    <DialogTitle>Chat with {product.vendorId}</DialogTitle>
                 </DialogHeader>
                 <ScrollArea className="flex-1" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                        {messages.map((msg, index) => (
                        <div key={index} className={cn("flex items-end gap-2", msg.sender === 'customer' ? 'justify-end' : 'justify-start')}>
                            {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt={product.vendorId} /><AvatarFallback>{product.vendorId.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn("max-w-xs rounded-lg p-3 text-sm space-y-2", msg.sender === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                            {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                            {msg.attachments && (
                                <div className="grid gap-2 grid-cols-2">
                                    {msg.attachments.map((att, i) => (
                                        att.type === 'image' ? (
                                            <div key={i} className="relative aspect-video rounded-md overflow-hidden">
                                                <Image src={att.url} alt={att.name} fill className="object-cover" data-ai-hint="attached image" />
                                            </div>
                                        ) : (
                                            <a href={att.url} key={i} download={att.name} className="flex items-center gap-2 p-2 rounded-md bg-background/50 hover:bg-background/80">
                                                <FileIcon className="h-6 w-6 text-muted-foreground"/>
                                                <span className="text-xs truncate">{att.name}</span>
                                                <Download className="h-4 w-4 ml-auto" />
                                            </a>
                                        )
                                    ))}
                                </div>
                            )}
                             {msg.sender === 'customer' && (
                                <div className="flex justify-end items-center gap-1 h-4">
                                    {getStatusIcon(msg.status)}
                                </div>
                            )}
                            </div>
                            {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/100x100.png" alt="You" /><AvatarFallback>Y</AvatarFallback></Avatar>}
                        </div>
                        ))}
                    </div>
                </ScrollArea>
                 <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto space-y-2">
                    {attachments.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {attachments.map((file, index) => (
                                <div key={index} className="relative group border rounded-md p-2 flex items-center gap-2 bg-muted/50">
                                    {file.type.startsWith('image/') ? <ImageIcon className="h-5 w-5 text-muted-foreground" /> : <FileIcon className="h-5 w-5 text-muted-foreground" />}
                                    <p className="text-xs text-muted-foreground truncate">{file.name}</p>
                                    <Button size="icon" variant="ghost" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100" onClick={() => removeAttachment(file)}><X className="h-3 w-3" /></Button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Textarea
                                ref={textareaRef}
                                placeholder="Type your message..."
                                className="pr-20 resize-none max-h-48"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                maxLength={MAX_MESSAGE_LENGTH}
                                rows={1}
                            />
                                <p className="absolute bottom-1 right-12 text-xs text-muted-foreground">{newMessage.length}/{MAX_MESSAGE_LENGTH}</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" asChild>
                            <label htmlFor="customer-file-upload"><Paperclip className="h-5 w-5" /></label>
                        </Button>
                        <input id="customer-file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                        <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
                    </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-muted-foreground">Sold by <Link href={`/account?tab=messages&vendorId=${product.vendorId}`} className="font-semibold text-primary hover:underline">Vendor ID: {product.vendorId}</Link></p>
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
