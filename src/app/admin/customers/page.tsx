

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
import { MoreHorizontal, PlusCircle, User as UserIcon, ListChecks, DollarSign, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


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

const MOCK_EMAIL_OTP = "123456";
const MOCK_PHONE_OTP = "654321";

function NewCustomerDialog({ onSave }: { onSave: (customer: User) => void }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'details' | 'verify'>('details');
    const [isLoading, setIsLoading] = useState(false);
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [emailOtp, setEmailOtp] = useState("");
    const [phoneOtp, setPhoneOtp] = useState("");
    
    const resetForm = () => {
        setName("");
        setEmail("");
        setPhone("");
        setEmailOtp("");
        setPhoneOtp("");
        setStep('details');
        setIsLoading(false);
    }
    
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm();
        }
        setOpen(isOpen);
    }

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            toast({
                title: "Verification Required",
                description: "We've sent verification codes to the customer's email and phone.",
            });
            setStep("verify");
            setIsLoading(false);
        }, 1000);
    };

    const handleVerificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (emailOtp !== MOCK_EMAIL_OTP || phoneOtp !== MOCK_PHONE_OTP) {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: "Invalid verification codes. Please try again.",
            });
            return;
        }
        
        const newCustomer: User = {
            id: `USR${(mockUsers.length + 1).toString().padStart(3, '0')}`,
            name,
            email,
            role: 'Customer',
            status: 'Active',
            joinedDate: new Date().toISOString().split('T')[0],
            avatar: 'https://placehold.co/40x40.png'
        };

        onSave(newCustomer);
        handleOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{step === 'details' ? 'Add New Customer' : 'Verify Contact Info'}</DialogTitle>
                    <DialogDescription>
                        {step === 'details' 
                            ? 'Enter the customer details below.' 
                            : 'Enter the codes sent to their email and phone.'}
                    </DialogDescription>
                </DialogHeader>
                {step === 'details' ? (
                    <form onSubmit={handleDetailsSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="new-customer-name">Full Name</Label>
                            <Input id="new-customer-name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-customer-email">Email</Label>
                            <Input id="new-customer-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-customer-phone">Phone</Label>
                            <Input id="new-customer-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Verification Codes
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerificationSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="email-otp">Email Verification Code</Label>
                            <Input id="email-otp" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone-otp">Phone Verification Code</Label>
                            <Input id="phone-otp" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Verify & Add Customer</Button>
                        <Button variant="link" size="sm" onClick={() => setStep('details')} className="w-full">
                            Back to details
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState(mockUsers.filter(u => u.role === 'Customer'));
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const { toast } = useToast();

    const handleAddCustomer = (newCustomer: User) => {
        setCustomers(prev => [newCustomer, ...prev]);
        toast({
            title: "Customer Added",
            description: `${newCustomer.name} has been added and verified.`
        });
    }

    return (
        <Dialog>
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Customers</h1>
                        <p className="text-muted-foreground">Manage all customers on the platform.</p>
                    </div>
                    <NewCustomerDialog onSave={handleAddCustomer} />
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

    