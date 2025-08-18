
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Percent, Edit, Search, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { User, DisplayProduct, Category, CommissionRule } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { collection, doc, onSnapshot, query, updateDoc, writeBatch, getDocs, addDoc, deleteDoc, where, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type CategoryCommissions = {
    [categoryName: string]: CommissionRule;
};

type CommissionData = {
    personalized: CategoryCommissions;
    corporate: CategoryCommissions;
}

type VendorCommissionOverride = {
    id: string; // Firestore document ID
    vendorId: string;
    vendorName: string;
    vendorAvatar: string;
    rule: CommissionRule;
};

type ProductCommissionOverride = {
    id: string; // Firestore document ID
    productId: string;
    productName: string;
    productImageUrl: string;
    rule: CommissionRule;
}

export default function CommissionEnginePage() {
    const { toast } = useToast();
    
    // State for commissions
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [commissions, setCommissions] = useState<CommissionData>({ personalized: {}, corporate: {} });
    const [vendorOverrides, setVendorOverrides] = useState<VendorCommissionOverride[]>([]);
    const [productOverrides, setProductOverrides] = useState<ProductCommissionOverride[]>([]);
    const [activeTab, setActiveTab] = useState<'personalized' | 'corporate'>('personalized');

    // State for dialogs and editing
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editContext, setEditContext] = useState<{ type: 'category' | 'vendor' | 'product'; id: string; name: string; } | null>(null);
    const [currentCommission, setCurrentCommission] = useState(0);
    const [currentBuffer, setCurrentBuffer] = useState({ type: 'fixed' as 'fixed' | 'percentage', value: 0 });

    // State for searching
    const [vendorSearch, setVendorSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");
    
    // Data fetching from Firestore
    useEffect(() => {
        // 1. Fetch all categories
        const categoriesQuery = query(collection(db, 'categories'));
        const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
            const cats: Category[] = [];
            snapshot.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as Category));
            setAllCategories(cats);
        });

        // 2. Fetch Category Commissions and create defaults if missing
        const catComRef = doc(db, 'commissions', 'categories');
        const unsubCat = onSnapshot(catComRef, async (docSnap) => {
            const fetchedCommissions = docSnap.exists() ? docSnap.data() as CommissionData : { personalized: {}, corporate: {} };

            const categoriesSnapshot = await getDocs(query(collection(db, 'categories')));
            const allCategoryNames = categoriesSnapshot.docs.map(doc => doc.data().name);
            
            let updatedCommissions = { ...fetchedCommissions };
            let hasChanged = false;

            allCategoryNames.forEach(name => {
                if (!updatedCommissions.personalized[name]) {
                    updatedCommissions.personalized[name] = { commission: 10, buffer: { type: 'fixed', value: 1.00 } };
                    hasChanged = true;
                }
                if (!updatedCommissions.corporate[name]) {
                    updatedCommissions.corporate[name] = { commission: 15, buffer: { type: 'fixed', value: 5.00 } }; // Different default for corporate
                    hasChanged = true;
                }
            });

            setCommissions(updatedCommissions);

            if (hasChanged) {
                await setDoc(catComRef, updatedCommissions, { merge: true });
            }
        });

        // Fetch Vendor Overrides
        const vendorQuery = query(collection(db, "vendorCommissionOverrides"));
        const unsubVendor = onSnapshot(vendorQuery, (snapshot) => {
            const overrides: VendorCommissionOverride[] = [];
            snapshot.forEach(doc => overrides.push({ id: doc.id, ...doc.data() } as VendorCommissionOverride));
            setVendorOverrides(overrides);
        });
        
        // Fetch Product Overrides
        const productQuery = query(collection(db, "productCommissionOverrides"));
        const unsubProduct = onSnapshot(productQuery, (snapshot) => {
            const overrides: ProductCommissionOverride[] = [];
            snapshot.forEach(doc => overrides.push({ id: doc.id, ...doc.data() } as ProductCommissionOverride));
            setProductOverrides(overrides);
        });

        return () => {
            unsubCategories();
            unsubCat();
            unsubVendor();
            unsubProduct();
        }
    }, []);

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allProducts, setAllProducts] = useState<DisplayProduct[]>([]);

    useEffect(() => {
        const fetchUsers = onSnapshot(query(collection(db, "users"), where("role", "==", "Vendor")), (snapshot) => {
            setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });
        const fetchProducts = onSnapshot(query(collection(db, "products")), (snapshot) => {
            setAllProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisplayProduct)));
        });
        return () => {
            fetchUsers();
            fetchProducts();
        }
    }, []);


    const filteredVendors = useMemo(() => {
        if (!vendorSearch) return [];
        return allUsers.filter(u => u.name.toLowerCase().includes(vendorSearch.toLowerCase()));
    }, [vendorSearch, allUsers]);

    const filteredProducts = useMemo(() => {
        if (!productSearch) return [];
        return allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    }, [productSearch, allProducts]);


    const handleEditClick = (type: 'category' | 'vendor' | 'product', id: string, name: string) => {
        setEditContext({ type, id, name });
        let rule;
        if (type === 'category') {
            rule = commissions[activeTab][id];
        } else if (type === 'vendor') {
            rule = vendorOverrides.find(v => v.id === id)?.rule;
        } else { // product
            rule = productOverrides.find(p => p.id === id)?.rule;
        }
        
        if (rule) {
            setCurrentCommission(rule.commission);
            setCurrentBuffer(rule.buffer);
        } else { // Default for new overrides
             setCurrentCommission(10);
             setCurrentBuffer({ type: 'fixed', value: 1.00 });
        }
        
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editContext) return;
        
        const newRule: CommissionRule = { commission: currentCommission, buffer: currentBuffer };

        try {
            if (editContext.type === 'category') {
                const catComRef = doc(db, 'commissions', 'categories');
                // Use dot notation for nested field update
                const fieldPath = `${activeTab}.${editContext.id}`;
                await updateDoc(catComRef, { [fieldPath]: newRule });
            } else if (editContext.type === 'vendor') {
                 const vendorDocRef = doc(db, 'vendorCommissionOverrides', editContext.id);
                 await updateDoc(vendorDocRef, { rule: newRule });
            } else { // product
                const productDocRef = doc(db, 'productCommissionOverrides', editContext.id);
                await updateDoc(productDocRef, { rule: newRule });
            }

            toast({
                title: "Commission Updated",
                description: `The commission for ${editContext.name} has been updated.`,
            });
            setIsDialogOpen(false);
            setEditContext(null);
        } catch(error) {
             toast({ variant: 'destructive', title: 'Failed to save commission.' });
             console.error("Error saving commission: ", error);
        }
    };

    const handleAddVendorOverride = async (vendor: User) => {
        if (vendorOverrides.some(v => v.vendorId === vendor.id)) {
            toast({ variant: 'destructive', title: 'Vendor override already exists.'});
            return;
        }
        
        const newOverride = {
            vendorId: vendor.id,
            vendorName: vendor.name,
            vendorAvatar: vendor.avatar,
            rule: { commission: 10, buffer: { type: 'fixed', value: 1.00 } }
        };
        const docRef = await addDoc(collection(db, 'vendorCommissionOverrides'), newOverride);
        setVendorSearch("");
        handleEditClick('vendor', docRef.id, vendor.name);
    }
    
    const handleAddProductOverride = async (product: DisplayProduct) => {
        if (productOverrides.some(p => p.productId === product.id)) {
            toast({ variant: 'destructive', title: 'Product override already exists.'});
            return;
        }
        const newOverride = {
            productId: product.id,
            productName: product.name,
            productImageUrl: product.imageUrl,
            rule: { commission: 10, buffer: { type: 'fixed', value: 1.00 } }
        };
        const docRef = await addDoc(collection(db, 'productCommissionOverrides'), newOverride);
        setProductSearch("");
        handleEditClick('product', docRef.id, product.name);
    }
    
    const handleRemoveOverride = async (type: 'vendor' | 'product', id: string) => {
        try {
            if (type === 'vendor') {
                await deleteDoc(doc(db, 'vendorCommissionOverrides', id));
            } else {
                await deleteDoc(doc(db, 'productCommissionOverrides', id));
            }
            toast({ title: 'Override Removed' });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Failed to remove override.' });
        }
    }

    const formatBuffer = (buffer: CommissionRule['buffer']) => {
        if (buffer.type === 'fixed') {
            return `$${buffer.value.toFixed(2)}`;
        }
        return `${buffer.value}%`;
    }
    
    const categoryCommissionsToShow = commissions[activeTab] || {};

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Commission Engine</h1>
                <p className="text-muted-foreground">Manage commission rates and pricing buffers across the platform.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                         <TabsList className="mb-4">
                            <TabsTrigger value="personalized">Personalized Retail</TabsTrigger>
                            <TabsTrigger value="corporate">Corporate & Bulk Gifting</TabsTrigger>
                        </TabsList>
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
                                        {Object.entries(categoryCommissionsToShow).map(([category, rule]) => (
                                            <TableRow key={category}>
                                                <TableCell className="font-medium">{category}</TableCell>
                                                <TableCell>{rule.commission}%</TableCell>
                                                <TableCell>{formatBuffer(rule.buffer)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditClick('category', category, category)}>
                                                        <Edit className="mr-2 h-3 w-3" /> Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Tabs>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor-Specific Commissions</CardTitle>
                            <CardDescription>Override category rules for specific vendors.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search for a vendor..." className="pl-8" value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} />
                                {filteredVendors.length > 0 && vendorSearch && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {filteredVendors.map(vendor => (
                                            <div key={vendor.id} className="p-2 text-sm hover:bg-accent cursor-pointer flex items-center gap-2" onClick={() => handleAddVendorOverride(vendor)}>
                                                <Avatar className="h-8 w-8"><AvatarImage src={vendor.avatar} /><AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback></Avatar>
                                                <span>{vendor.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {vendorOverrides.length > 0 && (
                                <Table>
                                    <TableBody>
                                        {vendorOverrides.map(({id, vendorName, rule}) => (
                                            <TableRow key={id}>
                                                <TableCell className="font-medium p-2">{vendorName}</TableCell>
                                                <TableCell className="p-2">{rule.commission}%</TableCell>
                                                <TableCell className="p-2">{formatBuffer(rule.buffer)}</TableCell>
                                                <TableCell className="p-2 text-right">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick('vendor', id, vendorName)}><Edit className="h-3 w-3"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveOverride('vendor', id)}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Product-Specific Overrides</CardTitle>
                            <CardDescription>Set a specific commission or buffer for an individual product.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search for a product..." className="pl-8" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                                {filteredProducts.length > 0 && productSearch && (
                                     <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {filteredProducts.map(product => (
                                            <div key={product.id} className="p-2 text-sm hover:bg-accent cursor-pointer flex items-center gap-2" onClick={() => handleAddProductOverride(product)}>
                                                <div className="relative h-8 w-8 flex-shrink-0"><Image src={product.imageUrl} alt={product.name} fill className="object-cover rounded-sm" /></div>
                                                <span className="truncate">{product.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                             {productOverrides.length > 0 && (
                                <Table>
                                    <TableBody>
                                        {productOverrides.map(({id, productName, rule}) => (
                                            <TableRow key={id}>
                                                <TableCell className="font-medium p-2 truncate">{productName}</TableCell>
                                                <TableCell className="p-2">{rule.commission}%</TableCell>
                                                <TableCell className="p-2">{formatBuffer(rule.buffer)}</TableCell>
                                                <TableCell className="p-2 text-right">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick('product', id, productName)}><Edit className="h-3 w-3"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveOverride('product', id)}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Commission for: {editContext?.name}</DialogTitle>
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
                                    className="pr-8"
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
                                className={currentBuffer.type === 'fixed' ? "pl-8" : "pr-8"}
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
    