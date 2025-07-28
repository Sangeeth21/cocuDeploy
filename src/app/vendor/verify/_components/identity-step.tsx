
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, FileUp, Loader2, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function IdentityStep({ onComplete }: { onComplete: () => void }) {
    const { toast } = useToast();
    const [govtId, setGovtId] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<string | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);

            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
          }
        };

        getCameraPermission();
      }, []);

    const handleCaptureSelfie = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setSelfie(canvas.toDataURL('image/png'));
        }
    };
    
    const handleSubmit = () => {
        if (!govtId || !selfie) {
            toast({ variant: 'destructive', title: 'Please upload an ID and take a selfie.' });
            return;
        }
        setIsVerifying(true);
        // Placeholder for Stripe Identity verification
        setTimeout(() => {
            setIsVerifying(false);
            toast({ title: 'Identity Verification Submitted', description: 'This will be verified by Stripe Identity in a real application.' });
            onComplete();
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="govt-id-upload">Upload Government ID</Label>
                    <label
                        htmlFor="govt-id-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                    >
                        {govtId ? (
                             <p className="text-sm font-medium">{govtId.name}</p>
                        ) : (
                            <>
                                <FileUp className="h-8 w-8 text-muted-foreground"/>
                                <span className="text-sm text-muted-foreground text-center mt-1">
                                    Passport, Driver's License, etc.
                                </span>
                            </>
                        )}
                    </label>
                    <Input id="govt-id-upload" type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => e.target.files && setGovtId(e.target.files[0])} />
                </div>
                 <div className="space-y-2">
                    <Label>Live Selfie</Label>
                    <div className="relative w-full h-48 border rounded-md overflow-hidden bg-black">
                        {hasCameraPermission === false ? (
                             <div className="w-full h-full flex flex-col items-center justify-center text-white">
                                <Camera className="h-8 w-8 mb-2" />
                                <p className="text-sm">Camera access denied.</p>
                             </div>
                        ) : selfie ? (
                             <img src={selfie} alt="Selfie preview" className="w-full h-full object-cover" />
                        ) : (
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        )}
                    </div>
                     <Button variant="outline" className="w-full" onClick={selfie ? () => setSelfie(null) : handleCaptureSelfie} disabled={!hasCameraPermission}>
                        {selfie ? "Retake Selfie" : "Capture Selfie"}
                    </Button>
                </div>
            </div>
             <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isVerifying || !govtId || !selfie}>
                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save and Continue
                </Button>
            </div>
        </div>
    );
}
