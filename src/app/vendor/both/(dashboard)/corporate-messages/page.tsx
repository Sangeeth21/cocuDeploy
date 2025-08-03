
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MessageSquare, Paperclip, X, File as FileIcon, ImageIcon, Download, Check, EyeOff, Eye, AlertTriangle, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import type { Message, Conversation } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

const initialConversations: Conversation[] = [
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
  }
];

export default function CorporateMessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(5);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

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
      prev.map(convo => 
        convo.id === selectedConversationId 
          ? { ...convo, messages: [...convo.messages, newMessageObj] } 
          : convo
      )
    );
    setNewMessage("");
  };

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 h-full">
        <div className="md:col-span-1 xl:col-span-1 flex flex-col h-full border-r bg-card">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold font-headline">Corporate Inbox</h1>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-8" />
            </div>
          </div>
          <ScrollArea className="flex-1">
                {conversations.map(convo => (
                <div
                    key={convo.id}
                    className={cn(
                    "flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 border-b",
                    selectedConversationId === convo.id && "bg-muted"
                    )}
                    onClick={() => handleSelectConversation(convo.id)}
                >
                    <Avatar>
                    <AvatarImage src={convo.avatar} alt={convo.customerId} />
                    <AvatarFallback>{convo.customerId?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{convo.customerId}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{convo.messages.slice(-1)[0].text}</p>
                    </div>
                </div>
                ))}
            </ScrollArea>
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col h-full">
          {selectedConversation ? (
            <Card className="flex flex-col h-full rounded-none border-0">
              <div className="p-4 border-b flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} />
                    <AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback>
                  </Avatar>
                   <div>
                       <h2 className="text-lg font-semibold">{selectedConversation.customerId}</h2>
                   </div>
                </div>
              </div>
                <>
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full bg-muted/20">
                        <div className="p-4 space-y-4">
                        {selectedConversation.messages.map((msg, index) => (
                            <div key={index} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                                {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} /><AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback></Avatar>}
                                <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                </div>
                                {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="Vendor" /><AvatarFallback>V</AvatarFallback></Avatar>}
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
                <form onSubmit={handleSendMessage} className="p-4 border-t space-y-2">
                  <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                          <Textarea
                              placeholder="Type your message..."
                              className="pr-12 resize-none max-h-48"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              rows={1}
                          />
                      </div>
                      <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
                  </div>
                </form>
              </>
            </Card>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-card">
                <MessageSquare className="h-16 w-16 mb-4"/>
                <h2 className="text-xl font-semibold">Select a conversation</h2>
                <p>Choose a conversation to view messages and reply.</p>
             </div>
          )}
        </div>
    </div>
  );
}
