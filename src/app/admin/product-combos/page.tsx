
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Plus, ShoppingCart, Heart, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { OrderedCombo, WishlistedCombo, Order, User, DisplayProduct } from "@/lib/types";
import { collection, onSnapshot, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";


function ComboCard({
  products,
  count,
  type,
  details,
}: {
  products: any[];
  count: number;
  type: "ordered" | "wishlisted";
  details: any;
}) {
  const Icon = type === "ordered" ? ShoppingCart : Heart;
  const description =
    type === "ordered"
      ? `${count} times`
      : `${count} wishlists`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex -space-x-4">
            {products.map((product, index) => (
            <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border-2 border-background shadow-sm">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
            ))}
        </div>
        <div className="mt-4">
            {products.map((product, index) => (
                 <div key={index} className="flex items-center gap-2 text-sm">
                    <p className="font-medium truncate">{product.name}</p>
                    {index < products.length -1 && <Plus className="h-4 w-4 text-muted-foreground" />}
                </div>
            ))}
        </div>
      </CardContent>
      <CardHeader className="flex flex-row items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span>{description}</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </DialogTrigger>
          <ComboDetailsDialog type={type} details={details} products={products} />
        </Dialog>
      </CardHeader>
    </Card>
  );
}

function ComboDetailsDialog({ type, details, products }: { type: 'ordered' | 'wishlisted', details: any, products: any[] }) {
    const title = type === 'ordered' ? "Orders Featuring This Combo" : "Wishlists Featuring This Combo";
    
    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                    {products.map(p => p.name).join(' + ')}
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            {type === 'ordered' && <TableHead>Order ID</TableHead>}
                            {type === 'wishlisted' && <TableHead>Date Added</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {details.map((item: any, index: number) => (
                             <TableRow key={index}>
                                <TableCell>
                                     <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={item.customer.avatar} alt={item.customer.name} />
                                            <AvatarFallback>{item.customer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{item.customer.name}</div>
                                    </div>
                                </TableCell>
                                {type === 'ordered' && <TableCell><Link href={`/admin/orders?search=${item.orderId}`} className="text-primary hover:underline">{item.orderId}</Link></TableCell>}
                                {type === 'wishlisted' && <TableCell>{item.date}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </DialogContent>
    )
}

const processCombos = <T extends Order | User>(items: T[], getProductIds: (item: T) => string[]) => {
    const comboCounts: { [key: string]: { products: string[], count: number, details: any[] } } = {};

    for (const item of items) {
        const productIds = getProductIds(item);
        if (productIds.length < 2) continue;

        productIds.sort();

        for (let i = 0; i < productIds.length; i++) {
            for (let j = i + 1; j < productIds.length; j++) {
                const comboKey = `${productIds[i]}-${productIds[j]}`;
                 if (!comboCounts[comboKey]) {
                    comboCounts[comboKey] = { products: [productIds[i], productIds[j]], count: 0, details: [] };
                }
                comboCounts[comboKey].count++;
                if ('id' in item) { // It's an order
                     comboCounts[comboKey].details.push({ orderId: (item as Order).id, customer: (item as Order).customer, date: new Date((item as Order).date.toDate()).toLocaleDateString() });
                } else { // It's a user with a wishlist
                     comboCounts[comboKey].details.push({ customer: item as User, date: new Date().toLocaleDateString() }); // Date placeholder
                }
            }
        }
    }
    return Object.values(comboCounts).sort((a,b) => b.count - a.count).slice(0, 10);
}


export default function ProductCombosPage() {
    const [orderedCombos, setOrderedCombos] = useState<any[]>([]);
    const [wishlistedCombos, setWishlistedCombos] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<DisplayProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            
            // Fetch all products first to map IDs to full product info
            const productsSnapshot = await getDocs(collection(db, "products"));
            const productsMap = new Map<string, DisplayProduct>();
            productsSnapshot.forEach(doc => productsMap.set(doc.id, { id: doc.id, ...doc.data() } as DisplayProduct));
            setAllProducts(Array.from(productsMap.values()));
            
            // Fetch all orders
            const ordersSnapshot = await getDocs(collection(db, "orders"));
            const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            const processedOrdered = processCombos(orders, (order) => order.items.map(item => item.productId));
            const resolvedOrdered = processedOrdered.map(combo => ({...combo, products: combo.products.map(id => productsMap.get(id)).filter(Boolean) as DisplayProduct[]}));
            setOrderedCombos(resolvedOrdered);

            // Fetch all users to check wishlists
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersWithWishlists = usersSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as User))
                .filter(user => user.wishlist && user.wishlist.length > 1);

            const allWishlistItems: User[] = [];
             usersWithWishlists.forEach(user => {
                if (user.wishlist) {
                    allWishlistItems.push(user);
                }
            });

            const processedWishlisted = processCombos(allWishlistItems, (user) => user.wishlist!.map(item => item.id));
            const resolvedWishlisted = processedWishlisted.map(combo => ({...combo, products: combo.products.map(id => productsMap.get(id)).filter(Boolean) as DisplayProduct[]}));
            setWishlistedCombos(resolvedWishlisted);

            setLoading(false);
        };

        fetchAllData();
    }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Product Combo Analysis</h1>
        <p className="text-muted-foreground">
          Discover which products are frequently bought or wishlisted together.
        </p>
      </div>
      <Tabs defaultValue="ordered">
        <TabsList>
          <TabsTrigger value="ordered">Ordered Together</TabsTrigger>
          <TabsTrigger value="wishlisted">Wishlisted Together</TabsTrigger>
        </TabsList>
        <TabsContent value="ordered">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {loading ? <p>Loading...</p> : orderedCombos.map((combo, i) => (
              <ComboCard
                key={i}
                products={combo.products}
                count={combo.count}
                type="ordered"
                details={combo.details}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="wishlisted">
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
             {loading ? <p>Loading...</p> : wishlistedCombos.map((combo, i) => (
              <ComboCard
                key={i}
                products={combo.products}
                count={combo.count}
                type="wishlisted"
                details={combo.details}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
