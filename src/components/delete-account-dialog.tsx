
"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/context/user-context"
import { auth, db } from "@/lib/firebase"
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth"
import { doc, deleteDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function DeleteAccountDialog() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState("");
    const [confirmationText, setConfirmationText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const { toast } = useToast();
    const { user, logout } = useUser();
    const router = useRouter();

    const handleReauthenticate = async () => {
        if (!user || !user.email || !password) {
            toast({ variant: 'destructive', title: 'Password is required.' });
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
             toast({ variant: 'destructive', title: 'Not logged in.' });
            return;
        }

        setIsLoading(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email!, password);
            await reauthenticateWithCredential(currentUser, credential);
            toast({ title: 'Identity confirmed.' });
            setStep(2);
        } catch (error) {
            console.error("Reauthentication error:", error);
            toast({ variant: 'destructive', title: 'Authentication Failed', description: 'Incorrect password. Please try again.' });
        } finally {
            setIsLoading(false);
            setPassword("");
        }
    }
    
    const handleDeleteAccount = async () => {
        if (confirmationText !== 'DELETE') {
            toast({ variant: 'destructive', title: 'Confirmation text does not match.' });
            return;
        }
        
        const currentUser = auth.currentUser;
        if (!currentUser || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'No authenticated user found.' });
            return;
        }

        setIsLoading(true);
        try {
            // Delete user from Firestore
            await deleteDoc(doc(db, "users", currentUser.uid));
            
            // Delete user from Firebase Auth
            await deleteUser(currentUser);

            toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
            await logout();
            router.push('/');
            setOpen(false);

        } catch (error) {
            console.error("Error deleting account:", error);
            toast({ variant: 'destructive', title: 'Deletion Failed', description: 'An error occurred while deleting your account.' });
        } finally {
            setIsLoading(false);
        }
    }
    
    const resetState = () => {
        setStep(1);
        setPassword('');
        setConfirmationText('');
        setIsLoading(false);
    }

    return (
        <AlertDialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                resetState();
            }
        }}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete My Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                       {step === 1 
                           ? "This is a sensitive action. To continue, please re-enter your password to confirm your identity."
                           : "This action cannot be undone. To permanently delete your account, type DELETE below."
                       }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                {step === 1 && (
                    <div className="space-y-2 py-2">
                        <Label htmlFor="password-confirm">Password</Label>
                        <Input 
                            id="password-confirm" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                )}
                
                {step === 2 && (
                     <div className="space-y-2 py-2">
                        <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
                        <Input 
                            id="delete-confirm" 
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="DELETE"
                        />
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={resetState}>Cancel</AlertDialogCancel>
                    {step === 1 ? (
                        <Button onClick={handleReauthenticate} disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Confirm Identity
                        </Button>
                    ) : (
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90" disabled={isLoading || confirmationText !== 'DELETE'}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Delete Account Permanently
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
