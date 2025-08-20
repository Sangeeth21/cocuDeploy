
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Check, Info, MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, AlertTriangle, Clock, CheckCheck, Eye } from "lucide-react";
import type { User, SupportTicket as BaseSupportTicket, Message as BaseMessage } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

// Enhance types for local state management
type Message = BaseMessage & {
    status?: 'sending' | 'sent' | 'read';
}

type SupportTicket = BaseSupportTicket & {
    messages: Message[];
}

export default function AdminSupportPage() {
    const { toast } = useToast();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const [newMessage, setNewMessage] = useState("");
    
    useEffect(() => {
        const q = query(collection(db, 'supportTickets'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ticketsData: SupportTicket[] = [];
            snapshot.forEach(doc => ticketsData.push({ id: doc.id, ...doc.data() } as SupportTicket));
            setTickets(ticketsData);
            if (!selectedTicket && ticketsData.length > 0) {
                setSelectedTicket(ticketsData[0]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [selectedTicket]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedTicket?.messages?.length]);

    const handleResolveTicket = async (ticketId: string) => {
        if (!selectedTicket) return;
        
        const systemMessage: Message = { id: `sys-${Date.now()}`, sender: 'system', text: 'Admin marked this conversation as resolved.'};
        const messagesRef = collection(db, 'supportTickets', ticketId, 'messages');
        await addDoc(messagesRef, systemMessage);
        
        const ticketRef = doc(db, 'supportTickets', ticketId);
        await updateDoc(ticketRef, { status: "Resolved" });

        toast({ title: 'Ticket Resolved', description: `Ticket ${ticketId} has been closed.` });
    };

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const messagesRef = collection(db, 'supportTickets', selectedTicket.id, 'messages');
        
        await addDoc(messagesRef, {
            id: `admin-${Date.now()}`,
            sender: "admin", 
            text: newMessage,
            timestamp: serverTimestamp(),
            status: 'sent'
        });

        // If the ticket was pending, update it to In-Progress
        if (selectedTicket.status === 'Pending') {
            const ticketRef = doc(db, 'supportTickets', selectedTicket.id);
            await updateDoc(ticketRef, { status: 'In-Progress' });
        }
        
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
                        <CardTitle>Support Tickets</CardTitle>
                        <CardDescription>Review and respond to vendor inquiries.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-2 p-4">
                        {loading ? <p>Loading tickets...</p> : tickets.map(ticket => (
                             <div 
                                key={ticket.id} 
                                className={`p-3 rounded-lg cursor-pointer border ${selectedTicket?.id === ticket.id ? 'bg-muted ring-2 ring-primary' : 'bg-card hover:bg-muted/50'}`}
                                onClick={() => setSelectedTicket(tickets.find(t => t.id === ticket.id) || null)}
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm truncate">{ticket.subject}</p>
                                    <Badge variant={ticket.status === 'Pending' ? 'destructive' : ticket.status === 'Resolved' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{ticket.vendor.name} - {new Date(ticket.date).toLocaleDateString()}</p>
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
                                        Ticket from {selectedTicket.vendor.name} on {new Date(selectedTicket.date).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                 <Avatar>
                                    <AvatarImage src={selectedTicket.vendor.avatar} alt={selectedTicket.vendor.name} />
                                    <AvatarFallback>{selectedTicket.vendor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                        </CardHeader>
                       
                        <div className="flex-1 flex flex-col min-h-0 bg-card">
                            <ScrollArea className="flex-1 bg-muted/20">
                                <div className="p-4 space-y-4">
                                        <div className="text-center text-xs text-muted-foreground py-2 italic">Initial message from vendor</div>
                                         <div className="flex items-end gap-2 justify-start">
                                            <Avatar className="h-8 w-8"><AvatarImage src={selectedTicket.vendor.avatar} alt={selectedTicket.vendor.name} /><AvatarFallback>{selectedTicket.vendor.name.charAt(0)}</AvatarFallback></Avatar>
                                            <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm bg-background shadow-sm">
                                                <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                                            </div>
                                         </div>
                                     {(selectedTicket.messages || []).map((msg) => (
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
                                    <Button type="submit" size="icon" disabled={selectedTicket.status === 'Resolved' || !newMessage.trim()}><Send className="h-4 w-4" /></Button>
                                </div>
                            </form>
                        </div>
                        {selectedTicket.status !== 'Resolved' && (
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
