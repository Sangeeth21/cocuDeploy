
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

const initialConversation: Omit<Conversation, 'id' | 'customerId'> = {
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

export function CorporateProductInteractions({ product, isCustomizable }: { product: DisplayProduct, isCustomizable: boolean }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPreChatOpen, setIsPreChatOpen] = useState(false);
  const [isChatDisabledOpen, setIsChatDisabledOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  const { addToCart } = useCart();
  const { isLoggedIn } = useUser();
  const { openDialog } = useAuthDialog();

  const [conversation, setConversation] = useState<Omit<Conversation, 'id' | 'customerId'>>({
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


  const handleMessageVendorClick = () => {
    if (!isLoggedIn) {
        openDialog('login');
        return;
    }
      
    if (isChatDisabled) {
        setIsChatDisabledOpen(true);
        return;
    }
    
    // For corporate, we can skip the warning flow for now
    router.push(`/account?tab=messages&vendorId=${product.vendorId}&productName=${encodeURIComponent(product.name)}&type=corporate`);
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

        if (updatedConvo.userMessageCount === 15) {
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
      const INITIAL_LIMIT = 15;
      const EXTENDED_LIMIT = 15 + 8; // When vendor extends

      const isLocked = awaitingVendorDecision || userMessageCount >= EXTENDED_LIMIT;
      let limit = userMessageCount < INITIAL_LIMIT ? INITIAL_LIMIT : EXTENDED_LIMIT;
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
      <Button size="lg" variant="outline" className="w-full" onClick={handleMessageVendorClick}>
            <MessageSquare className="mr-2 h-5 w-5" />
            Message Vendor
      </Button>
      
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
                    <Button onClick={() => setIsChatOpen(true)}>I Understand, Continue to Chat</Button>
                </DialogFooter>
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
