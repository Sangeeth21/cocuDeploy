

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

    return (
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
                <div className="space-y-2">
                    <Label htmlFor="phone-otp">Phone Verification Code</Label>
                    <Input id="phone-otp" required value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} />
                </div>
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
                <Label htmlFor="customer-signup-password">Password</Label>
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
                    </div>
                 )}
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
