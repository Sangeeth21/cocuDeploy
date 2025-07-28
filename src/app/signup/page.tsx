
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const MOCK_EMAIL_OTP = "123456";
const MOCK_PHONE_OTP = "654321";

export default function SignupPage() {
  const [step, setStep] = useState<"details" | "verify">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const router = useRouter();
  const { toast } = useToast();

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending OTPs
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
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 555-5555" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} required />
                     <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
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
