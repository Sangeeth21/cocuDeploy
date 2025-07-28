

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Info, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthDialog } from "@/context/auth-dialog-context";
import { Separator } from "@/components/ui/separator";


const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.8 0-5.18-1.89-6.03-4.43H2.39v2.84C4.26 20.98 7.89 23 12 23z" fill="#34A853" />
        <path d="M5.97 14.25a6.47 6.47 0 0 1 0-4.5V6.91H2.39a11.98 11.98 0 0 0 0 10.18l3.58-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.89 1 4.26 3.02 2.39 6.91l3.58 2.84c.85-2.54 3.23-4.43 6.03-4.43z" fill="#EA4335" />
    </svg>
);

const FacebookIcon = () => (
     <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89H8.169v-2.89H10.438V9.62c0-2.274 1.35-3.522 3.42-3.522 1.01 0 1.86.074 2.11.107v2.585h-1.51c-1.1 0-1.31.522-1.31 1.285v1.6h2.86l-.372 2.89h-2.488v7.008C18.343 21.128 22 16.991 22 12z" fill="#1877F2" />
    </svg>
);

const TwitterIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const InstagramIcon = () => (
     <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>
);

const LinkedinIcon = () => (
     <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.25 6.5 1.75 1.75 0 0 1 6.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.54 1.54 0 0 0 13 14.19a1.4 1.4 0 0 0 .1.74V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.3.86 3.3 3.6z"></path>
    </svg>
);


// LoginForm Component
function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simplified logic for customer login
        if (email === "customer@example.com" && password === "customerpass") {
            toast({
                title: "Login Successful",
                description: "Welcome back!",
            });
            onLoginSuccess(); // Close dialog via context
            router.refresh(); // Refresh page to update header state
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password.",
            });
        }
    };
    
    const handleSocialLogin = (provider: string) => {
        toast({
            title: `Logged in with ${provider}!`,
            description: "Welcome back!",
        });
        onLoginSuccess();
        router.refresh();
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input id="customer-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="customer-password">Password</Label>
                        <Link href="#" className="text-sm text-primary hover:underline">
                            Forgot your password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input id="customer-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                </div>
                <Button type="submit" className="w-full">Sign In</Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <div className="flex justify-center gap-2">
                 <Button variant="outline" size="icon" onClick={() => handleSocialLogin("Google")}>
                    <GoogleIcon />
                    <span className="sr-only">Continue with Google</span>
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleSocialLogin("Facebook")}>
                    <FacebookIcon />
                    <span className="sr-only">Continue with Facebook</span>
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleSocialLogin("X")}>
                    <TwitterIcon />
                     <span className="sr-only">Continue with X</span>
                </Button>
                 <Button variant="outline" size="icon" onClick={() => handleSocialLogin("Instagram")}>
                    <InstagramIcon />
                     <span className="sr-only">Continue with Instagram</span>
                </Button>
                 <Button variant="outline" size="icon" onClick={() => handleSocialLogin("LinkedIn")}>
                    <LinkedinIcon />
                     <span className="sr-only">Continue with LinkedIn</span>
                </Button>
            </div>
        </div>
    );
}

// SignupForm Component
function SignupForm({ onSignupSuccess }: { onSignupSuccess: () => void }) {
    const [step, setStep] = useState<"details" | "verify">("details");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
    const [agreedToTerms, setAgreedToTerms] = useState(true);
    const [emailOtp, setEmailOtp] = useState("");
    const [phoneOtp, setPhoneOtp] = useState("");
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        number: false,
        specialChar: false,
    });
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const checkPasswordStrength = (pass: string) => {
            let score = 0;
            const newCriteria = {
                length: pass.length >= 8,
                uppercase: /[A-Z]/.test(pass),
                number: /[0-9]/.test(pass),
                specialChar: /[^A-Za-z0-9]/.test(pass),
            };
            setPasswordCriteria(newCriteria);
            
            if (newCriteria.length) score++;
            if (newCriteria.uppercase) score++;
            if (newCriteria.number) score++;
            if (newCriteria.specialChar) score++;
            
            if (score < 2) {
                setPasswordStrength({ score, label: 'Weak', color: 'bg-destructive' });
            } else if (score < 4) {
                 setPasswordStrength({ score, label: 'Medium', color: 'bg-yellow-500' });
            } else {
                 setPasswordStrength({ score, label: 'Strong', color: 'bg-green-500' });
            }
        }
        checkPasswordStrength(password);
    }, [password]);

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "Passwords do not match" });
            return;
        }
        if (passwordStrength.score < 4) {
            toast({ variant: "destructive", title: "Password is too weak" });
            return;
        }
        if (!agreedToTerms) {
            toast({ variant: "destructive", title: "You must agree to the terms" });
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
          toast({ title: "Verification Required", description: "Codes sent to your email & phone." });
          setStep("verify");
          setIsLoading(false);
        }, 1500);
    };
    
    const handleVerificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock OTP check
        setTimeout(() => {
           toast({ title: "Account Created!", description: "Welcome to ShopSphere!" });
           onSignupSuccess();
           router.refresh();
        }, 1500);
    };

    const renderCriteriaCheck = (label: string, isMet: boolean) => (
        <div className={cn("flex items-center text-xs gap-2", isMet ? "text-green-600" : "text-muted-foreground")}>
            <Check className="h-3 w-3" />
            <span>{label}</span>
        </div>
    );
    
     const handleSocialLogin = (provider: string) => {
        toast({
            title: `Signed up with ${provider}!`,
            description: "Welcome to ShopSphere!",
        });
        onSignupSuccess();
        router.refresh();
    }

    if (step === 'verify') {
        return (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <DialogHeader className="text-center">
                    <DialogTitle>Verify Your Account</DialogTitle>
                    <DialogDescription>Enter the codes sent to your email and phone.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="email-otp">Email Verification Code</Label>
                    <Input id="email-otp" required value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} />
                </div>
                 {phone && (
                    <div className="space-y-2">
                        <Label htmlFor="phone-otp">Phone Verification Code</Label>
                        <Input id="phone-otp" required value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} />
                    </div>
                 )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Verify and Sign Up
                </Button>
                <Button variant="link" size="sm" onClick={() => setStep('details')} className="w-full text-muted-foreground">
                    Back to previous step
                </Button>
            </form>
        );
    }
    
    return (
        <div className="space-y-4">
             <div className="flex justify-center gap-2">
                 <Button variant="outline" size="icon" onClick={() => handleSocialLogin("Google")}>
                    <GoogleIcon />
                    <span className="sr-only">Continue with Google</span>
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleSocialLogin("Facebook")}>
                    <FacebookIcon />
                    <span className="sr-only">Continue with Facebook</span>
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleSocialLogin("X")}>
                    <TwitterIcon />
                     <span className="sr-only">Continue with X</span>
                </Button>
                 <Button variant="outline" size="icon" onClick={() => handleSocialLogin("Instagram")}>
                    <InstagramIcon />
                     <span className="sr-only">Continue with Instagram</span>
                </Button>
                 <Button variant="outline" size="icon" onClick={() => handleSocialLogin("LinkedIn")}>
                    <LinkedinIcon />
                     <span className="sr-only">Continue with LinkedIn</span>
                </Button>
            </div>
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
                </div>
            </div>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="customer-name">Full Name</Label>
                    <Input id="customer-name" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customer-signup-email">Email</Label>
                    <Input id="customer-signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="customer-signup-phone">Phone Number (Optional)</Label>
                    <Input id="customer-signup-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="customer-signup-password">Password</Label>
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger type="button"><Info className="h-3 w-3 text-muted-foreground"/></TooltipTrigger>
                                <TooltipContent>
                                    <ul className="list-disc pl-4 text-xs space-y-1">
                                        <li>At least 8 characters long</li>
                                        <li>Contains an uppercase letter</li>
                                        <li>Contains a number</li>
                                        <li>Contains a special character</li>
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="relative">
                        <Input id="customer-signup-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} />
                        <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                    {isPasswordFocused && (
                        <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 p-2 rounded-md bg-muted/50">
                                {renderCriteriaCheck("8+ characters", passwordCriteria.length)}
                                {renderCriteriaCheck("1 uppercase", passwordCriteria.uppercase)}
                                {renderCriteriaCheck("1 number", passwordCriteria.number)}
                                {renderCriteriaCheck("1 special char", passwordCriteria.specialChar)}
                            </div>
                             {password.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Progress value={passwordStrength.score * 25} className={cn("h-1 w-full", passwordStrength.color)} />
                                    <span className="text-xs text-muted-foreground flex-shrink-0">{passwordStrength.label}</span>
                                </div>
                            )}
                        </div>
                     )}
                </div>
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
                        I agree to the ShopSphere <Link href="#" className="font-medium text-primary hover:underline">Terms</Link> and <Link href="#" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
                    </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </form>
        </div>
    );
}

// Main Dialog Component
export function CustomerAuthDialog() {
    const { authDialogState, closeDialog } = useAuthDialog();

    return (
        <Dialog open={authDialogState.isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-md">
                 <DialogHeader className="text-center">
                    <DialogTitle>Welcome to ShopSphere</DialogTitle>
                    <DialogDescription>Log in or create an account to continue.</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue={authDialogState.initialTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <div className="pt-4">
                           <LoginForm onLoginSuccess={closeDialog} />
                        </div>
                    </TabsContent>
                    <TabsContent value="signup">
                        <div className="pt-4">
                          <SignupForm onSignupSuccess={closeDialog} />
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
