
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Check, Info, MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, AlertTriangle, Clock, CheckCheck, Eye } from "lucide-react";
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

const initialTickets: SupportTicket[] = [
    {
        id: "TKT001",
        vendor: { id: "VDR001", name: "Timeless Co.", email: "contact@timeless.co", role: "Vendor", status: "Active", joinedDate: "2024-02-20", avatar: "https://placehold.co/40x40.png" },
        subject: "Payout Delay",
        message: "Hi, I haven't received my payout for the last cycle. Can you please look into this? The cycle ended on the 15th.",
        date: "2024-06-21",
        status: "Pending",
        messages: [],
    },
    {
        id: "TKT002",
        vendor: { id: "VDR002", name: "Gadget Guru", email: "support@gadgetguru.io", role: "Vendor", status: "Active", joinedDate: "2024-04-22", avatar: "https://placehold.co/40x40.png" },
        subject: "Question about Product Listing",
        message: "I'm trying to list a new product with multiple color variants, but I'm having trouble with the interface. Can you guide me on how to do this properly? Thanks.",
        date: "2024-06-20",
        status: "Pending",
        messages: [],
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
    },
];

const vendorReplies = [
    "Okay, thank you for the information. I'll look out for it.",
    "That makes sense. I appreciate the quick response!",
    "Got it. Thanks for clarifying.",
    "Perfect, that's exactly what I needed to know. Thank you!",
    "Thanks, I'll try that now.",
    "Can you show me where to find that in the dashboard?",
];

export default function AdminSupportPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [tickets, setTickets] = useState(initialTickets);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(initialTickets[0]);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const [newMessage, setNewMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const MAX_MESSAGE_LENGTH = 1500;
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedTicket?.messages.length]);

    const handleStartConversation = (ticketId: string) => {
        setTickets(prev => prev.map(t => {
            if (t.id === ticketId) {
                const initialMessage: Message = { id: `${ticketId}-init`, sender: 'vendor', text: t.message, timestamp: new Date(t.date) };
                const updatedTicket = { ...t, status: "In-Progress", messages: [initialMessage] };
                setSelectedTicket(updatedTicket); // Update the selected ticket state as well
                return updatedTicket;
            }
            return t;
        }));
    };
    
    const handleResolveTicket = (ticketId: string) => {
        if (!selectedTicket) return;
        
        const finalMessage: Message = { id: `sys-${Date.now()}`, sender: 'system', text: 'Admin marked this conversation as resolved.'};
        
        const updatedTicket = { ...selectedTicket, status: "Resolved", messages: [...selectedTicket.messages, finalMessage] } as SupportTicket;
        
        setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
        setSelectedTicket(updatedTicket);

        toast({ title: 'Ticket Resolved', description: `Ticket ${ticketId} has been closed.` });
    };

    const handleSendMessage = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && attachments.length === 0) || !selectedTicket) return;

        const adminMessageId = `admin-${Date.now()}`;
        const newAdminMessage: Message = { 
            id: adminMessageId,
            sender: "admin", 
            text: newMessage,
            timestamp: new Date(),
            status: 'sending'
        };

        const currentTicketId = selectedTicket.id;
        
        // Optimistically update the UI with the "sending" message
        setTickets(prev => prev.map(t => t.id === currentTicketId ? { ...t, messages: [...t.messages, newAdminMessage] } : t));
        setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, newAdminMessage] } : null);
        
        setNewMessage("");
        setAttachments([]);

        // Simulate sending the message
        setTimeout(() => {
            setTickets(prevTickets => prevTickets.map(t => {
                if (t.id === currentTicketId) {
                    const updatedMessages = t.messages.map(m => m.id === adminMessageId ? { ...m, status: 'sent' } : m);
                    return { ...t, messages: updatedMessages };
                }
                return t;
            }));
            setSelectedTicket(prev => prev ? {...prev, messages: prev.messages.map(m => m.id === adminMessageId ? { ...m, status: 'sent' } : m)} : null);

             // Simulate vendor reply
            setTimeout(() => {
                const vendorMessage: Message = {
                    id: `vendor-${Date.now()}`,
                    sender: 'vendor',
                    text: vendorReplies[Math.floor(Math.random() * vendorReplies.length)],
                    timestamp: new Date()
                }
                 setTickets(prevTickets => prevTickets.map(t => t.id === currentTicketId ? { ...t, messages: [...t.messages, vendorMessage] } : t));
                 setSelectedTicket(prev => prev ? {...prev, messages: [...prev.messages, vendorMessage]} : null);

                 // Mark admin's message as read after vendor replies
                 setTimeout(() => {
                      setTickets(prevTickets => prevTickets.map(t => {
                          if (t.id === currentTicketId) {
                              const updatedMessages = t.messages.map(m => m.id === adminMessageId ? { ...m, status: 'read' } : m);
                              return { ...t, messages: updatedMessages };
                          }
                          return t;
                      }));
                      setSelectedTicket(prev => prev ? {...prev, messages: prev.messages.map(m => m.id === adminMessageId ? { ...m, status: 'read' } : m)} : null);
                 }, 500)
            }, 1500);

        }, 1000);

      }, [newMessage, attachments, selectedTicket]);
  
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
                        <CardTitle>Support Tickets</CardTitle>
                        <CardDescription>Review and respond to vendor inquiries.</CardDescription>
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
                                <p className="text-xs text-muted-foreground">{ticket.vendor.name} - {ticket.date}</p>
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
                                        Ticket from {selectedTicket.vendor.name} on {selectedTicket.date}
                                    </CardDescription>
                                </div>
                                 <Avatar>
                                    <AvatarImage src={selectedTicket.vendor.avatar} alt={selectedTicket.vendor.name} />
                                    <AvatarFallback>{selectedTicket.vendor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                        </CardHeader>
                       
                        {selectedTicket.status === "Pending" ? (
                             <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-muted/20">
                                <p className="font-semibold">Initial Message:</p>
                                <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground max-w-md">"{selectedTicket.message}"</blockquote>
                                <Button className="mt-6" onClick={() => handleStartConversation(selectedTicket.id)}>
                                     <Check className="mr-2 h-4 w-4" /> Start Conversation & Approve
                                </Button>
                            </div>
                        ) : (
                             <div className="flex-1 flex flex-col min-h-0 bg-card">
                                <ScrollArea className="flex-1 bg-muted/20">
                                    <div className="p-4 space-y-4">
                                         {selectedTicket.messages.map((msg) => (
                                            msg.sender === 'system' ? (
                                                <div key={msg.id} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                                            ) : (
                                            <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'admin' ? 'justify-end' : 'justify-start')}>
                                                {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src={selectedTicket.vendor.avatar} alt={selectedTicket.vendor.name} /><AvatarFallback>{selectedTicket.vendor.name.charAt(0)}</AvatarFallback></Avatar>}
                                                <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                                    {msg.sender === 'admin' && msg.status && (
                                                        <div className="flex justify-end items-center gap-1 h-4 mt-1">
                                                            <span className="text-xs text-primary-foreground/70">{msg.status}</span>
                                                            {getStatusIcon(msg.status)}
                                                        </div>
                                                    )}
                                                </div>
                                                {msg.sender === 'admin' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="Admin" /><AvatarFallback>A</AvatarFallback></Avatar>}
                                            </div>
                                            )
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>
                                 <form onSubmit={handleSendMessage} className="p-4 border-t space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Textarea
                                            ref={textareaRef}
                                            placeholder={selectedTicket.status === 'Resolved' ? "This ticket has been resolved." : "Type your message..."}
                                            className="pr-12 resize-none max-h-48"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            rows={1}
                                            disabled={selectedTicket.status === 'Resolved'}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                        />
                                        <Button type="submit" size="icon" disabled={selectedTicket.status === 'Resolved' || (!newMessage.trim() && attachments.length === 0)}><Send className="h-4 w-4" /></Button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {selectedTicket.status === 'In-Progress' && (
                             <CardContent className="p-4 border-t">
                                <Button className="w-full" variant="secondary" onClick={() => handleResolveTicket(selectedTicket.id)}>
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Mark as Resolved
                                </Button>
                             </CardContent>
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
