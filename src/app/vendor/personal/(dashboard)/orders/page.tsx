
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { Order } from "@/lib/types";
import { collection, query, where, onSnapshot, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const vendorId = "VDR001"; // Placeholder

    useEffect(() => {
        setLoading(true);

        const fetchOrders = async () => {
            // Get all products for the vendor to identify their orders
            const productsQuery = query(collection(db, "products"), where("vendorId", "==", vendorId));
            const productsSnapshot = await getDocs(productsQuery);
            const vendorProductIds = productsSnapshot.docs.map(doc => doc.id);

            if (vendorProductIds.length === 0) {
                setOrders([]);
                setLoading(false);
                return;
            }

            const allOrdersQuery = query(collection(db, "orders"), orderBy("date", "desc"));

            const unsubscribe = onSnapshot(allOrdersQuery, (querySnapshot) => {
                const fetchedOrders: Order[] = [];
                querySnapshot.forEach((doc) => {
                    const order = { id: doc.id, ...doc.data() } as Order;
                    // Check if any item in the order belongs to the vendor
                    const hasVendorProduct = order.items.some(item => vendorProductIds.includes(item.productId));
                    if (hasVendorProduct) {
                        fetchedOrders.push(order);
                    }
                });
                setOrders(fetchedOrders);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching orders: ", error);
                setLoading(false);
            });

            return unsubscribe;
        };

        const unsubscribePromise = fetchOrders();
        
        return () => {
            unsubscribePromise.then(unsub => unsub && unsub());
        };
    }, [vendorId]);


    return (
        <div>
             <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Orders</h1>
                <p className="text-muted-foreground">View and manage customer orders.</p>
            </div>
             <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden sm:table-cell">Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right sr-only">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading orders...</TableCell>
                                </TableRow>
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.customer.name}</TableCell>
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>
    );
}
