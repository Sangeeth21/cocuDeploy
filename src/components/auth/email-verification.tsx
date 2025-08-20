
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { applyActionCode, getAuth } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

type VerificationStatus = 'verifying' | 'success' | 'error';

export function EmailVerification({ oobCode }: { oobCode: string }) {
    const [status, setStatus] = useState<VerificationStatus>('verifying');
    const [error, setError] = useState('');
    const router = useRouter();
    const auth = getAuth();

    useEffect(() => {
        const handleVerifyEmail = async () => {
            try {
                await applyActionCode(auth, oobCode);
                setStatus('success');
            } catch (err: any) {
                console.error(err);
                setError('Invalid or expired verification link. Please request a new one.');
                setStatus('error');
            }
        };

        handleVerifyEmail();
    }, [auth, oobCode]);

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <CardDescription>Verifying your email...</CardDescription>
                    </div>
                );
            case 'success':
                return (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <CardDescription>Your email has been verified successfully. You can now log in.</CardDescription>
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
                <CardTitle>Email Verification</CardTitle>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
