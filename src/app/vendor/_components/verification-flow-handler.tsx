
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useVerification } from "@/context/vendor-verification-context";
import { ShieldAlert } from "lucide-react";
import { PublishDraftsDialog } from "./publish-drafts-dialog";
import { verificationSteps } from "../verify/page";

const PROMPT_CLOSE_COUNT_KEY = 'shopsphere_verification_prompt_close_count';
const MAX_PROMPT_CLOSES = 5;

export function VerificationFlowHandler() {
    const router = useRouter();
    const { 
        isVerified, 
        promptState, 
        setPromptState,
        draftProducts,
        removeDrafts,
        completedSteps
    } = useVerification();
    const [closeCount, setCloseCount] = useState(0);

    // Load close count from localStorage on mount
    useEffect(() => {
        try {
            const count = parseInt(localStorage.getItem(PROMPT_CLOSE_COUNT_KEY) || '0', 10);
            setCloseCount(count);
        } catch (e) {
            console.error("Could not parse prompt close count from localStorage", e);
        }
    }, []);
    
    // Show the initial prompt if user is unverified and hasn't seen it yet
    useEffect(() => {
        if (!isVerified && promptState === 'initial') {
            if (closeCount < MAX_PROMPT_CLOSES) {
                 // Automatically show the dialog on the first visit or if it hasn't been permanently dismissed
                 setPromptState('prompting');
            } else {
                setPromptState('permanently_dismissed');
            }
        }
    }, [isVerified, promptState, setPromptState, closeCount]);
    
    
    const handleGoToDashboard = () => {
        const newCount = closeCount + 1;
        localStorage.setItem(PROMPT_CLOSE_COUNT_KEY, newCount.toString());
        setCloseCount(newCount);
        setPromptState(newCount >= MAX_PROMPT_CLOSES ? 'permanently_dismissed' : 'dismissed');
    };

    const handleCompleteVerification = () => {
        setPromptState('dismissed');
        router.push('/vendor/verify');
    };
    
    const handlePublishDrafts = (selectedIds: string[]) => {
        // In a real app, this would make an API call to update the product statuses
        console.log("Publishing products:", selectedIds);
        removeDrafts(selectedIds);
        setPromptState('dismissed');
    };

    if (isVerified) {
        if (promptState === 'show_draft_publish') {
             return (
                <PublishDraftsDialog 
                    drafts={draftProducts}
                    open={true}
                    onOpenChange={(open) => { if (!open) setPromptState('dismissed') }}
                    onPublish={handlePublishDrafts}
                />
            );
        }
        return null;
    }
    
    const totalSteps = verificationSteps.length;
    const completedRequiredSteps = verificationSteps.filter(s => !s.isOptional && completedSteps.includes(s.id)).length;
    const totalRequiredSteps = verificationSteps.filter(s => !s.isOptional).length;
    const remainingSteps = totalSteps - completedSteps.length;

    // Non-blocking banner for the dashboard
    if (promptState === 'dismissed' || promptState === 'permanently_dismissed') {
        return (
             <div className="bg-accent/20 border-l-4 border-accent text-accent-foreground p-4 mb-6" role="alert">
                <div className="flex">
                    <div className="py-1"><ShieldAlert className="h-5 w-5 text-accent" /></div>
                    <div className="ml-3">
                         <p className="font-bold">
                            {completedSteps.length > 0 ? 
                                `Just ${remainingSteps} step(s) left!`
                                : 'Verification Required'
                            }
                         </p>
                        <p className="text-sm">
                            {promptState === 'permanently_dismissed' 
                                ? 'Your products will remain as drafts until you complete verification.' 
                                : 'Please complete your account verification to publish products and receive orders.'
                            }
                        </p>
                         <Button size="sm" className="mt-2" variant="outline" onClick={() => router.push('/vendor/verify')}>
                            {completedSteps.length > 0 ? 'Continue Verification' : 'Start Verification'}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Dialog open={promptState === 'prompting'} onOpenChange={handleGoToDashboard}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Welcome to ShopSphere!</DialogTitle>
                    <DialogDescription>
                        Complete your verification to start selling, or explore the dashboard first.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={handleGoToDashboard}>Go to Dashboard</Button>
                    <Button onClick={handleCompleteVerification}>Complete Verification</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
