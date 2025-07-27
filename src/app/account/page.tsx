
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';
  const { toast } = useToast();

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

  return (
    <div className="container py-12">
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="person face" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold font-headline">John Doe's Account</h1>
          <p className="text-muted-foreground">Manage your profile, orders, and settings.</p>
        </div>
      </div>
      <Tabs value={tab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Public Profile</CardTitle>
              <CardDescription>This information will be displayed publicly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order History</CardTitle>
              <CardDescription>View your past purchases.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center py-8">You have no past orders.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Account Settings</CardTitle>
              <CardDescription>Manage your account preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Change Password</h3>
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <Button className="mt-4" onClick={handleUpdatePassword}>Update Password</Button>
                </div>
                <Separator/>
                <div>
                    <h3 className="font-semibold text-destructive mb-2">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all of your content.</p>
                    <DeleteAccountDialog />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
