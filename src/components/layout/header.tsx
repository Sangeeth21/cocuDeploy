
"use client";

import Link from "next/link";
import { User, Menu, Store, LogOut, Settings, ListChecks, MessageSquare, CreditCard, UserCircle, ChevronDown, ShoppingCart, Heart, Gift, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "@/components/search-bar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { CartPreview } from "@/components/cart-preview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/user-context";
import { WishlistPreview } from "@/components/wishlist-preview";
import { NotificationPopover } from "@/components/notification-popover";
import { mockActivity } from "@/lib/mock-data";
import { useAuthDialog } from "@/context/auth-dialog-context";
import { ComparisonPreview } from "../comparison-preview";
import { useCorporateAuthDialog } from "@/context/corporate-auth-dialog-context";


const navLinks = [
  { href: "/products", label: "All Products" },
  { href: "/#categories", label: "Categories" },
];

const customerNotifications = [
    { type: 'order_shipped', id: 'ORD002', text: 'Your order #ORD002 has shipped!', time: '1d ago', href: '/account?tab=orders', actions: [{label: 'Track', href: '/account?tab=orders'}] },
    { type: 'request_approved', id: 'REQ001', text: 'Your request for "Classic Leather Watch" was approved!', time: '2d ago', href: '/cart', actions: [{label: 'Go to Cart', href: '/cart'}] },
    { type: 'request_denied', id: 'REQ002', text: '"Modern Minimalist Desk" is unavailable.', time: '3d ago', href: '/products?category=Furniture', actions: [{label: 'View Similar', href: '/products?category=Furniture', variant: 'secondary'}] },
]

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { avatar, isLoggedIn, logout } = useUser();
  const { openDialog: openCustomerDialog } = useAuthDialog();
  const { openDialog: openCorporateDialog } = useCorporateAuthDialog();

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  return (
    <header className="w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
            <div className="mr-4 md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                <Link href="/" className="mr-6 flex items-center gap-2">
                    <Store className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg font-headline">Co & Cu</span>
                </Link>
                <nav className="flex flex-col gap-4 mt-8">
                    {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "text-lg font-medium hover:text-primary transition-colors",
                            pathname === link.href ? "text-primary" : "text-foreground"
                        )}
                    >
                        {link.label}
                    </Link>
                    ))}
                     <Link href="/vendor/login" className="text-lg font-medium hover:text-primary transition-colors">Become a Vendor</Link>
                </nav>
                </SheetContent>
            </Sheet>
            </div>

            <Link href="/" className="mr-6 hidden md:flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">Co & Cu</span>
            </Link>
            
            <nav className="hidden md:flex gap-4 items-center">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
                >
                {link.label}
                </Link>
            ))}
             <Link href="/vendor/signup" className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/vendor/signup" ? "text-primary" : "text-muted-foreground"
                )}>
                Become a Vendor
            </Link>
            </nav>
        </div>

        <div className="flex-1 flex justify-center px-4 lg:px-8">
             <div className="w-full max-w-xl">
                <SearchBar />
            </div>
        </div>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          {isLoggedIn ? (
            <>
              <NotificationPopover notifications={customerNotifications} />
              <WishlistPreview />
              <CartPreview />
              <div className="flex items-center rounded-md hover:bg-accent focus-within:bg-accent">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent rounded-full" asChild>
                    <Link href="/account">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={avatar} alt="User Avatar" data-ai-hint="person face" />
                        <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">User Account</span>
                    </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-6 hover:bg-transparent">
                      <ChevronDown className="h-4 w-4" />
                      <span className="sr-only">Open user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account?tab=profile"><UserCircle className="mr-2 h-4 w-4"/> Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account?tab=messages"><MessageSquare className="mr-2 h-4 w-4"/> Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account?tab=orders"><ListChecks className="mr-2 h-4 w-4"/> Order History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account?tab=wishlist"><Heart className="mr-2 h-4 w-4"/> Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account?tab=billing"><CreditCard className="mr-2 h-4 w-4"/> Billing</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account?tab=profile"><Gift className="mr-2 h-4 w-4"/> Referrals</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account?tab=settings"><Settings className="mr-2 h-4 w-4"/> Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4"/> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
             <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                            Login <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openCustomerDialog('login')}>
                            <UserCircle className="mr-2 h-4 w-4" />
                            <span>Personal Account</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openCorporateDialog()}>
                            <Building className="mr-2 h-4 w-4" />
                            <span>Corporate Account</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={() => openCustomerDialog('signup')}>
                    Sign Up
                </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
