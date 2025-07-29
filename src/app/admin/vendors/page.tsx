
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockUsers } from "@/lib/mock-data";
import { MoreHorizontal, PlusCircle, Loader2, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/types";


const MOCK_EMAIL_OTP = "123456";
const MOCK_PHONE_OTP = "654321";

function NewVendorDialog({ onSave }: { onSave: (vendor: User) => void }) {
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
                description: "We've sent verification codes to the vendor's email and phone.",
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
        
        const newVendor: User = {
            id: `VDR${(mockUsers.filter(u => u.role === 'Vendor').length + 1).toString().padStart(3, '0')}`,
            name,
            email,
            role: 'Vendor',
            status: 'Active',
            joinedDate: new Date().toISOString().split('T')[0],
            avatar: 'https://placehold.co/40x40.png'
        };

        onSave(newVendor);
        handleOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Vendor
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{step === 'details' ? 'Add New Vendor' : 'Verify Contact Info'}</DialogTitle>
                    <DialogDescription>
                        {step === 'details' 
                            ? 'Enter the vendor details below.' 
                            : 'Enter the codes sent to the vendor\'s email and phone.'}
                    </DialogDescription>
                </DialogHeader>
                {step === 'details' ? (
                    <form onSubmit={handleDetailsSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="new-vendor-name">Vendor Name</Label>
                            <Input id="new-vendor-name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-vendor-email">Email</Label>
                            <Input id="new-vendor-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-vendor-phone">Phone</Label>
                            <Input id="new-vendor-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
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
                        <Button type="submit" className="w-full">Verify & Add Vendor</Button>
                        <Button variant="link" size="sm" onClick={() => setStep('details')} className="w-full">
                            Back to details
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

function SuspendVendorDialog({ vendor, onConfirm, open, onOpenChange }: { vendor: User, onConfirm: () => void, open: boolean, onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        Confirm Suspension
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to suspend {vendor.name}? This will prevent them from logging in and listing new products.
                    </DialogDescription>
                </DialogHeader>
                 <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        <ShieldAlert className="mr-2 h-4 w-4" /> Confirm Suspend
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function AdminVendorsPage() {
    const [vendors, setVendors] = useState(mockUsers.filter(u => u.role === 'Vendor'));
    const [selectedVendor, setSelectedVendor] = useState<User | null>(null);
    const [isSuspendOpen, setIsSuspendOpen] = useState(false);
    const { toast } = useToast();

    const handleAddVendor = (newVendor: User) => {
        setVendors(prev => [newVendor, ...prev]);
        toast({
            title: "Vendor Added",
            description: `${newVendor.name} has been added and verified.`
        });
    }

    const handleSuspendClick = (vendor: User) => {
        setSelectedVendor(vendor);
        setIsSuspendOpen(true);
    };

     const handleConfirmSuspend = () => {
        if (!selectedVendor) return;
        setVendors(prev => prev.map(v => 
            v.id === selectedVendor.id ? { ...v, status: 'Suspended' } : v
        ));
        toast({
            title: "Vendor Suspended",
            description: `${selectedVendor.name}'s account has been suspended.`
        });
        setIsSuspendOpen(false);
        setSelectedVendor(null);
    }

    return (
        <>
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Vendors</h1>
                    <p className="text-muted-foreground">Manage all vendors on the platform.</p>
                </div>
                <NewVendorDialog onSave={handleAddVendor} />
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendor</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vendors.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="company logo" />
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
                                                <DropdownMenuItem>View Storefront</DropdownMenuItem>
                                                <DropdownMenuItem>View Products</DropdownMenuItem>
                                                <DropdownMenuItem>View Payouts</DropdownMenuItem>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleSuspendClick(user)}>Suspend</DropdownMenuItem>
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
        {selectedVendor && (
            <SuspendVendorDialog
                vendor={selectedVendor}
                open={isSuspendOpen}
                onOpenChange={setIsSuspendOpen}
                onConfirm={handleConfirmSuspend}
            />
        )}
        </>
    )
}
