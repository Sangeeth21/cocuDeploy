
"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmailVerification } from '@/components/auth/email-verification';
import { PasswordReset } from '@/components/auth/password-reset';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function AuthActionContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (!mode || !oobCode) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Invalid Link</CardTitle>
                    <CardDescription>This link is either invalid or has expired. Please try again.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    switch (mode) {
        case 'verifyEmail':
            return <EmailVerification oobCode={oobCode} />;
        case 'resetPassword':
            return <PasswordReset oobCode={oobCode} />;
        default:
            return (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Unsupported Action</CardTitle>
                        <CardDescription>This action is not supported.</CardDescription>
                    </CardHeader>
                </Card>
            );
    }
}


export default function AuthActionPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <AuthActionContent />
            </Suspense>
        </div>
    );
}
