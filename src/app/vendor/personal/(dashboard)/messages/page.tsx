// src/app/vendor/personal/(dashboard)/messages/MessagesClient.tsx

"use client"; // This directive is crucial for client-side functionality

import React, { useState, useRef, useEffect, useCallback } from "react";
// Import all necessary components and types from your code
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MessageSquare, AlertTriangle, Check, EyeOff, Eye, CheckCheck, FileIcon, Download, ImageIcon, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import type { Message, Conversation } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Re-define your type and component as needed
type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

function ConversionCheckDialog({ open, onOpenChange, onContinue, onEnd }: { open: boolean, onOpenChange: (open: boolean) => void, onContinue: () => void, onEnd: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message Limit Reached</DialogTitle>
          <DialogDescription>
            You have reached the initial message limit with this customer. Would you like to continue the conversation?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm">Continuing this conversation will allow for 8 more messages. You can always end the conversation later.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onEnd}>End Conversation</Button>
          <Button onClick={onContinue}>Continue Chatting</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Rename the component and update the prop types
export default function MessagesClient({ initialConversations }: { initialConversations: Conversation[] }) {
  // Use the initial prop to set the initial state
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const MAX_MESSAGE_LENGTH = 1500;
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isConversionDialogOpen, setIsConversionDialogOpen] = useState(false);

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
  
  const handleReportConversation = (id: string | number) => {
    const updatedConvo = { ...selectedConversation!, status: 'flagged' as const };
    setConversations?.(prev => prev.map(c => c.id === id ? updatedConvo : c));
    setSelectedConversation(updatedConvo);
    toast({
        title: "Conversation Reported",
        description: "Thank you. Our moderation team will review this chat.",
    });
  }

  const handleContinueChat = () => {
    if (!selectedConversation) return;
    const updatedConvo = {
        ...selectedConversation,
        awaitingVendorDecision: false,
        messages: [...selectedConversation.messages, {id: 'system-continue', sender: 'system' as const, text: 'You extended the chat. 8 messages remaining.'}]
    };
    setConversations?.(prev => prev.map(c => c.id === selectedConversation.id ? updatedConvo : c));
    setSelectedConversation(updatedConvo);
    setIsConversionDialogOpen(false);
    toast({ title: 'Chat Extended', description: 'You can now send 8 more messages.' });
  }

  const handleEndChat = () => {
      if (!selectedConversation) return;
      const updatedConvo = {
            ...selectedConversation,
            awaitingVendorDecision: false,
            status: 'locked' as const,
            messages: [...selectedConversation.messages, {id: 'system-end', sender: 'system' as const, text: 'You have ended the chat.'}]
      };
      setConversations?.(prev => prev.map(c => c.id === selectedConversation.id ? updatedConvo : c));
      setSelectedConversation(updatedConvo);
      setIsConversionDialogOpen(false);
      toast({ variant: 'destructive', title: 'Chat Ended', description: 'This conversation has been locked.' });
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0 || !selectedConversation || !setConversations) return;

    const newAttachments: Attachment[] = attachments.map(file => ({
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "file",
        url: URL.createObjectURL(file), 
    }));

    const newMessageObj: Message = { 
      id: Math.random().toString(),
      sender: "vendor", 
      text: newMessage,
      status: 'sent',
      ...(newAttachments.length > 0 && {attachments: newAttachments})
    };

    setConversations(prev =>
      prev.map(convo => {
        if (convo.id !== selectedConversation.id) return convo;
        
        const updatedMessages = [...convo.messages, newMessageObj];
        let awaitingDecision = convo.awaitingVendorDecision;

        // Simplified logic from product-interactions
        if (convo.userMessageCount >= 15) {
            awaitingDecision = true;
        }
        
        return {
            ...convo,
            messages: updatedMessages,
            awaitingVendorDecision: awaitingDecision,
        };
      })
    );
    setNewMessage("");
    setAttachments([]);
  };
  
   const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        if (attachments.length + newFiles.length > 5) {
             toast({
                variant: "destructive",
                title: "Attachment Limit Exceeded",
                description: "You can only attach up to 5 files.",
            });
            return;
        }
        setAttachments(prev => [...prev, ...newFiles]);
    }
  }, [attachments.length, toast]);

  const removeAttachment = useCallback((fileToRemove: File) => {
    setAttachments(prev => prev.filter(file => file !== fileToRemove));
  }, []);
  
  const handleSelectConversation = (id: string | number) => {
    const convo = conversations.find(c => c.id === id);
    if(convo){
        setSelectedConversation(convo);
        setConversations?.(prev =>
            prev.map(c => 
                c.id === id ? { ...c, unread: false } : c
            )
        );
    }
  }

  const getLastMessage = (messages: Message[]) => {
      if (messages.length === 0) return "No messages yet.";
      const lastMsg = messages.filter(m => m.sender !== 'system').pop();
      if (!lastMsg) return "No messages yet.";
      
      const prefix = lastMsg.sender === 'vendor' ? 'You: ' : '';
      if (lastMsg.text) return `${prefix}${lastMsg.text}`;
      if (lastMsg.attachments && lastMsg.attachments.length > 0) return `${prefix}Sent ${lastMsg.attachments.length} attachment(s)`;
      return "No messages yet.";
  }
  
    const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
      switch(status) {
          case 'read':
              return <Eye className="h-4 w-4 text-primary-foreground" />;
          case 'delivered':
              return <EyeOff className="h-4 w-4 text-primary-foreground" />;
          case 'sent':
              return <Check className="h-4 w-4 text-primary-foreground" />;
          default:
              return null;
      }
    }
    
  const getChatLimit = () => {
      if (!selectedConversation) return { limit: 0, remaining: 0, isLocked: true };
      const { userMessageCount, awaitingVendorDecision, status } = selectedConversation;

      const INITIAL_LIMIT = 15;
      const EXTENDED_LIMIT = 15 + 8;

      const isLocked = awaitingVendorDecision || userMessageCount >= EXTENDED_LIMIT || status !== 'active';
      let limit = userMessageCount < INITIAL_LIMIT ? INITIAL_LIMIT : EXTENDED_LIMIT;
      let remaining = limit - userMessageCount;
      
      if(awaitingVendorDecision) {
        remaining = 0;
      }
      
      return { limit, remaining: Math.max(0, remaining), isLocked };
  }
  
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
          <ScrollArea className="flex-1">
            {conversations.map(convo => (
              <div
                key={convo.id}
                className={cn(
                  "flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 border-b",
                  selectedConversation?.id === convo.id && "bg-muted"
                )}
                onClick={() => handleSelectConversation(convo.id)}
              >
                <Avatar>
                  <AvatarImage src={convo.avatar} alt={convo.customerId} data-ai-hint="person face" />
                  <AvatarFallback>{convo.customerId?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">{convo.customerId}</p>
                        <div className="flex items-center gap-2">
                           {convo.status === 'flagged' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                           {convo.unread && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{getLastMessage(convo.messages)}</p>
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
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} data-ai-hint="person face" />
                    <AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback>
                  </Avatar>
                   <div>
                       <h2 className="text-lg font-semibold">{selectedConversation.customerId}</h2>
                       {selectedConversation.status === 'flagged' && <Badge variant="destructive" className="mt-1">Flagged for Review</Badge>}
                   </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => handleReportConversation(selectedConversation.id)}>
                        <AlertTriangle className="h-5 w-5" />
                        <span className="sr-only">Report Conversation</span>
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        {selectedConversation.status === 'active' ? (isLocked ? 'Message limit reached' : `${remaining} messages left`) : 'Chat disabled'}
                    </div>
                </div>
              </div>
              
              {selectedConversation.status === 'flagged' ? (
                 <div className="flex flex-col flex-1 items-center justify-center text-center p-8 bg-muted/20">
                      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                      <h2 className="text-xl font-bold">Chat Flagged for Review</h2>
                      <p className="text-muted-foreground max-w-sm">
                          This conversation has been flagged for a potential policy violation. It is currently disabled pending review by our moderation team.
                      </p>
                  </div>
              ) : (
                <>
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full bg-muted/20">
                        <div className="p-4 space-y-4" ref={messagesContainerRef}>
                        {selectedConversation.messages.map((msg, index) => (
                            msg.sender === 'system' ? (
                                <div key={index} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                            ) : (
                            <div key={index} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                            {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} /><AvatarFallback>{selectedConversation.customerId?.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                {msg.attachments && (
                                    <div className="grid gap-2 grid-cols-2">
                                        {msg.attachments.map((att, i) => (
                                            att.type === 'image' ? (
                                                <div key={i} className="relative aspect-video rounded-md overflow-hidden">
                                                    <Image src={att.url} alt={att.name} fill className="object-cover" data-ai-hint="attached image" />
                                                </div>
                                            ) : (
                                                <a href={att.url} key={i} download={att.name} className="flex items-center gap-2 p-2 rounded-md bg-background/50 hover:bg-background/80">
                                                    <FileIcon className="h-6 w-6 text-muted-foreground"/>
                                                    <span className="text-xs truncate">{att.name}</span>
                                                    <Download className="h-4 w-4 ml-auto" />
                                                </a>
                                            )
                                        ))}
                                    </div>
                                )}
                                {msg.sender === 'vendor' && (
                                    <div className="flex justify-end items-center gap-1 h-4 mt-1">
                                        {getStatusIcon(msg.status)}
                                    </div>
                                )}
                            </div>
                            {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="Vendor" /><AvatarFallback>V</AvatarFallback></Avatar>}
                            </div>
                            )
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
                <form onSubmit={handleSendMessage} className="p-4 border-t space-y-2">
                   {attachments.length > 0 && !isLocked && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {attachments.map((file, index) => (
                              <div key={index} className="relative group border rounded-md p-2 flex items-center gap-2 bg-muted/50">
                                  {file.type.startsWith('image/') ? <ImageIcon className="h-5 w-5 text-muted-foreground" /> : <FileIcon className="h-5 w-5 text-muted-foreground" />}
                                  <p className="text-xs text-muted-foreground truncate">{file.name}</p>
                                  <Button size="icon" variant="ghost" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100" onClick={() => removeAttachment(file)}><X className="h-3 w-3" /></Button>
                              </div>
                          ))}
                      </div>
                  )}
                  <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                          <Textarea
                              ref={textareaRef}
                              placeholder={isLocked ? "Message limit reached. Awaiting your decision..." : "Type your message..."}
                              className="pr-20 resize-none max-h-48"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              maxLength={MAX_MESSAGE_LENGTH}
                              rows={1}
                              disabled={isLocked}
                          />
                           {!isLocked && <p className="absolute bottom-1 right-12 text-xs text-muted-foreground">{newMessage.length}/{MAX_MESSAGE_LENGTH}</p>}
                      </div>
                      <Button type="button" variant="ghost" size="icon" asChild disabled={isLocked}>
                          <label htmlFor="vendor-file-upload"><Paperclip className="h-5 w-5" /></label>
                      </Button>
                      <input id="vendor-file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} disabled={isLocked} />
                      <Button type="submit" size="icon" disabled={isLocked || (!newMessage.trim() && attachments.length === 0)}><Send className="h-4 w-4" /></Button>
                  </div>
                </form>
              </>
            )}
            </Card>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-card">
                <MessageSquare className="h-16 w-16 mb-4"/>
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