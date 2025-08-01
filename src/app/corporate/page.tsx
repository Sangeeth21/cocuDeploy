
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building, Store } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVerification } from "@/context/vendor-verification-context";
import { useAdminAuth } from "@/context/admin-auth-context";
import Link from "next/link";
import { AdminAuthProvider } from "@/context/admin-auth-context";

function VendorLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setAsVerified, setAsUnverified } = useVerification();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "vendor@example.com" && password === "vendorpass") {
      setAsVerified();
      toast({
        title: "Login Successful",
        description: "Redirecting to your vendor dashboard.",
      });
      router.push("/vendor/dashboard");
    } else if (email === "unverified@example.com" && password === "vendorpass") {
        setAsUnverified();
         toast({
            title: "Login Successful",
            description: "Please complete your verification.",
        });
        router.push("/vendor/dashboard");
    }
    else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
        });
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="vendor-email">Vendor Email</Label>
            <Input id="vendor-email" type="email" placeholder="vendor@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="vendor-password">Password</Label>
            <div className="relative">
            <Input id="vendor-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
            </Button>
            </div>
        </div>
        <Button type="submit" className="w-full">Sign In to Vendor Portal</Button>
        <p className="text-sm text-center text-muted-foreground">
            New vendor?{" "}
            <Link href="/vendor/signup" className="font-semibold text-primary hover:underline">
                Sign Up
            </Link>
        </p>
    </form>
  )
}


function CorporateLoginForm() {
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
      router.push("/admin");
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
            <Label htmlFor="corporate-email">Corporate Email</Label>
            <Input id="corporate-email" type="email" placeholder="corporate@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="corporate-password">Password</Label>
            <div className="relative">
            <Input id="corporate-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
            </Button>
            </div>
        </div>
        <Button type="submit" className="w-full">Sign In to Corporate Dashboard</Button>
    </form>
  )
}


function CorporatePageContent() {
    return (
        <Card className="w-full max-w-md">
            <Tabs defaultValue="vendor">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline">Business Portal</CardTitle>
                <CardDescription>Sign in to your respective dashboard.</CardDescription>
                 <TabsList className="grid w-full grid-cols-2 mt-4">
                    <TabsTrigger value="vendor"><Store className="h-4 w-4 mr-2"/> Vendor</TabsTrigger>
                    <TabsTrigger value="corporate"><Building className="h-4 w-4 mr-2"/> Corporate</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
                <TabsContent value="vendor">
                   <VendorLoginForm />
                </TabsContent>
                <TabsContent value="corporate">
                    <AdminAuthProvider>
                        <CorporateLoginForm />
                    </AdminAuthProvider>
                </TabsContent>
            </CardContent>
            </Tabs>
        </Card>
    )
}

export default function CorporatePage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 bg-muted/40">
            <CorporatePageContent />
        </div>
    )
}
