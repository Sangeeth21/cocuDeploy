import Link from "next/link";
import { Store, Twitter, Facebook, Instagram } from "lucide-react";
import { ContactDialog } from "@/components/contact-dialog";

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg font-headline">Co & Cu</span>
            </Link>
            <p className="text-sm text-muted-foreground">Your one-stop online marketplace for everything you need.</p>
            <div className="flex gap-4 mt-2">
                <Link href="https://x.com" target="_blank" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5"/></Link>
                <Link href="https://facebook.com" target="_blank" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5"/></Link>
                <Link href="https://instagram.com" target="_blank" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5"/></Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 font-headline">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link href="/#categories" className="text-sm text-muted-foreground hover:text-primary">Categories</Link></li>
              <li><Link href="/#featured" className="text-sm text-muted-foreground hover:text-primary">Featured</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 font-headline">About Us</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Our Story</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 font-headline">Support</h3>
            <ul className="space-y-2">
              <li><ContactDialog /></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="/account?tab=orders" className="text-sm text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Co & Cu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
