
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { Order } from "@/lib/types";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const mockVendorOrders = [
    { id: "CORP_ORD001", date: new Date("2024-06-18"), customerId: "Corporate Client Inc.", total: 12450.00, status: "Shipped" },
    { id: "CORP_ORD002", date: new Date("2024-06-15"), customerId: "Tech Solutions LLC", total: 7999.00, status: "Pending" },
];


export default function CorporateOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const vendorId = "VDR001"; // Placeholder

    useEffect(() => {
        const q = query(
            collection(db, "orders"), 
            where("vendorId", "==", vendorId),
            // This would ideally also filter by an order type (e.g., where("type", "==", "corporate"))
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders: Order[] = [];
            snapshot.forEach(doc => {
                // A simple mock filter for now
                if(doc.id.startsWith("CORP")) {
                    fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
                }
            });
            setOrders(fetchedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [vendorId]);


    return (
        <div>
             <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Corporate Orders</h1>
                <p className="text-muted-foreground">View and manage your bulk and corporate orders.</p>
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
                                <TableRow><TableCell colSpan={5} className="text-center">Loading orders...</TableCell></TableRow>
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.customer.name}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{order.date ? new Date(order.date.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={order.status === 'Fulfilled' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline'}
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
                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No corporate orders found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>
    );
}
