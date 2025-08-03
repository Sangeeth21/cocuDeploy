
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Copy, Trash2, Edit, Megaphone, Zap, Gift, Building } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { MarketingCampaign } from "@/lib/types";
import Link from "next/link";
import { mockCorporateCampaigns as initialCampaigns } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";


const campaignTypeIcons: { [key in MarketingCampaign['type']]: React.ElementType } = {
    'Sale': Megaphone,
    'Promotion': Gift,
    'Flash Sale': Zap,
    'Freebie': Gift,
    'Combo Offer': Gift,
}

export default function AdminCorporateMarketingPage() {
    const { toast } = useToast();
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(initialCampaigns);
    const [campaignToDelete, setCampaignToDelete] = useState<MarketingCampaign | null>(null);

    const handleDuplicate = (campaignId: string) => {
        const campaignToDuplicate = campaigns.find(c => c.id === campaignId);
        if (!campaignToDuplicate) return;

        const newCampaign: MarketingCampaign = {
            ...campaignToDuplicate,
            id: `CORP_CAMP${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            name: `${campaignToDuplicate.name} (Copy)`,
            status: 'Draft'
        };

        setCampaigns(prev => [newCampaign, ...prev]);
        toast({
            title: "Campaign Duplicated",
            description: `"${campaignToDuplicate.name}" has been duplicated.`,
        });
    }

    const handleDelete = () => {
        if (!campaignToDelete) return;
        
        setCampaigns(prev => prev.filter(c => c.id !== campaignToDelete.id));
        toast({
            variant: "destructive",
            title: "Campaign Deleted",
            description: `"${campaignToDelete.name}" has been deleted.`,
        });
        setCampaignToDelete(null);
    }

    return (
        <AlertDialog>
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Corporate Marketing</h1>
                        <p className="text-muted-foreground">Manage promotions for your B2B clients.</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/corporate-marketing/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Start Date</TableHead>
                                    <TableHead className="hidden md:table-cell">End Date</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map(campaign => {
                                    const Icon = campaignTypeIcons[campaign.type] || Building;
                                    return (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-medium">{campaign.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-muted-foreground"/>
                                                <span>{campaign.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={campaign.status === 'Active' ? 'default' : campaign.status === 'Finished' ? 'secondary' : 'outline'}>
                                                {campaign.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{campaign.startDate}</TableCell>
                                        <TableCell className="hidden md:table-cell">{campaign.endDate}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/corporate-marketing/new?id=${campaign.id}`}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(campaign.id)}>
                                                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                    </DropdownMenuItem>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive" onSelect={() => setCampaignToDelete(campaign)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the campaign
                        "{campaignToDelete?.name}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCampaignToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
