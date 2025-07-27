
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, User, Package, MessageSquare, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


type ReportType = "user" | "product" | "message";

interface Report {
    id: string;
    type: ReportType;
    targetId: string;
    targetName: string;
    reporterId: string;
    reporterName: string;
    reason: string;
    date: string;
    targetAvatar?: string;
}

const mockReports: Report[] = [
    {
        id: "REP001",
        type: "user",
        targetId: "USR004",
        targetName: "Crafty Creations",
        reporterId: "USR003",
        reporterName: "Jackson Lee",
        reason: "Vendor is unresponsive and has not shipped the order after 2 weeks.",
        date: "2024-06-20",
        targetAvatar: "https://placehold.co/40x40.png"
    },
    {
        id: "REP002",
        type: "product",
        targetId: "PROD009",
        targetName: "Hand-poured Soy Candle",
        reporterId: "USR005",
        reporterName: "Isabella Nguyen",
        reason: "Product description is misleading. The scent is completely different from what was advertised.",
        date: "2024-06-19",
        targetAvatar: "https://placehold.co/400x400.png"
    },
    {
        id: "REP003",
        type: "message",
        targetId: "CUST001",
        targetName: "Olivia Martin",
        reporterId: "VDR002",
        reporterName: "Gadget Guru",
        reason: "Customer is using inappropriate language in chat messages.",
        date: "2024-06-18",
        targetAvatar: "https://placehold.co/40x40.png"
    }
];

const reportTypeDetails: { [key in ReportType]: { icon: React.ElementType, title: string } } = {
    user: { icon: User, title: "Reported User" },
    product: { icon: Package, title: "Flagged Product" },
    message: { icon: MessageSquare, title: "Flagged Message" }
};


export default function AdminModerationPage() {
    const { toast } = useToast();
    const [reports, setReports] = useState(mockReports);

    const handleAction = (reportId: string, action: "dismiss" | "warn" | "suspend" | "remove_product") => {
        const report = reports.find(r => r.id === reportId);
        if (!report) return;

        let toastTitle = "";
        let toastDescription = "";

        switch(action) {
            case "dismiss":
                toastTitle = "Report Dismissed";
                toastDescription = `The report against ${report.targetName} has been dismissed.`;
                break;
            case "warn":
                 toastTitle = "Warning Sent";
                 toastDescription = `A warning has been issued to ${report.targetName}.`;
                break;
            case "suspend":
                 toastTitle = "Account Suspended";
                 toastDescription = `The account for ${report.targetName} has been suspended.`;
                break;
            case "remove_product":
                 toastTitle = "Product Removed";
                 toastDescription = `The product "${report.targetName}" has been removed from the store.`;
                break;
        }

        toast({
            title: toastTitle,
            description: toastDescription,
        });

        setReports(prev => prev.filter(r => r.id !== reportId));
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Moderation Queue</h1>
                <p className="text-muted-foreground">Review and act on reports from users.</p>
            </div>

            {reports.length > 0 ? (
                 <div className="grid gap-6">
                    {reports.map(report => {
                        const details = reportTypeDetails[report.type];
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
                                                <CardTitle className="text-lg">{details.title}: {report.targetName}</CardTitle>
                                                <CardDescription>
                                                    Reported by {report.reporterName} ({report.reporterId}) on {report.date}
                                                </CardDescription>
                                            </div>
                                        </div>
                                         <Avatar className="hidden sm:block">
                                            <AvatarImage src={report.targetAvatar} alt={report.targetName} data-ai-hint="company logo person face" />
                                            <AvatarFallback>{report.targetName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-semibold">Reason for report:</p>
                                    <blockquote className="mt-1 border-l-2 pl-4 italic text-muted-foreground">"{report.reason}"</blockquote>
                                </CardContent>
                                <CardFooter className="flex-wrap gap-2">
                                     <Button size="sm" variant="outline" onClick={() => handleAction(report.id, 'dismiss')}>
                                        <Check className="mr-2 h-4 w-4" /> Dismiss Report
                                    </Button>
                                    {report.type === 'product' ? (
                                        <Button size="sm" variant="destructive" onClick={() => handleAction(report.id, 'remove_product')}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Remove Product
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="sm" variant="secondary" onClick={() => handleAction(report.id, 'warn')}>Warn {report.type === "user" ? "User" : "Customer"}</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleAction(report.id, 'suspend')}>Suspend Account</Button>
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
