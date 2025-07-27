

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Attachment, Message, DisplayProduct } from "@/lib/types";
import { MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, Check, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


export function ProductInteractions({ product }: { product: DisplayProduct }) {
  const { toast } = useToast();

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const MAX_MESSAGE_LENGTH = 1500; // Approx 250 words

  const initializeChat = useCallback(() => {
    setMessages([
        { 
            id: 'init-msg',
            sender: "vendor",
            text: `Hi! Thanks for your interest in the "${product?.name}". How can I help you today?`,
            status: "read",
        }
    ]);
    setNewMessage("");
    setAttachments([]);
  }, [product?.name]);

  useEffect(() => {
    if (isChatOpen) {
      initializeChat();
    }
  }, [isChatOpen, initializeChat]);

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
        id: Math.random().toString(),
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
        setMessages(prev => prev.map(m => m.id === sentMessage.id ? {...m, status: 'delivered'} : m));
        
        // Simulate vendor seeing the message
        setTimeout(() => {
             // Only update the last 'delivered' message to 'read'
             setMessages(prev => {
                const updatedMessages = prev.map(m => {
                    if (m.id === sentMessage.id && m.status === 'delivered') {
                        return { ...m, status: 'read' };
                    }
                    return m;
                });
                return updatedMessages;
            });

             // Simulate vendor reply
             setTimeout(() => {
                const reply: Message = {
                    id: Math.random().toString(),
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
              return <Eye className="h-4 w-4 text-primary-foreground" />;
          case 'delivered':
              return <EyeOff className="h-4 w-4 text-primary-foreground" />;
          case 'sent':
              return <Check className="h-4 w-4 text-primary-foreground" />;
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


  return (
    <>
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
                    <div key={msg.id || index} className={cn("flex items-end gap-2", msg.sender === 'customer' ? 'justify-end' : 'justify-start')}>
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
      <p className="text-sm text-muted-foreground">Sold by <Link href={`/vendor?vendorId=${product.vendorId}&productName=${encodeURIComponent(product.name)}`} className="font-semibold text-primary hover:underline">Vendor ID: {product.vendorId}</Link></p>
    </>
  );
}
