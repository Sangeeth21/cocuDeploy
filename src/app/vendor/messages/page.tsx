
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send } from "lucide-react";
import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";
import { cn } from "@/lib/utils";

type Message = {
  sender: "customer" | "vendor";
  text: string;
};

type Conversation = {
  id: number;
  customerId: string;
  customerName: string;
  avatar: string;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  {
    id: 1,
    customerId: "CUST001",
    customerName: "Liam Johnson",
    avatar: "https://placehold.co/40x40.png",
    messages: [
      { sender: "customer", text: "Hi! I'm interested in the Classic Leather Watch. Is it available in black?" },
      { sender: "vendor", text: "Hello! Yes, the Classic Leather Watch is available with a black strap. I can update the listing if you'd like to purchase it." },
      { sender: "customer", text: "That would be great, thank you!" },
    ],
  },
  {
    id: 2,
    customerId: "CUST002",
    customerName: "Olivia Smith",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ sender: "customer", text: "Can you ship to Canada?" }],
  },
  {
    id: 3,
    customerId: "CUST003",
    customerName: "Noah Williams",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ sender: "vendor", text: "Thank you!" }],
  },
];

export default function VendorMessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    const newMessageObj: Message = { sender: "vendor", text: newMessage };

    setConversations(prev =>
      prev.map(convo =>
        convo.id === selectedConversationId
          ? { ...convo, messages: [...convo.messages, newMessageObj] }
          : convo
      )
    );
    setNewMessage("");
  };
  
  const getLastMessage = (messages: Message[]) => {
      if (messages.length === 0) return "No messages yet.";
      return messages[messages.length - 1].text;
  }

  return (
    <VendorSidebarLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-8rem)] gap-4">
        <div className="col-span-1 flex flex-col border rounded-lg bg-card">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold font-headline">Inbox</h1>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-8" />
            </div>
          </div>
          <ScrollArea>
            {conversations.map(convo => (
              <div
                key={convo.id}
                className={cn(
                  "flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50",
                  selectedConversationId === convo.id && "bg-muted"
                )}
                onClick={() => setSelectedConversationId(convo.id)}
              >
                <Avatar>
                  <AvatarImage src={convo.avatar} alt={convo.customerName} data-ai-hint="person face" />
                  <AvatarFallback>{convo.customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold">{convo.customerId}</p>
                  <p className="text-sm text-muted-foreground truncate">{getLastMessage(convo.messages)}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col h-full border rounded-lg bg-card">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerName} data-ai-hint="person face" />
                  <AvatarFallback>{selectedConversation.customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{selectedConversation.customerId}</h2>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((msg, index) => (
                    <div key={index} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                      {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerName} /><AvatarFallback>{selectedConversation.customerName.charAt(0)}</AvatarFallback></Avatar>}
                      <div className={cn("max-w-xs md:max-w-md rounded-lg p-3 text-sm", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        {msg.text}
                      </div>
                      {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarFallback>V</AvatarFallback></Avatar>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Select a conversation to start chatting.</p>
             </div>
          )}
        </div>
      </div>
    </VendorSidebarLayout>
  );
}
