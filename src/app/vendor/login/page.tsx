
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Store } from "lucide-react";
import { useVerification } from "@/context/vendor-verification-context";

export default function VendorLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { setAsVerified, setAsUnverified, setVendorType } = useVerification();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        let isValid = false;
        let isVerified = true;
        let resolvedVendorType: 'personalized' | 'corporate' | 'both' = 'personalized'; // Default

        if (password === "vendorpass") {
            if (email === 'personalized@example.com') {
                isValid = true;
                resolvedVendorType = 'personalized';
            } else if (email === 'corporate@example.com') {
                isValid = true;
                resolvedVendorType = 'corporate';
            } else if (email === 'vendor@example.com' || email === 'both@example.com') {
                isValid = true;
                resolvedVendorType = 'both';
            } else if (email === 'unverified@example.com') {
                isValid = true;
                isVerified = false;
                resolvedVendorType = 'both'; // Unverified vendors get the full dashboard view to encourage setup
            }
        }

        if (isValid) {
            if (isVerified) {
                setAsVerified();
            } else {
                setAsUnverified();
            }
            setVendorType(resolvedVendorType);
            toast({
                title: "Login Successful",
                description: "Redirecting to your vendor dashboard.",
            });
            // The redirection is now handled by the layout based on vendorType
            // No need to push router here, let the context and layout do the work.
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password. Please try again.",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
            <Card className="w-full max-w-md">
                <form onSubmit={handleLogin}>
                    <CardHeader className="text-center">
                         <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                            <Store className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-3xl font-headline">Vendor Portal</CardTitle>
                        <CardDescription>Sign in to manage your store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="vendor-email">Email</Label>
                            <Input id="vendor-email" type="email" placeholder="vendor@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="vendor-password">Password</Label>
                                <Link href="#" className="text-sm text-primary hover:underline">
                                    Forgot your password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input id="vendor-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                                <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full">Sign In</Button>
                        <p className="text-sm text-center text-muted-foreground">
                            New vendor?{" "}
                            <Link href="/vendor/signup" className="font-semibold text-primary hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
