
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Check, Info, MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, AlertTriangle, Clock, CheckCheck, Eye, EyeOff } from "lucide-react";
import type { User, SupportTicket as BaseSupportTicket, Message as BaseMessage, Attachment } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Enhance types for local state management
type Message = BaseMessage & {
    status?: 'sending' | 'sent' | 'read';
}

type SupportTicket = BaseSupportTicket & {
    messages: Message[];
}

export const initialConversations: SupportTicket[] = [
    {
        id: "CORP_TKT001",
        vendor: { id: "VDR001", name: "Timeless Co.", email: "contact@timeless.co", role: "Vendor", status: "Active", joinedDate: "2024-02-20", avatar: "https://placehold.co/40x40.png" },
        subject: "Bulk Order Payout Question",
        message: "Hi, how are payouts for large corporate orders handled? Are they different from regular orders?",
        date: "2024-06-21",
        status: "Pending",
        messages: [],
        unread: true,
    },
    {
        id: "TKT002",
        vendor: { id: "VDR002", name: "Gadget Guru", email: "support@gadgetguru.io", role: "Vendor", status: "Active", joinedDate: "2024-04-22", avatar: "https://placehold.co/40x40.png" },
        subject: "Question about Product Listing",
        message: "I'm trying to list a new product with multiple color variants, but I'm having trouble with the interface. Can you guide me on how to do this properly? Thanks.",
        date: "2024-06-20",
        status: "Pending",
        messages: [],
        unread: true,
    },
     {
        id: "TKT003",
        vendor: { id: "VDR003", name: "Crafty Creations", email: "hello@crafty.com", role: "Vendor", status: "Active", joinedDate: "2024-03-15", avatar: "https://placehold.co/40x40.png" },
        subject: "Commission Rate Inquiry",
        message: "What is the current commission rate for the Home & Decor category?",
        date: "2024-06-18",
        status: "Resolved",
        messages: [
            { id: 't3m1', sender: 'vendor', text: 'What is the current commission rate for the Home & Decor category?' },
            { id: 't3m2', sender: 'admin', text: 'Hi! The commission rate for Home & Decor is currently 15%.' },
            { id: 't3m3', sender: 'system', text: 'Admin marked this conversation as resolved.' }
        ],
        unread: false,
    },
];

export default function CorporateSupportPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [tickets, setTickets] = useState(initialConversations);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(initialTickets[0]);
    const [newMessage, setNewMessage] = useState("");

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedTicket?.messages.length]);

    const handleSendMessage = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const vendorMessageId = `vendor-${Date.now()}`;
        const newVendorMessage: Message = { 
            id: vendorMessageId,
            sender: "vendor", 
            text: newMessage,
            timestamp: new Date(),
            status: 'sent'
        };

        const currentTicketId = selectedTicket.id;
        
        setTickets(prev => prev.map(t => t.id === currentTicketId ? { ...t, messages: [...t.messages, newVendorMessage], status: 'In-Progress' } : t));
        setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, newVendorMessage], status: 'In-Progress' } : null);
        
        setNewMessage("");

      }, [newMessage, selectedTicket]);
  
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
        <div className="grid md:grid-cols-3 gap-8 items-start h-[calc(100vh-12rem)]">
            <div className="md:col-span-1 h-full">
                 <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Corporate Support</CardTitle>
                        <CardDescription>Manage your support tickets related to corporate sales.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-2 p-4">
                        {tickets.map(ticket => (
                             <div 
                                key={ticket.id} 
                                className={`p-3 rounded-lg cursor-pointer border ${selectedTicket?.id === ticket.id ? 'bg-muted ring-2 ring-primary' : 'bg-card hover:bg-muted/50'}`}
                                onClick={() => setSelectedTicket(tickets.find(t => t.id === ticket.id) || null)}
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm truncate">{ticket.subject}</p>
                                    <Badge variant={ticket.status === 'Pending' ? 'destructive' : ticket.status === 'Resolved' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{ticket.id} - {ticket.date}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
             <div className="md:col-span-2 h-full">
                {selectedTicket ? (
                     <Card className="h-full flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl">{selectedTicket.subject}</CardTitle>
                                    <CardDescription className="mt-1">
                                        Ticket ID: {selectedTicket.id}
                                    </CardDescription>
                                </div>
                                <Avatar>
                                    <AvatarImage src={"https://placehold.co/40x40.png"} alt={"Admin"} />
                                    <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                            </div>
                        </CardHeader>
                       
                        {selectedTicket.status === "Pending" ? (
                             <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-muted/20">
                                <p className="font-semibold">Initial Message:</p>
                                <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground max-w-md">"{selectedTicket.message}"</blockquote>
                                <p className="text-xs text-muted-foreground mt-4">An admin will respond to your ticket shortly.</p>
                            </div>
                        ) : (
                             <div className="flex-1 flex flex-col min-h-0 bg-card">
                                <ScrollArea className="flex-1 bg-muted/20">
                                    <div className="p-4 space-y-4">
                                         {selectedTicket.messages.map((msg) => (
                                            msg.sender === 'system' ? (
                                                <div key={msg.id} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                                            ) : (
                                            <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                                                {msg.sender === 'admin' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="Admin" /><AvatarFallback>A</AvatarFallback></Avatar>}
                                                <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                                    {msg.sender === 'vendor' && msg.status && (
                                                        <div className="flex justify-end items-center gap-1 h-4 mt-1">
                                                            <span className="text-xs text-primary-foreground/70">{msg.status}</span>
                                                            {getStatusIcon(msg.status)}
                                                        </div>
                                                    )}
                                                </div>
                                                {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src={selectedTicket.vendor.avatar} alt={selectedTicket.vendor.name} /><AvatarFallback>{selectedTicket.vendor.name.charAt(0)}</AvatarFallback></Avatar>}
                                            </div>
                                            )
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>
                                 <form onSubmit={handleSendMessage} className="p-4 border-t space-y-2">
                                     {selectedTicket.status !== 'Resolved' && (
                                         <div className="flex items-center gap-2">
                                            <Textarea
                                                ref={textareaRef}
                                                placeholder={"Type your message..."}
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
                                            <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
                                        </div>
                                     )}
                                </form>
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Select a ticket to view its details.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
