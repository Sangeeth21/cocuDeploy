
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockProducts, mockUsers } from "@/lib/mock-data";
import type { DisplayProduct, User } from "@/lib/types";
import { ArrowLeft, Search, X, User as UserIcon, Package, DollarSign, Save, Trash2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type OrderItem = DisplayProduct & { quantity: number };

export default function NewOrderPage() {
    const router = useRouter();
    const { toast } = useToast();

    // State
    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [shippingCost, setShippingCost] = useState(0);
    const [referralCommission, setReferralCommission] = useState(0);

    // Memos and Calculations
    const customerSearchResults = useMemo(() => {
        if (!customerSearchTerm) return [];
        return mockUsers.filter(u => 
            u.role === 'Customer' && (
                u.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
            )
        );
    }, [customerSearchTerm]);

    const productSearchResults = useMemo(() => {
        if (!productSearchTerm) return [];
        return mockProducts.filter(p =>
            p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
        );
    }, [productSearchTerm]);

    const subtotal = useMemo(() => {
        return orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }, [orderItems]);

    const total = useMemo(() => {
        return subtotal + shippingCost;
    }, [subtotal, shippingCost]);


    // Handlers
    const handleCustomerSelect = (customer: User) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm("");
    };
    
    const handleProductSelect = (product: DisplayProduct) => {
        if (!orderItems.find(item => item.id === product.id)) {
            setOrderItems(prev => [...prev, { ...product, quantity: 1 }]);
        }
        setProductSearchTerm("");
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        setOrderItems(prev =>
            prev.map(item => item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item)
        );
    };

    const handleRemoveItem = (productId: string) => {
        setOrderItems(prev => prev.filter(item => item.id !== productId));
    };

    const handleCreateOrder = () => {
        if (!selectedCustomer) {
            toast({ variant: 'destructive', title: 'Please select a customer.' });
            return;
        }
        if (orderItems.length === 0) {
            toast({ variant: 'destructive', title: 'Please add at least one product to the order.' });
            return;
        }
        toast({
            title: "Order Created!",
            description: "The new order has been successfully created.",
        });
        router.push("/admin/orders");
    };

    return (
        <div>
            <Button variant="outline" size="sm" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
            <div className="mb-4">
                <h1 className="text-3xl font-bold font-headline">Create New Order</h1>
                <p className="text-muted-foreground">Manually construct an order and assign it to a customer.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Customer Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedCustomer ? (
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                                            <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{selectedCustomer.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search for a customer by name or email..."
                                        className="pl-8"
                                        value={customerSearchTerm}
                                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                    />
                                    {customerSearchResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                                            <ul>
                                                {customerSearchResults.map(customer => (
                                                    <li key={customer.id} className="p-2 text-sm hover:bg-accent cursor-pointer flex items-center gap-2" onClick={() => handleCustomerSelect(customer)}>
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={customer.avatar} alt={customer.name} />
                                                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p>{customer.name}</p>
                                                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Items Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input
                                   placeholder="Search for products to add..."
                                   className="pl-8"
                                   value={productSearchTerm}
                                   onChange={(e) => setProductSearchTerm(e.target.value)}
                               />
                                {productSearchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        <ul>
                                            {productSearchResults.map(product => (
                                                <li key={product.id} className="p-2 text-sm hover:bg-accent cursor-pointer flex items-center gap-2" onClick={() => handleProductSelect(product)}>
                                                    <Image src={product.imageUrl} alt={product.name} width={32} height={32} className="rounded-sm" />
                                                    <span>{product.name}</span>
                                                    <span className="ml-auto font-mono text-xs">${product.price.toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                {orderItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md" />
                                        <div className="flex-grow">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                                        </div>
                                        <Input 
                                            type="number" 
                                            className="w-20 h-9" 
                                            value={item.quantity} 
                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                            min="1"
                                        />
                                        <p className="w-20 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                {orderItems.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">No products added to the order yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 sticky top-24 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Subtotal</Label>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="shipping-cost">Shipping</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input 
                                        id="shipping-cost" 
                                        type="number" 
                                        className="w-24 h-8 pl-5" 
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="referral-commission">Referral Commission (Optional)</Label>
                                 <div className="relative">
                                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input 
                                        id="referral-commission" 
                                        type="number" 
                                        className="w-24 h-8 pl-5" 
                                        value={referralCommission}
                                        onChange={(e) => setReferralCommission(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <Label>Total</Label>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                     </Card>
                     <Card>
                         <CardHeader>
                            <CardTitle>Actions</CardTitle>
                         </CardHeader>
                         <CardContent className="flex flex-col gap-2">
                             <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Save as Draft</Button>
                             <Button onClick={handleCreateOrder}><CheckCircle className="mr-2 h-4 w-4" /> Create Order</Button>
                         </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    );
}
