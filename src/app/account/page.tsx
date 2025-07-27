
"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Camera, Home, CreditCard, PlusCircle, MoreVertical, Trash2, Edit, CheckCircle, Eye, EyeOff, MessageSquare, Search, Send, Paperclip, X, File as FileIcon, ImageIcon, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

type Message = {
  sender: "customer" | "vendor";
  text: string;
  attachments?: Attachment[];
};

type Conversation = {
  id: number;
  vendorId: string;
  avatar: string;
  messages: Message[];
  unread?: boolean;
};

const initialConversations: Conversation[] = [
  {
    id: 1,
    vendorId: "VDR001",
    avatar: "https://placehold.co/40x40.png",
    messages: [
      { sender: "customer", text: "Hi! I'm interested in the Classic Leather Watch. Is it available in black?" },
      { sender: "vendor", text: "Hello! Yes, the Classic Leather Watch is available with a black strap. I can update the listing if you'd like to purchase it." },
      { sender: "customer", text: "That would be great, thank you!", attachments: [{name: 'watch_photo.jpg', type: 'image', url: 'https://placehold.co/300x200.png'}] },
    ],
    unread: true,
  },
  {
    id: 2,
    vendorId: "VDR002",
    avatar: "https://placehold.co/40x40.png",
    messages: [{ sender: "customer", text: "Can you ship to Canada?", attachments: [{name: 'shipping_question.pdf', type: 'file', url: '#'}] }],
    unread: false,
  },
];


const mockUserOrders = [
    { id: "ORD001", date: "2024-05-20", status: "Delivered", total: 49.99 },
    { id: "ORD002", date: "2024-06-11", status: "Shipped", total: 124.50 },
    { id: "ORD003", date: "2024-06-15", status: "Processing", total: 79.99 },
];

const mockAddresses = [
    { id: 1, type: "Home", recipient: "John Doe", line1: "123 Main St", city: "Anytown", zip: "12345", isDefault: true, phone: "+1 (555) 111-2222" },
    { id: 2, type: "Work", recipient: "Jane Smith", line1: "456 Office Ave", city: "Busytown", zip: "54321", isDefault: false, phone: null },
]

const mockPaymentMethods = [
    { id: 1, type: "Visa", last4: "4242", expiry: "12/26"},
    { id: 2, type: "Mastercard", last4: "5555", expiry: "08/25"},
]


export default function AccountPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';
  const { toast } = useToast();
  const [avatar, setAvatar] = useState("https://placehold.co/100x100.png");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [isEmailVerifyOpen, setIsEmailVerifyOpen] = useState(false);
  const [isPhoneVerifyOpen, setIsPhoneVerifyOpen] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Chat state
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const MAX_MESSAGE_LENGTH = 1200; // Approx 200 words

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Handle navigation from product page
  useEffect(() => {
    const vendorId = searchParams.get('vendorId');
    const productName = searchParams.get('productName');
    if (vendorId) {
      const existingConvo = conversations.find(c => c.vendorId === vendorId);
      if (existingConvo) {
        setSelectedConversationId(existingConvo.id);
      } else {
        // Create a new conversation if one doesn't exist
        const newConvo: Conversation = {
          id: conversations.length + 1,
          vendorId: vendorId,
          avatar: "https://placehold.co/40x40.png",
          messages: [],
        };
        setConversations(prev => [...prev, newConvo]);
        setSelectedConversationId(newConvo.id);
      }
      
      if (productName) {
        setNewMessage(`Hi, I have a question about the "${productName}"...`);
      }
      
      // Clean up URL
      window.history.replaceState(null, '', '/account?tab=messages');
    } else {
        // Default to first conversation if no specific one is targeted
        if (conversations.length > 0 && !selectedConversationId) {
            setSelectedConversationId(conversations[0].id);
        }
    }
  }, [searchParams, conversations, selectedConversationId]);

  const handleSaveChanges = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
    });
  }
  
  const handleUpdatePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toast({
        title: "Password Updated",
        description: "Your password has been changed.",
    });
  }
  
  const handleNotificationSettingsChange = () => {
    toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
    });
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatar(URL.createObjectURL(file));
       toast({
        title: "Avatar Updated",
        description: "Your new profile picture has been set. Click 'Save Changes' to apply.",
    });
    }
  };

  const handleAvatarClick = () => {
      fileInputRef.current?.click();
  }
  
  const handleVerifySubmit = (type: 'email' | 'phone') => {
    toast({
      title: `${type === 'email' ? 'Email' : 'Phone'} Verified`,
      description: `Your new ${type} has been updated successfully.`,
    });
    if (type === 'email') setIsEmailVerifyOpen(false);
    if (type === 'phone') setIsPhoneVerifyOpen(false);
  }
  
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
        sender: "customer", 
        text: newMessage,
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
    toast({
        title: "Message Sent",
        description: "Your message has been sent to the vendor.",
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
      const prefix = lastMsg.sender === 'customer' ? 'You: ' : '';
      if (lastMsg.text) return `${prefix}${lastMsg.text}`;
      if (lastMsg.attachments && lastMsg.attachments.length > 0) return `${prefix}Sent ${lastMsg.attachments.length} attachment(s)`;
      return "No messages yet.";
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
    <div className="container py-12">
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group">
            <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} alt="User Avatar" data-ai-hint="person face" />
            <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <button 
                onClick={handleAvatarClick} 
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Change profile picture"
            >
                <Camera className="h-8 w-8 text-white" />
            </button>
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
            />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">John Doe's Account</h1>
          <p className="text-muted-foreground">Manage your profile, orders, and settings.</p>
        </div>
      </div>
      <Tabs value={tab} onValueChange={(value) => window.history.pushState(null, '', `?tab=${value}`)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Public Profile</CardTitle>
              <CardDescription>This information may be displayed publicly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="johndoe" />
                    </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us a little about yourself" defaultValue="Lover of all things tech and design. Avid collector of handcrafted mugs."/>
              </div>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="messages" className="h-[calc(100vh-22rem)]">
             <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 h-full gap-4">
                <div className="md:col-span-1 xl:col-span-1 flex flex-col border rounded-lg bg-card h-full">
                  <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold font-headline">Conversations</h2>
                     <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-8" />
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
                          <AvatarImage src={convo.avatar} alt={convo.vendorId} data-ai-hint="company logo" />
                          <AvatarFallback>{convo.vendorId.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold">{convo.vendorId}</p>
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
                          <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.vendorId} data-ai-hint="company logo" />
                          <AvatarFallback>{selectedConversation.vendorId.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-lg font-semibold">{selectedConversation.vendorId}</h2>
                      </div>
                      <ScrollArea className="flex-1" ref={scrollAreaRef}>
                        <div className="p-4 space-y-4">
                          {selectedConversation.messages.map((msg, index) => (
                            <div key={index} className={cn("flex items-end gap-2", msg.sender === 'customer' ? 'justify-end' : 'justify-start')}>
                              {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.avatar} alt={selectedConversation.vendorId} /><AvatarFallback>{selectedConversation.vendorId.charAt(0)}</AvatarFallback></Avatar>}
                              <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
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
                              </div>
                              {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={avatar} alt="You" /><AvatarFallback>Y</AvatarFallback></Avatar>}
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
                                <label htmlFor="customer-file-upload"><Paperclip className="h-5 w-5" /></label>
                            </Button>
                            <input id="customer-file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                            <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
                        </div>
                      </form>
                    </>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                        <MessageSquare className="h-16 w-16 mb-4"/>
                        <h2 className="text-xl font-semibold">Select a conversation</h2>
                        <p>Choose a conversation from the left panel to view your messages.</p>
                     </div>
                  )}
                </div>
            </div>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order History</CardTitle>
              <CardDescription>View your past purchases and their status.</CardDescription>
            </CardHeader>
            <CardContent>
                {mockUserOrders.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockUserOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.date}</TableCell>
                                <TableCell>
                                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">View Details</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                ) : (
                    <div className="text-muted-foreground text-center py-8">You have no past orders.</div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-4 text-lg">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Email Address</Label>
                        <div className="text-sm text-muted-foreground">john.doe@example.com <Badge variant="secondary" className="ml-2">Verified</Badge></div>
                      </div>
                      <Dialog open={isEmailVerifyOpen} onOpenChange={setIsEmailVerifyOpen}>
                        <DialogTrigger asChild><Button variant="outline">Change</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Email Address</DialogTitle>
                                <DialogDescription>A verification code will be sent to your new email.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-email">New Email</Label>
                                    <Input id="new-email" type="email" placeholder="new.email@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-otp">Verification Code</Label>
                                    <Input id="email-otp" placeholder="Enter 6-digit code" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => handleVerifySubmit('email')}>Verify & Update</Button>
                            </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Primary Phone</Label>
                        <div className="text-sm text-muted-foreground">+1 (555) 123-4567 <Badge variant="secondary" className="ml-2">Verified</Badge></div>
                      </div>
                       <Dialog open={isPhoneVerifyOpen} onOpenChange={setIsPhoneVerifyOpen}>
                         <DialogTrigger asChild><Button variant="outline">Change</Button></DialogTrigger>
                         <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Phone Number</DialogTitle>
                                <DialogDescription>A verification code will be sent to your new phone number.</DialogDescription>
                            </DialogHeader>
                             <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-phone">New Phone Number</Label>
                                    <Input id="new-phone" type="tel" placeholder="+1 (555) 555-5555" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone-otp">Verification Code</Label>
                                    <Input id="phone-otp" placeholder="Enter 6-digit code" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => handleVerifySubmit('phone')}>Verify & Update</Button>
                            </DialogFooter>
                        </DialogContent>
                       </Dialog>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Secondary Phone</Label>
                        <div className="text-sm text-muted-foreground">Not provided</div>
                      </div>
                      <Button variant="outline">Add</Button>
                    </div>
                  </div>
                </div>
                <Separator/>
                <div>
                    <h3 className="font-semibold mb-4 text-lg">Change Password</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <div className="relative">
                                <Input id="current-password" type={showCurrentPassword ? "text" : "password"} />
                                <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                    {showCurrentPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Input id="new-password" type={showNewPassword ? "text" : "password"} />
                                     <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowNewPassword(!showNewPassword)}>
                                        {showNewPassword ? <EyeOff /> : <Eye />}
                                    </Button>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <div className="relative">
                                    <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} />
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button className="mt-4" onClick={handleUpdatePassword}>Update Password</Button>
                </div>
                <Separator/>
                 <div>
                    <h3 className="font-semibold mb-4 text-lg">Notification Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div>
                             <Label htmlFor="promotions" className="font-medium">Promotional Emails</Label>
                             <p className="text-xs text-muted-foreground">Receive updates on new products and special offers.</p>
                           </div>
                           <Switch id="promotions" defaultChecked onCheckedChange={handleNotificationSettingsChange}/>
                        </div>
                         <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div>
                             <Label htmlFor="order-updates" className="font-medium">Order Updates</Label>
                             <p className="text-xs text-muted-foreground">Get notified about the status of your orders.</p>
                           </div>
                           <Switch id="order-updates" defaultChecked onCheckedChange={handleNotificationSettingsChange}/>
                        </div>
                    </div>
                </div>
                <Separator/>
                <div>
                    <h3 className="font-semibold text-destructive mb-2 text-lg">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all of your content. This action is not reversible.</p>
                    <DeleteAccountDialog />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="billing">
            <div className="space-y-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">Shipping Addresses</CardTitle>
                            <CardDescription>Manage your saved delivery addresses.</CardDescription>
                        </div>
                         <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2"/> Add Address</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px]">
                                <DialogHeader><DialogTitle>Add New Shipping Address</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label>Address Nickname</Label>
                                        <Input placeholder="e.g. Home, Work" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address</Label>
                                        <Input placeholder="123 Main St" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label>City</Label>
                                            <Input placeholder="Anytown" />
                                        </div>
                                         <div className="space-y-2 col-span-1">
                                            <Label>ZIP Code</Label>
                                            <Input placeholder="12345" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number (Optional)</Label>
                                        <Input type="tel" placeholder="For delivery updates or gifts" />
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="default-address"/>
                                        <Label htmlFor="default-address" className="font-normal">Set as default shipping address</Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => setIsAddressFormOpen(false)}>Save Address</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {mockAddresses.map(address => (
                         <div key={address.id} className="flex items-start justify-between p-4 border rounded-lg gap-4">
                            <div className="flex items-start gap-4">
                                <Home className="h-6 w-6 text-muted-foreground mt-1"/>
                                <div>
                                    <div className="font-semibold">{address.type} {address.isDefault && <Badge className="ml-2">Default</Badge>}</div>
                                    <div className="text-sm text-muted-foreground">{address.recipient}</div>
                                    <div className="text-sm text-muted-foreground">{address.line1}, {address.city}, {address.zip}</div>
                                    {address.phone && <div className="text-sm text-muted-foreground">Phone: {address.phone}</div>}
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem><Edit className="mr-2"/> Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/> Delete</DropdownMenuItem>
                                    {!address.isDefault && <DropdownMenuItem><CheckCircle className="mr-2"/> Set as Default</DropdownMenuItem>}
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                       ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader  className="flex flex-row items-center justify-between">
                         <div>
                            <CardTitle className="font-headline">Payment Methods</CardTitle>
                            <CardDescription>Manage your saved payment options.</CardDescription>
                        </div>
                        <Dialog open={isCardFormOpen} onOpenChange={setIsCardFormOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline"><PlusCircle className="mr-2"/> Add Card</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[480px]">
                              <DialogHeader><DialogTitle>Add New Payment Method</DialogTitle></DialogHeader>
                              <div className="space-y-4 py-2">
                                  <div className="space-y-2">
                                      <Label htmlFor="card-name">Name on Card</Label>
                                      <Input id="card-name" placeholder="John Doe" />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="card-number">Card Number</Label>
                                      <Input id="card-number" placeholder="•••• •••• •••• ••••" />
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Label htmlFor="expiry">Expiry</Label>
                                          <Input id="expiry" placeholder="MM/YY" />
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="cvc">CVC</Label>
                                          <Input id="cvc" placeholder="123" />
                                      </div>
                                  </div>
                              </div>
                              <DialogFooter>
                                  <Button onClick={() => setIsCardFormOpen(false)}>Save Card</Button>
                              </DialogFooter>
                          </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {mockPaymentMethods.map(pm => (
                         <div key={pm.id} className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-4">
                                <CreditCard className="h-6 w-6 text-muted-foreground"/>
                                <div>
                                    <div className="font-semibold">{pm.type} ending in {pm.last4}</div>
                                    <div className="text-sm text-muted-foreground">Expires {pm.expiry}</div>
                                </div>
                           </div>
                           <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                         </div>
                       ))}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
