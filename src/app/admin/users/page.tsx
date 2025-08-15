

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";


const MOCK_EMAIL_OTP = "123456";
const MOCK_PHONE_OTP = "654321";

function NewCustomerDialog({ onSave }: { onSave: (customer: Omit<User, 'id' | 'role' | 'status' | 'joinedDate' | 'avatar'>) => void }) {
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
        // Simulate sending OTPs
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
        
        onSave({ name, email });
        handleOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{step === 'details' ? 'Add New Customer' : 'Verify Contact Info'}</DialogTitle>
                    <DialogDescription>
                        {step === 'details' 
                            ? 'Enter the customer details below.' 
                            : 'Enter the codes sent to the customer\'s email and phone.'}
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


export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "users"), where("role", "==", "Customer"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersData: User[] = [];
            querySnapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() } as User);
            });
            setUsers(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddCustomer = (newCustomer: Omit<User, 'id' | 'role' | 'status' | 'joinedDate' | 'avatar'>) => {
        // This would be an API call in a real app.
        console.log("Adding new customer:", newCustomer);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Users</h1>
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
                                </TableRow>
                            ) : users.map(user => (
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
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem>View Orders</DropdownMenuItem>
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
        </div>
    )
}
