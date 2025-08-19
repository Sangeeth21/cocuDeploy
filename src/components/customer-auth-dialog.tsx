
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Info, Check, User as UserIcon, Building, Combine, Mail, KeyRound, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthDialog } from "@/context/auth-dialog-context";
import { Separator } from "@/components/ui/separator";
import { useVerification } from "@/context/vendor-verification-context";
import { useUser } from "@/context/user-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auth, db } from "@/lib/firebase";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    sendSignInLinkToEmail,
    signInWithPopup,
    GoogleAuthProvider,
    linkWithCredential,
    EmailAuthProvider,
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import type { User } from "@/lib/types";

// This will be a mock. In a real app, this would involve a backend service.
const MOCK_OTP = "123456";

// LoginForm Component
function PersonalLoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const { toast } = useToast();
    const { login } = useUser();
    const { openForgotPasswordDialog, closeDialog } = useAuthDialog();

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistence);

            await signInWithEmailAndPassword(auth, email, password);
            login(); // This will trigger the context to update the user state
            toast({ title: "Login Successful", description: "Welcome back!" });
            onLoginSuccess();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Login Failed", description: "Invalid password or email." });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // onAuthStateChanged will handle the rest, including Firestore user creation if needed.
            toast({ title: "Login Successful", description: "Welcome!" });
            onLoginSuccess();
        } catch (error: any) {
             if (error.code === 'auth/account-exists-with-different-credential') {
                const email = error.customData.email;
                const methods = await fetchSignInMethodsForEmail(auth, email);
                toast({
                    variant: 'destructive',
                    title: 'Account Exists',
                    description: `You already have an account with this email signed up via ${methods[0]}. Please sign in with your password to link your Google account.`,
                    duration: 8000
                });
            } else {
                toast({ variant: 'destructive', title: "Google Sign-In Failed", description: error.message });
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-4">
             <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input id="customer-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <Label htmlFor="customer-password">Password</Label>
                        <Button type="button" variant="link" className="text-xs h-auto p-0" onClick={() => { closeDialog(); openForgotPasswordDialog(); }}>
                            Forgot password?
                        </Button>
                     </div>
                    <div className="relative">
                        <Input id="customer-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                    <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                </Button>
            </form>
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
             <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.5L357 150.3C320.3 116.8 288.5 97.2 248 97.2c-83.3 0-151.8 68.3-151.8 158.8s68.5 158.8 151.8 158.8c99.1 0 134.3-84.3 138.6-124.6H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>}
                Google
            </Button>
        </div>
    );
}

function CorporateLoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { adminLogin } = useAdminAuth();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === "corporate@example.com" && password === "corporatepass") {
            adminLogin();
            toast({
                title: "Corporate Login Successful",
                description: "Redirecting to the corporate dashboard.",
            });
            onLoginSuccess();
            router.push("/corporate/dashboard");
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid corporate credentials.",
            });
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="corporate-email-dialog">Corporate Email</Label>
                <Input id="corporate-email-dialog" type="email" placeholder="corporate@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="corporate-password-dialog">Password</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                        Forgot your password?
                    </Link>
                </div>
                <div className="relative">
                    <Input id="corporate-password-dialog" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
            </div>
            <Button type="submit" className="w-full">Sign In to Corporate Dashboard</Button>
        </form>
    );
}

// SignupForm Component
function SignupForm({ onSignupSuccess }: { onSignupSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(true);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isAwaitingVerification, setIsAwaitingVerification] = useState(false);
    const { toast } = useToast();
    const { login } = useUser();

    const passwordCheck = useMemo(() => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            specialChar: /[^A-Za-z0-9]/.test(password),
        };
        const strength = Object.values(checks).filter(Boolean).length;
        return { checks, strength };
    }, [password]);

    const getStrengthColor = () => {
        switch (passwordCheck.strength) {
            case 0:
            case 1:
            case 2:
                return 'bg-red-500'; // Weak
            case 3:
            case 4:
                return 'bg-yellow-500'; // Medium
            case 5:
                return 'bg-green-500'; // Strong
            default:
                return 'bg-gray-200';
        }
    };


    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            toast({ variant: "destructive", title: "Terms and Conditions required" });
            return;
        }
         if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "Passwords do not match" });
            return;
        }
        if (passwordCheck.strength < 5) {
            toast({ variant: "destructive", title: "Password is too weak" });
            return;
        }
        
        setIsLoading(true);
        try {
            const actionCodeSettings = {
                url: `${window.location.origin}/`,
                handleCodeInApp: true,
            };
            
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);

            // Store user details temporarily to use after email verification
            window.localStorage.setItem('emailForSignIn', email);
            window.localStorage.setItem('pendingSignupDetails', JSON.stringify({name, password}));

            toast({
                title: "Verification Email Sent",
                description: "Please check your email and click the link to complete your registration.",
            });
            setIsAwaitingVerification(true);
            
        } catch (error: any) {
             toast({ variant: "destructive", title: "Signup Failed", description: error.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : error.message });
        } finally {
            setIsLoading(false);
        }
    };

    if (isAwaitingVerification) {
        return (
            <div className="text-center py-8 space-y-4">
                <Mail className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-xl font-headline">Check Your Email</h3>
                <p className="text-muted-foreground">
                    We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>. Click the link to complete your signup and sign in.
                </p>
                <Button variant="link" onClick={() => setIsAwaitingVerification(false)}>Back to Signup</Button>
            </div>
        )
    }
    
    return (
        <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="customer-name">Full Name</Label>
                <Input id="customer-name" placeholder="Your Name" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="customer-signup-email">Email</Label>
                <Input id="customer-signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="customer-signup-password">Password</Label>
                <div className="relative">
                    <Input 
                        id="customer-signup-password" 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
            </div>

            {isPasswordFocused && password.length > 0 && (
                    <div className="space-y-3 pt-1">
                    <Progress value={passwordCheck.strength * 20} className={cn("h-2", getStrengthColor())} />
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {Object.entries(passwordCheck.checks).map(([key, value]) => (
                            <li key={key} className={cn("flex items-center gap-2", value && "text-green-600")}>
                                <Check className={cn("h-3.5 w-3.5 transition-all", value ? "opacity-100" : "opacity-30")} />
                                <span>
                                    {
                                        {
                                            length: 'At least 8 characters',
                                            uppercase: 'One uppercase letter',
                                            lowercase: 'One lowercase letter',
                                            number: 'One number',
                                            specialChar: 'One special character',
                                        }[key]
                                    }
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="customer-confirm-password">Confirm Password</Label>
                    <div className="relative">
                    <Input id="customer-confirm-password" type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="customer-terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
                <Label htmlFor="customer-terms" className="font-normal text-xs text-muted-foreground leading-snug">
                    I agree to the Co & Cu <Link href="#" className="font-medium text-primary hover:underline">Terms</Link> and <Link href="#" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
                </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
            </Button>
        </form>
    );
}

function ForgotPasswordForm({ onForgotPasswordSuccess }: { onForgotPasswordSuccess: () => void }) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast({
                title: "Password Reset Email Sent",
                description: "Please check your inbox to reset your password.",
            });
            onForgotPasswordSuccess();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not send password reset email. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your registered email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
            </Button>
        </form>
    );
}

// Main Dialog Component
export function CustomerAuthDialog() {
    const { authDialogState, closeDialog, openDialog } = useAuthDialog();

    return (
        <Dialog open={authDialogState.currentState !== 'closed'} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
                 {authDialogState.currentState === 'auth' ? (
                     <>
                        <DialogHeader>
                            <DialogTitle className="text-center font-headline text-2xl">Account Access</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue={authDialogState.initialTab} className="w-full flex flex-col min-h-0">
                            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>
                            <div className="pt-4 flex-1 min-h-0">
                                <TabsContent value="login">
                                    <Tabs defaultValue="personal" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="personal"><UserIcon className="mr-2 h-4 w-4"/> Personal</TabsTrigger>
                                            <TabsTrigger value="corporate"><Building className="mr-2 h-4 w-4"/> Corporate</TabsTrigger>
                                        </TabsList>
                                        <div className="pt-4">
                                        <TabsContent value="personal">
                                            <PersonalLoginForm onLoginSuccess={closeDialog} />
                                        </TabsContent>
                                        <TabsContent value="corporate">
                                            <AdminAuthProvider>
                                                <CorporateLoginForm onLoginSuccess={closeDialog} />
                                            </AdminAuthProvider>
                                        </TabsContent>
                                        </div>
                                    </Tabs>
                                </TabsContent>
                                <TabsContent value="signup" className="h-full flex flex-col">
                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-semibold">Create a Personal Account</h3>
                                        <p className="text-sm text-muted-foreground">Join our community to shop, save favorites, and track orders.</p>
                                    </div>
                                    <ScrollArea className="flex-1 -mr-6 pr-6">
                                        <SignupForm onSignupSuccess={closeDialog} />
                                    </ScrollArea>
                                </TabsContent>
                            </div>
                        </Tabs>
                     </>
                 ) : (
                     <>
                        <DialogHeader>
                            <DialogTitle>Reset Your Password</DialogTitle>
                            <DialogDescription>
                                Enter your email address and we'll send you a link to get back into your account.
                            </DialogDescription>
                        </DialogHeader>
                        <ForgotPasswordForm onForgotPasswordSuccess={closeDialog} />
                        <Button variant="link" size="sm" onClick={() => openDialog('login')}>Back to Login</Button>
                     </>
                 )}
            </DialogContent>
        </Dialog>
    );
}
