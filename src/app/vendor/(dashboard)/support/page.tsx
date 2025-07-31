
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, Mail, Phone } from "lucide-react";
import { useState } from "react";

export default function VendorSupportPage() {
    const { toast } = useToast();
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out both the subject and message fields.",
            });
            return;
        }
        
        toast({
            title: "Support Ticket Submitted",
            description: "Our team will get back to you shortly. You can track progress in your messages.",
        });

        // In a real app, this would create a ticket and a new conversation
        // that would appear in the vendor's message center.
        setSubject("");
        setMessage("");
    };

    return (
        <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Create a Support Ticket</CardTitle>
                            <CardDescription>
                                Have an issue or a question? Fill out the form below and our support team will get in touch.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input 
                                    id="subject" 
                                    placeholder="e.g., Payout issue, Question about listing" 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea 
                                    id="message" 
                                    placeholder="Please describe your issue in detail..." 
                                    rows={8}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardContent>
                             <Button type="submit">Submit Ticket</Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center gap-4">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <h4 className="font-semibold text-sm">Vendor Support Email</h4>
                                <a href="mailto:vendors@shopsphere.com" className="text-sm text-primary hover:underline">vendors@shopsphere.com</a>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <h4 className="font-semibold text-sm">Vendor Support Line</h4>
                                <a href="tel:+1234567891" className="text-sm text-primary hover:underline">+1 (234) 567-891</a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Help Center</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Looking for quick answers? Our Help Center is full of FAQs and guides.
                        </p>
                        <Button variant="outline" className="w-full">
                            <LifeBuoy className="mr-2 h-4 w-4" />
                            Visit Help Center
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
