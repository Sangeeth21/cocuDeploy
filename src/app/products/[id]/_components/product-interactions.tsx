

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
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, limit, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

export function ProductInteractions({ product, isCustomizable, quantity }: { product: DisplayProduct, isCustomizable: boolean, quantity: number }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatDisabledOpen, setIsChatDisabledOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  const { addToCart } = useCart();
  const { isLoggedIn, user } = useUser();
  const { openDialog } = useAuthDialog();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const MAX_MESSAGE_LENGTH = 1500;
  
  // Effect to fetch or create a conversation when chat dialog opens
  useEffect(() => {
    if (!isChatOpen || !isLoggedIn || !user) {
        setConversation(null); // Clear conversation when dialog closes or user logs out
        return;
    };

    const fetchConversation = async () => {
        const convosRef = collection(db, "conversations");
        const q = query(convosRef, 
            where("vendorId", "==", product.vendorId),
            where("customerId", "==", user.id),
            limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const convoDoc = querySnapshot.docs[0];
            const convoData = { id: convoDoc.id, ...convoDoc.data() } as Conversation;
            setConversation(convoData);
        } else {
            // No existing conversation, create a placeholder in state
            // It will be created in Firestore upon sending the first message.
            const newConvo: Conversation = {
                id: `TEMP-${Date.now()}`,
                vendorId: product.vendorId,
                customerId: user.id,
                avatar: product.vendorImageUrl || 'https://placehold.co/40x40.png',
                messages: [],
                userMessageCount: 0,
                awaitingVendorDecision: false,
                status: 'active',
            };
            setConversation(newConvo);
        }
    };
    
    fetchConversation();

  }, [isChatOpen, isLoggedIn, user, product.vendorId, product.vendorImageUrl]);


  // Effect to listen for new messages in the selected conversation
   useEffect(() => {
    if (!conversation || conversation.id.toString().startsWith('TEMP-')) return;
    
    const messagesQuery = query(collection(db, "conversations", conversation.id as string, "messages"), serverTimestamp());
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const msgs: Message[] = [];
        querySnapshot.forEach((doc) => {
            msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setConversation(prev => prev ? {...prev, messages: msgs} : null);
    });

    return () => unsubscribe();
  }, [conversation?.id]);


  const handleMessageVendorClick = () => {
    if (!isLoggedIn) {
        openDialog('login');
        return;
    }
    // Directly navigate to the account page with params to initiate chat
    router.push(`/account?tab=messages&vendorId=${product.vendorId}&productName=${encodeURIComponent(product.name)}`);
  }
  
  const handleRequestSample = () => {
    toast({
        title: "Sample Requested (Simulated)",
        description: `Your request for a sample of "${product.name}" has been sent to the vendor.`,
    });
  }

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !user) return;

    let currentConversationId = conversation?.id;

    // If it's a new conversation, create it first
    if (conversation && conversation.id.toString().startsWith('TEMP-')) {
        const { id, ...convoData } = conversation;
        const convoRef = await addDoc(collection(db, "conversations"), convoData);
        currentConversationId = convoRef.id;
        setConversation(prev => prev ? {...prev, id: currentConversationId as string } : null);
    }
    
    if (!currentConversationId) return;

    const conversationRef = collection(db, "conversations", currentConversationId as string, "messages");
    await addDoc(conversationRef, { 
        sender: "customer", 
        text: newMessage,
        timestamp: serverTimestamp(),
    });

    setNewMessage("");
    setAttachments([]);
  }, [attachments, newMessage, conversation, user]);
  
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
    }, [conversation?.messages.length]);

    const handleAddToCart = () => {
        if (product.requiresConfirmation) {
            setIsConfirmationOpen(true);
            toast({
                title: "Vendor Notified",
                description: "The vendor will confirm availability within 5 hours.",
            });
            return;
        }
        addToCart({product, customizations: {}, quantity});
        toast({
          title: "Added to cart!",
          description: `${quantity} x ${product.name} has been added to your cart.`,
        });
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            openDialog('login');
            return;
        }
        addToCart({product, customizations: {}, quantity});
        router.push('/checkout');
    }

    const handleCustomize = () => {
        if (!isLoggedIn) {
            openDialog('login');
            return;
        }
        router.push(`/customize/${product.id}`);
    }
  
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
      
       <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
            <DialogContent className="max-w-xl h-[80vh] flex flex-col p-0 gap-0">
                {conversation && user ? (
                    <>
                    <DialogHeader className="p-4 border-b">
                         <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={conversation.avatar} alt={conversation.vendorId} data-ai-hint="company logo" />
                              <AvatarFallback>{conversation.vendorId.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <DialogTitle>{`Chat with ${conversation.vendorId}`}</DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 flex flex-col min-h-0 bg-card">
                         <ScrollArea className="flex-1 bg-muted/20">
                            <div className="p-4 space-y-4" ref={messagesContainerRef}>
                            {(conversation.messages || []).map((msg, index) => (
                                msg.sender === 'system' ? (
                                    <div key={index} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                                ) : (
                                <div key={index} className={cn("flex items-end gap-2", msg.sender === 'customer' ? 'justify-end' : 'justify-start')}>
                                {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src={conversation.avatar} alt={conversation.vendorId} /><AvatarFallback>{conversation.vendorId.charAt(0)}</AvatarFallback></Avatar>}
                                <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                </div>
                                {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={user.avatar} alt="You" /><AvatarFallback>Y</AvatarFallback></Avatar>}
                                </div>
                                )
                            ))}
                            </div>
                        </ScrollArea>
                        <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto space-y-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Textarea
                                        ref={textareaRef}
                                        placeholder="Type your message..."
                                        className="pr-12 resize-none max-h-48"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>
                                <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
                            </div>
                        </form>
                    </div>
                    </>
                ) : (
                    <div className="p-6">Loading conversation...</div>
                )}
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
