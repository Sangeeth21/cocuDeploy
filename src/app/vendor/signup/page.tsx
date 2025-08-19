
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
import { Loader2, Info, Check, User, Building, Combine } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendSignInLinkToEmail } from "firebase/auth";

const actionCodeSettings = {
    url: typeof window !== 'undefined' ? `${window.location.origin}/vendor/verify` : 'http://localhost:3000/vendor/verify',
    handleCodeInApp: true,
};

export default function VendorSignupPage() {
  const [step, setStep] = useState<"details" | "type" | "magic-link-sent">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [vendorType, setVendorType] = useState<"personalized" | "corporate" | "both">();

  const router = useRouter();
  const { toast } = useToast();

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
    setStep("type");
  };

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!vendorType) {
        toast({
            variant: "destructive",
            title: "Please select a vendor type.",
        });
        return;
    }
    setIsLoading(true);
    try {
        // In a real app, you would first create the user document in Firestore with their details
        // before sending the sign-in link, to store their vendorType, name, etc.
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email); // To pre-fill email on the landing device
        setStep('magic-link-sent');
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
        ) : (
             <CardContent className="pt-6 text-center space-y-4">
                <Check className="h-12 w-12 mx-auto text-green-500" />
                <h3 className="text-lg font-semibold">Check your email to finish signing up!</h3>
                <p className="text-muted-foreground">A confirmation link has been sent to <strong>{email}</strong>. Check your inbox and click the link to sign in and begin verification.</p>
                <Button variant="link" onClick={() => setStep('details')}>Use a different email</Button>
            </CardContent>
        )}
      </Card>
    </div>
  );
}
