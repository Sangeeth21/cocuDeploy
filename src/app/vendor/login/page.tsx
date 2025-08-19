
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Store, Check } from "lucide-react";
import { useVerification } from "@/context/vendor-verification-context";
import { auth, db } from "@/lib/firebase";
import { 
    sendSignInLinkToEmail,
    signInWithEmailAndPassword, 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const actionCodeSettings = {
    url: typeof window !== 'undefined' ? `${window.location.origin}/vendor/login` : 'http://localhost:3000/vendor/login',
    handleCodeInApp: true,
};

export default function VendorLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { setAsVerified, setAsUnverified, setVendorType } = useVerification();
    
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.role === 'Vendor') {
                    setVendorType(userData.vendorType || 'personalized');
                    if (userData.verificationStatus === 'verified') {
                        setAsVerified();
                    } else {
                        setAsUnverified();
                    }
                    toast({ title: "Login Successful", description: "Redirecting to your dashboard." });
                    router.push(`/vendor/both/dashboard`);
                } else {
                     throw new Error("This account is not registered as a vendor.");
                }
            } else {
                 throw new Error("Vendor details not found.");
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: "Login Failed", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMagicLink = async () => {
        if (!email) {
            toast({ variant: 'destructive', title: 'Email required', description: 'Please enter your email to receive a sign-in link.' });
            return;
        }
        setIsLoading(true);
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setIsMagicLinkSent(true);
        } catch (error: any) {
             toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    if (isMagicLinkSent) {
         return (
             <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center space-y-4">
                        <Check className="h-12 w-12 mx-auto text-green-500" />
                        <h3 className="text-lg font-semibold">Check your email</h3>
                        <p className="text-muted-foreground">A sign-in link has been sent to <strong>{email}</strong>. Check your inbox and click the link to sign in.</p>
                        <Button variant="link" onClick={() => setIsMagicLinkSent(false)}>Back to login</Button>
                    </CardContent>
                </Card>
            </div>
         )
    }

    return (
        <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
            <Card className="w-full max-w-md">
                <form onSubmit={handlePasswordLogin}>
                    <CardHeader className="text-center">
                         <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                            <Store className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-3xl font-headline">Vendor Portal</CardTitle>
                        <CardDescription>
                            Sign in to manage your store.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="vendor-email">Email</Label>
                            <Input id="vendor-email" type="email" placeholder="vendor@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="vendor-password">Password</Label>
                            <div className="relative">
                                <Input id="vendor-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                                <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                        <Separator />
                        <Button variant="outline" className="w-full" onClick={handleSendMagicLink}>Email me a sign-in link</Button>
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
