
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, User, Package, MessageSquare, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notification } from '@/lib/types';


const reportTypeDetails: { [key: string]: { icon: React.ElementType, title: string } } = {
    user: { icon: User, title: "Reported User" },
    product: { icon: Package, title: "Flagged Product" },
    message: { icon: MessageSquare, title: "Flagged Message" }
};


export default function AdminModerationPage() {
    const { toast } = useToast();
    const [reports, setReports] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "notifications"), 
            where("type", "in", ["user_report", "product_report", "message_report"])
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reportsData: Notification[] = [];
            snapshot.forEach(doc => reportsData.push({ id: doc.id, ...doc.data() } as Notification));
            setReports(reportsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAction = async (report: Notification, action: "dismiss" | "warn" | "suspend" | "remove_product") => {
        let toastTitle = "";
        let toastDescription = "";

        switch(action) {
            case "dismiss":
                toastTitle = "Report Dismissed";
                toastDescription = `The report regarding "${report.text}" has been dismissed.`;
                break;
            case "warn":
                 toastTitle = "Warning Sent";
                 toastDescription = `A warning has been issued based on report ${report.id}.`;
                break;
            case "suspend":
                 toastTitle = "Account Suspended";
                 toastDescription = `An account has been suspended based on report ${report.id}.`;
                break;
            case "remove_product":
                 toastTitle = "Product Removed";
                 toastDescription = `A product has been removed based on report ${report.id}.`;
                break;
        }
        
        // Remove the report from the queue after action is taken
        await deleteDoc(doc(db, "notifications", report.id));

        toast({
            title: toastTitle,
            description: toastDescription,
        });
    };

    if (loading) {
        return <div className="text-center py-16">Loading moderation queue...</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Moderation Queue</h1>
                <p className="text-muted-foreground">Review and act on reports from users.</p>
            </div>

            {reports.length > 0 ? (
                 <div className="grid gap-6">
                    {reports.map(report => {
                        const details = reportTypeDetails[report.type] || reportTypeDetails.user;
                        const Icon = details.icon;

                        return (
                            <Card key={report.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-destructive/10 text-destructive p-2 rounded-full">
                                                <ShieldAlert className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{details.title}</CardTitle>
                                                <CardDescription>
                                                    Reported on {new Date(report.timestamp.toDate()).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <blockquote className="mt-1 border-l-2 pl-4 italic text-muted-foreground">"{report.text}"</blockquote>
                                </CardContent>
                                <CardFooter className="flex-wrap gap-2">
                                     <Button size="sm" variant="outline" onClick={() => handleAction(report, 'dismiss')}>
                                        <Check className="mr-2 h-4 w-4" /> Dismiss Report
                                    </Button>
                                    {report.type === 'product_report' ? (
                                        <Button size="sm" variant="destructive" onClick={() => handleAction(report, 'remove_product')}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Remove Product
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="sm" variant="secondary" onClick={() => handleAction(report, 'warn')}>Warn User</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleAction(report, 'suspend')}>Suspend Account</Button>
                                        </>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                 </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">Queue Clear!</h2>
                    <p className="mt-2 text-sm text-muted-foreground">There are no pending reports to review. Great job!</p>
                </div>
            )}
        </div>
    )
}
