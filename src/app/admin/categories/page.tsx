
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Upload, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";

const storage = getStorage(app);

function CategoryDialog({ open, onOpenChange, category, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; category?: Category | null; onSave: (data: Omit<Category, 'id' | 'productCount'>, file?: File | null) => void; }) {
    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setName(category?.name || "");
            setPreviewUrl(category?.imageUrl || null);
            setImageFile(null);
        }
    }, [category, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast({ variant: 'destructive', title: "Category name is required." });
            return;
        }
        onSave({ name, imageUrl: previewUrl || "" }, imageFile);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input id="category-name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Category Image</Label>
                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Category preview" width={100} height={100} className="object-contain h-full" />
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground mt-1">Click to upload</span>
                                </>
                            )}
                        </label>
                        <Input id="image-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const q = query(collection(db, "categories"), orderBy("name"));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            
            // Fetch product counts for each category
            const productCounts = await Promise.all(categoriesData.map(async (cat) => {
                const productsQuery = query(collection(db, "products"), where("category", "==", cat.name));
                const productsSnapshot = await getDocs(productsQuery);
                return { ...cat, productCount: productsSnapshot.size };
            }));

            setCategories(productCounts);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSaveCategory = async (data: Omit<Category, 'id' | 'productCount'>, file: File | null) => {
        setIsDialogOpen(false);
        let finalImageUrl = editingCategory?.imageUrl || data.imageUrl;

        try {
            if (file) {
                const storageRef = ref(storage, `category_images/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                finalImageUrl = await getDownloadURL(snapshot.ref);
            }

            const categoryData = { name: data.name, imageUrl: finalImageUrl };

            if (editingCategory) {
                await updateDoc(doc(db, 'categories', editingCategory.id!), categoryData);
                toast({ title: 'Category Updated!' });
            } else {
                await addDoc(collection(db, 'categories'), categoryData);
                toast({ title: 'Category Created!' });
            }
        } catch (error) {
            console.error("Error saving category: ", error);
            toast({ variant: 'destructive', title: 'Failed to save category.' });
        }
        setEditingCategory(null);
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    const handleDelete = async (categoryId: string) => {
        await deleteDoc(doc(db, 'categories', categoryId));
        toast({ title: 'Category Deleted', variant: 'destructive' });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Categories</h1>
                    <p className="text-muted-foreground">Manage your product categories.</p>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Category
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : (
                                categories.map(category => (
                                    <TableRow key={category.id}>
                                        <TableCell className="hidden sm:table-cell p-2">
                                            <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                                <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.productCount}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild><Link href={`/admin/products?category=${encodeURIComponent(category.name)}`}><ExternalLink className="mr-2 h-4 w-4" />View Products</Link></DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(category)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(category.id!)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
            <CategoryDialog 
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                category={editingCategory}
                onSave={handleSaveCategory}
            />
        </div>
    );
}
