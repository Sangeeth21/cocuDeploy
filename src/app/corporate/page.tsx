
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building } from "lucide-react";
import { useAdminAuth } from "@/context/admin-auth-context";
import Link from "next/link";
import { AdminAuthProvider } from "@/context/admin-auth-context";
import { VerificationProvider } from "@/context/vendor-verification-context";

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
      router.replace("/corporate/dashboard");
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
             <div className="flex items-center justify-between">
                <Label htmlFor="corporate-password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot your password?
                </Link>
            </div>
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
            <CardHeader className="text-center">
                 <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <Building className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-headline">Corporate Portal</CardTitle>
                <CardDescription>Sign in to your corporate account.</CardDescription>
            </CardHeader>
            <CardContent>
                <CorporateLoginForm />
            </CardContent>
        </Card>
    )
}

export default function CorporatePage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 bg-muted/40">
             <AdminAuthProvider>
                <CorporatePageContent />
            </AdminAuthProvider>
        </div>
    )
}
