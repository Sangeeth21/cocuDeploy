
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";
import { Button } from "@/components/ui/button";

const mockVendorOrders = [
    { id: "ORD001", date: "2024-05-20", customerId: "CUST001", total: 49.99, status: "Fulfilled" },
    { id: "ORD002", date: "2024-06-11", customerId: "CUST002", total: 124.50, status: "Shipped" },
    { id: "ORD003", date: "2024-06-15", customerId: "CUST003", total: 79.99, status: "Pending" },
    { id: "ORD004", date: "2024-06-18", customerId: "CUST004", total: 215.00, status: "Pending" },
    { id: "ORD005", date: "2024-06-20", customerId: "CUST005", total: 34.50, status: "Fulfilled" },
];


export default function VendorOrdersPage() {
    return (
        <VendorSidebarLayout>
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
                                <TableHead>Customer ID</TableHead>
                                <TableHead className="hidden sm:table-cell">Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right sr-only">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockVendorOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customerId}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{order.date}</TableCell>
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </VendorSidebarLayout>
    );
}
