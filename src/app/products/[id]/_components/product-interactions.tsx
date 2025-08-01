
"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { DisplayProduct, Conversation, Message } from "@/lib/types";
import { MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, AlertTriangle, BellRing, Wand2, ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { mockUserOrders } from "@/lib/mock-data";
import { useCart } from "@/context/cart-context";
import { useUser } from "@/context/user-context";
import { useAuthDialog } from "@/context/auth-dialog-context";

type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

const initialConversation: Omit<Conversation, 'id'> = {
    vendorId: "VDR001",
    avatar: "https://placehold.co/40x40.png",
    messages: [],
    userMessageCount: 0,
    awaitingVendorDecision: false,
    status: 'active',
};

// Simulate tracking for chat abuse prevention
// In a real app, this would come from a user context or API call
const MAX_CHATS_WITHOUT_PURCHASE = 4;
let hasMadePurchase = mockUserOrders.length > 0;
let uniqueVendorChats = 2; // Starting with 2 from the initial mock data in account page

// localStorage keys
const VIEWED_WARNINGS_KEY = 'shopsphere_viewed_chat_warnings';
const WARNING_COUNT_KEY = 'shopsphere_chat_warning_count';
const MAX_WARNING_COUNT = 5;

export function ProductInteractions({ product, isCustomizable }: { product: DisplayProduct, isCustomizable: boolean }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPreChatOpen, setIsPreChatOpen] = useState(false);
  const [isChatDisabledOpen, setIsChatDisabledOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  const { addToCart } = useCart();
  const { isLoggedIn } = useUser();
  const { openDialog } = useAuthDialog();

  const [conversation, setConversation] = useState<Omit<Conversation, 'id'>>({
      ...initialConversation, 
      vendorId: product.vendorId
  });
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const MAX_MESSAGE_LENGTH = 1500;

  const isChatDisabled = !hasMadePurchase && uniqueVendorChats >= MAX_CHATS_WITHOUT_PURCHASE;

  useEffect(() => {
    if (isChatOpen && conversation.messages.length === 0) {
        // Create initial message from vendor
        const initialVendorMessage: Message = {
            id: 'init-vendor',
            sender: 'vendor',
            text: `Hi! Thanks for your interest in the "${product.name}". How can I help you today?`
        };
        const autoReply: Message = {
            id: 'init-autoreply',
            sender: 'vendor',
            text: `Thanks for your message! We'll get back to you shortly.`
        }
        setConversation(prev => ({...prev, messages: [initialVendorMessage, autoReply]}))
    }
  }, [isChatOpen, product.name, conversation.messages.length])

  const handleAddToCart = () => {
    if (product.requiresConfirmation) {
        setIsConfirmationOpen(true);
        // Here you would also trigger a backend notification to the vendor
        toast({
            title: "Vendor Notified",
            description: "The vendor will confirm availability within 5 hours.",
        });
        return;
    }
    addToCart({product, customizations: {}});
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
        openDialog('login');
        return;
    }
    addToCart({product, customizations: {}});
    router.push('/checkout');
  }

  const handleCustomize = () => {
    router.push(`/customize/${product.id}`);
  }

  const handleMessageVendorClick = () => {
    if (!isLoggedIn) {
        openDialog('login');
        return;
    }
      
    if (isChatDisabled) {
        setIsChatDisabledOpen(true);
        return;
    }
    
    // Check localStorage for warning status
    const viewedWarnings: string[] = JSON.parse(localStorage.getItem(VIEWED_WARNINGS_KEY) || '[]');
    const warningCount: number = parseInt(localStorage.getItem(WARNING_COUNT_KEY) || '0');
    
    const hasSeenForThisProduct = viewedWarnings.includes(product.id);
    const hasReachedMaxWarnings = warningCount >= MAX_WARNING_COUNT;

    if (hasSeenForThisProduct || hasReachedMaxWarnings) {
        // Skip pre-chat dialog and open chat directly
        setIsChatOpen(true);
    } else {
        setIsPreChatOpen(true);
    }
  }

  const handleProceedToChat = () => {
    setIsPreChatOpen(false);
    setIsChatOpen(true);

    // Update localStorage
    try {
        const viewedWarnings: string[] = JSON.parse(localStorage.getItem(VIEWED_WARNINGS_KEY) || '[]');
        if (!viewedWarnings.includes(product.id)) {
            viewedWarnings.push(product.id);
            localStorage.setItem(VIEWED_WARNINGS_KEY, JSON.stringify(viewedWarnings));
        }
        
        const warningCount: number = parseInt(localStorage.getItem(WARNING_COUNT_KEY) || '0');
        localStorage.setItem(WARNING_COUNT_KEY, (warningCount + 1).toString());

    } catch (error) {
        console.error("Failed to update localStorage:", error);
    }
  }

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;

    const newAttachments: Attachment[] = attachments.map(file => ({
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "file",
        url: URL.createObjectURL(file),
    }));

    const newMessageObj: Message = { 
        id: Math.random().toString(),
        sender: "customer", 
        text: newMessage,
        ...(newAttachments.length > 0 && { attachments: newAttachments })
    };
    
    setConversation(prev => {
        const updatedConvo = {
            ...prev,
            messages: [...prev.messages, newMessageObj],
            userMessageCount: prev.userMessageCount + 1
        };

        if (updatedConvo.userMessageCount === 9) {
            updatedConvo.awaitingVendorDecision = true;
            updatedConvo.messages.push({
                id: 'system-wait',
                sender: 'system',
                text: 'You have reached the initial message limit. Please wait for the vendor to respond.'
            });
        }
        return updatedConvo;
    });

    setNewMessage("");
    setAttachments([]);
  }, [attachments, newMessage]);
  
   const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [attachments.length, toast]);

  const removeAttachment = useCallback((fileToRemove: File) => {
    setAttachments(prev => prev.filter(file => file !== fileToRemove));
  }, []);
  
  const getChatLimit = () => {
      const { userMessageCount, awaitingVendorDecision } = conversation;
      const INITIAL_LIMIT = 9;
      const EXTENDED_LIMIT = 15; // Placeholder for when vendor extends

      const isLocked = awaitingVendorDecision || userMessageCount >= INITIAL_LIMIT;
      let limit = INITIAL_LIMIT;
      let remaining = limit - userMessageCount;
      
      if(awaitingVendorDecision) {
        remaining = 0;
      }
      
      return { limit, remaining: Math.max(0, remaining), isLocked };
  }

  const { remaining, isLocked } = getChatLimit();

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [newMessage]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [conversation.messages]);
  
  return (
    <>
      <div className="space-y-4">
        {isCustomizable ? (
            <div className="grid grid-cols-1 gap-2">
                <Button size="lg" className="w-full" onClick={handleCustomize}>
                    <Wand2 className="mr-2 h-5 w-5" /> Customize Now
                </Button>
                 <div className="grid grid-cols-2 gap-2">
                    <Button size="lg" variant="secondary" onClick={handleAddToCart}>
                        Add to Cart
                    </Button>
                    <Button size="lg" variant="secondary" onClick={handleBuyNow}>Buy Now</Button>
                </div>
            </div>
        ) : (
           <div className="flex flex-col sm:flex-row gap-2">
              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                  {product.requiresConfirmation ? 'Request to Buy' : 'Add to Cart'}
              </Button>
              <Button size="lg" variant="secondary" className="w-full" onClick={handleBuyNow}>Buy Now</Button>
          </div>
        )}
        <Button size="lg" variant="outline" className="w-full" onClick={handleMessageVendorClick}>
            <MessageSquare className="mr-2 h-5 w-5" />
            Message Vendor
        </Button>
      </div>

       <Dialog open={isPreChatOpen} onOpenChange={setIsPreChatOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-primary"/> Chat Guidelines</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground">
                    <p>To ensure a safe and secure marketplace for everyone, please keep in mind:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><span className="font-semibold text-foreground">Do not share personal contact information</span> such as phone numbers, email addresses, or social media profiles.</li>
                        <li>All payments must be made <span className="font-semibold text-foreground">through the platform's secure checkout</span>. Do not arrange off-site payments.</li>
                        <li>Violating these rules may result in account suspension.</li>
                    </ul>
                     <p>All conversations are monitored for safety purposes.</p>
                </div>
                <DialogFooter>
                    <Button onClick={handleProceedToChat}>I Understand, Continue to Chat</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

         <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
            <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0">
                 <DialogHeader className="p-4 border-b">
                     <DialogTitle className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={conversation.avatar} alt={conversation.vendorId} data-ai-hint="company logo" />
                            <AvatarFallback>{conversation.vendorId.charAt(0)}</AvatarFallback>
                        </Avatar>
                        Chat with {conversation.vendorId}
                    </DialogTitle>
                     <DialogDescription className="ml-12 -mt-2 text-xs">
                        {isLocked ? 'Message limit reached' : `${remaining} messages left`}
                     </DialogDescription>
                </DialogHeader>
                 <div className="flex-1 overflow-hidden min-h-0">
                    <ScrollArea className="h-full bg-muted/20">
                        <div className="p-4 space-y-4" ref={messagesContainerRef}>
                        {conversation.messages.map((msg, index) => (
                             msg.sender === 'system' ? (
                                <div key={index} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                            ) : (
                            <div key={index} className={cn("flex items-end gap-2", msg.sender === 'customer' ? 'justify-end' : 'justify-start')}>
                            {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src={conversation.avatar} alt={conversation.vendorId} /><AvatarFallback>{conversation.vendorId.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn("max-w-xs rounded-lg p-3 text-sm space-y-2", msg.sender === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
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
                            </div>
                            {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="You" data-ai-hint="person face" /><AvatarFallback>Y</AvatarFallback></Avatar>}
                            </div>
                             )
                        ))}
                        </div>
                    </ScrollArea>
                 </div>
                 <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto space-y-2">
                    {attachments.length > 0 && !isLocked && (
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
                                placeholder={isLocked ? "Message limit reached." : "Type your message..."}
                                className="pr-12 resize-none max-h-48"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                maxLength={MAX_MESSAGE_LENGTH}
                                rows={1}
                                disabled={isLocked}
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" asChild disabled={isLocked}>
                            <label htmlFor="modal-file-upload"><Paperclip className="h-5 w-5" /></label>
                        </Button>
                        <input id="modal-file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} disabled={isLocked} />
                        <Button type="submit" size="icon" disabled={isLocked}><Send className="h-4 w-4" /></Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog open={isChatDisabledOpen} onOpenChange={setIsChatDisabledOpen}>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><MessageSquare className="text-destructive"/> Chat Limit Reached</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    To prevent spam and encourage genuine interactions, we limit the number of new conversations a customer can start before making a purchase.
                </DialogDescription>
                <p className="text-sm text-muted-foreground">
                    Please complete an order to re-enable the chat feature. We appreciate your understanding!
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsChatDisabledOpen(false)}>Close</Button>
                    <Button onClick={() => router.push('/cart')}>Go to Cart</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><BellRing className="text-primary"/> Notified Vendor</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    The vendor has been notified to confirm this item is available and can be delivered on time. Please wait for their confirmation. You will be notified here and can complete your purchase once they respond.
                </DialogDescription>
                <p className="text-sm text-muted-foreground">
                    The vendor has up to 5 hours to respond.
                </p>
                <DialogFooter>
                    <Button onClick={() => setIsConfirmationOpen(false)}>OK</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
