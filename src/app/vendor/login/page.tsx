
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Store } from "lucide-react";
import { useVerification } from "@/context/vendor-verification-context";
import { auth, db } from "@/lib/firebase";
import { 
    signInWithEmailAndPassword, 
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@/lib/types";

export default function VendorLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const { setAsVerified, setAsUnverified, setVendorType } = useVerification();
    
    // This effect will handle the magic link sign-in process
    useEffect(() => {
        const handleMagicLinkSignIn = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                setIsLoading(true);
                let emailFromStorage = window.localStorage.getItem('emailForSignIn');
                if (!emailFromStorage) {
                    // This can happen if the user opens the link on a different device/browser.
                    emailFromStorage = window.prompt('Please provide your email for confirmation');
                }
                
                if (!emailFromStorage) {
                    toast({ variant: 'destructive', title: 'Could not complete sign-in.', description: 'Your email is required to finalize verification.'});
                    setIsLoading(false);
                    return;
                }

                try {
                    const userCredential = await signInWithEmailLink(auth, emailFromStorage, window.location.href);
                    
                    const pendingDetailsRaw = window.localStorage.getItem('pendingSignupDetails');
                    if (pendingDetailsRaw && userCredential.user) {
                        // This is a new user completing signup.
                        const { name, vendorType: vType } = JSON.parse(pendingDetailsRaw);
                        const userDocRef = doc(db, "users", userCredential.user.uid);

                        // Check if a document already exists, just in case.
                        const docSnap = await getDoc(userDocRef);
                        if (!docSnap.exists()) {
                            const newUser: Omit<User, 'id'> = {
                                name,
                                email: userCredential.user.email || emailFromStorage,
                                role: 'Vendor',
                                vendorType: vType,
                                status: 'Active',
                                verificationStatus: 'pending',
                                joinedDate: new Date().toISOString().split('T')[0],
                                avatar: 'https://placehold.co/40x40.png'
                            };
                            await setDoc(userDocRef, newUser);
                        }
                        
                        setVendorType(vType);
                        setAsUnverified(); // They are new, so they are unverified.
                    }

                    window.localStorage.removeItem('emailForSignIn');
                    window.localStorage.removeItem('pendingSignupDetails');
                    
                    toast({ title: 'Sign-in Successful!', description: 'You have been securely signed in.' });
                    router.push("/vendor/dashboard");

                } catch (error: any) {
                    toast({ variant: 'destructive', title: "Sign-in Failed", description: "The link may be expired or invalid." });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        handleMagicLinkSignIn();
    }, [router, toast, setAsUnverified, setAsVerified, setVendorType]);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistence);

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
                    router.push(`/vendor/dashboard`);
                } else {
                     throw new Error("This account is not registered as a vendor.");
                }
            } else {
                 throw new Error("Vendor details not found.");
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: "Login Failed", description: "Invalid password or email." });
        } finally {
            setIsLoading(false);
        }
    };


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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                                <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
                            </div>
                             <Link href="#" className="text-sm text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
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
