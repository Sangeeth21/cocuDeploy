
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MessageSquare, AlertTriangle, Check, EyeOff, Eye, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import type { Message, Conversation } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVerification } from "@/context/vendor-verification-context";

type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

const initialConversations: (Conversation & {type: 'customer' | 'corporate'})[] = [
  {
    id: 1,
    customerId: "CUST001",
    vendorId: "VDR001",
    avatar: "https://placehold.co/40x40.png",
    messages: [
      { id: 'msg1', sender: "customer", text: "Hi! I'm interested in the Classic Leather Watch. Is it available in black?" },
      { id: 'msg2', sender: "vendor", text: "Hello! Yes, the Classic Leather Watch is available with a black strap. I can update the listing if you'd like to purchase it.", status: 'read' },
      { id: 'msg3', sender: "customer", text: "That would be great, thank you!", attachments: [{name: 'watch_photo.jpg', type: 'image', url: 'https://placehold.co/300x200.png'}] },
    ],
    unread: true,
    userMessageCount: 3,
    awaitingVendorDecision: false,
    status: 'active',
    type: 'customer',
  },
  {
    id: 2,
    customerId: "CUST002",
    vendorId: "VDR002",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ id: 'msg4', sender: "customer", text: "Can you ship to Canada?", attachments: [{name: 'shipping_question.pdf', type: 'file', url: '#'}] }],
    unread: true,
    userMessageCount: 1,
    awaitingVendorDecision: false,
    status: 'active',
    type: 'customer',
  },
  {
    id: 3,
    customerId: "CUST003",
    vendorId: "VDR003",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ id: 'msg5', sender: "vendor", text: "Thank you!", status: 'delivered' }],
    unread: false,
    userMessageCount: 1,
    awaitingVendorDecision: false,
    status: 'active',
    type: 'customer',
  },
   {
    id: 4,
    customerId: "CUST004",
    vendorId: "VDR004",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ id: 'msg6', sender: "customer", text: "What is the return policy?" }],
    unread: true,
    userMessageCount: 1,
    awaitingVendorDecision: false,
    status: 'active',
    type: 'customer',
  },
  {
    id: 5,
    customerId: "Corporate Client Inc.",
    vendorId: "VDR001",
    avatar: "https://placehold.co/40x40.png",
    messages: [
      { id: 'ccm1', sender: 'customer', text: 'Hello, we are interested in a bulk order of the Classic Leather Watch for a corporate event. Can you provide a quote for 500 units?' },
      { id: 'ccm2', sender: 'vendor', text: 'Absolutely! For 500 units, we can offer a price of $159.99 per unit. This includes custom engraving on the back. What is your required delivery date?', status: 'sent'},
    ],
    unread: true,
    userMessageCount: 1,
    awaitingVendorDecision: false,
    status: 'active',
    type: 'corporate',
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

export default function BothVendorMessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");
  const MAX_MESSAGE_LENGTH = 1500;
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isConversionDialogOpen, setIsConversionDialogOpen] = useState(false);
  const { vendorType } = useVerification();
  const defaultTab = vendorType === 'corporate' ? 'corporate' : 'customer';

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  useEffect(() => {
    if (selectedConversation?.awaitingVendorDecision) {
        setIsConversionDialogOpen(true);
    } else {
        setIsConversionDialogOpen(false);
    }
  }, [selectedConversation]);
  
  const handleReportConversation = (id: number) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, status: 'flagged' } : c));
    toast({
        title: "Conversation Reported",
        description: "Thank you. Our moderation team will review this chat.",
    });
  }

  const handleContinueChat = () => {
    if (!selectedConversationId) return;
    setConversations(prev => prev.map(c => {
        if (c.id === selectedConversationId) {
            return {
                ...c,
                awaitingVendorDecision: false,
                messages: [...c.messages, {id: 'system-continue', sender: 'system' as const, text: 'Vendor extended the chat. 8 messages remaining.'}]
            };
        }
        return c;
    }));
    setIsConversionDialogOpen(false);
    toast({ title: 'Chat Extended', description: 'You can now send 8 more messages.' });
  }

  const handleEndChat = () => {
      if (!selectedConversationId) return;
      setConversations(prev => prev.map(c => {
        if (c.id === selectedConversationId) {
            return {
                ...c,
                awaitingVendorDecision: false,
                userMessageCount: 23, // 15 + 8, to lock it
                messages: [...c.messages, {id: 'system-end', sender: 'system' as const, text: 'Vendor has ended the chat.'}]
            };
        }
        return c;
    }));
    setIsConversionDialogOpen(false);
    toast({ variant: 'destructive', title: 'Chat Ended', description: 'This conversation has been locked.' });
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    const newMessageObj: Message = { 
        id: Math.random().toString(),
        sender: "vendor", 
        text: newMessage,
        status: 'sent',
    };

    setConversations(prev =>
      prev.map(convo => {
         if (convo.id !== selectedConversationId) return convo;
        
        const updatedConvo = {
            ...convo,
            messages: [...convo.messages, newMessageObj],
        };

        if (updatedConvo.userMessageCount === 15) {
            updatedConvo.awaitingVendorDecision = true;
        }
        
        return updatedConvo;
      })
    );
    setNewMessage("");
  };
  
  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setConversations(prev =>
        prev.map(convo => 
            convo.id === id ? { ...convo, unread: false } : convo
        )
    );
  }

  const getLastMessage = (messages: Message[]) => {
      if (messages.length === 0) return "No messages yet.";
      const lastMsg = messages.filter(m => m.sender !== 'system').pop();
      if (!lastMsg) return "No messages yet.";
      
      const prefix = lastMsg.sender === 'vendor' ? 'You: ' : '';
      if (lastMsg.text) return `${prefix}${lastMsg.text}`;
      if (lastMsg.attachments && lastMsg.attachments.length > 0) return `${prefix}Sent ${lastMsg.attachments.length} attachment(s)`;
      return "No messages yet.";
  }
  
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
    
  const getChatLimit = () => {
      if (!selectedConversation) return { limit: 0, remaining: 0, isLocked: true };
      const { userMessageCount, awaitingVendorDecision, status } = selectedConversation;

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
        if (scrollAreaRef.current) {
             const scrollableView = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
             if(scrollableView){
                 scrollableView.scrollTop = scrollableView.scrollHeight;
             }
        }
    }, [selectedConversation?.messages, selectedConversationId]);
    
    const renderConversationList = (type: 'customer' | 'corporate') => {
        const filteredList = conversations.filter(c => c.type === type);
        return (
            <ScrollArea className="flex-1">
                {filteredList.map(convo => (
                <div
                    key={convo.id}
                    className={cn(
                    "flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 border-b",
                    selectedConversationId === convo.id && "bg-muted"
                    )}
                    onClick={() => handleSelectConversation(convo.id)}
                >
                    <Avatar>
                    <AvatarImage src={convo.avatar} alt={convo.customerId} data-ai-hint="person face" />
                    <AvatarFallback>{convo.customerId?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{`Chat #${convo.id.toString().padStart(6, '0')}`}</p>
                            <div className="flex items-center gap-2">
                            {convo.status === 'flagged' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                            {convo.unread && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{getLastMessage(convo.messages)}</p>
                    </div>
                </div>
                ))}
            </ScrollArea>
        )
    }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 h-full">
        <div className="md:col-span-1 xl:col-span-1 flex flex-col h-full border-r bg-card">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold font-headline">Inbox</h1>
            <Tabs defaultValue={defaultTab} className="w-full mt-2">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer">Customer</TabsTrigger>
                    <TabsTrigger value="corporate">Corporate</TabsTrigger>
                </TabsList>
                <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="pl-8" />
                </div>
                <TabsContent value="customer">
                    {renderConversationList('customer')}
                </TabsContent>
                <TabsContent value="corporate">
                    {renderConversationList('corporate')}
                </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col h-full">
          {selectedConversation ? (
            <Card className="flex flex-col h-full rounded-none border-0">
              <div className="p-4 border-b flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} data-ai-hint="person face" />
                    <AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback>
                  </Avatar>
                   <div>
                       <h2 className="text-lg font-semibold">{`Chat #${selectedConversation.id.toString().padStart(6, '0')}`}</h2>
                       {selectedConversation.status === 'flagged' && <Badge variant="destructive" className="mt-1">Flagged for Review</Badge>}
                   </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => handleReportConversation(selectedConversation.id)}>
                        <AlertTriangle className="h-5 w-5" />
                        <span className="sr-only">Report Conversation</span>
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        {selectedConversation.status === 'active' ? (remaining > 0 ? `${remaining} messages left` : 'Message limit reached') : 'Chat disabled'}
                    </div>
                </div>
              </div>
              
              {selectedConversation.status === 'flagged' ? (
                 <div className="flex flex-col flex-1 items-center justify-center text-center p-8 bg-muted/20">
                      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                      <h2 className="text-xl font-bold">Chat Flagged for Review</h2>
                      <p className="text-muted-foreground max-w-sm">
                          This conversation has been flagged for a potential policy violation. It is currently disabled pending review by our moderation team.
                      </p>
                  </div>
              ) : (
                <>
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full bg-muted/20" ref={scrollAreaRef}>
                        <div className="p-4 space-y-4">
                        {selectedConversation.messages.map((msg, index) => (
                            msg.sender === 'system' ? (
                                <div key={index} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                            ) : (
                            <div key={index} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                            {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} /><AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
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
                                                    {/* Removed FileIcon and Download */}
                                                    <span className="text-xs truncate">{att.name}</span>
                                                </a>
                                            )
                                        ))}
                                    </div>
                                )}
                                {msg.sender === 'vendor' && (
                                    <div className="flex justify-end items-center gap-1 h-4 mt-1">
                                        {getStatusIcon(msg.status)}
                                    </div>
                                )}
                            </div>
                            {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="Vendor" /><AvatarFallback>V</AvatarFallback></Avatar>}
                            </div>
                            )
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
                <form onSubmit={handleSendMessage} className="p-4 border-t space-y-2">
                  <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                          <Textarea
                              ref={textareaRef}
                              placeholder={isLocked ? "Message limit reached. Awaiting your decision..." : "Type your message..."}
                              className="pr-12 resize-none max-h-48"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              maxLength={MAX_MESSAGE_LENGTH}
                              rows={1}
                              disabled={isLocked}
                          />
                           {!isLocked && <p className="absolute bottom-1 right-2 text-xs text-muted-foreground">{newMessage.length}/{MAX_MESSAGE_LENGTH}</p>}
                      </div>
                      <Button type="submit" size="icon" disabled={isLocked || !newMessage.trim()}><Send className="h-4 w-4" /></Button>
                  </div>
                </form>
              </>
            )}
            </Card>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-card">
                <MessageSquare className="h-16 w-16 mb-4"/>
                <h2 className="text-xl font-semibold">Select a conversation</h2>
                <p>Choose a conversation from the left panel to view messages and reply to your customers.</p>
             </div>
          )}
        </div>
      <ConversionCheckDialog 
        open={isConversionDialogOpen} 
        onOpenChange={setIsConversionDialogOpen}
        onContinue={handleContinueChat}
        onEnd={handleEndChat}
      />
    </div>
  );
}
