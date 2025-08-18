
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Percent, Gift, Trophy, PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Users, Store, Loader2, Globe, Edit, Trash2, PauseCircle, PlayCircle, Ticket, X } from "lucide-react";
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
import type { Program, ProgramPlatform, ProgramTarget, Coupon, Freebie, Category, DisplayProduct } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

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

function CreateCouponDialog({ coupon, onSave, isLoading, open, onOpenChange }: { coupon?: Coupon | null; onSave: (data: Omit<Coupon, 'id' | 'usageCount' | 'status'>, id?: string) => void; isLoading: boolean; open: boolean; onOpenChange: (open: boolean) => void }) {
    const [code, setCode] = useState('');
    const [type, setType] = useState<'fixed' | 'percentage'>('percentage');
    const [value, setValue] = useState<number | string>('');
    const [platform, setPlatform] = useState<ProgramPlatform>('both');
    const [maxDiscount, setMaxDiscount] = useState<number | string>('');
    const [expiresAt, setExpiresAt] = useState<Date | undefined>();
    const [usageLimit, setUsageLimit] = useState<number | string>(100);
    const [isPublic, setIsPublic] = useState(true);
    const [scope, setScope] = useState<'all' | 'category' | 'product'>('all');
    
    // State for scope selections
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<DisplayProduct[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<DisplayProduct[]>([]);
    const [productSearch, setProductSearch] = useState("");

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };
    
    useEffect(() => {
        // Fetch categories and products for selection
        const unsubCategories = onSnapshot(query(collection(db, 'categories')), snapshot => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
        });
        const unsubProducts = onSnapshot(query(collection(db, 'products')), snapshot => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisplayProduct)));
        });

        return () => {
            unsubCategories();
            unsubProducts();
        }
    }, []);

    const searchedProducts = useMemo(() => {
        if (!productSearch) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
            !selectedProducts.find(sp => sp.id === p.id)
        );
    }, [productSearch, products, selectedProducts]);
    
    useEffect(() => {
        if(open && !coupon) {
             generateRandomCode();
             setType('percentage');
             setValue(10);
             setPlatform('both');
             setMaxDiscount('');
             setExpiresAt(undefined);
             setUsageLimit(100);
             setIsPublic(true);
             setScope('all');
             setSelectedCategories([]);
             setSelectedProducts([]);
        }
        if (open && coupon) {
            setCode(coupon.code);
            setType(coupon.type);
            setValue(coupon.value);
            setPlatform(coupon.platform);
            setMaxDiscount(coupon.maxDiscount || '');
            setExpiresAt(coupon.expiresAt);
            setUsageLimit(coupon.usageLimit);
            setIsPublic(coupon.isPublic ?? true);
            setScope(coupon.scope || 'all');
            setSelectedCategories(coupon.applicableCategories || []);
            // This part is tricky as we only have IDs. A real app would fetch product details.
            // For now, we'll assume we have the full product objects if they were passed in.
            setSelectedProducts(products.filter(p => coupon.applicableProducts?.includes(p.id)));
        }
    }, [open, coupon, products]);
    
    const handleSave = () => {
        const couponData = {
            code,
            type,
            value: Number(value),
            platform,
            maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
            expiresAt,
            usageLimit: Number(usageLimit),
            isPublic,
            scope,
            applicableCategories: scope === 'category' ? selectedCategories : [],
            applicableProducts: scope === 'product' ? selectedProducts.map(p => p.id) : [],
        };
        onSave(couponData, coupon?.id);
    };

    const handleSelectProduct = (product: DisplayProduct) => {
        if (!selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(prev => [...prev, product]);
        }
        setProductSearch("");
    }

    const handleRemoveProduct = (id: string) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== id));
    }

    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{coupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
                </DialogHeader>
                 <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                 <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="coupon-code">Coupon Code</Label>
                        <div className="flex gap-2">
                            <Input id="coupon-code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
                            <Button variant="outline" onClick={generateRandomCode}>Generate</Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select value={platform} onValueChange={(v) => setPlatform(v as any)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="both">All Platforms</SelectItem>
                                <SelectItem value="personalized">Personalized</SelectItem>
                                <SelectItem value="corporate">Corporate</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select value={type} onValueChange={(v) => setType(v as any)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Input type="number" value={value} onChange={e => setValue(e.target.value)} />
                        </div>
                    </div>
                    {type === 'percentage' && (
                        <div className="space-y-2">
                            <Label htmlFor="max-discount">Max Discount (₹) (Optional)</Label>
                            <Input id="max-discount" type="number" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} placeholder="e.g., 100" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Coupon Scope</Label>
                        <RadioGroup value={scope} onValueChange={(v) => setScope(v as any)} className="flex gap-4">
                            <Label htmlFor="scope-all" className="flex items-center gap-2 p-2 border rounded-md cursor-pointer flex-1 text-sm">
                                <RadioGroupItem value="all" id="scope-all"/> All Products
                            </Label>
                             <Label htmlFor="scope-cat" className="flex items-center gap-2 p-2 border rounded-md cursor-pointer flex-1 text-sm">
                                <RadioGroupItem value="category" id="scope-cat"/> Specific Categories
                            </Label>
                             <Label htmlFor="scope-prod" className="flex items-center gap-2 p-2 border rounded-md cursor-pointer flex-1 text-sm">
                                <RadioGroupItem value="product" id="scope-prod"/> Specific Products
                            </Label>
                        </RadioGroup>
                    </div>

                    {scope === 'category' && (
                        <Card>
                            <CardHeader className="p-3"><CardTitle className="text-sm">Select Categories</CardTitle></CardHeader>
                            <CardContent className="p-3">
                                <ScrollArea className="h-32">
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(cat => (
                                         <div key={cat.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`cat-${cat.id}`} 
                                                checked={selectedCategories.includes(cat.id!)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedCategories(prev => checked ? [...prev, cat.id!] : prev.filter(id => id !== cat.id));
                                                }}
                                            />
                                            <Label htmlFor={`cat-${cat.id}`} className="font-normal">{cat.name}</Label>
                                        </div>
                                    ))}
                                </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}
                    {scope === 'product' && (
                        <Card>
                             <CardHeader className="p-3"><CardTitle className="text-sm">Select Products</CardTitle></CardHeader>
                             <CardContent className="p-3 space-y-2">
                                 <div className="relative">
                                    <Input placeholder="Search for products..." value={productSearch} onChange={e => setProductSearch(e.target.value)}/>
                                     {searchedProducts.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                            {searchedProducts.map(p => (
                                                <div key={p.id} className="p-2 hover:bg-accent cursor-pointer text-sm" onClick={() => handleSelectProduct(p)}>
                                                    {p.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                 <div className="space-y-1">
                                    {selectedProducts.map(p => (
                                         <div key={p.id} className="flex items-center gap-2 text-xs p-1 border rounded-md bg-muted/50">
                                            <p className="flex-1 truncate">{p.name}</p>
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleRemoveProduct(p.id)}><X className="h-3 w-3"/></Button>
                                         </div>
                                    ))}
                                </div>
                             </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Expiry Date (Optional)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {expiresAt ? format(expiresAt, "PPP") : <span>No expiry</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={expiresAt} onSelect={setExpiresAt} /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Usage Limit</Label>
                            <Input type="number" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
                        <Label htmlFor="is-public">Publish Coupon Publicly</Label>
                    </div>
                </div>
                 </ScrollArea>
                 <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Coupon
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
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
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [freebies, setFreebies] = useState<Freebie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Dialog states
    const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);

    const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

    useEffect(() => {
        const unsubPrograms = onSnapshot(query(collection(db, "programs")), (snapshot) => {
            const programsData: Program[] = snapshot.docs.map(doc => ({ 
                id: doc.id,
                ...doc.data(),
                startDate: doc.data().startDate?.toDate(),
                endDate: doc.data().endDate?.toDate()
            } as Program));
            setPrograms(programsData);
        });
        
        const unsubCoupons = onSnapshot(query(collection(db, "coupons")), (snapshot) => {
            const couponsData: Coupon[] = snapshot.docs.map(doc => ({ 
                id: doc.id,
                ...doc.data(),
                expiresAt: doc.data().expiresAt?.toDate(),
            } as Coupon));
            setCoupons(couponsData);
        });
        
        const unsubFreebies = onSnapshot(query(collection(db, "freebies")), (snapshot) => {
            const freebiesData: Freebie[] = snapshot.docs.map(doc => ({ 
                id: doc.id,
                ...doc.data(),
            } as Freebie));
            setFreebies(freebiesData);
        });

        return () => {
            unsubPrograms();
            unsubCoupons();
            unsubFreebies();
        }
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
            setIsProgramDialogOpen(false);
            setEditingProgram(null);
        } catch (error) {
             console.error("Error saving program: ", error);
             toast({ variant: 'destructive', title: 'Failed to save program.' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleSaveCoupon = async (couponData: Omit<Coupon, 'id' | 'usageCount' | 'status'>, id?: string) => {
        setIsLoading(true);
        try {
            const dataToSave = { ...couponData, status: 'Active', usageCount: 0 };
             if (id) {
                await updateDoc(doc(db, 'coupons', id), dataToSave as any);
                toast({ title: "Coupon Updated!" });
            } else {
                await addDoc(collection(db, "coupons"), dataToSave);
                toast({ title: "Coupon Created!" });
            }
            setIsCouponDialogOpen(false);
            setEditingCoupon(null);
        } catch (error) {
            console.error("Error saving coupon: ", error);
            toast({ variant: 'destructive', title: 'Failed to save coupon.' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleEditProgramClick = (program: Program) => {
        setEditingProgram(program);
        setIsProgramDialogOpen(true);
    };

    const handleCreateProgramClick = () => {
        setEditingProgram(null);
        setIsProgramDialogOpen(true);
    };

    const handleToggleStatus = async (program: Program) => {
        const newStatus = program.status === 'Active' ? 'Paused' : 'Active';
        const programRef = doc(db, 'programs', program.id);
        await updateDoc(programRef, { status: newStatus });
        toast({ title: `Program ${newStatus}`, description: `"${program.name}" has been ${newStatus.toLowerCase()}.` });
    };

    const handleDeleteProgramClick = (program: Program) => {
        setProgramToDelete(program);
    };

    const handleDeleteProgram = async () => {
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
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>What would you like to create?</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <Button variant="outline" className="h-20" onClick={() => { setIsProgramDialogOpen(true); setEditingProgram(null); }}>
                                <Gift className="mr-2 h-5 w-5"/> Loyalty Program
                            </Button>
                             <Button variant="outline" className="h-20" onClick={() => { setIsCouponDialogOpen(true); setEditingCoupon(null); }}>
                                <Ticket className="mr-2 h-5 w-5"/> Coupon Code
                            </Button>
                        </div>
                    </DialogContent>
                 </Dialog>
            </div>

            <Tabs defaultValue="programs" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="programs">Loyalty Programs</TabsTrigger>
                    <TabsTrigger value="coupons">Coupon Codes</TabsTrigger>
                    <TabsTrigger value="freebies">Freebies</TabsTrigger>
                </TabsList>
                <TabsContent value="programs" className="mt-4">
                    <Tabs defaultValue="customer" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="customer">Customer Programs</TabsTrigger>
                            <TabsTrigger value="vendor">Vendor Programs</TabsTrigger>
                        </TabsList>
                        <TabsContent value="customer" className="mt-4">
                            <ProgramTable programs={customerPrograms} onEdit={handleEditProgramClick} onToggleStatus={handleToggleStatus} onDelete={handleDeleteProgramClick} />
                        </TabsContent>
                        <TabsContent value="vendor" className="mt-4">
                            <ProgramTable programs={vendorPrograms} onEdit={handleEditProgramClick} onToggleStatus={handleToggleStatus} onDelete={handleDeleteProgramClick} />
                        </TabsContent>
                    </Tabs>
                </TabsContent>
                <TabsContent value="coupons" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Public</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {coupons.map(coupon => (
                                        <TableRow key={coupon.id}>
                                            <TableCell className="font-mono">{coupon.code}</TableCell>
                                            <TableCell className="capitalize">{coupon.platform}</TableCell>
                                            <TableCell className="capitalize">{coupon.type}</TableCell>
                                            <TableCell>{coupon.type === 'fixed' ? `₹${coupon.value}` : `${coupon.value}%`}</TableCell>
                                            <TableCell>{coupon.usageCount} / {coupon.usageLimit}</TableCell>
                                            <TableCell>
                                                <Badge variant={coupon.isPublic ? 'secondary' : 'outline'}>{coupon.isPublic ? 'Yes' : 'No'}</Badge>
                                            </TableCell>
                                            <TableCell><Badge>{coupon.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="freebies" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor-Provided Freebies</CardTitle>
                            <CardDescription>Review all free items offered by vendors on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Freebie</TableHead>
                                        <TableHead>Vendor ID</TableHead>
                                        <TableHead>Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {freebies.map(freebie => (
                                        <TableRow key={freebie.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                                        <Image src={freebie.imageUrl} alt={freebie.name} fill className="object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{freebie.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{freebie.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono">{freebie.vendorId}</TableCell>
                                            <TableCell>₹{freebie.price.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            

             <CreateProgramDialog 
                program={editingProgram} 
                onSave={handleSaveProgram} 
                isLoading={isLoading} 
                open={isProgramDialogOpen} 
                onOpenChange={setIsProgramDialogOpen}
            />
            <CreateCouponDialog 
                coupon={editingCoupon}
                onSave={handleSaveCoupon}
                isLoading={isLoading}
                open={isCouponDialogOpen}
                onOpenChange={setIsCouponDialogOpen}
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
                    <AlertDialogAction onClick={handleDeleteProgram} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </div>
        </AlertDialog>
    )
}
