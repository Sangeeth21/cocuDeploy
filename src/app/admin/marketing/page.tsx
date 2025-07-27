
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Copy, Trash2, Edit, Megaphone, Zap, Gift } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { MarketingCampaign } from "@/lib/types";

const mockCampaigns: MarketingCampaign[] = [
    {
        id: "CAMP001",
        name: "Summer Sale 2024",
        type: "Sale",
        status: "Active",
        startDate: "2024-06-01",
        endDate: "2024-06-30",
    },
    {
        id: "CAMP002",
        name: "New Electronics Launch",
        type: "Promotion",
        status: "Active",
        startDate: "2024-06-15",
        endDate: "2024-07-15",
    },
     {
        id: "CAMP003",
        name: "Weekend Flash Deals",
        type: "Flash Sale",
        status: "Scheduled",
        startDate: "2024-06-22",
        endDate: "2024-06-23",
    },
    {
        id: "CAMP004",
        name: "Holiday Freebies",
        type: "Freebie",
        status: "Finished",
        startDate: "2023-12-15",
        endDate: "2023-12-25",
    }
]

const campaignTypeIcons: { [key in MarketingCampaign['type']]: React.ElementType } = {
    'Sale': Megaphone,
    'Promotion': Gift,
    'Flash Sale': Zap,
    'Freebie': Gift,
    'Combo Offer': Gift,
}

export default function AdminMarketingPage() {

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Marketing Campaigns</h1>
                    <p className="text-muted-foreground">Create and manage your site-wide promotions and sales.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
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
                            {mockCampaigns.map(campaign => {
                                const Icon = campaignTypeIcons[campaign.type] || Megaphone;
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
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
    )
}
