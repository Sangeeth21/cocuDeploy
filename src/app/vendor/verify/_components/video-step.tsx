
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Check, Loader2, VideoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function VideoStep({ onComplete }: { onComplete: () => void }) {
    const { toast } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };

      getCameraPermission();

      return () => {
        if(timerRef.current) clearInterval(timerRef.current);
      }
    }, [toast]);

    const startRecording = () => {
        setIsRecording(true);
        setVideoUrl(null);
        setRecordingTime(0);

        timerRef.current = setInterval(() => {
            setRecordingTime(prev => {
                const newTime = prev + 1;
                if (newTime >= 20) {
                    stopRecording();
                }
                return newTime;
            });
        }, 1000);
    };

    const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        // Placeholder for actual video blob URL
        setVideoUrl("blob:mock_video_url");
        toast({ title: "Recording complete!", description: "Review your video or record again." });
    };

    const handleRecordClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };
    
    const handleSave = () => {
        toast({ title: 'Video Saved!', description: 'In a real app, this would be uploaded to storage.' });
        onComplete();
    };

    return (
        <div className="space-y-6">
            <Alert>
                <AlertTitle className="font-semibold">Instructions</AlertTitle>
                <AlertDescription>
                    Record a 15-20 second video saying, "Hi, I’m [Your Name] from [Your Business Name]," and show a brief pan of your shop or workspace.
                </AlertDescription>
            </Alert>
            <div className="aspect-video w-full rounded-lg border bg-black flex items-center justify-center overflow-hidden">
                {videoUrl ? (
                    <video src={videoUrl} controls className="w-full h-full" />
                ) : (
                    hasCameraPermission === false ? (
                        <div className="text-white text-center">
                            <Camera className="h-12 w-12 mx-auto mb-2" />
                            <p>Camera access is required for this step.</p>
                        </div>
                    ) : (
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    )
                )}
            </div>

            {isRecording && (
                <div className="space-y-2">
                    <Progress value={(recordingTime / 20) * 100} />
                    <p className="text-sm text-center text-muted-foreground">{recordingTime}s / 20s</p>
                </div>
            )}

            <div className="flex justify-center gap-4">
                <Button onClick={handleRecordClick} disabled={hasCameraPermission === false}>
                    <VideoIcon className="mr-2 h-4 w-4" />
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
            </div>
            
             <div className="flex justify-end">
                <Button onClick={handleSave} disabled={!videoUrl}>
                    Save and Continue
                </Button>
            </div>
        </div>
    );
}
