
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2, Upload, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Freebie } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription as AlertDesc } from '@/components/ui/alert';

function FreebieDialog({ freebie, onSave, open, onOpenChange, isLoading }: { freebie?: Freebie | null, onSave: (data: Omit<Freebie, 'id' | 'vendorId' | 'imageUrl'>, file?: File | null) => void; open: boolean; onOpenChange: (open: boolean) => void; isLoading: boolean; }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setName(freebie?.name || '');
            setDescription(freebie?.description || '');
            setPrice(freebie?.price || '');
            setPreviewUrl(freebie?.imageUrl || null);
            setImageFile(null);
        }
    }, [freebie, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        const numPrice = Number(price);
        if (!name.trim() || !description.trim()) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Name and description are required.' });
            return;
        }
        if (isNaN(numPrice) || numPrice < 10 || numPrice > 60) {
            toast({ variant: 'destructive', title: 'Invalid Price', description: 'Price must be a number between ₹10 and ₹60.' });
            return;
        }
        if (!previewUrl) {
            toast({ variant: 'destructive', title: 'Image Required', description: 'Please upload an image for the freebie.' });
            return;
        }
        onSave({ name, description, price: numPrice });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{freebie ? 'Edit Freebie' : 'Add New Freebie'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Freebie Image</Label>
                        <label htmlFor="freebie-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                            {previewUrl ? <Image src={previewUrl} alt="Preview" width={100} height={100} className="object-contain h-full" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                        </label>
                        <Input id="freebie-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="freebie-name">Name</Label>
                        <Input id="freebie-name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="freebie-desc">Description</Label>
                        <Textarea id="freebie-desc" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="freebie-price">Your Cost (Price for Reimbursement)</Label>
                        <div className="relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                            <Input id="freebie-price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="10 - 60" className="pl-6" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Freebie
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function VendorFreebiesPage() {
    const { toast } = useToast();
    const [freebies, setFreebies] = useState<Freebie[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFreebie, setEditingFreebie] = useState<Freebie | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const vendorId = "VDR001"; // Placeholder

    useEffect(() => {
        const q = query(collection(db, "freebies"), where("vendorId", "==", vendorId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Freebie[] = [];
            snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Freebie));
            setFreebies(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [vendorId]);
    
    const handleSaveFreebie = async (data: Omit<Freebie, 'id' | 'vendorId' | 'imageUrl'>, file?: File | null) => {
        setIsLoading(true);
        let finalImageUrl = editingFreebie?.imageUrl || "";

        try {
            if (file) {
                const storageRef = ref(storage, `freebies/${vendorId}/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                finalImageUrl = await getDownloadURL(snapshot.ref);
            }
            
            const freebieData = { ...data, vendorId, imageUrl: finalImageUrl };

            if (editingFreebie) {
                await updateDoc(doc(db, 'freebies', editingFreebie.id), freebieData);
                toast({ title: 'Freebie Updated!' });
            } else {
                await addDoc(collection(db, 'freebies'), freebieData);
                toast({ title: 'Freebie Added!' });
            }
            
            setIsDialogOpen(false);
            setEditingFreebie(null);
        } catch (error) {
            console.error("Error saving freebie:", error);
            toast({ variant: 'destructive', title: 'Failed to save freebie.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteFreebie = async (id: string) => {
        await deleteDoc(doc(db, 'freebies', id));
        toast({ variant: 'destructive', title: 'Freebie Deleted' });
    };

    const handleEditClick = (freebie: Freebie) => {
        setEditingFreebie(freebie);
        setIsDialogOpen(true);
    };
    
    const handleAddClick = () => {
        setEditingFreebie(null);
        setIsDialogOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Freebies</h1>
                    <p className="text-muted-foreground">Add and manage items you want to offer as freebies for qualifying orders.</p>
                </div>
                <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" /> Add Freebie</Button>
            </div>
            
            <Alert className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>How It Works</AlertTitle>
                <AlertDescription>
                    The platform decides when a customer is eligible for a freebie (e.g., based on order value, as a birthday gift). If a customer chooses your item, its cost will be added to your payout for that order.
                </AlertDescription>
            </Alert>
            
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Your Cost</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                            ) : freebies.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">You haven't added any freebies yet.</TableCell></TableRow>
                            ) : (
                                freebies.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => handleEditClick(item)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleDeleteFreebie(item.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <FreebieDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} freebie={editingFreebie} onSave={handleSaveFreebie} isLoading={isLoading} />
        </div>
    )
}
