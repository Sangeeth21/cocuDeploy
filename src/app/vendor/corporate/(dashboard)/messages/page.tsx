
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Check, Info, MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, AlertTriangle, Clock, CheckCheck, Eye, EyeOff } from "lucide-react";
import type { User, SupportTicket as BaseSupportTicket, Message as BaseMessage, Attachment, Conversation } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Message = BaseMessage & {
    status?: 'sending' | 'sent' | 'read';
}

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
                    Continuing the chat will grant 6 more messages. Ending the chat will lock the conversation.
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={onEnd}>End Chat</Button>
                    <Button onClick={onContinue}>Yes, Continue Chat</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function CorporateMessagesPage({ conversations = [], setConversations }: { conversations: (Conversation & {type: 'customer' | 'corporate'})[], setConversations: React.Dispatch<React.SetStateAction<(Conversation & {type: 'customer' | 'corporate'})[]>> }) {
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & {type: 'customer' | 'corporate'}) | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const MAX_MESSAGE_LENGTH = 1500;
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isConversionDialogOpen, setIsConversionDialogOpen] = useState(false);

  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      const firstCorporateChat = conversations.find(c => c.type === 'corporate');
      setSelectedConversation(firstCorporateChat || null);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (selectedConversation?.awaitingVendorDecision) {
        setIsConversionDialogOpen(true);
    } else {
        setIsConversionDialogOpen(false);
    }
  }, [selectedConversation]);
  
  const handleReportConversation = (id: number) => {
    const updatedConvo = { ...selectedConversation!, status: 'flagged' as const };
    setConversations(prev => prev.map(c => c.id === id ? updatedConvo : c));
    setSelectedConversation(updatedConvo);
    toast({
        title: "Conversation Reported",
        description: "Thank you. Our moderation team will review this chat.",
    });
  }

  const handleContinueChat = () => {
    if (!selectedConversation) return;
    const updatedConvo = {
        ...selectedConversation,
        awaitingVendorDecision: false,
        messages: [...selectedConversation.messages, {id: 'system-continue', sender: 'system' as const, text: 'You extended the chat. 6 messages remaining.'}]
    };
    setConversations(prev => prev.map(c => c.id === selectedConversation.id ? updatedConvo : c));
    setSelectedConversation(updatedConvo);
    setIsConversionDialogOpen(false);
    toast({ title: 'Chat Extended', description: 'You can now send 6 more messages.' });
  }

  const handleEndChat = () => {
      if (!selectedConversation) return;
      const updatedConvo = {
            ...selectedConversation,
            awaitingVendorDecision: false,
            status: 'locked' as const,
            messages: [...selectedConversation.messages, {id: 'system-end', sender: 'system' as const, text: 'You have ended the chat.'}]
      };
      setConversations(prev => prev.map(c => c.id === selectedConversation.id ? updatedConvo : c));
      setSelectedConversation(updatedConvo);
      setIsConversionDialogOpen(false);
      toast({ variant: 'destructive', title: 'Chat Ended', description: 'This conversation has been locked.' });
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const newMessageObj: Message = {
      id: Math.random().toString(),
      sender: "vendor",
      text: newMessage,
      status: 'sent',
    };

    let updatedConvo: (Conversation & {type: 'customer' | 'corporate'}) | null = null;
    setConversations(prev =>
      prev.map(convo => {
         if (convo.id !== selectedConversation.id) return convo;
        
        const vendorMessageCount = convo.messages.filter(m => m.sender === 'vendor').length;
        const updatedMessages = [...convo.messages, newMessageObj];
        let awaitingDecision = convo.awaitingVendorDecision;

        // Apply corporate logic
        if (vendorMessageCount + 1 === 5) { // Check before incrementing
          awaitingDecision = true;
          updatedMessages.push({
            id: 'system-limit-corp',
            sender: 'system',
            text: 'You have reached the initial message limit. Decide whether to continue the chat.'
          });
        }
        
        updatedConvo = {
          ...convo,
          messages: updatedMessages,
          awaitingVendorDecision: awaitingDecision,
        };
        
        return updatedConvo;
      })
    );

    if (updatedConvo) {
      setSelectedConversation(updatedConvo);
    }
    setNewMessage("");
  };
  
  const handleSelectConversation = (id: number) => {
    const convo = conversations.find(c => c.id === id);
    if(convo){
        setSelectedConversation(convo);
        setConversations(prev =>
            prev.map(c => 
                c.id === id ? { ...c, unread: false } : c
            )
        );
    }
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
        const { messages, awaitingVendorDecision, status } = selectedConversation;
        const isPermanentlyLocked = status !== 'active';
        const vendorMessageCount = messages.filter(m => m.sender === 'vendor').length;

        const INITIAL_LIMIT = 5;
        const EXTENDED_LIMIT = 5 + 6;
        
        const isLocked = awaitingVendorDecision || vendorMessageCount >= EXTENDED_LIMIT || isPermanentlyLocked;
        let limit = vendorMessageCount < INITIAL_LIMIT ? INITIAL_LIMIT : EXTENDED_LIMIT;
        let remaining = limit - vendorMessageCount;
        
        if(awaitingVendorDecision) {
            remaining = 0;
        }
        
        return { limit, remaining: Math.max(0, remaining), isLocked };
    };
  
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
    }, [selectedConversation?.messages]);

    const corporateConversations = conversations.filter(c => c.type === 'corporate');

    return (
        <div className="grid md:grid-cols-3 gap-8 items-start h-[calc(100vh-12rem)]">
            <div className="md:col-span-1 h-full">
                 <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Corporate Messages</CardTitle>
                        <CardDescription>Direct messages from corporate clients.</CardDescription>
                        <div className="relative pt-2">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search messages..." className="pl-8" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-2 p-0">
                        {corporateConversations.map(ticket => (
                             <div 
                                key={ticket.id} 
                                className={`p-4 flex items-center gap-4 cursor-pointer border-b ${selectedConversation?.id === ticket.id ? 'bg-muted' : 'bg-card hover:bg-muted/50'}`}
                                onClick={() => handleSelectConversation(ticket.id)}
                            >
                                <Avatar>
                                    <AvatarImage src={ticket.avatar} alt={ticket.customerId} />
                                    <AvatarFallback>{ticket.customerId.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm truncate">{ticket.customerId}</p>
                                    {ticket.unread && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{getLastMessage(ticket.messages)}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
             <div className="md:col-span-2 h-full">
                {selectedConversation ? (
                     <Card className="h-full flex flex-col">
                         <div className="p-4 border-b flex flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} data-ai-hint="person face" />
                                <AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-lg font-semibold">{selectedConversation.customerId}</h2>
                                {selectedConversation.status === 'flagged' && <Badge variant="destructive" className="mt-1">Flagged for Review</Badge>}
                            </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => handleReportConversation(selectedConversation.id)}>
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="sr-only">Report Conversation</span>
                                </Button>
                                 <div className="text-sm text-muted-foreground">
                                    {selectedConversation.status === 'active' ? (isLocked ? 'Message limit reached' : `${remaining} messages left`) : 'Chat disabled'}
                                </div>
                            </div>
                        </div>
                       
                         <div className="flex-1 flex flex-col min-h-0 bg-card">
                            <ScrollArea className="flex-1 bg-muted/20">
                                <div className="p-4 space-y-4" ref={messagesContainerRef}>
                                     {selectedConversation.messages.map((msg, index) => (
                                        msg.sender === 'system' ? (
                                            <div key={index} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                                        ) : (
                                        <div key={index} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                                        {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} /><AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback></Avatar>}
                                        <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                                            {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                            {msg.sender === 'vendor' && (
                                                <div className="flex justify-end items-center gap-1 h-4 mt-1">
                                                    {getStatusIcon(msg.status)}
                                                </div>
                                            )}
                                        </div>
                                        {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src={"https://placehold.co/40x40.png"} alt={"Vendor"} /><AvatarFallback>V</AvatarFallback></Avatar>}
                                        </div>
                                        )
                                    ))}
                                </div>
                            </ScrollArea>
                            <form onSubmit={handleSendMessage} className="p-4 border-t space-y-2">
                                     {selectedConversation.status !== 'Resolved' && (
                                         <div className="flex items-center gap-2">
                                            <Textarea
                                                placeholder={"Type your message..."}
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
             <ConversionCheckDialog 
                open={isConversionDialogOpen} 
                onOpenChange={setIsConversionDialogOpen}
                onContinue={handleContinueChat}
                onEnd={handleEndChat}
            />
        </div>
    );
}
