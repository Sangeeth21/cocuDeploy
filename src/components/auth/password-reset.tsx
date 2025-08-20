
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode, getAuth } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';

type ResetStatus = 'loading' | 'form' | 'success' | 'error';

export function PasswordReset({ oobCode }: { oobCode: string }) {
    const [status, setStatus] = useState<ResetStatus>('loading');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const auth = getAuth();

    useEffect(() => {
        const handleVerifyCode = async () => {
            try {
                await verifyPasswordResetCode(auth, oobCode);
                setStatus('form');
            } catch (err) {
                console.error(err);
                setError('Invalid or expired password reset link. Please request a new one.');
                setStatus('error');
            }
        };
        handleVerifyCode();
    }, [auth, oobCode]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setStatus('success');
            toast({ title: 'Password Reset Successfully!', description: 'You can now log in with your new password.' });
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
            setStatus('error');
        }
    };
    
    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                );
            case 'form':
                return (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-muted"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full">Reset Password</Button>
                    </form>
                );
            case 'success':
                 return (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <CardDescription>Your password has been reset. Please log in with your new password.</CardDescription>
                        <Button onClick={() => router.push('/vendor/login')}>Go to Login</Button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <XCircle className="h-12 w-12 text-destructive" />
                        <CardDescription>{error}</CardDescription>
                         <Button onClick={() => router.push('/vendor/login')}>Back to Login</Button>
                    </div>
                );
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>Reset Your Password</CardTitle>
                 {status === 'form' && <CardDescription>Enter your new password below.</CardDescription>}
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
