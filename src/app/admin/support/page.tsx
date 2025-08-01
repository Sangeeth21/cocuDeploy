
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Check, Info, MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, AlertTriangle } from "lucide-react";
import type { User, SupportTicket, Message, Attachment } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Image from "next/image";

const mockTickets: SupportTicket[] = [
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

export default function AdminSupportPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [tickets, setTickets] = useState(mockTickets);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(mockTickets[0]);

    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const [newMessage, setNewMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const MAX_MESSAGE_LENGTH = 1500;
    
    // Auto-scrolling logic
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [selectedTicket?.messages.length]);


    const handleStartConversation = (ticketId: string) => {
        setTickets(prev => prev.map(t => {
            if (t.id === ticketId) {
                // Initialize messages if this is the first time
                const initialMessages: Message[] = t.messages.length > 0 ? t.messages : [
                    { id: `${ticketId}-init`, sender: 'vendor', text: t.message, timestamp: new Date(t.date) }
                ];
                
                return { ...t, status: "In-Progress", messages: initialMessages };
            }
            return t;
        }));
        
        // Update the selected ticket state as well to trigger re-render
        const updatedTicket = tickets.find(t => t.id === ticketId);
        if(updatedTicket) {
             const initialMessages: Message[] = updatedTicket.messages.length > 0 ? updatedTicket.messages : [
                { id: `${ticketId}-init`, sender: 'vendor', text: updatedTicket.message, timestamp: new Date(updatedTicket.date) }
            ];
            setSelectedTicket({...updatedTicket, status: 'In-Progress', messages: initialMessages});
        }
    };
    
    const handleResolveTicket = (ticketId: string) => {
        if (!selectedTicket) return;
        
        const finalMessage: Message = { id: `sys-${Date.now()}`, sender: 'system', text: 'Admin marked this conversation as resolved.'};
        
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, status: "Resolved", messages: [...t.messages, finalMessage] } : t
        ));
        
        setSelectedTicket(prev => prev ? {...prev, status: "Resolved", messages: [...prev.messages, finalMessage]} : null);

        toast({ title: 'Ticket Resolved', description: `Ticket ${ticketId} has been closed.` });
    };

    const handleSendMessage = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && attachments.length === 0 || !selectedTicket) return;

        const newAttachments: Attachment[] = attachments.map(file => ({
            name: file.name,
            type: file.type.startsWith("image/") ? "image" : "file",
            url: URL.createObjectURL(file), 
        }));

        const newMessageObj: Message = { 
            id: `admin-${Date.now()}`,
            sender: "admin", 
            text: newMessage,
            timestamp: new Date(),
            ...(newAttachments.length > 0 && {attachments: newAttachments})
        };

        const updatedMessages = [...selectedTicket.messages, newMessageObj];

        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? {...t, messages: updatedMessages} : t));
        setSelectedTicket(prev => prev ? {...prev, messages: updatedMessages} : null);

        setNewMessage("");
        setAttachments([]);
      }, [attachments, newMessage, selectedTicket]);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachments(prev => [...prev, ...newFiles]);
        }
    }

    const removeAttachment = (fileToRemove: File) => {
        setAttachments(prev => prev.filter(file => file !== fileToRemove));
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
                                    <div ref={messagesContainerRef} className="p-4 space-y-4">
                                         {selectedTicket.messages.map((msg, index) => (
                                            msg.sender === 'system' ? (
                                                <div key={msg.id} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                                            ) : (
                                            <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'admin' ? 'justify-end' : 'justify-start')}>
                                                {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src={selectedTicket.vendor.avatar} alt={selectedTicket.vendor.name} /><AvatarFallback>{selectedTicket.vendor.name.charAt(0)}</AvatarFallback></Avatar>}
                                                <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                                </div>
                                                {msg.sender === 'admin' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="Admin" /><AvatarFallback>A</AvatarFallback></Avatar>}
                                            </div>
                                            )
                                        ))}
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
                                        />
                                        <Button type="submit" size="icon" disabled={selectedTicket.status === 'Resolved'}><Send className="h-4 w-4" /></Button>
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
