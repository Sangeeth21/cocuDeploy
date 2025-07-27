"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "vendor@example.com" && password === "vendorpass") {
      toast({
        title: "Login Successful",
        description: "Redirecting to your vendor dashboard.",
      });
      router.push("/vendor/dashboard");
    } else if (email && password) {
      // For any other credentials, redirect to customer account
      toast({
        title: "Login Successful",
        description: "Redirecting to your account.",
      });
      router.push("/account");
    } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Please enter both email and password.",
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot your password?
                  </Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">Sign In</Button>
            <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                    Sign Up
                </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
