
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Store, Loader2, Check } from "lucide-react";
import { useVerification } from "@/context/vendor-verification-context";
import { auth } from "@/lib/firebase";
import { 
    fetchSignInMethodsForEmail, 
    sendSignInLinkToEmail,
    signInWithEmailAndPassword, 
} from "firebase/auth";

const actionCodeSettings = {
    url: typeof window !== 'undefined' ? `${window.location.origin}/vendor/both/dashboard` : 'http://localhost:3000/vendor/both/dashboard',
    handleCodeInApp: true,
};

export default function VendorLoginPage() {
    const [step, setStep] = useState<'email' | 'password' | 'magic-link-sent'>('email');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { setAsVerified, setAsUnverified, setVendorType } = useVerification();
    
    // This effect should ideally be in a wrapper component, but for this scope,
    // we place it here to handle the magic link sign-in redirect.
    useEffect(() => {
        if (auth.isSignInWithEmailLink(window.location.href)) {
            let emailFromStorage = window.localStorage.getItem('emailForSignIn');
            if (!emailFromStorage) {
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask for the email again.
                emailFromStorage = window.prompt('Please provide your email for confirmation');
            }
            if(emailFromStorage) {
                // The logic to sign in the user would go here.
                // For this example, we'll simulate a successful login.
                setAsVerified(); // Assuming all magic link users are verified for this flow
                setVendorType('both'); // Defaulting to 'both'
                toast({ title: "Magic Link Login Successful", description: "Welcome back!" });
                router.push('/vendor/both/dashboard');
            }
        }
    }, [router, setAsVerified, setVendorType, toast]);


    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.includes('password')) {
                setStep('password');
            } else if (methods.length === 0) {
                 toast({
                    variant: "destructive",
                    title: "No Account Found",
                    description: "This email is not registered as a vendor. Please sign up.",
                });
            } else {
                 handleSendMagicLink();
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            
            // In a real app, you would fetch user's role from your database here.
            // For now, we'll use a mock logic.
            let isVerified = true;
            let resolvedVendorType: 'personalized' | 'corporate' | 'both' = 'personalized';

            if (email === 'unverified@example.com') {
                 isVerified = false;
                 resolvedVendorType = 'both';
            } else if (email === 'corporate@example.com') {
                 resolvedVendorType = 'corporate';
            } else if (email === 'both@example.com') {
                 resolvedVendorType = 'both';
            }

            if(isVerified) setAsVerified();
            else setAsUnverified();

            setVendorType(resolvedVendorType);

            toast({ title: "Login Successful", description: "Redirecting to your dashboard." });
            router.push(`/vendor/both/dashboard`);

        } catch (error: any) {
            toast({ variant: 'destructive', title: "Login Failed", description: "Invalid password." });
        } finally {
            setIsLoading(false);
        }
    };

     const handleSendMagicLink = async () => {
        setIsLoading(true);
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setStep('magic-link-sent');
        } catch (error: any) {
             toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
            <Card className="w-full max-w-md">
                {step === 'magic-link-sent' ? (
                     <CardContent className="pt-6 text-center space-y-4">
                        <Check className="h-12 w-12 mx-auto text-green-500" />
                        <h3 className="text-lg font-semibold">Check your email</h3>
                        <p className="text-muted-foreground">A sign-in link has been sent to <strong>{email}</strong>. Check your inbox and click the link to sign in.</p>
                        <Button variant="link" onClick={() => setStep('email')}>Back to login</Button>
                    </CardContent>
                ) : (
                <form onSubmit={step === 'email' ? handleEmailSubmit : handlePasswordLogin}>
                    <CardHeader className="text-center">
                         <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                            <Store className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-3xl font-headline">Vendor Portal</CardTitle>
                        <CardDescription>
                            {step === 'email' ? "Enter your email to continue." : "Enter your password to sign in."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {step === 'email' ? (
                            <div className="space-y-2">
                                <Label htmlFor="vendor-email">Email</Label>
                                <Input id="vendor-email" type="email" placeholder="vendor@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        ) : (
                             <div className="space-y-2">
                                 <div className="flex justify-between items-center">
                                    <Label htmlFor="vendor-password">Password</Label>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setStep('email')}>Use different email</Button>
                                 </div>
                                <div className="relative">
                                    <Input id="vendor-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Continue
                        </Button>
                        {step === 'password' && (
                            <Button variant="outline" className="w-full" onClick={handleSendMagicLink}>Email me a sign-in link</Button>
                        )}
                        <p className="text-sm text-center text-muted-foreground">
                            New vendor?{" "}
                            <Link href="/vendor/signup" className="font-semibold text-primary hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
                 )}
            </Card>
        </div>
    );
}
