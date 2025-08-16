
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect, useMemo } from "react";
import type { Order } from "@/lib/types";

function OrdersTable({ orders, loading, type }: { orders: Order[], loading: boolean, type: string }) {
    if (loading) {
        return <p className="text-center text-muted-foreground p-4">Loading orders...</p>
    }

    if (orders.length === 0) {
        return <p className="text-center text-muted-foreground p-4">No {type.toLowerCase()} orders found.</p>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right sr-only">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer.id}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.date ? new Date(order.date.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                            <Badge 
                                variant={order.status === 'Delivered' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline'}
                            >
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function VendorOrdersPage() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const vendorId = "VDR001"; // Placeholder

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "orders"), orderBy("date", "desc"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedOrders: Order[] = [];
            querySnapshot.forEach((doc) => {
                fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
            });
            
            // This is a placeholder for filtering. A real app would have vendorId on orders/order items.
            setAllOrders(fetchedOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [vendorId]);

    const personalOrders = useMemo(() => allOrders.filter(o => o.id.startsWith("ORD")), [allOrders]);
    const corporateOrders = useMemo(() => allOrders.filter(o => o.id.startsWith("CORP")), [allOrders]);
    
    return (
        <div className="flex-1 flex flex-col min-h-0">
             <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Orders</h1>
                <p className="text-muted-foreground">View and manage customer orders across all channels.</p>
            </div>
             <Tabs defaultValue="personalized" className="w-full flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personalized">Personalized Retail</TabsTrigger>
                    <TabsTrigger value="corporate">Corporate & Bulk</TabsTrigger>
                </TabsList>
                <Card className="mt-4 flex-1">
                    <TabsContent value="personalized" className="h-full">
                        <CardContent className="p-0 h-full">
                             <OrdersTable orders={personalOrders} loading={loading} type="Personalized" />
                        </CardContent>
                    </TabsContent>
                    <TabsContent value="corporate" className="h-full">
                        <CardContent className="p-0 h-full">
                            <OrdersTable orders={corporateOrders} loading={loading} type="Corporate" />
                        </CardContent>
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    );
}

    