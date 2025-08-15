
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, LineChart, Package, MessageSquare, ArrowRight, Bell, DollarSign, Check, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";

export default function BothVendorDashboardPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const vendorId = "VDR001"; // Placeholder
    const q = query(
        collection(db, "notifications"), 
        where("vendorId", "==", vendorId),
        orderBy("timestamp", "desc"),
        limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(notifs);
    });
    return () => unsubscribe();
  }, []);
  
  const revenue = "$45,231.89";
  const revenueChange = "+20.1% from last month";
  const activeOrders = "+23";
  const newMessages = "+5";
  const activeListings = "125";

  return (
      <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Timeless Co. (Hybrid Portal)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenue}</div>
            <p className="text-xs text-muted-foreground">{revenueChange}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground">Ready to be fulfilled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
            <div className="relative">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Badge className="absolute -top-2 -right-2 h-4 w-4 justify-center p-0">{newMessages.replace('+', '')}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newMessages}</div>
            <p className="text-xs text-muted-foreground">From interested customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
            <p className="text-xs text-muted-foreground">Products currently for sale</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {notifications.map(item => {
                const Icon = item.type === 'stock' ? Package : item.type === 'message' ? MessageSquare : item.type === 'confirmation' ? Bell : ListChecks;
                const timestamp = item.timestamp?.toDate ? new Date(item.timestamp.toDate()).toLocaleTimeString() : 'Just now';
                return (
                     <div key={item.id} className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Icon className="h-5 w-5 text-primary"/>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="grid gap-1">
                                <p className="text-sm"><Link href={item.href || '#'} className="font-semibold hover:underline">{item.text}</Link></p>
                                <p className="text-xs text-muted-foreground">{timestamp}</p>
                            </div>
                            {item.type === 'confirmation' && (
                                <div className="flex gap-2">
                                    <Button size="sm"><Check className="mr-2 h-4 w-4"/> Approve</Button>
                                    <Button size="sm" variant="destructive"><X className="mr-2 h-4 w-4"/> Reject</Button>
                                </div>
                            )}
                             {item.type === 'message' && (
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={item.href || '#'}>
                                        Reply <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                             )}
                        </div>
                    </div>
                )
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Product Page Templates</CardTitle>
            <CardDescription>Customize the look of your product detail pages.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create beautiful, custom landing pages for your products with our easy-to-use template generator.
            </p>
            <Button asChild>
                <Link href="/vendor/templates">
                    Manage Templates <ArrowRight className="ml-2"/>
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
  );
}
