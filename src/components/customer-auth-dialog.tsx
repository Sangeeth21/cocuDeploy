
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Info, Check, User as UserIcon, Building, Combine } from "lucide-react";
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


// LoginForm Component
function PersonalLoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { login } = useUser();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (email === "customer@example.com" && password === "customerpass") {
            login();
            toast({ title: "Login Successful", description: "Welcome back!" });
            onLoginSuccess();
            router.refresh();
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password.",
            });
        }
    };

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
                <Label htmlFor="corporate-password-dialog">Password</Label>
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
    const [step, setStep] = useState<"details" | "verify">("details");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(true);
    const [accountType, setAccountType] = useState<'personalized' | 'corporate' | 'both'>('personalized');
    const [emailOtp, setEmailOtp] = useState("");
    const [phoneOtp, setPhoneOtp] = useState("");
    const router = useRouter();
    const { toast } = useToast();
    const { login } = useUser();

    const namePlaceholder = useMemo(() => {
        if (accountType === 'corporate') return 'Company Name';
        if (accountType === 'both') return 'Your Name';
        return 'Your Name';
    }, [accountType]);

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords do not match",
                description: "Please ensure your passwords match.",
            });
            return;
        }

        if (!agreedToTerms) {
            toast({
                variant: "destructive",
                title: "Terms and Conditions",
                description: "You must agree to the terms to sign up.",
            });
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
           login();
           toast({ title: "Account Created!", description: "Welcome to Co & Cu!" });
           onSignupSuccess();
           router.refresh();
        }, 1500);
    };

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
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Account Type</Label>
                    <RadioGroup value={accountType} onValueChange={(value) => setAccountType(value as any)} className="grid grid-cols-3 gap-2">
                         <div>
                            <RadioGroupItem value="personalized" id="personalized" className="peer sr-only" />
                            <Label htmlFor="personalized" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <UserIcon className="mb-1 h-5 w-5" />
                                <span className="text-xs">Personal</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="corporate" id="corporate" className="peer sr-only" />
                            <Label htmlFor="corporate" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <Building className="mb-1 h-5 w-5" />
                                <span className="text-xs">Corporate</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="both" id="both" className="peer sr-only" />
                            <Label htmlFor="both" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <Combine className="mb-1 h-5 w-5" />
                                <span className="text-xs">Both</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customer-name">{namePlaceholder}</Label>
                    <Input id="customer-name" placeholder={namePlaceholder} required />
                </div>
                 {accountType === 'both' && (
                    <div className="space-y-2">
                        <Label htmlFor="customer-company-name">Company Name (Optional)</Label>
                        <Input id="customer-company-name" placeholder="Your Company LLC" />
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="customer-signup-email">Email</Label>
                    <Input id="customer-signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customer-signup-phone">Phone Number</Label>
                    <Input 
                        id="customer-signup-phone" 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, '');
                            if (numericValue.length <= 10) {
                                setPhone(numericValue);
                            }
                        }} 
                        maxLength={10}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customer-signup-password">Password</Label>
                    <div className="relative">
                        <Input id="customer-signup-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
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
                        I agree to the Co & Cu <Link href="#" className="font-medium text-primary hover:underline">Terms</Link> and <Link href="#" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
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
            <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
                <Tabs defaultValue={authDialogState.initialTab} className="w-full flex flex-col min-h-0">
                    <DialogHeader className="flex-shrink-0">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                    </DialogHeader>
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
                            <ScrollArea className="flex-1 -mr-6 pr-6">
                                <SignupForm onSignupSuccess={closeDialog} />
                            </ScrollArea>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
