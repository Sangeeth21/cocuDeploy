

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building, User as UserIcon } from "lucide-react";
import { useVerification } from "@/context/vendor-verification-context";
import { useUser } from "@/context/user-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LoginForm({ type }: { type: 'personalized' | 'corporate' }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { setAsVerified, setAsUnverified, setVendorType } = useVerification();
    
    const defaultEmail = type === 'personalized' ? 'personalized@example.com' : 'corporate@example.com';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        let isValid = false;
        let isVerified = true;
        let vendorType: 'personalized' | 'corporate' | 'both' = type;

        if (password === "vendorpass") {
            if (type === 'personalized' && email === 'personalized@example.com') {
                isValid = true;
                vendorType = 'personalized';
            } else if (type === 'corporate' && email === 'corporate@example.com') {
                isValid = true;
                vendorType = 'corporate';
            } else if (email === 'vendor@example.com') {
                isValid = true;
                vendorType = 'both';
            } else if (email === 'unverified@example.com') {
                isValid = true;
                isVerified = false;
                vendorType = 'both';
            }
        }

        if (isValid) {
            setVendorType(vendorType);
            if (isVerified) {
                setAsVerified();
            } else {
                setAsUnverified();
            }
            toast({
                title: "Login Successful",
                description: `Redirecting to your ${vendorType} vendor dashboard.`,
            });
            router.push(`/vendor/${vendorType}/dashboard`);
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password. Please try again.",
            });
        }
    };

    return (
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder={defaultEmail} required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot your password?
                  </Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="font-normal">
                Remember me
                </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">Sign In</Button>
            <p className="text-sm text-center text-muted-foreground">
                Don't have a vendor account?{" "}
                <Link href="/vendor/signup" className="font-semibold text-primary hover:underline">
                    Sign Up
                </Link>
            </p>
          </CardFooter>
        </form>
    )
}

export default function VendorLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
      <Card className="w-full max-w-md">
         <Tabs defaultValue="personalized" className="w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline">Vendor Portal</CardTitle>
                <CardDescription>Select your business type to sign in.</CardDescription>
                <TabsList className="grid w-full grid-cols-2 mt-4">
                    <TabsTrigger value="personalized"><UserIcon className="mr-2 h-4 w-4" /> Personalized Retail</TabsTrigger>
                    <TabsTrigger value="corporate"><Building className="mr-2 h-4 w-4" /> Corporate & Bulk</TabsTrigger>
                </TabsList>
            </CardHeader>
            <TabsContent value="personalized">
                <LoginForm type="personalized" />
            </TabsContent>
            <TabsContent value="corporate">
                <LoginForm type="corporate" />
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
