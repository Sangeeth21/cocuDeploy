
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Building, User as UserIcon } from "lucide-react";
import { useVerification } from "@/context/vendor-verification-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LoginForm({ type, onLoginSuccess }: { type: 'personalized' | 'corporate'; onLoginSuccess: (type: 'personalized' | 'corporate' | 'both') => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    
    const defaultEmail = type === 'personalized' ? 'personalized@example.com' : 'corporate@example.com';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        let isValid = false;
        let isVerified = true;
        let resolvedVendorType: 'personalized' | 'corporate' | 'both' = type;

        if (password === "vendorpass") {
             if (email === 'personalized@example.com') {
                isValid = true;
                resolvedVendorType = 'personalized';
            } else if (email === 'corporate@example.com') {
                isValid = true;
                resolvedVendorType = 'corporate';
            } else if (email === 'vendor@example.com') {
                isValid = true;
                resolvedVendorType = 'both';
            } else if (email === 'unverified@example.com') {
                isValid = true;
                isVerified = false;
                resolvedVendorType = 'both';
            }
        }

        if (isValid) {
            onLoginSuccess(resolvedVendorType);
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password. Please try again.",
            });
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`email-${type}`}>Email</Label>
              <Input id={`email-${type}`} type="email" placeholder={defaultEmail} required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                  <Label htmlFor={`password-${type}`}>Password</Label>
                  <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot your password?
                  </Link>
              </div>
              <div className="relative">
                <Input id={`password-${type}`} type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
        </form>
    )
}

export default function VendorLoginPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setAsVerified, setAsUnverified, setVendorType } = useVerification();
    const { toast } = useToast();

    const type = searchParams.get('type') || 'personalized';
    
    const handleLoginSuccess = (vendorType: 'personalized' | 'corporate' | 'both') => {
        setVendorType(vendorType);
        // This is a simplified logic, a real app would check verification status from an API
        if (vendorType === 'both' && email === 'unverified@example.com') {
            setAsUnverified();
        } else {
            setAsVerified();
        }
        
        toast({
            title: "Login Successful",
            description: `Redirecting to your ${vendorType} vendor dashboard.`,
        });
        
        // Let the layout handle the redirect based on context change.
    }

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
      <Card className="w-full max-w-md">
         <Tabs defaultValue={type} onValueChange={(value) => router.push(`/vendor/login?type=${value}`)} className="w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline">Vendor Portal</CardTitle>
                <CardDescription>Select your business type to sign in.</CardDescription>
                <TabsList className="grid w-full grid-cols-2 mt-4">
                    <TabsTrigger value="personalized"><UserIcon className="mr-2 h-4 w-4" /> Personalized Retail</TabsTrigger>
                    <TabsTrigger value="corporate"><Building className="mr-2 h-4 w-4" /> Corporate & Bulk</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
                <TabsContent value="personalized">
                    <LoginForm type="personalized" onLoginSuccess={handleLoginSuccess} />
                </TabsContent>
                <TabsContent value="corporate">
                    <LoginForm type="corporate" onLoginSuccess={handleLoginSuccess} />
                </TabsContent>
            </CardContent>
            <CardFooter>
                 <p className="text-sm text-center text-muted-foreground w-full">
                    Don't have a vendor account?{" "}
                    <Link href="/vendor/signup" className="font-semibold text-primary hover:underline">
                        Sign Up
                    </Link>
                </p>
            </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}
