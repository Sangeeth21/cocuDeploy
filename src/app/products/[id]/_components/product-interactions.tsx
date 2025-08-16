
"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { DisplayProduct, Conversation, Message } from "@/lib/types";
import { MessageSquare, Send, Paperclip, X, File as FileIcon, ImageIcon, Download, AlertTriangle, BellRing, Wand2, ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { mockUserOrders } from "@/lib/mock-data";
import { useCart } from "@/context/cart-context";
import { useUser } from "@/context/user-context";
import { useAuthDialog } from "@/context/auth-dialog-context";

type Attachment = {
    name: string;
    type: 'image' | 'file';
    url: string;
}

// Simulate tracking for chat abuse prevention
// In a real app, this would come from a user context or API call
const MAX_CHATS_WITHOUT_PURCHASE = 4;
let hasMadePurchase = mockUserOrders.length > 0;
let uniqueVendorChats = 2; // Starting with 2 from the initial mock data in account page

// localStorage keys
const VIEWED_WARNINGS_KEY = 'shopsphere_viewed_chat_warnings';
const WARNING_COUNT_KEY = 'shopsphere_chat_warning_count';
const MAX_WARNING_COUNT = 5;

export function ProductInteractions({ product, isCustomizable }: { product: DisplayProduct, isCustomizable: boolean }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isChatDisabledOpen, setIsChatDisabledOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  const { addToCart } = useCart();
  const { isLoggedIn } = useUser();
  const { openDialog } = useAuthDialog();

  const isChatDisabled = !hasMadePurchase && uniqueVendorChats >= MAX_CHATS_WITHOUT_PURCHASE;

  const handleAddToCart = () => {
    if (product.requiresConfirmation) {
        setIsConfirmationOpen(true);
        // Here you would also trigger a backend notification to the vendor
        toast({
            title: "Vendor Notified",
            description: "The vendor will confirm availability within 5 hours.",
        });
        return;
    }
    addToCart({product, customizations: {}});
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
        openDialog('login');
        return;
    }
    addToCart({product, customizations: {}});
    router.push('/checkout');
  }

  const handleCustomize = () => {
    router.push(`/customize/${product.id}`);
  }

  const handleMessageVendorClick = () => {
    if (!isLoggedIn) {
        openDialog('login');
        return;
    }
      
    if (isChatDisabled) {
        setIsChatDisabledOpen(true);
        return;
    }
    
    // Redirect to the centralized messaging page
    router.push(`/account?tab=messages&vendorId=${product.vendorId}&productName=${encodeURIComponent(product.name)}`);
  }
  
  return (
    <>
      <div className="space-y-4">
        {isCustomizable ? (
            <div className="grid grid-cols-1 gap-2">
                <Button size="lg" className="w-full" onClick={handleCustomize}>
                    <Wand2 className="mr-2 h-5 w-5" /> Customize Now
                </Button>
                 <div className="grid grid-cols-2 gap-2">
                    <Button size="lg" variant="secondary" onClick={handleAddToCart}>
                        Add to Cart
                    </Button>
                    <Button size="lg" variant="secondary" onClick={handleBuyNow}>Buy Now</Button>
                </div>
            </div>
        ) : (
           <div className="flex flex-col sm:flex-row gap-2">
              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                  {product.requiresConfirmation ? 'Request to Buy' : 'Add to Cart'}
              </Button>
              <Button size="lg" variant="secondary" className="w-full" onClick={handleBuyNow}>Buy Now</Button>
          </div>
        )}
        <Button size="lg" variant="outline" className="w-full" onClick={handleMessageVendorClick}>
            <MessageSquare className="mr-2 h-5 w-5" />
            Message Vendor
        </Button>
      </div>

        <Dialog open={isChatDisabledOpen} onOpenChange={setIsChatDisabledOpen}>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><MessageSquare className="text-destructive"/> Chat Limit Reached</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    To prevent spam and encourage genuine interactions, we limit the number of new conversations a customer can start before making a purchase.
                </DialogDescription>
                <p className="text-sm text-muted-foreground">
                    Please complete an order to re-enable the chat feature. We appreciate your understanding!
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsChatDisabledOpen(false)}>Close</Button>
                    <Button onClick={() => router.push('/cart')}>Go to Cart</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><BellRing className="text-primary"/> Notified Vendor</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    The vendor has been notified to confirm this item is available and can be delivered on time. Please wait for their confirmation. You will be notified here and can complete your purchase once they respond.
                </DialogDescription>
                <p className="text-sm text-muted-foreground">
                    The vendor has up to 5 hours to respond.
                </p>
                <DialogFooter>
                    <Button onClick={() => setIsConfirmationOpen(false)}>OK</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
