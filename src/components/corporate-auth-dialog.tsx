
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building } from "lucide-react";
import { useAdminAuth } from "@/context/admin-auth-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCorporateAuthDialog } from "@/context/corporate-auth-dialog-context";

function CorporateLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { adminLogin } = useAdminAuth();
    const { closeDialog } = useCorporateAuthDialog();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === "corporate@example.com" && password === "corporatepass") {
            adminLogin();
            toast({
                title: "Corporate Login Successful",
                description: "Redirecting to the corporate dashboard.",
            });
            closeDialog();
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
            <Button type="submit" className="w-full">Sign In</Button>
        </form>
    );
}


export function CorporateAuthDialog() {
    const { isOpen, closeDialog } = useCorporateAuthDialog();

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                        <Building className="h-8 w-8" />
                    </div>
                    <DialogTitle className="text-3xl font-headline">Corporate Portal</DialogTitle>
                    <DialogDescription>Sign in to your corporate account.</DialogDescription>
                </DialogHeader>
                <div className="pt-4">
                    <CorporateLoginForm />
                </div>
            </DialogContent>
        </Dialog>
    );
}
