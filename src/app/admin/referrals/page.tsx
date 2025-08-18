
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Percent, Gift, Trophy, PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Users, Store, Loader2, Globe, Edit, Trash2, PauseCircle, PlayCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Program, ProgramPlatform, ProgramTarget } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const programOptions = {
    customer: {
        types: [
            { value: 'referral', label: 'Referral Program' },
            { value: 'milestone', label: 'Purchase Milestone' },
            { value: 'discount', label: 'Percentage Discount' },
            { value: 'wallet_credit', label: 'Wallet Credit Grant' }
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
        ]
    }
}


function CreateProgramDialog({
  program,
  onSave,
  isLoading,
  open,
  onOpenChange,
}: {
  program?: Program | null;
  onSave: (program: Omit<Program, 'id'>, id?: string) => void;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
    const [name, setName] = useState('');
    const [platform, setPlatform] = useState<ProgramPlatform>('both');
    const [targetAudience, setTargetAudience] = useState<ProgramTarget | ''>('');
    const [type, setType] = useState('');
    const [rewardType, setRewardType] = useState('');
    const [rewardValue, setRewardValue] = useState(0);
    const [productScope, setProductScope] = useState('all');
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [expiryDays, setExpiryDays] = useState<number | undefined>();
    
    const resetForm = () => {
        setName('');
        setPlatform('both');
        setTargetAudience('');
        setType('');
        setRewardType('');
        setRewardValue(0);
        setProductScope('all');
        setDate(undefined);
        setExpiryDays(undefined);
    }
    
    useEffect(() => {
        if (program) {
            setName(program.name);
            setPlatform(program.platform);
            setTargetAudience(program.target);
            setType(program.type);
            setRewardType(program.reward.type);
            setRewardValue(program.reward.value);
            setProductScope(program.productScope);
            setDate({ from: program.startDate, to: program.endDate });
            setExpiryDays(program.expiryDays);
        } else {
            resetForm();
        }
    }, [program, open]);

    const handleSave = () => {
        const programData: Omit<Program, 'id'> = {
            name,
            platform,
            target: targetAudience as ProgramTarget,
            type: type,
            reward: { type: rewardType, value: rewardValue },
            productScope: productScope as any,
            startDate: date!.from!,
            endDate: date!.to!,
            expiryDays,
            status: program?.status === 'Paused' ? 'Paused' : 'Active'
        };
        onSave(programData, program?.id);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{program ? "Edit Program" : "Create New Loyalty Program"}</DialogTitle>
                    <DialogDescription>Define the rules and rewards for a new program.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="program-name">Program Name</Label>
                        <Input id="program-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Summer Referral Bonanza" />
                    </div>
                     <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select value={platform} onValueChange={(value) => setPlatform(value as ProgramPlatform)}>
                            <SelectTrigger><SelectValue placeholder="Select platform..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="both">Both</SelectItem>
                                <SelectItem value="personalized">Personalized</SelectItem>
                                <SelectItem value="corporate">Corporate</SelectItem>
                            </SelectContent>
                        </Select>
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
                         <p className="text-xs text-muted-foreground">E.g., 100 for wallet, 15 for %, 2 for # of orders/referrals.</p>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Program
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ProgramTable({ programs, onEdit, onToggleStatus, onDelete }: { programs: Program[], onEdit: (p: Program) => void, onToggleStatus: (p: Program) => void, onDelete: (p: Program) => void }) {
    const getStatusVariant = (status: Program['status']) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Scheduled': return 'secondary';
            case 'Expired': return 'outline';
            case 'Paused': return 'secondary';
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

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Program Name</TableHead>
                            <TableHead>Platform</TableHead>
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
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <span>{program.platform}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getRewardIcon(program.reward.type)}
                                        <span>
                                            {program.reward.type === 'wallet_credit' && `₹${program.reward.value}`}
                                            {(program.reward.type === 'discount_percent' || program.reward.type === 'commission_discount') && `${program.reward.value}%`}
                                            {(program.reward.type === 'free_shipping') && `${program.reward.value} Orders`}
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
                                            <DropdownMenuItem onSelect={() => onEdit(program)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => onToggleStatus(program)}>
                                                {program.status === 'Active' ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                                                {program.status === 'Active' ? 'Pause' : 'Resume'}
                                            </DropdownMenuItem>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(program)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function PromotionsPage() {
    const { toast } = useToast();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);

    useEffect(() => {
        const q = query(collection(db, "programs"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const programsData: Program[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                programsData.push({ 
                    id: doc.id,
                    ...data,
                    startDate: data.startDate.toDate(), // Convert Firestore Timestamp to JS Date
                    endDate: data.endDate.toDate()
                } as Program);
            });
            setPrograms(programsData);
        });
        return () => unsubscribe();
    }, []);

    const handleSaveProgram = async (programData: Omit<Program, 'id'>, id?: string) => {
        setIsLoading(true);
        try {
            if (id) {
                await updateDoc(doc(db, 'programs', id), programData as any);
                toast({ title: "Program Updated!", description: `"${programData.name}" has been successfully updated.` });
            } else {
                await addDoc(collection(db, "programs"), programData);
                toast({ title: "Program Created!", description: `"${programData.name}" has been successfully added.` });
            }
            setIsDialogOpen(false);
            setEditingProgram(null);
        } catch (error) {
             console.error("Error saving program: ", error);
             toast({ variant: 'destructive', title: 'Failed to save program.' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleEditClick = (program: Program) => {
        setEditingProgram(program);
        setIsDialogOpen(true);
    };

    const handleCreateClick = () => {
        setEditingProgram(null);
        setIsDialogOpen(true);
    };

    const handleToggleStatus = async (program: Program) => {
        const newStatus = program.status === 'Active' ? 'Paused' : 'Active';
        const programRef = doc(db, 'programs', program.id);
        await updateDoc(programRef, { status: newStatus });
        toast({ title: `Program ${newStatus}`, description: `"${program.name}" has been ${newStatus.toLowerCase()}.` });
    };

    const handleDeleteClick = (program: Program) => {
        setProgramToDelete(program);
    };

    const handleDelete = async () => {
        if (!programToDelete) return;
        await deleteDoc(doc(db, "programs", programToDelete.id));
        toast({ variant: "destructive", title: "Program Deleted", description: `"${programToDelete.name}" has been permanently deleted.` });
        setProgramToDelete(null);
    };
    
    const customerPrograms = useMemo(() => programs.filter(p => p.target === 'customer'), [programs]);
    const vendorPrograms = useMemo(() => programs.filter(p => p.target === 'vendor'), [programs]);

    return (
        <AlertDialog>
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Promotions Engine</h1>
                    <p className="text-muted-foreground">Create and manage your customer and vendor incentive programs.</p>
                </div>
                <Button onClick={handleCreateClick}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Program
                </Button>
            </div>

            <Tabs defaultValue="customer">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer">Customer Programs</TabsTrigger>
                    <TabsTrigger value="vendor">Vendor Programs</TabsTrigger>
                </TabsList>
                <TabsContent value="customer" className="mt-4">
                     <ProgramTable programs={customerPrograms} onEdit={handleEditClick} onToggleStatus={handleToggleStatus} onDelete={handleDeleteClick} />
                </TabsContent>
                 <TabsContent value="vendor" className="mt-4">
                    <ProgramTable programs={vendorPrograms} onEdit={handleEditClick} onToggleStatus={handleToggleStatus} onDelete={handleDeleteClick} />
                </TabsContent>
            </Tabs>
            

             <CreateProgramDialog 
                program={editingProgram} 
                onSave={handleSaveProgram} 
                isLoading={isLoading} 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen}
            />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the program
                        "{programToDelete?.name}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setProgramToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </div>
        </AlertDialog>
    )
}
