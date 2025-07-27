
"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Camera, Home, CreditCard, PlusCircle, MoreVertical, Trash2, Edit, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockUserOrders = [
    { id: "ORD001", date: "2024-05-20", status: "Delivered", total: 49.99 },
    { id: "ORD002", date: "2024-06-11", status: "Shipped", total: 124.50 },
    { id: "ORD003", date: "2024-06-15", status: "Processing", total: 79.99 },
];

const mockAddresses = [
    { id: 1, type: "Home", line1: "123 Main St", city: "Anytown", zip: "12345", isDefault: true },
    { id: 2, type: "Work", line1: "456 Office Ave", city: "Busytown", zip: "54321", isDefault: false },
]

const mockPaymentMethods = [
    { id: 1, type: "Visa", last4: "4242", expiry: "12/26"},
    { id: 2, type: "Mastercard", last4: "5555", expiry: "08/25"},
]


export default function AccountPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';
  const { toast } = useToast();
  const [avatar, setAvatar] = useState("https://placehold.co/100x100.png");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEmailVerifyOpen, setIsEmailVerifyOpen] = useState(false);
  const [isPhoneVerifyOpen, setIsPhoneVerifyOpen] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

  const handleSaveChanges = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
    });
  }
  
  const handleUpdatePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toast({
        title: "Password Updated",
        description: "Your password has been changed.",
    });
  }
  
  const handleNotificationSettingsChange = () => {
    toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
    });
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatar(URL.createObjectURL(file));
       toast({
        title: "Avatar Updated",
        description: "Your new profile picture has been set. Click 'Save Changes' to apply.",
    });
    }
  };

  const handleAvatarClick = () => {
      fileInputRef.current?.click();
  }
  
  const handleVerifySubmit = (type: 'email' | 'phone') => {
    toast({
      title: `${type === 'email' ? 'Email' : 'Phone'} Verified`,
      description: `Your new ${type} has been updated successfully.`,
    });
    if (type === 'email') setIsEmailVerifyOpen(false);
    if (type === 'phone') setIsPhoneVerifyOpen(false);
  }

  return (
    <div className="container py-12">
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group">
            <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} alt="User Avatar" data-ai-hint="person face" />
            <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <button 
                onClick={handleAvatarClick} 
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Change profile picture"
            >
                <Camera className="h-8 w-8 text-white" />
            </button>
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
            />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">John Doe's Account</h1>
          <p className="text-muted-foreground">Manage your profile, orders, and settings.</p>
        </div>
      </div>
      <Tabs value={tab} onValueChange={(value) => window.history.pushState(null, '', `?tab=${value}`)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
           <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Public Profile</CardTitle>
              <CardDescription>This information may be displayed publicly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="johndoe" />
                    </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us a little about yourself" defaultValue="Lover of all things tech and design. Avid collector of handcrafted mugs."/>
              </div>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order History</CardTitle>
              <CardDescription>View your past purchases and their status.</CardDescription>
            </CardHeader>
            <CardContent>
                {mockUserOrders.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockUserOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.date}</TableCell>
                                <TableCell>
                                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">View Details</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                ) : (
                    <p className="text-muted-foreground text-center py-8">You have no past orders.</p>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-4 text-lg">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Email Address</Label>
                        <p className="text-sm text-muted-foreground">john.doe@example.com <Badge variant="secondary" className="ml-2">Verified</Badge></p>
                      </div>
                      <Dialog open={isEmailVerifyOpen} onOpenChange={setIsEmailVerifyOpen}>
                        <DialogTrigger asChild><Button variant="outline">Change</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Email Address</DialogTitle>
                                <DialogDescription>A verification code will be sent to your new email.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-email">New Email</Label>
                                    <Input id="new-email" type="email" placeholder="new.email@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-otp">Verification Code</Label>
                                    <Input id="email-otp" placeholder="Enter 6-digit code" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => handleVerifySubmit('email')}>Verify & Update</Button>
                            </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Primary Phone</Label>
                        <p className="text-sm text-muted-foreground">+1 (555) 123-4567 <Badge variant="secondary" className="ml-2">Verified</Badge></p>
                      </div>
                       <Dialog open={isPhoneVerifyOpen} onOpenChange={setIsPhoneVerifyOpen}>
                         <DialogTrigger asChild><Button variant="outline">Change</Button></DialogTrigger>
                         <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Phone Number</DialogTitle>
                                <DialogDescription>A verification code will be sent to your new phone number.</DialogDescription>
                            </DialogHeader>
                             <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-phone">New Phone Number</Label>
                                    <Input id="new-phone" type="tel" placeholder="+1 (555) 555-5555" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone-otp">Verification Code</Label>
                                    <Input id="phone-otp" placeholder="Enter 6-digit code" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => handleVerifySubmit('phone')}>Verify & Update</Button>
                            </DialogFooter>
                        </DialogContent>
                       </Dialog>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Secondary Phone</Label>
                        <p className="text-sm text-muted-foreground">Not provided</p>
                      </div>
                      <Button variant="outline">Add</Button>
                    </div>
                  </div>
                </div>
                <Separator/>
                <div>
                    <h3 className="font-semibold mb-4 text-lg">Change Password</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                        </div>
                    </div>
                    <Button className="mt-4" onClick={handleUpdatePassword}>Update Password</Button>
                </div>
                <Separator/>
                 <div>
                    <h3 className="font-semibold mb-4 text-lg">Notification Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div>
                             <Label htmlFor="promotions" className="font-medium">Promotional Emails</Label>
                             <p className="text-xs text-muted-foreground">Receive updates on new products and special offers.</p>
                           </div>
                           <Switch id="promotions" defaultChecked onCheckedChange={handleNotificationSettingsChange}/>
                        </div>
                         <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div>
                             <Label htmlFor="order-updates" className="font-medium">Order Updates</Label>
                             <p className="text-xs text-muted-foreground">Get notified about the status of your orders.</p>
                           </div>
                           <Switch id="order-updates" defaultChecked onCheckedChange={handleNotificationSettingsChange}/>
                        </div>
                    </div>
                </div>
                <Separator/>
                <div>
                    <h3 className="font-semibold text-destructive mb-2 text-lg">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all of your content. This action is not reversible.</p>
                    <DeleteAccountDialog />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="billing">
            <div className="space-y-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">Shipping Addresses</CardTitle>
                            <CardDescription>Manage your saved addresses.</CardDescription>
                        </div>
                         <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2"/> Add Address</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add New Address</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label>Address Nickname</Label>
                                        <Input placeholder="e.g. Home, Work" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address Line 1</Label>
                                        <Input placeholder="123 Main St" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input placeholder="Anytown" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label>ZIP Code</Label>
                                            <Input placeholder="12345" />
                                        </div>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="default-address"/>
                                        <Label htmlFor="default-address" className="font-normal">Set as default address</Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => setIsAddressFormOpen(false)}>Save Address</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {mockAddresses.map(address => (
                         <div key={address.id} className="flex items-start justify-between p-4 border rounded-lg gap-4">
                            <div className="flex items-start gap-4">
                                <Home className="h-6 w-6 text-muted-foreground mt-1"/>
                                <div>
                                    <p className="font-semibold">{address.type} {address.isDefault && <Badge className="ml-2">Default</Badge>}</p>
                                    <p className="text-sm text-muted-foreground">{address.line1}</p>
                                    <p className="text-sm text-muted-foreground">{address.city}, {address.zip}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem><Edit className="mr-2"/> Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/> Delete</DropdownMenuItem>
                                    {!address.isDefault && <DropdownMenuItem><CheckCircle className="mr-2"/> Set as Default</DropdownMenuItem>}
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                       ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader  className="flex flex-row items-center justify-between">
                         <div>
                            <CardTitle className="font-headline">Payment Methods</CardTitle>
                            <CardDescription>Manage your saved payment options.</CardDescription>
                        </div>
                        <Button variant="outline"><PlusCircle className="mr-2"/> Add Card</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {mockPaymentMethods.map(pm => (
                         <div key={pm.id} className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-4">
                                <CreditCard className="h-6 w-6 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">{pm.type} ending in {pm.last4}</p>
                                    <p className="text-sm text-muted-foreground">Expires {pm.expiry}</p>
                                </div>
                           </div>
                           <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                         </div>
                       ))}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    