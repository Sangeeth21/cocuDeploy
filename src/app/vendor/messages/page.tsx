
"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MessageSquare, Paperclip, X, File as FileIcon, ImageIcon, Download, Check, EyeOff, Eye } from "lucide-react";
import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@/lib/types";

type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

type Conversation = {
  id: number;
  customerId: string;
  avatar: string;
  messages: Message[];
  unread?: boolean;
};

const initialConversations: Conversation[] = [
  {
    id: 1,
    customerId: "CUST001",
    avatar: "https://placehold.co/40x40.png",
    messages: [
      { id: 'msg1', sender: "customer", text: "Hi! I'm interested in the Classic Leather Watch. Is it available in black?" },
      { id: 'msg2', sender: "vendor", text: "Hello! Yes, the Classic Leather Watch is available with a black strap. I can update the listing if you'd like to purchase it.", status: 'read' },
      { id: 'msg3', sender: "customer", text: "That would be great, thank you!", attachments: [{name: 'watch_photo.jpg', type: 'image', url: 'https://placehold.co/300x200.png'}] },
    ],
    unread: true,
  },
  {
    id: 2,
    customerId: "CUST002",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ id: 'msg4', sender: "customer", text: "Can you ship to Canada?", attachments: [{name: 'shipping_question.pdf', type: 'file', url: '#'}] }],
    unread: true,
  },
  {
    id: 3,
    customerId: "CUST003",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ id: 'msg5', sender: "vendor", text: "Thank you!", status: 'delivered' }],
    unread: false,
  },
   {
    id: 4,
    customerId: "CUST004",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ id: 'msg6', sender: "customer", text: "What is the return policy?" }],
    unread: true,
  },
];

export default function VendorMessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const MAX_MESSAGE_LENGTH = 1500; // Approx 250 words
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const removeAttachment = (fileToRemove: File) => {
    setAttachments(prev => prev.filter(file => file !== fileToRemove));
  }
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0 || !selectedConversationId) return;

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
      prev.map(convo =>
        convo.id === selectedConversationId
          ? { ...convo, messages: [...convo.messages, newMessageObj] }
          : convo
      )
    );
    setNewMessage("");
    setAttachments([]);
    
    // Simulate message delivery and read receipt
    setTimeout(() => {
        setConversations(prev => prev.map(convo => convo.id === selectedConversationId ? {
            ...convo,
            messages: convo.messages.map(m => m.id === newMessageObj.id ? {...m, status: 'delivered'} : m)
        } : convo));
        
        // Simulate customer seeing the message
        setTimeout(() => {
             setConversations(prev => prev.map(convo => convo.id === selectedConversationId ? {
                ...convo,
                messages: convo.messages.map(m => m.id === newMessageObj.id ? {...m, status: 'read'} : m)
             } : convo));
        }, 1500);
    }, 500);

    toast({
        title: "Message Sent",
        description: "Your reply has been sent to the customer.",
    });
  };
  
  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setConversations(prev =>
        prev.map(convo => 
            convo.id === id ? { ...convo, unread: false } : convo
        )
    );
  }

  const getLastMessage = (messages: Message[]) => {
      if (messages.length === 0) return "No messages yet.";
      const lastMsg = messages[messages.length - 1];
      const prefix = lastMsg.sender === 'vendor' ? 'You: ' : '';
      if (lastMsg.text) return `${prefix}${lastMsg.text}`;
      if (lastMsg.attachments && lastMsg.attachments.length > 0) return `${prefix}Sent ${lastMsg.attachments.length} attachment(s)`;
      return "No messages yet.";
  }
  
    const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
      switch(status) {
          case 'read':
              return <Eye className="h-4 w-4 text-primary" />;
          case 'delivered':
              return <EyeOff className="h-4 w-4" />;
          case 'sent':
              return <Check className="h-4 w-4" />;
          default:
              return null;
      }
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [newMessage]);

    useEffect(() => {
        if (scrollAreaRef.current) {
             const scrollableView = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
             if(scrollableView){
                 scrollableView.scrollTop = scrollableView.scrollHeight;
             }
        }
    }, [selectedConversation?.messages, selectedConversationId]);

  return (
    <VendorSidebarLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 h-[calc(100vh-11rem)] gap-4">
        <div className="md:col-span-1 xl:col-span-1 flex flex-col border rounded-lg bg-card">
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
                onClick={() => handleSelectConversation(convo.id)}
              >
                <Avatar>
                  <AvatarImage src={convo.avatar} alt={convo.customerId} data-ai-hint="person face" />
                  <AvatarFallback>{convo.customerId.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{convo.customerId}</p>
                    {convo.unread && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{getLastMessage(convo.messages)}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col h-full border rounded-lg bg-card">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} data-ai-hint="person face" />
                  <AvatarFallback>{selectedConversation.customerId.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{selectedConversation.customerId}</h2>
              </div>
              <ScrollArea className="flex-1" ref={scrollAreaRef}>
                 <div className="p-4 space-y-4">
                  {selectedConversation.messages.map((msg, index) => (
                    <div key={index} className={cn("flex items-end gap-2", msg.sender === 'vendor' ? 'justify-end' : 'justify-start')}>
                      {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.avatar} alt={selectedConversation.customerId} /><AvatarFallback>{selectedConversation.customerId.charAt(0)}</AvatarFallback></Avatar>}
                      <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
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
                            <div className="flex justify-end items-center gap-1 h-4">
                                {getStatusIcon(msg.status)}
                            </div>
                        )}
                      </div>
                      {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" alt="Vendor" /><AvatarFallback>V</AvatarFallback></Avatar>}
                    </div>
                  ))}
                  </div>
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto space-y-2">
                 {attachments.length > 0 && (
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
                            placeholder="Type your message..."
                            className="pr-20 resize-none max-h-48"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            maxLength={MAX_MESSAGE_LENGTH}
                            rows={1}
                        />
                         <p className="absolute bottom-1 right-12 text-xs text-muted-foreground">{newMessage.length}/{MAX_MESSAGE_LENGTH}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" asChild>
                        <label htmlFor="vendor-file-upload"><Paperclip className="h-5 w-5" /></label>
                    </Button>
                    <input id="vendor-file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                    <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
                </div>
              </form>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <MessageSquare className="h-16 w-16 mb-4"/>
                <h2 className="text-xl font-semibold">Select a conversation</h2>
                <p>Choose a conversation from the left panel to view messages and reply to your customers.</p>
             </div>
          )}
        </div>
      </div>
    </VendorSidebarLayout>
  );
}

    