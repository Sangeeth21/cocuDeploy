
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockCategories } from "@/lib/mock-data";
import { DollarSign, Percent, Edit, Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type CommissionRule = {
    commission: number; // percentage
    buffer: {
        type: 'fixed' | 'percentage';
        value: number;
    };
};

type CategoryCommissions = {
    [categoryName: string]: CommissionRule;
};

const initialCommissions: CategoryCommissions = mockCategories.reduce((acc, category) => {
    acc[category.name] = { commission: 15, buffer: { type: 'fixed', value: 2.00 } }; // Default to fixed buffer
    return acc;
}, {} as CategoryCommissions);


export default function CommissionEnginePage() {
    const { toast } = useToast();
    const [commissions, setCommissions] = useState<CategoryCommissions>(initialCommissions);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentCommission, setCurrentCommission] = useState(0);
    const [currentBuffer, setCurrentBuffer] = useState({ type: 'fixed' as 'fixed' | 'percentage', value: 0 });

    const handleEditClick = (categoryName: string) => {
        setSelectedCategory(categoryName);
        const rule = commissions[categoryName];
        setCurrentCommission(rule.commission);
        setCurrentBuffer(rule.buffer);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!selectedCategory) return;
        setCommissions(prev => ({
            ...prev,
            [selectedCategory]: {
                commission: currentCommission,
                buffer: currentBuffer,
            }
        }));
        toast({
            title: "Commission Updated",
            description: `The commission for ${selectedCategory} has been updated.`,
        });
        setIsDialogOpen(false);
    };

    const formatBuffer = (buffer: CommissionRule['buffer']) => {
        if (buffer.type === 'fixed') {
            return `$${buffer.value.toFixed(2)}`;
        }
        return `${buffer.value}%`;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Commission Engine</h1>
                <p className="text-muted-foreground">Manage commission rates and pricing buffers across the platform.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category-based Commissions</CardTitle>
                            <CardDescription>
                                This is the primary way to set commissions. Rules here apply to all products within a category unless a specific override exists.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Commission Rate</TableHead>
                                        <TableHead>Buffer Price/ Buffer %</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(commissions).map(([category, rule]) => (
                                        <TableRow key={category}>
                                            <TableCell className="font-medium">{category}</TableCell>
                                            <TableCell>{rule.commission}%</TableCell>
                                            <TableCell>{formatBuffer(rule.buffer)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick(category)}>
                                                    <Edit className="mr-2 h-3 w-3" /> Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor-Specific Commissions</CardTitle>
                            <CardDescription>Override category rules for specific vendors.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-2">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search for a vendor..." className="pl-8" />
                            </div>
                            <Button variant="secondary" className="w-full" disabled>Find Vendor</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Product-Specific Overrides</CardTitle>
                            <CardDescription>Set a specific commission or buffer for an individual product.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search for a product..." className="pl-8" />
                            </div>
                             <Button variant="secondary" className="w-full" disabled>Find Product</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Commission for: {selectedCategory}</DialogTitle>
                        <DialogDescription>
                            Set the percentage commission and a buffer to be added to the product's base price.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                             <div className="relative">
                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="commission-rate" 
                                    type="number" 
                                    value={currentCommission}
                                    onChange={(e) => setCurrentCommission(Number(e.target.value))}
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Buffer Type</Label>
                             <RadioGroup value={currentBuffer.type} onValueChange={(value) => setCurrentBuffer(prev => ({ ...prev, type: value as 'fixed' | 'percentage' }))}>
                                 <div className="flex items-center space-x-2">
                                     <RadioGroupItem value="fixed" id="r-fixed" />
                                     <Label htmlFor="r-fixed">Fixed Buffer ($)</Label>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                     <RadioGroupItem value="percentage" id="r-percent" />
                                     <Label htmlFor="r-percent">Percentage Buffer (%)</Label>
                                 </div>
                             </RadioGroup>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="buffer-value">Buffer Value</Label>
                         <div className="relative">
                             {currentBuffer.type === 'fixed' ? (
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            )}
                            <Input 
                                id="buffer-value" 
                                type="number" 
                                value={currentBuffer.value}
                                onChange={(e) => setCurrentBuffer(prev => ({...prev, value: Number(e.target.value)}))}
                                className={currentBuffer.type === 'fixed' ? "pl-8" : ""}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
