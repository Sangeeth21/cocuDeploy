
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare, AlertTriangle, ShieldCheck, Lock, Unlock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Message, Conversation as AdminConversation } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type Conversation = Omit<AdminConversation, 'awaitingVendorDecision' | 'userMessageCount'> & {
  customerAvatar: string;
  vendorAvatar: string;
  type?: 'customer' | 'corporate';
}

const initialConversations: Conversation[] = [
  {
    id: "1",
    customerId: "CUST001",
    vendorId: "VDR001",
    customerAvatar: "https://placehold.co/40x40.png",
    vendorAvatar: "https://placehold.co/40x40.png",
    status: 'active',
    messages: [
      { id: 'msg1', sender: "customer", text: "Hi! I'm interested in the Classic Leather Watch. Is it available in black?", timestamp: new Date() },
      { id: 'msg2', sender: "vendor", text: "Hello! Yes, the Classic Leather Watch is available with a black strap. I can update the listing if you'd like to purchase it.", timestamp: new Date() },
      { id: 'msg3', sender: "customer", text: "That would be great, thank you!", timestamp: new Date() },
    ],
    avatar: '', // not used in this view
    type: 'customer',
  },
  {
    id: "2",
    customerId: "CUST002",
    vendorId: "VDR002",
    customerAvatar: "https://placehold.co/40x40.png",
    vendorAvatar: "https://placehold.co/40x40.png",
    status: 'flagged',
    messages: [{ id: 'msg4', sender: "customer", text: "Can you ship to Canada? My email is test@example.com", timestamp: new Date() }],
     avatar: '',
     type: 'customer',
  },
  {
    id: "CORP_CONV_1",
    customerId: "Corporate Client Inc.",
    vendorId: "VDR001",
    customerAvatar: "https://placehold.co/40x40.png",
    vendorAvatar: "https://placehold.co/40x40.png",
    status: 'active',
    messages: [
        { id: 'ccm1', sender: 'customer', text: 'Hello, we are interested in a bulk order of the Classic Leather Watch for a corporate event. Can you provide a quote for 500 units?' },
        { id: 'ccm2', sender: 'vendor', text: 'Absolutely! For 500 units, we can offer a price of $159.99 per unit. This includes custom engraving on the back. What is your required delivery date?' },
    ],
    avatar: '',
    type: 'corporate',
  }
];

export default function AdminChatLogsPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const selectedConversation = useMemo(() => conversations.find(c => c.id === selectedConversationId), [conversations, selectedConversationId]);

  useEffect(() => {
    if(!selectedConversationId && conversations.length > 0){
        setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedConversationId, selectedConversation?.messages.length]);


  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  }

  const handleModerationAction = (action: "warn_vendor" | "warn_customer" | "approve" | "lock") => {
      if (!selectedConversation) return;

      const customer = selectedConversation.customerId;
      const vendor = selectedConversation.vendorId;
      
      switch(action) {
        case 'warn_customer':
            toast({ title: "Action Taken", description: `A warning has been sent to ${customer}.` });
            break;
        case 'warn_vendor':
            toast({ title: "Action Taken", description: `A warning has been sent to ${vendor}.` });
            break;
        case 'approve':
            setConversations(prev => prev.map(c => c.id === selectedConversation.id ? {...c, status: 'active'} : c));
            toast({ title: "Chat Approved", description: `The conversation between ${customer} and ${vendor} has been re-enabled.` });
            break;
        case 'lock':
            setConversations(prev => prev.map(c => c.id === selectedConversation.id ? {...c, status: 'locked'} : c));
            toast({ variant: 'destructive', title: "Chat Locked", description: `The conversation between ${customer} and ${vendor} has been permanently locked.` });
            break;
      }
  }

  const renderConversationList = (type: 'customer' | 'corporate') => {
      const filteredConversations = conversations.filter(c => c.type === type);
      return (
          <ScrollArea>
              {filteredConversations.map(convo => (
              <div
                  key={convo.id}
                  className={cn(
                  "flex flex-col p-4 cursor-pointer hover:bg-muted/50 border-b",
                  selectedConversationId === convo.id && "bg-muted"
                  )}
                  onClick={() => handleSelectConversation(convo.id as string)}
              >
                  <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="truncate">{convo.customerId}</span>
                      <span>&harr;</span>
                      <span className="truncate">{convo.vendorId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground truncate mt-1">
                          {convo.messages.filter(m => m.sender !== 'system').pop()?.text}
                      </p>
                      {convo.status !== 'active' && <Badge variant={convo.status === 'flagged' ? 'destructive' : 'secondary'} className="capitalize">{convo.status}</Badge>}
                  </div>
              </div>
              ))}
          </ScrollArea>
      )
  }

  return (
      <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Chat Logs</h1>
            <p className="text-muted-foreground">Monitor conversations between vendors and customers.</p>
        </div>
        <Tabs defaultValue="customer" className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 h-[calc(100vh-14rem)] border rounded-lg bg-card">
            <div className="md:col-span-1 xl:col-span-1 flex flex-col h-full">
            <div className="p-4 border-b">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer">Customer</TabsTrigger>
                    <TabsTrigger value="corporate">Corporate</TabsTrigger>
                </TabsList>
                <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-8" />
                </div>
            </div>
            <TabsContent value="customer" className="flex-1 overflow-hidden mt-0">
                {renderConversationList('customer')}
            </TabsContent>
            <TabsContent value="corporate" className="flex-1 overflow-hidden mt-0">
                 {renderConversationList('corporate')}
            </TabsContent>
            </div>
            <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col h-full border-l">
            {selectedConversation ? (
                <>
                <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">{selectedConversation.customerId} &harr; {selectedConversation.vendorId}</h2>
                         {selectedConversation.status !== 'active' && <Badge variant={selectedConversation.status === 'flagged' || selectedConversation.status === 'locked' ? 'destructive' : 'secondary'} className="capitalize">{selectedConversation.status}</Badge>}
                    </div>
                    <div className="flex gap-2">
                        {selectedConversation.status === 'flagged' && (
                            <>
                                <Button variant="secondary" size="sm" onClick={() => handleModerationAction('approve')}>
                                    <Unlock className="mr-2 h-4 w-4"/> Approve Chat
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleModerationAction('lock')}>
                                    <Lock className="mr-2 h-4 w-4"/> Lock Chat
                                </Button>
                            </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleModerationAction('warn_customer')}>
                            <AlertTriangle className="mr-2 h-4 w-4"/> Warn {selectedConversation.type === 'corporate' ? 'Client' : 'Customer'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleModerationAction('warn_vendor')}>
                           <AlertTriangle className="mr-2 h-4 w-4"/> Warn Vendor
                        </Button>
                    </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0 bg-muted/20">
                    <div className="flex-1 min-h-0">
                        <ScrollArea className="h-full">
                            <div ref={messagesContainerRef} className="p-4 space-y-4">
                            {selectedConversation.messages.map((msg, index) => (
                                msg.sender === 'system' ? (
                                    <div key={index} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                                ) : (
                                <div key={index} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                                {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.customerAvatar} alt={selectedConversation.customerId} /><AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback></Avatar>}
                                <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                </div>
                                {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.vendorAvatar} alt={selectedConversation.vendorId} /><AvatarFallback>{selectedConversation.vendorId.charAt(0)}</AvatarFallback></Avatar>}
                                </div>
                                )
                            ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                    <MessageSquare className="h-16 w-16 mb-4"/>
                    <h2 className="text-xl font-semibold">Select a conversation</h2>
                    <p>Choose a conversation from the left panel to view the chat log.</p>
                </div>
            )}
            </div>
        </Tabs>
      </div>
  );
}
