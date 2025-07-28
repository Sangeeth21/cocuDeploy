
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Percent, Gift, Trophy, PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Users, Store } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


type ProgramTarget = 'customer' | 'vendor';

type Program = {
    id: string;
    name: string;
    target: ProgramTarget;
    type: string;
    reward: {
        type: string;
        value: number;
    };
    productScope: 'all' | 'selected';
    status: 'Active' | 'Scheduled' | 'Expired';
    startDate: Date;
    endDate: Date;
    expiryDays?: number;
};

const initialPrograms: Program[] = [
    {
        id: 'PROG001',
        name: 'New Customer Referral',
        target: 'customer',
        type: 'referral',
        reward: { type: 'wallet_credit', value: 100 },
        productScope: 'all',
        status: 'Active',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
    },
    {
        id: 'PROG002',
        name: 'Frequent Buyer Reward',
        target: 'customer',
        type: 'milestone',
        reward: { type: 'free_shipping', value: 2 },
        productScope: 'selected',
        status: 'Active',
        startDate: new Date(2024, 5, 1),
        endDate: new Date(2024, 6, 31),
        expiryDays: 60
    },
     {
        id: 'PROG003',
        name: 'Vendor Referral',
        target: 'vendor',
        type: 'referral',
        reward: { type: 'commission_discount', value: 1 },
        productScope: 'all',
        status: 'Scheduled',
        startDate: new Date(2024, 7, 1),
        endDate: new Date(2024, 9, 30),
    }
];


const programOptions = {
    customer: {
        types: [
            { value: 'referral', label: 'Referral Program' },
            { value: 'milestone', label: 'Purchase Milestone' },
        ],
        rewards: [
            { value: 'wallet_credit', label: 'Wallet Credit (₹)' },
            { value: 'discount_percent', label: 'Percentage Discount (%)' },
            { value: 'free_shipping', label: 'Free Shipping (Orders)' },
        ]
    },
    vendor: {
        types: [
            { value: 'referral', label: 'Vendor Referral' },
            { value: 'onboarding', label: 'Onboarding Bonus' },
        ],
        rewards: [
            { value: 'commission_discount', label: 'Commission Discount (%)' },
            { value: 'commission_free_sales', label: 'Commission-Free Sales (Orders)' },
        ]
    }
}


function CreateProgramDialog({ onSave }: { onSave: (program: Program) => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [targetAudience, setTargetAudience] = useState<ProgramTarget | ''>('');
    const [type, setType] = useState('');
    const [rewardType, setRewardType] = useState('');
    const [rewardValue, setRewardValue] = useState(0);
    const [productScope, setProductScope] = useState('all');
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [expiryDays, setExpiryDays] = useState<number | undefined>();
    
    const resetForm = () => {
        setName('');
        setTargetAudience('');
        setType('');
        setRewardType('');
        setRewardValue(0);
        setProductScope('all');
        setDate(undefined);
        setExpiryDays(undefined);
    }
    
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm();
        }
        setOpen(isOpen);
    }

    const handleSave = () => {
        const newProgram: Program = {
            id: `PROG${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            name,
            target: targetAudience as ProgramTarget,
            type: type,
            reward: { type: rewardType, value: rewardValue },
            productScope: productScope as any,
            startDate: date!.from!,
            endDate: date!.to!,
            expiryDays,
            status: 'Active'
        };
        onSave(newProgram);
        setOpen(false);
        resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Program
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Loyalty Program</DialogTitle>
                    <DialogDescription>Define the rules and rewards for a new program.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="program-name">Program Name</Label>
                        <Input id="program-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Summer Referral Bonanza" />
                    </div>
                     <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select value={targetAudience} onValueChange={(value) => setTargetAudience(value as ProgramTarget)}>
                            <SelectTrigger><SelectValue placeholder="Select audience..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Program Type</Label>
                        <Select value={type} onValueChange={setType} disabled={!targetAudience}>
                            <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                            <SelectContent>
                                {targetAudience && programOptions[targetAudience].types.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Reward Type</Label>
                         <Select value={rewardType} onValueChange={setRewardType} disabled={!targetAudience}>
                            <SelectTrigger><SelectValue placeholder="Select reward..." /></SelectTrigger>
                            <SelectContent>
                                {targetAudience && programOptions[targetAudience].rewards.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Reward Value / Condition</Label>
                        <Input type="number" value={rewardValue || ''} onChange={e => setRewardValue(Number(e.target.value))} />
                         <p className="text-xs text-muted-foreground">E.g., 100 for wallet, 15 for %, 5 for # of orders/referrals.</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Product Scope</Label>
                        <Select value={productScope} onValueChange={setProductScope}>
                             <SelectTrigger><SelectValue /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="all">All Products</SelectItem>
                                <SelectItem value="selected">Selected Products Only</SelectItem>
                            </SelectContent>
                        </Select>
                         {productScope === 'selected' && <Button variant="outline" size="sm" className="mt-2 w-full">Select Products</Button>}
                    </div>
                     <div className="space-y-2">
                        <Label>Program Duration</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button id="date" variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")
                                    ) : (<span>Pick a date range</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="range" selected={date} onSelect={setDate} numberOfMonths={2} />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="expiry-days">Reward Expiry (Optional)</Label>
                        <Input id="expiry-days" type="number" value={expiryDays || ''} onChange={e => setExpiryDays(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g., 30" />
                        <p className="text-xs text-muted-foreground">Number of days the reward is valid for the user after being earned.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Program</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function ReferralsPage() {
    const { toast } = useToast();
    const [programs, setPrograms] = useState<Program[]>(initialPrograms);

    const handleAddProgram = (newProgram: Program) => {
        setPrograms(prev => [newProgram, ...prev]);
        toast({
            title: "Program Created!",
            description: `"${newProgram.name}" has been successfully added.`,
        });
    }

    const getStatusVariant = (status: Program['status']) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Scheduled': return 'secondary';
            case 'Expired': return 'outline';
            default: return 'outline';
        }
    }

    const getRewardIcon = (type: Program['reward']['type']) => {
        switch (type) {
            case 'wallet_credit': return <DollarSign className="h-4 w-4 text-muted-foreground" />;
            case 'discount_percent': return <Percent className="h-4 w-4 text-muted-foreground" />;
            case 'commission_discount': return <Percent className="h-4 w-4 text-muted-foreground" />;
            case 'free_shipping': return <Gift className="h-4 w-4 text-muted-foreground" />;
            default: return <Trophy className="h-4 w-4 text-muted-foreground" />;
        }
    }
    
    const getTargetIcon = (target: ProgramTarget) => {
        switch(target) {
            case 'customer': return <Users className="h-4 w-4 text-muted-foreground" />;
            case 'vendor': return <Store className="h-4 w-4 text-muted-foreground" />;
            default: return null;
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Promotions Engine</h1>
                    <p className="text-muted-foreground">Create and manage your customer and vendor incentive programs.</p>
                </div>
                <CreateProgramDialog onSave={handleAddProgram} />
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>All Programs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Program Name</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Reward</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {programs.map(program => (
                                <TableRow key={program.id}>
                                    <TableCell className="font-medium">{program.name}</TableCell>
                                     <TableCell>
                                        <div className="flex items-center gap-2 capitalize">
                                             {getTargetIcon(program.target)}
                                             <span>{program.target}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getRewardIcon(program.reward.type)}
                                            <span>
                                                {program.reward.type === 'wallet_credit' && `₹${program.reward.value}`}
                                                {(program.reward.type === 'discount_percent' || program.reward.type === 'commission_discount') && `${program.reward.value}%`}
                                                {(program.reward.type === 'free_shipping' || program.reward.type === 'commission_free_sales') && `${program.reward.value} Orders`}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(program.status)}>{program.status}</Badge>
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Pause</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
