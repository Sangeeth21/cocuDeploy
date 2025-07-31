
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Check, Info } from "lucide-react";
import type { User } from "@/lib/types";

interface Ticket {
    id: string;
    vendor: User;
    subject: string;
    message: string;
    date: string;
    status: "Pending" | "In-Progress" | "Resolved";
}

const mockTickets: Ticket[] = [
    {
        id: "TKT001",
        vendor: { id: "VDR001", name: "Timeless Co.", email: "contact@timeless.co", role: "Vendor", status: "Active", joinedDate: "2024-02-20", avatar: "https://placehold.co/40x40.png" },
        subject: "Payout Delay",
        message: "Hi, I haven't received my payout for the last cycle. Can you please look into this? The cycle ended on the 15th.",
        date: "2024-06-21",
        status: "Pending",
    },
    {
        id: "TKT002",
        vendor: { id: "VDR002", name: "Gadget Guru", email: "support@gadgetguru.io", role: "Vendor", status: "Active", joinedDate: "2024-04-22", avatar: "https://placehold.co/40x40.png" },
        subject: "Question about Product Listing",
        message: "I'm trying to list a new product with multiple color variants, but I'm having trouble with the interface. Can you guide me on how to do this properly? Thanks.",
        date: "2024-06-20",
        status: "Pending",
    },
     {
        id: "TKT003",
        vendor: { id: "VDR003", name: "Crafty Creations", email: "hello@crafty.com", role: "Vendor", status: "Active", joinedDate: "2024-03-15", avatar: "https://placehold.co/40x40.png" },
        subject: "Commission Rate Inquiry",
        message: "What is the current commission rate for the Home & Decor category?",
        date: "2024-06-18",
        status: "Resolved",
    },
];

export default function AdminSupportPage() {
    const { toast } = useToast();
    const [tickets, setTickets] = useState(mockTickets);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(mockTickets[0]);

    const handleApprove = (ticketId: string) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, status: "In-Progress" } : t
        ));
        
        setSelectedTicket(prev => prev && prev.id === ticketId ? {...prev, status: "In-Progress"} : prev);

        toast({
            title: "Conversation Started",
            description: `A chat has been initiated with ${ticket.vendor.name}.`,
        });
        
        // Here, you would trigger the creation of a new conversation
        // between the admin and the vendor in your backend.
    };

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
                                onClick={() => setSelectedTicket(ticket)}
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
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl">{selectedTicket.subject}</CardTitle>
                                    <CardDescription className="mt-1">
                                        Received from {selectedTicket.vendor.name} on {selectedTicket.date}
                                    </CardDescription>
                                </div>
                                 <Avatar>
                                    <AvatarImage src={selectedTicket.vendor.avatar} alt={selectedTicket.vendor.name} />
                                    <AvatarFallback>{selectedTicket.vendor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6 bg-muted/40">
                            <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                        </CardContent>
                         <CardContent className="p-4 border-t">
                            {selectedTicket.status === "Pending" ? (
                                 <Button className="w-full" onClick={() => handleApprove(selectedTicket.id)}>
                                     <Check className="mr-2 h-4 w-4" /> Start Conversation & Approve
                                 </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted justify-center">
                                    <Info className="h-4 w-4" />
                                    This ticket is {selectedTicket.status}.
                                </div>
                            )}
                        </CardContent>
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
