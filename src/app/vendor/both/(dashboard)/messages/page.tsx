
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MessageSquare, AlertTriangle, Check, EyeOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import type { Message, Conversation } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

type Attachment = {
  name: string;
  type: "image" | "file";
  url: string;
};

function ConversionCheckDialog({
  open,
  onOpenChange,
  onContinue,
  onEnd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onEnd: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-primary" /> Potential Conversion
          </DialogTitle>
          <DialogDescription>
            You've reached the initial message limit. Do you believe this customer will place an order?
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Continuing the chat will grant 6 more messages. Ending the chat will lock the conversation.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onEnd}>
            End Chat
          </Button>
          <Button onClick={onContinue}>Yes, Continue Chat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -------------------------
// Inner UI component
// -------------------------
function MessagesUI({
  conversations = [],
  setConversations,
}: {
  conversations: (Conversation & { type: "customer" | "corporate" })[];
  setConversations: React.Dispatch<
    React.SetStateAction<(Conversation & { type: "customer" | "corporate" })[]>
  >;
}) {
  const [selectedConversation, setSelectedConversation] = useState<
    (Conversation & { type: "customer" | "corporate" }) | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isConversionDialogOpen, setIsConversionDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "corporate" ? "corporate" : "customer";

  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
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
    if (!selectedConversation) return;
    const updatedConvo = { ...selectedConversation, status: "flagged" as const };
    setConversations((prev) => prev.map((c) => (c.id === id ? updatedConvo : c)));
    setSelectedConversation(updatedConvo);
    toast({
      title: "Conversation Reported",
      description: "Thank you. Our moderation team will review this chat.",
    });
  };

  const handleContinueChat = () => {
    if (!selectedConversation) return;
    const updatedConvo = {
      ...selectedConversation,
      awaitingVendorDecision: false,
      messages: [
        ...selectedConversation.messages,
        { id: "system-continue", sender: "system" as const, text: "You extended the chat. 6 messages remaining." },
      ],
    };
    setConversations((prev) => prev.map((c) => (c.id === selectedConversation.id ? updatedConvo : c)));
    setSelectedConversation(updatedConvo);
    setIsConversionDialogOpen(false);
    toast({ title: "Chat Extended", description: "You can now send 6 more messages." });
  };

  const handleEndChat = () => {
    if (!selectedConversation) return;
    const updatedConvo = {
      ...selectedConversation,
      awaitingVendorDecision: false,
      status: "locked" as const,
      messages: [
        ...selectedConversation.messages,
        { id: "system-end", sender: "system" as const, text: "You have ended the chat." },
      ],
    };
    setConversations((prev) => prev.map((c) => (c.id === selectedConversation.id ? updatedConvo : c)));
    setSelectedConversation(updatedConvo);
    setIsConversionDialogOpen(false);
    toast({ variant: "destructive", title: "Chat Ended", description: "This conversation has been locked." });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const newMessageObj: Message = {
      id: Math.random().toString(),
      sender: "vendor",
      text: newMessage,
      status: "sent",
    };

    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.id !== selectedConversation.id) return convo;

        const customerMessageCount = convo.messages.filter((m) => m.sender === "customer").length;
        const vendorMessageCount = convo.messages.filter((m) => m.sender === "vendor").length;

        const updatedMessages = [...convo.messages, newMessageObj];
        let awaitingDecision = convo.awaitingVendorDecision;

        if (convo.type === "customer" && customerMessageCount >= 4 && vendorMessageCount === 0) {
          awaitingDecision = true;
          updatedMessages.push({
            id: "system-limit-personal",
            sender: "system",
            text: "You have reached the initial message limit. Decide whether to continue the chat.",
          });
        } else if (convo.type === "corporate" && vendorMessageCount + 1 === 5) {
          awaitingDecision = true;
          updatedMessages.push({
            id: "system-limit-corp",
            sender: "system",
            text: "You have reached the initial message limit. Decide whether to continue the chat.",
          });
        }

        const updatedConvo = {
          ...convo,
          messages: updatedMessages,
          awaitingVendorDecision: awaitingDecision,
        };

        setSelectedConversation(updatedConvo);
        return updatedConvo;
      })
    );

    setNewMessage("");
  };

  const handleSelectConversation = (id: number) => {
    const convo = conversations.find((c) => c.id === id);
    if (convo) {
      setSelectedConversation(convo);
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false, unreadCount: 0 } : c)));
    }
  };

  const getLastMessage = (messages: Message[]) => {
    if (messages.length === 0) return "No messages yet.";
    const lastMsg = messages.filter((m) => m.sender !== "system").pop();
    if (!lastMsg) return "No messages yet.";

    const prefix = lastMsg.sender === "vendor" ? "You: " : "";
    if (lastMsg.text) return `${prefix}${lastMsg.text}`;
    if (lastMsg.attachments && lastMsg.attachments.length > 0) return `${prefix}Sent ${lastMsg.attachments.length} attachment(s)`;
    return "No messages yet.";
  };

  const getStatusIcon = (status?: "sent" | "delivered" | "read") => {
    switch (status) {
      case "read":
        return <Eye className="h-4 w-4 text-primary-foreground" />;
      case "delivered":
        return <EyeOff className="h-4 w-4 text-primary-foreground" />;
      case "sent":
        return <Check className="h-4 w-4 text-primary-foreground" />;
      default:
        return null;
    }
  };

  const getChatLimit = () => {
    if (!selectedConversation) return { limit: 0, remaining: 0, isLocked: true };
    const { messages, awaitingVendorDecision, type, status } = selectedConversation;
    const isPermanentlyLocked = status !== "active";
    const vendorMessageCount = messages.filter((m) => m.sender === "vendor").length;

    if (type === "corporate") {
      const INITIAL_LIMIT = 5;
      const EXTENDED_LIMIT = 5 + 6;

      const isLocked = awaitingVendorDecision || vendorMessageCount >= EXTENDED_LIMIT || isPermanentlyLocked;
      let limit = vendorMessageCount < INITIAL_LIMIT ? INITIAL_LIMIT : EXTENDED_LIMIT;
      let remaining = limit - vendorMessageCount;

      if (awaitingVendorDecision) {
        remaining = 0;
      }

      return { limit, remaining: Math.max(0, remaining), isLocked };
    } else {
      const customerMessageCount = messages.filter((m) => m.sender === "customer").length;
      const INITIAL_LIMIT = 4;
      const EXTENDED_LIMIT = 4 + 8;
      const isLocked =
        (customerMessageCount >= INITIAL_LIMIT && awaitingVendorDecision) ||
        (customerMessageCount >= INITIAL_LIMIT && vendorMessageCount >= EXTENDED_LIMIT) ||
        isPermanentlyLocked;

      let limit = customerMessageCount < INITIAL_LIMIT ? INITIAL_LIMIT : EXTENDED_LIMIT;
      let remaining = limit - vendorMessageCount;

      if (awaitingVendorDecision) {
        remaining = 0;
      }

      return { limit, remaining: Math.max(0, remaining), isLocked };
    }
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

  const customerUnreadCount = conversations?.filter((c) => c.type === "customer" && c.unread).length || 0;
  const corporateUnreadCount = conversations?.filter((c) => c.type === "corporate" && c.unread).length || 0;

  const renderConversationList = (type: "customer" | "corporate") => {
    const filteredList = conversations?.filter((c) => c.type === type) || [];
    return (
      <ScrollArea className="h-full">
        {filteredList.map((convo) => (
          <div
            key={convo.id}
            className={cn(
              "flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 border-b",
              selectedConversation?.id === convo.id && "bg-muted"
            )}
            onClick={() => handleSelectConversation(convo.id as number)}
          >
            <Avatar>
              <AvatarImage src={convo.avatar} alt={convo.customerId} data-ai-hint="person face" />
              <AvatarFallback>{convo.customerId?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="font-semibold">{`Chat #${convo.id.toString().padStart(6, "0")}`}</p>
                <div className="flex items-center gap-2">
                  {convo.status === "flagged" && <AlertTriangle className="w-4 h-4 text-destructive" />}
                  {convo.unread && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                  {convo.unread && convo.unreadCount && convo.unreadCount > 0 && (
                    <Badge variant="secondary" className="px-1.5">
                      {convo.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground truncate">{getLastMessage(convo.messages)}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 h-full">
      <div className="md:col-span-1 xl:col-span-1 flex flex-col h-full border-r bg-card">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold font-headline">Inbox</h1>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-8" />
          </div>
        </div>
        <Tabs defaultValue={initialTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
            <TabsTrigger value="customer">
              Customer
              {customerUnreadCount > 0 && <Badge className="ml-2">{customerUnreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="corporate">
              Corporate
              {corporateUnreadCount > 0 && <Badge className="ml-2">{corporateUnreadCount}</Badge>}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="customer" className="flex-1 mt-0">
            {renderConversationList("customer")}
          </TabsContent>
          <TabsContent value="corporate" className="flex-1 mt-0">
            {renderConversationList("corporate")}
          </TabsContent>
        </Tabs>
      </div>
      <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col h-full">
        {selectedConversation ? (
          <div className="flex flex-col h-full rounded-none border-0">
            <div className="p-4 border-b flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} data-ai-hint="person face" />
                  <AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{`Chat #${selectedConversation.id.toString().padStart(6, "0")}`}</h2>
                  {selectedConversation.status === "flagged" && <Badge variant="destructive" className="mt-1">Flagged for Review</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => handleReportConversation(selectedConversation.id as number)}
                >
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span className="sr-only">Report Conversation</span>
                </Button>
                <div className="text-sm text-muted-foreground">
                  {selectedConversation.status === "active" ? (isLocked ? "Message limit reached" : `${remaining} messages left`) : "Chat disabled"}
                </div>
              </div>
            </div>

            {selectedConversation.status === "flagged" ? (
              <div className="flex flex-col flex-1 items-center justify-center text-center p-8 bg-muted/20">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-bold">Chat Flagged for Review</h2>
                <p className="text-muted-foreground max-w-sm">
                  This conversation has been flagged for a potential policy violation. It is currently disabled pending review by our moderation team.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 bg-muted/20">
                  <div className="p-4 space-y-4" ref={messagesContainerRef}>
                    {selectedConversation.messages.map((msg, index) =>
                      msg.sender === "system" ? (
                        <div key={index} className="text-center text-xs text-muted-foreground py-2">
                          {msg.text}
                        </div>
                      ) : (
                        <div
                          key={index}
                          className={cn("flex items-end gap-2", msg.sender === "vendor" ? "justify-end" : "justify-start")}
                        >
                          {msg.sender === "customer" && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} />
                              <AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2",
                              msg.sender === "vendor" ? "bg-primary text-primary-foreground" : "bg-background shadow-sm"
                            )}
                          >
                            {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                            {msg.attachments && (
                              <div className="grid gap-2 grid-cols-2">
                                {msg.attachments.map((att, i) =>
                                  att.type === "image" ? (
                                    <div key={i} className="relative aspect-video rounded-md overflow-hidden">
                                      <Image src={att.url} alt={att.name} fill className="object-cover" data-ai-hint="attached image" />
                                    </div>
                                  ) : (
                                    <a
                                      href={att.url}
                                      key={i}
                                      download={att.name}
                                      className="flex items-center gap-2 p-2 rounded-md bg-background/50 hover:bg-background/80"
                                    >
                                      <span className="text-xs truncate">{att.name}</span>
                                    </a>
                                  )
                                )}
                              </div>
                            )}
                            {msg.sender === "vendor" && (
                              <div className="flex justify-end items-center gap-1 h-4 mt-1">{getStatusIcon(msg.status)}</div>
                            )}
                          </div>
                          {msg.sender === "vendor" && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="https://placehold.co/40x40.png" alt="Vendor" />
                              <AvatarFallback>V</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="p-4 border-t space-y-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Textarea
                        ref={textareaRef}
                        placeholder={isLocked ? "Message limit reached. Awaiting your decision..." : "Type your message..."}
                        className="pr-12 resize-none max-h-48"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={1}
                        disabled={isLocked}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                    </div>
                    <Button type="submit" size="icon" disabled={isLocked || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-card">
            <MessageSquare className="h-16 w-16 mb-4" />
            <h2 className="text-xl font-semibold">Select a conversation</h2>
            <p>Choose a conversation from the left panel to view messages and reply to your customers.</p>
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

// -------------------------
// Default export: Next.js page (no props!)
// -------------------------
export default function Page() {
  // NOTE: Pages in Next.js App Router must not expect arbitrary props.
  // Manage state locally, fetch data via server components, or use a client-side store.
  const [conversations, setConversations] = useState<(Conversation & { type: "customer" | "corporate" })[]>([]);

  // If you want to hydrate with server-fetched data, lift this UI into a client wrapper
  // and pass initial data here.
  return <MessagesUI conversations={conversations} setConversations={setConversations} />;
}
