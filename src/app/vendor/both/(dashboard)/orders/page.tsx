
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import type { Order } from "@/lib/types";

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const vendorId = "VDR001"; // Placeholder for logged-in vendor

    useEffect(() => {
        setLoading(true);
        // This query is a bit more complex. In a real-world scenario with a large dataset,
        // you might denormalize data or use a different query structure (e.g., have a vendorId on the order).
        // For now, we fetch all and filter client-side, which is fine for a smaller number of orders.
        const q = query(collection(db, "orders"), orderBy("date", "desc"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allOrders: Order[] = [];
            querySnapshot.forEach((doc) => {
                allOrders.push({ id: doc.id, ...doc.data() } as Order);
            });
            
            // Filter orders that contain at least one product from the current vendor
            const vendorOrders = allOrders.filter(order => 
                order.items.some(item => {
                    // This assumes product IDs are structured in a way that lets you know the vendor.
                    // A better approach is to have vendorId on each order item.
                    // For this mock, we'll check against a hardcoded list of VDR001's products.
                    const vendorProductIds = ['1', '4']; // Mock products for VDR001
                    return vendorProductIds.includes(item.productId);
                })
            );

            setOrders(vendorOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching vendor orders: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [vendorId]);
    
    return (
        <div>
             <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Personalized Retail Orders</h1>
                <p className="text-muted-foreground">View and manage orders from individual customers.</p>
            </div>
             <Card>
                <CardContent className="p-0">
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">Loading orders...</TableCell>
                                </TableRow>
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.customer.id}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{order.date}</TableCell>
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
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">You have no orders yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>
    );
}

