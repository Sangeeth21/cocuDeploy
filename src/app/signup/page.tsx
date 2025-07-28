
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const MOCK_EMAIL_OTP = "123456";
const MOCK_PHONE_OTP = "654321";

export default function SignupPage() {
  const [step, setStep] = useState<"details" | "verify">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkPasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        
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

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
        toast({
            variant: "destructive",
            title: "Passwords do not match",
            description: "Please re-enter your passwords.",
        });
        return;
    }
     if (passwordStrength.score < 4) {
        toast({
            variant: "destructive",
            title: "Password is too weak",
            description: "Please choose a stronger password that meets all the criteria.",
        });
        return;
    }
     if (!agreedToTerms) {
        toast({
            variant: "destructive",
            title: "Terms and Conditions",
            description: "You must agree to the Terms and Conditions to create an account.",
        });
        return;
    }

    if (role === 'vendor' && email === 'test-vendor@example.com') {
        toast({
            title: "Developer Shortcut",
            description: "Bypassing OTP and redirecting to vendor verification.",
        });
        router.push('/vendor/verify');
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Verification Required",
        description: "We've sent verification codes to your email and phone.",
      });
      setStep("verify");
      setIsLoading(false);
    }, 1500);
  };
  
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (emailOtp === MOCK_EMAIL_OTP && phoneOtp === MOCK_PHONE_OTP) {
       setTimeout(() => {
          toast({
            title: "Account Created!",
            description: "Your account has been successfully verified.",
          });
          if (role === 'vendor') {
            router.push("/vendor/verify");
          } else {
            router.push("/account");
          }
       }, 1500);
    } else {
        toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Invalid verification codes. Please try again.",
        });
        setIsLoading(false);
    }
  }


  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
      <Card className="w-full max-w-md">
        {step === 'details' ? (
          <form onSubmit={handleSignupSubmit}>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
              <CardDescription>Join ShopSphere to start buying and selling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 555-5555" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <Label htmlFor="password">Password</Label>
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
                    <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                     <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
                {password.length > 0 && (
                     <div className="flex items-center gap-2">
                        <Progress value={passwordStrength.score * 25} className={cn("h-1", passwordStrength.color)} />
                        <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                     </div>
                )}
              </div>
               <div className="space-y-2">
                 <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                    <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                     <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>I am a...</Label>
                <RadioGroup value={role} onValueChange={setRole} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="customer" id="customer" />
                        <Label htmlFor="customer" className="font-normal">Customer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="vendor" id="vendor" />
                        <Label htmlFor="vendor" className="font-normal">Vendor</Label>
                    </div>
                </RadioGroup>
              </div>

               <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-2">
                        <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
                        <Label htmlFor="terms" className="font-normal text-xs text-muted-foreground leading-snug">
                            I agree to the ShopSphere <Link href="#" className="font-medium text-primary hover:underline">Terms and Conditions</Link> and <Link href="#" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="newsletter" defaultChecked />
                        <Label htmlFor="newsletter" className="font-normal text-sm">Sign up for our newsletter</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="notifications" defaultChecked />
                        <Label htmlFor="notifications" className="font-normal text-sm">Receive email and phone notifications</Label>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                      Sign In
                  </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit}>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Verify Your Account</CardTitle>
              <CardDescription>Enter the codes sent to your email and phone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-otp">Email Verification Code</Label>
                <Input id="email-otp" type="text" placeholder="123456" required value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-otp">Phone Verification Code</Label>
                <Input id="phone-otp" type="text" placeholder="654321" required value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Verify and Sign Up
              </Button>
              <Button variant="link" size="sm" onClick={() => setStep('details')} className="text-muted-foreground">
                Back to previous step
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
