
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
import { Loader2, Eye, EyeOff, Info, Check, User, Building, Combine } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const MOCK_EMAIL_OTP = "123456";
const MOCK_PHONE_OTP = "654321";

export default function VendorSignupPage() {
  const [step, setStep] = useState<"details" | "type" | "verify">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [vendorType, setVendorType] = useState<"personalized" | "corporate" | "both">();
  
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

    if (email === 'test-vendor@example.com') {
        toast({
            title: "Signup Bypassed for Testing",
            description: "Please log in with the unverified vendor account to test the verification flow.",
        });
        router.push('/vendor/login');
        return;
    }

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
    setStep("type");
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!vendorType) {
        toast({
            variant: "destructive",
            title: "Please select a vendor type.",
        });
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
          router.push("/vendor/verify");
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

  const renderCriteriaCheck = (label: string, isMet: boolean) => (
    <div className={cn("flex items-center text-xs gap-2", isMet ? "text-green-600" : "text-muted-foreground")}>
        <Check className="h-3 w-3" />
        <span>{label}</span>
    </div>
  );


  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
      <Card className="w-full max-w-md">
        {step === 'details' ? (
          <form onSubmit={handleDetailsSubmit}>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Become a Vendor</CardTitle>
              <CardDescription>Create your vendor account to start selling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name or Business Name</Label>
                <Input id="name" type="text" placeholder="e.g. Timeless Co." required />
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
                    <Input 
                        id="password" 
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
                 {isPasswordFocused && (
                    <div className="space-y-2">
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
                 <div className="flex items-center gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                     <TooltipProvider delayDuration={0}>
                         <Tooltip>
                            <TooltipTrigger type="button"><Info className="h-3 w-3 text-muted-foreground"/></TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Passwords must match.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="relative">
                    <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                     <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
              </div>
              
               <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-2">
                        <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
                        <Label htmlFor="terms" className="font-normal text-xs text-muted-foreground leading-snug">
                            I agree to the Co & Cu <Link href="#" className="font-medium text-primary hover:underline">Vendor Terms and Conditions</Link> and <Link href="#" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
                        </Label>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">
                Continue
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                  Already have a vendor account?{" "}
                  <Link href="/vendor/login" className="font-semibold text-primary hover:underline">
                      Sign In
                  </Link>
              </p>
            </CardFooter>
          </form>
        ) : step === 'type' ? (
             <form onSubmit={handleTypeSubmit}>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">Select Vendor Type</CardTitle>
                    <CardDescription>Choose the type of business you operate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={vendorType} onValueChange={(v) => setVendorType(v as any)} className="space-y-4">
                        <Label htmlFor="type-personalized" className="flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <div className="flex items-center gap-4">
                                <RadioGroupItem value="personalized" id="type-personalized" />
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    <span className="font-semibold">Personalized Retail</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 ml-8">Sell individual items directly to customers. Perfect for artisans and small-scale sellers.</p>
                        </Label>
                        <Label htmlFor="type-corporate" className="flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                             <div className="flex items-center gap-4">
                                <RadioGroupItem value="corporate" id="type-corporate" />
                                <div className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    <span className="font-semibold">Corporate & Bulk Sales</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 ml-8">Fulfill bulk orders and participate in corporate bid requests. Ideal for wholesale suppliers.</p>
                        </Label>
                         <Label htmlFor="type-both" className="flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <div className="flex items-center gap-4">
                                <RadioGroupItem value="both" id="type-both" />
                                 <div className="flex items-center gap-2">
                                    <Combine className="h-5 w-5" />
                                    <span className="font-semibold">Both</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 ml-8">Engage in both personalized retail and corporate bulk sales.</p>
                        </Label>
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="ghost" onClick={() => setStep('details')}>Back</Button>
                    <Button type="submit" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next
                    </Button>
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
                 Verify and Continue
              </Button>
              <Button variant="link" size="sm" onClick={() => setStep('type')} className="w-full text-muted-foreground">
                Back to previous step
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
