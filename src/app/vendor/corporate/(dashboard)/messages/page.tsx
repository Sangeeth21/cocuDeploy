
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, AlertTriangle, Check, EyeOff, Eye, CheckCheck } from "lucide-react";
import type { User, SupportTicket as BaseSupportTicket, Message as BaseMessage, Attachment } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Message = BaseMessage & {
    status?: 'sending' | 'sent' | 'read';
}

type Conversation = BaseSupportTicket & {
    messages: Message[];
    customerId?: string; // Add this to align with other conversation types
    unreadCount?: number;
    userMessageCount: number;
    awaitingVendorDecision: boolean;
}

const initialConversations: (Omit<Conversation, 'vendor'>)[] = [
  {
    id: 'CORP_MSG_1',
    customerId: "Corporate Client Inc.",
    subject: "Bulk Order Payout Question",
    message: "Hi, how are payouts for large corporate orders handled? Are they different from regular orders?",
    date: "2024-06-21",
    status: 'active',
    messages: [
        { id: 'ccm1', sender: 'customer', text: 'Hello, we are interested in a bulk order of the Classic Leather Watch for a corporate event. Can you provide a quote for 500 units?' },
        { id: 'ccm2', sender: 'vendor', text: 'Absolutely! For 500 units, we can offer a price of $159.99 per unit. This includes custom engraving on the back. What is your required delivery date?', status: 'sent'},
    ],
    unread: true,
    unreadCount: 1,
    userMessageCount: 1,
    awaitingVendorDecision: false,
  }
];


function ConversionCheckDialog({ open, onOpenChange, onContinue, onEnd }: { open: boolean, onOpenChange: (open: boolean) => void, onContinue: () => void, onEnd: () => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-primary"/> Potential Conversion</DialogTitle>
                    <DialogDescription>
                        You've reached the initial message limit. Do you believe this customer will place an order?
                    </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Continuing the chat will grant 8 more messages. Ending the chat will lock the conversation.
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={onEnd}>End Chat</Button>
                    <Button onClick={onContinue}>Yes, Continue Chat</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function CorporateMessagesPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [conversations, setConversations] = useState(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<(Omit<Conversation, 'vendor'>) | null>(initialConversations[0]);
    
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const [newMessage, setNewMessage] = useState("");
    const MAX_MESSAGE_LENGTH = 1500;

    const [isConversionDialogOpen, setIsConversionDialogOpen] = useState(false);

    useEffect(() => {
        if (selectedConversation?.awaitingVendorDecision) {
            setIsConversionDialogOpen(true);
        } else {
            setIsConversionDialogOpen(false);
        }
    }, [selectedConversation]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?.messages.length]);

     const handleContinueChat = () => {
        if (!selectedConversation) return;
        
        const updatedConversation = { 
            ...selectedConversation,
            awaitingVendorDecision: false,
            messages: [...selectedConversation.messages, {id: 'system-continue', sender: 'system' as const, text: 'You extended the chat. 8 messages remaining.'}]
        };
        
        setConversations(prev => prev.map(t => t.id === selectedConversation.id ? updatedConversation : t));
        setSelectedConversation(updatedConversation);

        setIsConversionDialogOpen(false);
        toast({ title: 'Chat Extended', description: 'You can now send 8 more messages.' });
    };

    const handleEndChat = () => {
        if (!selectedConversation) return;
        const updatedConversation = { 
            ...selectedConversation, 
            awaitingVendorDecision: false,
            status: 'locked',
            messages: [...selectedConversation.messages, {id: 'system-end', sender: 'system' as const, text: 'You have ended the chat.'}]
        } as Omit<Conversation, 'vendor'>;

        setConversations(prev => prev.map(c => c.id === selectedConversation.id ? updatedConversation : c));
        setSelectedConversation(updatedConversation);
        
        setIsConversionDialogOpen(false);
        toast({ variant: 'destructive', title: 'Chat Ended', description: 'This conversation has been locked.' });
    };

     const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const newVendorMessage: Message = { 
            id: `vendor-${Date.now()}`,
            sender: "vendor", 
            text: newMessage,
            timestamp: new Date(),
            status: 'sent'
        };

        const currentTicketId = selectedConversation.id;
        
        const newConversations = conversations.map(t => {
            if (t.id === currentTicketId) {
                const updatedConvo = {
                    ...t,
                    messages: [...t.messages, newVendorMessage],
                    userMessageCount: t.userMessageCount + 1,
                };
                
                if (updatedConvo.userMessageCount === 5) {
                    updatedConvo.awaitingVendorDecision = true;
                }

                return updatedConvo;
            }
            return t;
        });

        setConversations(newConversations);
        setSelectedConversation(newConversations.find(t => t.id === currentTicketId) || null);
        
        setNewMessage("");

      }, [newMessage, selectedConversation, conversations]);

      const handleSelectConversation = (id: string) => {
        const ticket = conversations.find(t => t.id === id);
        if(ticket) {
            setSelectedConversation(ticket);
            // Mark as read
            setConversations(prev => prev.map(t => t.id === id ? {...t, unread: false, unreadCount: 0} : t));
        }
      }

    const getChatLimit = () => {
      if (!selectedConversation) return { limit: 0, remaining: 0, isLocked: true };
      const { userMessageCount, awaitingVendorDecision, status } = selectedConversation;
  
      const INITIAL_LIMIT = 5;
      const EXTENDED_LIMIT = 13; // 5 initial + 8 extended
  
      const isLocked = awaitingVendorDecision || userMessageCount >= EXTENDED_LIMIT || status !== 'active';
      let limit = userMessageCount < INITIAL_LIMIT ? INITIAL_LIMIT : EXTENDED_LIMIT;
      let remaining = limit - userMessageCount;
      
      if(awaitingVendorDecision) {
        remaining = 0;
      }
      
      return { limit, remaining: Math.max(0, remaining), isLocked };
  };

  const { remaining, isLocked } = getChatLimit();

    const getStatusIcon = (status?: 'sending' | 'sent' | 'read') => {
      switch(status) {
          case 'sending':
              return <Clock className="h-3 w-3 text-primary-foreground/70" />;
          case 'sent':
              return <Check className="h-3 w-3 text-primary-foreground" />;
          case 'read':
               return <CheckCheck className="h-3 w-3 text-primary-foreground" />;
          default:
              return null;
      }
    }


    return (
        <>
        <div className="grid md:grid-cols-3 gap-8 items-start h-[calc(100vh-12rem)]">
            <div className="md:col-span-1 h-full">
                 <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Corporate Messages</CardTitle>
                        <CardDescription>Manage inquiries from corporate clients.</CardDescription>
                         <div className="relative mt-2">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search messages..." className="pl-8" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-2 p-4">
                        {conversations.map(ticket => (
                             <div 
                                key={ticket.id} 
                                className={`p-3 rounded-lg cursor-pointer border ${selectedConversation?.id === ticket.id ? 'bg-muted ring-2 ring-primary' : 'bg-card hover:bg-muted/50'}`}
                                onClick={() => handleSelectConversation(ticket.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm truncate">{ticket.subject}</p>
                                    <Badge variant={ticket.status === 'active' ? 'secondary' : 'default'}>{ticket.status}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{ticket.id} - {ticket.date}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
             <div className="md:col-span-2 h-full">
                {selectedConversation ? (
                     <Card className="h-full flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl">{selectedConversation.subject}</CardTitle>
                                    <CardDescription className="mt-1">
                                        From: {selectedConversation.customerId}
                                    </CardDescription>
                                </div>
                                <Avatar>
                                    <AvatarImage src={"https://placehold.co/40x40.png"} alt={"Client"} />
                                    <AvatarFallback>C</AvatarFallback>
                                </Avatar>
                            </div>
                             <div className="text-sm text-muted-foreground pt-2">
                                {isLocked ? 'Message limit reached' : `${remaining} messages left`}
                            </div>
                        </CardHeader>
                        <div className="flex-1 flex flex-col min-h-0 bg-card">
                            <ScrollArea className="flex-1 bg-muted/20">
                                <div className="p-4 space-y-4">
                                     {selectedConversation.messages.map((msg) => (
                                        msg.sender === 'system' ? (
                                            <div key={msg.id} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                                        ) : (
                                        <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                                            {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="Client" /><AvatarFallback>C</AvatarFallback></Avatar>}
                                            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                                                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                                {msg.sender === 'vendor' && msg.status && (
                                                    <div className="flex justify-end items-center gap-1 h-4 mt-1">
                                                        <span className="text-xs text-primary-foreground/70">{msg.status}</span>
                                                        {getStatusIcon(msg.status)}
                                                    </div>
                                                )}
                                            </div>
                                            {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="You" /><AvatarFallback>V</AvatarFallback></Avatar>}
                                        </div>
                                        )
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                             <form onSubmit={handleSendMessage} className="p-4 border-t space-y-2">
                                 {selectedConversation.status === 'active' && (
                                     <div className="flex items-center gap-2">
                                        <Textarea
                                            ref={textareaRef}
                                            placeholder={isLocked ? "Awaiting your decision..." : "Type your message..."}
                                            className="pr-12 resize-none max-h-48"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            rows={1}
                                            disabled={isLocked}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                        />
                                        <Button type="submit" size="icon" disabled={isLocked || !newMessage.trim()}><Send className="h-4 w-4" /></Button>
                                    </div>
                                 )}
                            </form>
                        </div>
                    </Card>
                ) : (
                    <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Select a message to view details.</p>
                    </div>
                )}
            </div>
        </div>
         <ConversionCheckDialog 
            open={isConversionDialogOpen} 
            onOpenChange={setIsConversionDialogOpen}
            onContinue={handleContinueChat}
            onEnd={handleEndChat}
        />
        </>
    );
}
