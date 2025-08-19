
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, User, Building, Combine, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useVerification } from "@/context/vendor-verification-context";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { doc, setDoc } from "firebase/firestore";
import type { User as VendorUser } from "@/lib/types";

export default function VendorSignupPage() {
  const [step, setStep] = useState<"details" | "type" | "verified">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [vendorType, setVendorType] = useState<"personalized" | "corporate" | "both">();

  const router = useRouter();
  const { toast } = useToast();
  const { setAsUnverified, setVendorType: setContextVendorType } = useVerification();
  
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
            case 0: case 1: case 2: return 'bg-red-500';
            case 3: case 4: return 'bg-yellow-500';
            case 5: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
        toast({
            variant: "destructive",
            title: "Terms and Conditions",
            description: "You must agree to the Terms and Conditions to create an account.",
        });
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
    setStep("type");
  };

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!vendorType) {
        toast({ variant: "destructive", title: "Please select a vendor type." });
        return;
    }
    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);

        // Create user document in Firestore
        const newVendor: Omit<VendorUser, 'id'> = {
            name,
            email,
            phone,
            role: 'Vendor',
            status: 'Active', // Active but unverified
            joinedDate: new Date().toISOString().split('T')[0],
            avatar: 'https://placehold.co/40x40.png',
            vendorType,
            verificationStatus: 'unverified'
        };
        await setDoc(doc(db, "users", user.uid), newVendor);
        
        setAsUnverified();
        setContextVendorType(vendorType);
        
        toast({
            title: "Account Created!",
            description: "You're now logged in. Please check your email to verify your account and then complete the verification steps.",
        });

        router.push('/vendor/verify');

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Signup Failed",
            description: error.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : error.message
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
      <Card className="w-full max-w-md">
        {step === 'details' ? (
          <form onSubmit={handleDetailsSubmit}>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Become a Vendor</CardTitle>
              <CardDescription>Create your account to start selling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name or Business Name</Label>
                <Input id="name" type="text" placeholder="e.g. Timeless Co." required value={name} onChange={e => setName(e.target.value)} />
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
                    <Label htmlFor="vendor-password">Password</Label>
                    <div className="relative">
                        <Input 
                            id="vendor-password" 
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
                    <Label htmlFor="vendor-confirm-password">Confirm Password</Label>
                     <div className="relative">
                        <Input id="vendor-confirm-password" type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
        ) : (
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
                                    <span className="font-semibold">Both Channels</span>
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
                        Create Account
                    </Button>
                </CardFooter>
            </form>
        )}
      </Card>
    </div>
  );
}
