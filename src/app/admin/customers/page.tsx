

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockOrders, mockUsers } from "@/lib/mock-data";
import { User } from "@/lib/types";
import { MoreHorizontal, PlusCircle, User as UserIcon, ListChecks, DollarSign, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


function CustomerProfileDialog({ user }: { user: User }) {
    const userOrders = mockOrders.filter(o => o.customer.id === user.id);
    const totalSpent = userOrders.reduce((acc, order) => acc + order.total, 0);

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Customer Profile</DialogTitle>
                <DialogDescription>
                    Viewing details for {user.name} ({user.id})
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="md:col-span-1 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person face" />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Badge variant={user.status === 'Suspended' ? 'destructive' : 'default'} className="mt-2">{user.status}</Badge>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userOrders.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                     <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {userOrders.slice(0, 3).map(order => (
                                <div key={order.id} className="flex justify-between items-center text-xs">
                                    <Link href={`/admin/orders?search=${order.id}`} className="font-medium text-primary hover:underline">{order.id}</Link>
                                    <span className="text-muted-foreground">{order.date}</span>
                                    <span>${order.total.toFixed(2)}</span>
                                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className="hidden sm:inline-flex">{order.status}</Badge>
                                </div>
                            ))}
                            {userOrders.length === 0 && <p className="text-xs text-muted-foreground text-center">No orders found for this customer.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DialogContent>
    )
}


export default function AdminCustomersPage() {
    const customers = mockUsers.filter(u => u.role === 'Customer');
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

    return (
        <Dialog>
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Customers</h1>
                        <p className="text-muted-foreground">Manage all customers on the platform.</p>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person face" />
                                                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant={user.status === 'Suspended' ? 'destructive' : 'default'}>{user.status}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">{user.joinedDate}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={() => setSelectedCustomer(user)}>View Profile</DropdownMenuItem>
                                                    </DialogTrigger>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/orders?customerId=${user.id}`}>View Orders</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator/>
                                                    <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {selectedCustomer && <CustomerProfileDialog user={selectedCustomer} />}
            </div>
        </Dialog>
    )
}
