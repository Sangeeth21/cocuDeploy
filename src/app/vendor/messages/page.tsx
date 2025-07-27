
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send } from "lucide-react";
import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";
import { cn } from "@/lib/utils";

const mockConversations = [
  { id: 1, name: "Liam Johnson", lastMessage: "Is this available in black?", avatar: "https://placehold.co/40x40.png", active: true },
  { id: 2, name: "Olivia Smith", lastMessage: "Can you ship to Canada?", avatar: "https://placehold.co/40x40.png", active: false },
  { id: 3, name: "Noah Williams", lastMessage: "Thank you!", avatar: "https://placehold.co/40x40.png", active: false },
];

const mockMessages = [
  { sender: "customer", text: "Hi! I'm interested in the Classic Leather Watch. Is it available in black?" },
  { sender: "vendor", text: "Hello! Yes, the Classic Leather Watch is available with a black strap. I can update the listing if you'd like to purchase it." },
  { sender: "customer", text: "That would be great, thank you!" },
];

export default function VendorMessagesPage() {
    return (
        <VendorSidebarLayout>
             <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-8rem)] gap-4">
                <div className="col-span-1 flex flex-col border rounded-lg bg-card">
                    <div className="p-4 border-b">
                         <h1 className="text-2xl font-bold font-headline">Inbox</h1>
                         <div className="relative mt-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search conversations..." className="pl-8" />
                        </div>
                    </div>
                    <ScrollArea>
                        {mockConversations.map(convo => (
                            <div key={convo.id} className={cn("flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50", convo.active && "bg-muted")}>
                                <Avatar>
                                    <AvatarImage src={convo.avatar} alt={convo.name} data-ai-hint="person face" />
                                    <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{convo.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-col h-full border rounded-lg bg-card">
                    <div className="p-4 border-b flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={mockConversations[0].avatar} alt={mockConversations[0].name} data-ai-hint="person face" />
                            <AvatarFallback>{mockConversations[0].name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-lg font-semibold">{mockConversations[0].name}</h2>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {mockMessages.map((msg, index) => (
                                <div key={index} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                                    {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarFallback>{mockConversations[0].name.charAt(0)}</AvatarFallback></Avatar>}
                                    <div className={cn("max-w-xs md:max-w-md rounded-lg p-3 text-sm", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                        {msg.text}
                                    </div>
                                    {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarFallback>V</AvatarFallback></Avatar>}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t mt-auto flex items-center gap-2">
                        <Input placeholder="Type your message..." className="flex-1"/>
                        <Button>
                            <Send className="h-4 w-4"/>
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </div>
             </div>
        </VendorSidebarLayout>
    );
}

