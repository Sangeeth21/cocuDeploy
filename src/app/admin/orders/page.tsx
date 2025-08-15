

"use client";

import { useState, useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Order } from "@/lib/types";
import { MoreHorizontal, PackageCheck, Truck, ListChecks, DollarSign, Search, File, User, CreditCard, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

const getStatusVariant = (status: Order['status']) => {
  switch (status) {
    case 'Delivered':
      return 'default';
    case 'Shipped':
      return 'secondary';
    case 'Processing':
      return 'outline';
    case 'Cancelled':
        return 'destructive'
    default:
      return 'outline';
  }
};

export default function AdminOrdersPage() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [orders, setOrders] = useState<Order[]>([]);
    
    // Search and filter state
    const customerIdQuery = searchParams.get('customerId');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? "");
    const [activeTab, setActiveTab] = useState("all");
    
    useEffect(() => {
        const q = query(collection(db, "orders"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData: Order[] = [];
            querySnapshot.forEach((doc) => {
                ordersData.push({ id: doc.id, ...doc.data() } as Order);
            });
            setOrders(ordersData);
        });

        return () => unsubscribe();
    }, []);
    
    // Effect to set search term from URL if customerId is present, giving it priority
    useEffect(() => {
        if(customerIdQuery){
            setSearchTerm(customerIdQuery);
        }
    }, [customerIdQuery]);


    const handleUpdateStatus = (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? {...o, status} : o));
        toast({
            title: "Order Status Updated",
            description: `Order ${orderId} has been marked as ${status}.`,
        })
    }
    
    const filteredOrders = useMemo(() => {
        let filtered = orders;

        if (activeTab !== "all") {
            filtered = filtered.filter(order => order.status.toLowerCase() === activeTab);
        }

        if (searchTerm) {
             const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(lowercasedFilter) ||
                order.customer.name.toLowerCase().includes(lowercasedFilter) ||
                order.customer.email.toLowerCase().includes(lowercasedFilter) ||
                order.customer.id.toLowerCase().includes(lowercasedFilter)
            );
        }

        return filtered;
    }, [orders, activeTab, searchTerm]);

    const stats = useMemo(() => {
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'Pending').length,
            revenue: orders.filter(o => o.status !== 'Cancelled').reduce((acc, o) => acc + o.total, 0)
        }
    }, [orders]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Orders</h1>
          <p className="text-muted-foreground">Manage all orders across the platform.</p>
        </div>
         <Button asChild>
            <Link href="/admin/orders/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Order
            </Link>
        </Button>
      </div>

       <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Orders
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center gap-4">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="processing">Processing</TabsTrigger>
                    <TabsTrigger value="shipped">Shipped</TabsTrigger>
                    <TabsTrigger value="delivered">Delivered</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                 <div className="ml-auto flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Order ID, Customer..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <TabsContent value={activeTab}>
                <Card className="mt-4">
                    <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead className="hidden sm:table-cell">Customer</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>
                            <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                                            <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{order.customer.name}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">{new Date(order.date.seconds * 1000).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                     <Dialog>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DialogTrigger asChild><DropdownMenuItem>View Details</DropdownMenuItem></DialogTrigger>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Processing')}>Mark as Processing</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Shipped')}>Mark as Shipped</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(order.id, 'Cancelled')}>Cancel Order</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <DialogContent className="sm:max-w-3xl">
                                            <DialogHeader>
                                                <DialogTitle>Order Details: {order.id}</DialogTitle>
                                                <DialogDescription>{new Date(order.date.seconds * 1000).toLocaleString()}</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
                                                <div className="lg:col-span-2 space-y-6">
                                                    <h3 className="font-semibold">Order Items</h3>
                                                     <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Product</TableHead>
                                                                <TableHead>Quantity</TableHead>
                                                                <TableHead className="text-right">Price</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {order.items.map(item => (
                                                                <TableRow key={item.productId}>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            <Image src={item.productImage} alt={item.productName} width={40} height={40} className="rounded-md" />
                                                                            {item.productName}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>x{item.quantity}</TableCell>
                                                                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                     </Table>
                                                      <div className="flex justify-end">
                                                        <div className="w-full max-w-sm space-y-2">
                                                            <div className="flex justify-between">
                                                                <span>Subtotal</span>
                                                                <span>${order.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-muted-foreground text-sm">
                                                                <span>Shipping</span>
                                                                <span>$0.00</span>
                                                            </div>
                                                             <Separator/>
                                                            <div className="flex justify-between font-bold">
                                                                <span>Total</span>
                                                                <span>${order.total.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="lg:col-span-1 space-y-6">
                                                     <Card>
                                                        <CardHeader className="flex-row gap-4 items-center">
                                                            <User className="w-8 h-8"/>
                                                            <div>
                                                                <h3 className="font-semibold">Customer</h3>
                                                                <p className="text-sm text-muted-foreground">Details</p>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="text-sm space-y-1">
                                                            <p>{order.customer.name}</p>
                                                            <p className="text-muted-foreground">{order.customer.email}</p>
                                                            <p className="text-muted-foreground">{`${order.shippingAddress.line1}, ${order.shippingAddress.city} ${order.shippingAddress.zip}`}</p>
                                                        </CardContent>
                                                    </Card>
                                                     <Card>
                                                        <CardHeader className="flex-row gap-4 items-center">
                                                            <CreditCard className="w-8 h-8"/>
                                                            <div>
                                                                <h3 className="font-semibold">Payment</h3>
                                                                 <p className="text-sm text-muted-foreground">Details</p>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="text-sm">
                                                            Paid with {order.payment.method} ending in {order.payment.last4}
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
    
