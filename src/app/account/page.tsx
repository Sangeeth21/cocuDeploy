
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Camera, Home, CreditCard, PlusCircle, MoreVertical, Trash2, Edit, CheckCircle, Eye, EyeOff, MessageSquare, Search, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, AlertTriangle, ShieldCheck, BellRing, Package, ShoppingCart, Truck, Gift, Copy, Gem, Trophy, Share2, Twitter, Facebook, Instagram, Linkedin, User as UserIcon, Wand2 } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import type { Message, Conversation, DisplayProduct, Order } from "@/lib/types";
import { useUser } from "@/context/user-context";
import { useWishlist } from "@/context/wishlist-context";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/context/cart-context";
import { Progress } from "@/components/ui/progress";
import { useAuthDialog } from "@/context/auth-dialog-context";
import { ProductFilterSidebar } from "@/components/product-filter-sidebar";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";


type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

const FORBIDDEN_KEYWORDS = ['phone', 'email', 'contact', '@', '.com', 'number', 'cash', 'paypal', 'venmo'];


const mockAddresses = [
    { id: 1, type: "Home", recipient: "John Doe", line1: "123 Main St", city: "Anytown", zip: "12345", isDefault: true, phone: "+1 (555) 111-2222" },
    { id: 2, type: "Work", recipient: "Jane Smith", line1: "456 Office Ave", city: "Busytown", zip: "54321", isDefault: false, phone: null },
]

const mockPaymentMethods = [
    { id: 1, type: "Visa", last4: "4242", expiry: "12/26"},
    { id: 2, type: "Mastercard", last4: "5555", expiry: "08/25"},
]

const MOCK_USER_DATA = {
    referralCode: "JOHN-D4E8",
    referrals: 2,
    referralsForNextTier: 5,
    walletBalance: 100, // in Rs
    ordersToNextReward: 1,
    totalOrdersForReward: 3,
    loyaltyPoints: 2500,
    loyaltyTier: "Silver",
    nextLoyaltyTier: "Gold",
    pointsToNextTier: 7500,
};

// Simulate tracking for chat abuse prevention
let uniqueVendorChats = new Set().size; // This will be managed by real data now

const MAX_PRICE = 500;

function WishlistTabContent({orders}: {orders: Order[]}) {
    const router = useRouter();
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { toast } = useToast();
    const { isLoggedIn } = useUser();
    const { openDialog } = useAuthDialog();
    
    // Filtering State
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);

    const handleCategoryChange = (categoryName: string) => {
        setSelectedCategories(prev =>
        prev.includes(categoryName)
            ? prev.filter(c => c !== categoryName)
            : [...prev, categoryName]
        );
    };

    const handleRatingChange = (rating: number) => {
        setSelectedRatings(prev =>
        prev.includes(rating)
            ? prev.filter(r => r !== rating)
            : [...prev, rating]
        );
    };
  
    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedRatings([]);
        setPriceRange([0, MAX_PRICE]);
    }
    
    const isCustomizable = (product: DisplayProduct) => {
        return Object.values(product.customizationAreas || {}).some(areas => areas && areas.length > 0);
    }

    const filteredWishlistItems = useMemo(() => {
        let products: DisplayProduct[] = wishlistItems;

        if (selectedCategories.length > 0) {
            products = products.filter(p => selectedCategories.includes(p.category));
        }

        if (selectedRatings.length > 0) {
            const minRating = Math.min(...selectedRatings);
            products = products.filter(p => p.rating >= minRating);
        }
        
        products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        return products;
    }, [wishlistItems, selectedCategories, selectedRatings, priceRange]);


    const handleAddToCart = (product: DisplayProduct) => {
        addToCart({product, customizations: {}});
        toast({
            title: "Added to Cart",
            description: `${product.name} has been added to your cart.`,
        });
    }

    const handleBuyNow = (product: DisplayProduct) => {
        if (!isLoggedIn) {
            openDialog('login');
            return;
        }
        addToCart({product, customizations: {}});
        router.push('/checkout');
    }
    
    const handleCustomize = (product: DisplayProduct) => {
        router.push(`/customize/${product.id}`);
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
                <p className="text-muted-foreground mb-6">Explore products and save your favorites here.</p>
                <Button asChild>
                    <Link href="/products">Start Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-4 gap-8">
            <ProductFilterSidebar 
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                selectedRatings={selectedRatings}
                onRatingChange={handleRatingChange}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                clearFilters={clearFilters}
            />
            <main className="lg:col-span-3">
                 {filteredWishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredWishlistItems.map(product => (
                            <Card key={product.id} className="relative group flex flex-col">
                                <div className="flex-grow">
                                <ProductCard product={product} />
                                </div>
                                <div className="p-2 border-t flex flex-col gap-2">
                                     {isCustomizable(product) && (
                                        <Button size="sm" onClick={() => handleCustomize(product)}>
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            Customize
                                        </Button>
                                    )}
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" className="w-full" onClick={() => handleAddToCart(product)}>
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Add to Cart
                                        </Button>
                                        <Button size="sm" variant="secondary" className="w-full" onClick={() => handleBuyNow(product)}>
                                            Buy Now
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold">No products found</h2>
                        <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                        <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
                    </div>
                )}
            </main>
        </div>
    )
}

function ShareDialog() {
    const { toast } = useToast();
    const referralCode = MOCK_USER_DATA.referralCode;
    const shareUrl = "https://coandcu.example.com/signup"; 

    // Platform-specific messages
    const genericText = `I love shopping on Co & Cu! Sign up with my referral code to get a special discount on your first order: ${referralCode}`;
    const fullMessage = `${genericText}\n\nSign up here: ${shareUrl}`;
    const twitterText = `Shopping on @CoAndCu is great! Use my code ${referralCode} for a discount on your first order. #coandcu #referral`;
    const linkedinTitle = "Get a Discount on Your First Co & Cu Order";
    const linkedinSummary = `A great place to discover unique products. Use my referral code ${referralCode} for a discount on your first purchase!`;

    const copyShareMessage = () => {
        navigator.clipboard.writeText(fullMessage);
        toast({ title: 'Copied!', description: 'Share message copied to clipboard.' });
    }

    const socialLinks = [
        { name: 'WhatsApp', icon: MessageSquare, url: `https://wa.me/?text=${encodeURIComponent(fullMessage)}` },
        { name: 'Telegram', icon: Send, url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(genericText)}` },
        { name: 'Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}` },
        { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(genericText)}` },
        { name: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(linkedinTitle)}&summary=${encodeURIComponent(linkedinSummary)}` },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="rounded-l-none">
                    <Share2 className="h-4 w-4"/>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Your Referral Code</DialogTitle>
                    <DialogDescription>
                        Invite friends to Co & Cu and you'll both get rewards!
                    </DialogDescription>
                </DialogHeader>
                 <div className="flex flex-col space-y-2">
                    <Label htmlFor="share-message" className="text-sm font-medium">Share Message</Label>
                    <Textarea id="share-message" value={fullMessage} readOnly rows={4} className="resize-none" />
                    <Button type="button" size="sm" className="w-full" onClick={copyShareMessage}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Message
                    </Button>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground text-center">Or share directly</p>
                <div className="flex justify-center gap-2">
                    {socialLinks.map(social => (
                         <Button key={social.name} variant="outline" size="icon" asChild>
                            <a href={social.url} target="_blank" rel="noopener noreferrer">
                                <social.icon className="h-5 w-5" />
                                <span className="sr-only">Share on {social.name}</span>
                            </a>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default function AccountPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { avatar, updateAvatar, isLoggedIn } = useUser();
  const { openDialog } = useAuthDialog();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);


  const [tab, setTab] = useState(searchParams.get('tab') || 'profile');
  
  const [isEmailVerifyOpen, setIsEmailVerifyOpen] = useState(false);
  const [isPhoneVerifyOpen, setIsPhoneVerifyOpen] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Live data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const MAX_MESSAGE_LENGTH = 1500;
  
  const hasMadePurchase = orders.length > 0;

  useEffect(() => {
    // In a real app, you'd filter by the current user's ID
    const currentUserId = "USR001"; // Placeholder for logged-in user

    const ordersQuery = query(collection(db, "orders"), where("customer.id", "==", currentUserId)); 
    const unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
        const userOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
            userOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(userOrders);
    });

    const convosQuery = query(collection(db, "conversations"), where("customerId", "==", currentUserId));
    const unsubscribeConversations = onSnapshot(convosQuery, (querySnapshot) => {
        const convos: Conversation[] = [];
        querySnapshot.forEach((doc) => {
            convos.push({ id: doc.id, ...doc.data() } as Conversation);
        });
        setConversations(convos);
        uniqueVendorChats = new Set(convos.map(c => c.vendorId)).size;
    });

    return () => {
        unsubscribeOrders();
        unsubscribeConversations();
    };
  }, []);


  // Handle navigation from product page
  useEffect(() => {
    const vendorId = searchParams.get('vendorId');
    const productName = searchParams.get('productName');
    if (vendorId) {
      let convo = conversations.find(c => c.vendorId === vendorId);
      if (!convo) {
        const newConvo: Conversation = {
          id: (conversations.length + 1).toString(),
          vendorId: vendorId,
          avatar: "https://placehold.co/40x40.png",
          messages: [],
          userMessageCount: 0,
          awaitingVendorDecision: false,
          status: 'active',
          customerId: 'current_user_id', // placeholder
        };
        
        if (!new Set(conversations.map(c => c.vendorId)).has(vendorId)) {
            uniqueVendorChats++;
        }

        setConversations(prev => [...prev, newConvo]);
        convo = newConvo;
      }
      setSelectedConversation(convo);
      
      if (productName) {
        setNewMessage(`Hi, I have a question about the "${productName}"...`);
      }
      
      window.history.replaceState(null, '', '/account?tab=messages');
      setTab('messages');
    } else {
        if (conversations.length > 0 && !selectedConversation) {
            setSelectedConversation(conversations[0]);
        }
    }
  }, [searchParams, conversations, selectedConversation]);

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
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
            updateAvatar(e.target.result as string);
            toast({
                title: "Avatar Updated",
                description: "Your new profile picture has been set.",
            });
        }
      }
      reader.readAsDataURL(file);
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
  
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || (!newMessage.trim() && attachments.length === 0)) return;

    const lowerCaseMessage = newMessage.toLowerCase();
    const hasForbiddenKeyword = FORBIDDEN_KEYWORDS.some(keyword => lowerCaseMessage.includes(keyword));

    if (hasForbiddenKeyword) {
        toast({
            variant: "destructive",
            title: "Message Not Sent",
            description: "Your message appears to violate our policies. Please remove any contact information.",
        });
        return;
    }

    const newMessageObj = { 
        sender: "customer", 
        text: newMessage,
        timestamp: serverTimestamp(),
    };

    try {
        const conversationRef = collection(db, "conversations", selectedConversation.id as string, "messages");
        await addDoc(conversationRef, newMessageObj);

        // Here you would also update the parent conversation document's `lastMessage` and `timestamp` fields.
        // For simplicity, we'll rely on the onSnapshot listener to update the view.

        setNewMessage("");
        setAttachments([]);
    } catch (error) {
        console.error("Error sending message:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send message. Please try again.",
        });
    }

  }, [attachments, newMessage, selectedConversation, toast]);

  const handleSelectConversation = useCallback((id: string) => {
    const convo = conversations.find(c => c.id === id);
    if (convo) {
        setSelectedConversation(convo);
    }
  }, [conversations]);
  
  const handleReportConversation = (id: string) => {
    toast({
        title: "Conversation Reported",
        description: "Thank you. Our moderation team will review this chat.",
    });
  }


  const getLastMessage = (messages: Message[]) => {
      if (messages.length === 0) return "No messages yet.";
      const lastMsg = messages.filter(m => m.sender !== 'system').pop();
      if (!lastMsg) return "No messages yet.";
      
      const prefix = lastMsg.sender === 'customer' ? 'You: ' : '';
      if (lastMsg.text) return `${prefix}${lastMsg.text}`;
      if (lastMsg.attachments && lastMsg.attachments.length > 0) return `${prefix}Sent ${lastMsg.attachments.length} attachment(s)`;
      return "No messages yet.";
  }
  
  const getChatLimit = () => {
      if (!selectedConversation) return { limit: 0, remaining: 0, isLocked: true };
      const { userMessageCount, status } = selectedConversation;
      const MAX_MESSAGES = 4;
      const isLocked = userMessageCount >= MAX_MESSAGES || status !== 'active';
      const remaining = Math.max(0, MAX_MESSAGES - userMessageCount);
      return { limit: MAX_MESSAGES, remaining, isLocked };
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
    }, [selectedConversation?.messages.length]);


    const copyReferralCode = () => {
        navigator.clipboard.writeText(MOCK_USER_DATA.referralCode);
        toast({ title: 'Copied!', description: 'Referral code copied to clipboard.' });
    }

    const loyaltyProgress = ((MOCK_USER_DATA.totalOrdersForReward - MOCK_USER_DATA.ordersToNextReward) / MOCK_USER_DATA.totalOrdersForReward) * 100;
    const referralsProgress = (MOCK_USER_DATA.referrals / MOCK_USER_DATA.referralsForNextTier) * 100;
    const loyaltyPointsProgress = (MOCK_USER_DATA.loyaltyPoints / MOCK_USER_DATA.pointsToNextTier) * 100;
    
    const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
      switch(status) {
          case 'read':
              return <Eye className="h-4 w-4 text-primary-foreground" />;
          case 'delivered':
              return <EyeOff className="h-4 w-4 text-primary-foreground" />;
          case 'sent':
              return <EyeOff className="h-4 w-4 text-primary-foreground/70" />;
          default:
              return null;
      }
    }


  if (!isLoggedIn) {
    return (
        <div className="container py-12 text-center">
            <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                <UserIcon className="h-16 w-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold font-headline">Please Log In</h1>
                <p className="text-muted-foreground">
                    You need to be logged in to view your account details, orders, and messages.
                </p>
                <Button onClick={() => openDialog('login')}>Login / Sign Up</Button>
            </div>
        </div>
    )
  }

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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
           <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
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
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Notifications</CardTitle>
                        <CardDescription>Recent updates about your orders and account activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                                <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                                    <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-blue-800 dark:text-blue-200">Your order #ORD002 has shipped!</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Estimated delivery: June 25, 2024.</p>
                                </div>
                                <Button size="sm" asChild variant="outline" className="bg-white">
                                    <Link href="/account?tab=orders&tracking=ORD002">Track</Link>
                                </Button>
                        </div>
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                                <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-green-800 dark:text-green-200">Your request for "Classic Leather Watch" was approved!</p>
                                    <p className="text-sm text-green-600 dark:text-green-400">The vendor has confirmed availability. You can now complete your purchase.</p>
                                </div>
                                <Button size="sm" asChild>
                                    <Link href="/cart">Go to Cart</Link>
                                </Button>
                        </div>
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                            <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
                                    <X className="h-5 w-5 text-red-600 dark:text-red-400"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-red-800 dark:text-red-200">"Modern Minimalist Desk" is unavailable.</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">We're sorry, the vendor could not confirm your request in time.</p>
                                </div>
                                <Button size="sm" variant="secondary" asChild>
                                <Link href="/products?category=Furniture">View Similar</Link>
                                </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div className="md:col-span-1 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Gift className="h-5 w-5 text-primary"/>Referral Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Share your code with friends. When they make their first purchase, you both get a reward!</p>
                             <div className="flex">
                                <Input value={MOCK_USER_DATA.referralCode} readOnly className="rounded-r-none focus:ring-0 focus:ring-offset-0"/>
                                <ShareDialog />
                            </div>
                        </div>
                        <Separator />
                         <div>
                            <Progress value={referralsProgress} />
                             <p className="text-sm text-muted-foreground text-center mt-2">
                                You have <span className="font-bold text-primary">{MOCK_USER_DATA.referrals}</span> successful referrals. You're <span className="font-bold text-primary">{MOCK_USER_DATA.referralsForNextTier - MOCK_USER_DATA.referrals}</span> away from the next bonus reward!
                            </p>
                         </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Loyalty Status</CardTitle>
                        <CardDescription>Your progress towards rewards.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                         <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <Label>Frequent Buyer Reward</Label>
                                <span className="text-xs font-mono">{MOCK_USER_DATA.totalOrdersForReward - MOCK_USER_DATA.ordersToNextReward}/{MOCK_USER_DATA.totalOrdersForReward} Orders</span>
                            </div>
                            <Progress value={loyaltyProgress} />
                            <p className="text-xs text-muted-foreground text-center mt-2">
                                You're <span className="font-bold text-primary">{MOCK_USER_DATA.ordersToNextReward}</span> order away from your next reward!
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <div className="flex justify-between items-baseline mb-1">
                                 <Label>Loyalty Tier: <span className="font-bold text-primary">{MOCK_USER_DATA.loyaltyTier}</span></Label>
                                <span className="text-xs font-mono">{MOCK_USER_DATA.loyaltyPoints.toLocaleString()}/{MOCK_USER_DATA.pointsToNextTier.toLocaleString()} Points</span>
                            </div>
                             <Progress value={loyaltyPointsProgress} />
                             <p className="text-xs text-muted-foreground text-center mt-2">
                                Earn <span className="font-bold text-primary">{(MOCK_USER_DATA.pointsToNextTier - MOCK_USER_DATA.loyaltyPoints).toLocaleString()}</span> more points to reach <span className="font-bold text-primary">{MOCK_USER_DATA.nextLoyaltyTier}</span> tier.
                            </p>
                        </div>
                         <Separator />
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-2 bg-muted/50 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-600">₹{MOCK_USER_DATA.walletBalance.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                            </div>
                             <div className="p-2 bg-muted/50 rounded-lg text-center">
                                 <p className="text-2xl font-bold text-primary">{MOCK_USER_DATA.loyaltyPoints.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Loyalty Points</p>
                            </div>
                         </div>
                    </CardContent>
                </Card>
             </div>
           </div>
        </TabsContent>
         <TabsContent value="wishlist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Wishlist</CardTitle>
              <CardDescription>Your saved products for future purchases.</CardDescription>
            </CardHeader>
            <CardContent>
                <WishlistTabContent orders={orders} />
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="messages" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 border rounded-lg h-[calc(100vh-22rem)]">
                <div className="md:col-span-1 xl:col-span-1 flex flex-col bg-card h-full">
                  <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold font-headline">Conversations</h2>
                     <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-8" />
                    </div>
                  </div>
                  <ScrollArea>
                    {conversations.map(convo => (
                      <DropdownMenu key={convo.id}>
                          <DropdownMenuTrigger asChild>
                              <div
                                className={cn(
                                  "flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 border-b",
                                  selectedConversation?.id === convo.id && "bg-muted"
                                )}
                                onClick={() => handleSelectConversation(convo.id as string)}
                              >
                                <Avatar>
                                  <AvatarImage src={convo.avatar} alt={convo.vendorId} data-ai-hint="company logo" />
                                  <AvatarFallback>{convo.vendorId.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                  <div className="flex justify-between items-center">
                                    <p className="font-semibold">{`Chat #${convo.id.toString().padStart(6, '0')}`}</p>
                                    <div className="flex items-center gap-2">
                                        {convo.status === 'flagged' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                                        {convo.unread && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">{getLastMessage(convo.messages)}</p>
                                </div>
                              </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuLabel>Chat Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleReportConversation(convo.id as string)}>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Report Conversation
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    ))}
                  </ScrollArea>
                </div>
                <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col h-full bg-card border-l">
                  {selectedConversation ? (
                    <>
                      <div className="p-4 border-b flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.vendorId} data-ai-hint="company logo" />
                              <AvatarFallback>{selectedConversation.vendorId.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-lg font-semibold">{`Chat #${selectedConversation.id.toString().padStart(6, '0')}`}</h2>
                        </div>
                         <div className="flex items-center gap-4">
                             <Button variant="ghost" size="icon" onClick={() => handleReportConversation(selectedConversation.id as string)}>
                                 <AlertTriangle className="h-5 w-5 text-destructive" />
                                 <span className="sr-only">Report Conversation</span>
                             </Button>
                             <div className="text-sm text-muted-foreground">
                                {selectedConversation.status === 'active' ? (remaining > 0 ? `${remaining} messages left` : 'Message limit reached') : 'Chat disabled'}
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
                          <div className="flex-1 flex flex-col min-h-0">
                                <ScrollArea className="flex-1 bg-muted/20">
                                    <div className="p-4 space-y-4" ref={messagesContainerRef}>
                                    {selectedConversation.messages.map((msg, index) => (
                                        msg.sender === 'system' ? (
                                            <div key={index} className="text-center text-xs text-muted-foreground py-2">{msg.text}</div>
                                        ) : (
                                        <div key={index} className={cn("flex items-end gap-2", msg.sender === 'customer' ? 'justify-end' : 'justify-start')}>
                                        {msg.sender === 'vendor' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.avatar} alt={selectedConversation.vendorId} /><AvatarFallback>{selectedConversation.vendorId.charAt(0)}</AvatarFallback></Avatar>}
                                        <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm space-y-2", msg.sender === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
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
                                        )
                                    ))}
                                    </div>
                                </ScrollArea>
                            <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto space-y-2 flex-shrink-0">
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
                                            placeholder={isLocked ? "This chat is currently disabled." : "Type your message..."}
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
                                        <label htmlFor="customer-file-upload"><Paperclip className="h-5 w-5" /></label>
                                    </Button>
                                    <input id="customer-file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} disabled={isLocked} />
                                    <Button type="submit" size="icon" disabled={isLocked}><Send className="h-4 w-4" /></Button>
                                </div>
                            </form>
                          </div>
                      )}
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
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order History</CardTitle>
              <CardDescription>View your past purchases and their status.</CardDescription>
            </CardHeader>
            <CardContent>
                {orders.length > 0 ? (
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
                        {orders.map((order) => (
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
        <TabsContent value="settings" className="mt-6">
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
                            <Input id="current-password" type={showCurrentPassword ? "text" : "password"} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type={showNewPassword ? 'text' : 'password'} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} />
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
         <TabsContent value="billing" className="mt-6">
            <div className="space-y-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">Shipping Addresses</CardTitle>
                            <CardDescription>Manage your saved delivery addresses.</CardDescription>
                        </div>
                         <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2"/> Add Address</Button></DialogTrigger>
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
