

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, DollarSign, Users, CreditCard, Activity, BellRing, Check, X, ShieldAlert, Package, User, Megaphone, Building } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order, User as UserType } from "@/lib/types";
import { mockCorporateCampaigns, mockCampaigns, mockActivity } from "@/lib/mock-data";


const heroCampaigns = mockCampaigns.filter(c => c.placement === 'hero' && c.status === 'Active');
const bannerCampaign = mockCampaigns.find(c => c.placement === 'banner' && c.status === 'Active');
const corporateHeroCampaigns = mockCorporateCampaigns.filter(c => c.placement === 'hero' && c.status === 'Active');


export default function AdminDashboardPage() {
    const [recentSales, setRecentSales] = useState<Order[]>([]);
    const [newUsers, setNewUsers] = useState<UserType[]>([]);

    useEffect(() => {
        // Fetch recent sales
        const salesQuery = query(collection(db, "orders"), orderBy("date", "desc"), limit(5));
        const unsubscribeSales = onSnapshot(salesQuery, (querySnapshot) => {
            const salesData: Order[] = [];
            querySnapshot.forEach((doc) => {
                salesData.push({ id: doc.id, ...doc.data() } as Order);
            });
            setRecentSales(salesData);
        });

        // Fetch new users
        const usersQuery = query(collection(db, "users"), orderBy("joinedDate", "desc"), limit(2));
        const unsubscribeUsers = onSnapshot(usersQuery, (querySnapshot) => {
            const usersData: UserType[] = [];
            querySnapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() } as UserType);
            });
            setNewUsers(usersData);
        });

        return () => {
            unsubscribeSales();
            unsubscribeUsers();
        };
    }, []);

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 my-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Sign-ups
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vendors
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>Your most recent sales from the store.</CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/admin/orders">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentSales.map(sale => (
                            <TableRow key={sale.id}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={sale.customer.avatar} alt={sale.customer.name} data-ai-hint="person face" />
                                            <AvatarFallback>{sale.customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{sale.customer.name}</div>
                                            <div className="text-sm text-muted-foreground">{sale.customer.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Homepage Content</CardTitle>
                    <CardDescription>Status of your dynamic content placements.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="flex items-center">
                        <div>
                            <p className="font-medium text-sm">Main Hero Carousel</p>
                            <p className="text-xs text-muted-foreground">{heroCampaigns.length} active campaigns</p>
                        </div>
                        {heroCampaigns.length === 0 ? (
                            <Button variant="ghost" size="sm" asChild className="ml-auto">
                                <Link href="/admin/marketing/new?placement=hero"><Megaphone className="h-3 w-3 mr-1.5"/>Create</Link>
                            </Button>
                        ) : (
                             <Badge variant="secondary" className="ml-auto">Active</Badge>
                        )}
                    </div>
                     <div className="flex items-center">
                        <div>
                            <p className="font-medium text-sm">Corporate Hero Carousel</p>
                            <p className="text-xs text-muted-foreground">{corporateHeroCampaigns.length} active campaigns</p>
                        </div>
                        {corporateHeroCampaigns.length === 0 ? (
                            <Button variant="ghost" size="sm" asChild className="ml-auto">
                                <Link href="/admin/corporate-marketing/new?placement=hero"><Building className="h-3 w-3 mr-1.5"/>Create</Link>
                            </Button>
                        ) : (
                             <Badge variant="secondary" className="ml-auto">Active</Badge>
                        )}
                    </div>
                     <div className="flex items-center">
                        <div>
                            <p className="font-medium text-sm">Top Announcement Banner</p>
                            <p className="text-xs text-muted-foreground">{bannerCampaign ? '1 active campaign' : 'No active campaign'}</p>
                        </div>
                         {bannerCampaign ? (
                             <Badge variant="secondary" className="ml-auto">Active</Badge>
                         ) : (
                             <Button variant="ghost" size="sm" asChild className="ml-auto">
                                <Link href="/admin/marketing/new?placement=banner"><Megaphone className="h-3 w-3 mr-1.5"/>Create</Link>
                            </Button>
                         )}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Activity & Moderation</CardTitle>
                    <CardDescription>Recent events across the platform.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {mockActivity.map(item => {
                        const Icon = item.icon
                        return (
                            <div key={item.id} className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${item.variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                                    <Icon className={`h-5 w-5 ${item.variant === 'destructive' ? 'text-destructive' : 'text-primary'}`}/>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="grid gap-1">
                                      <p className="text-sm font-medium leading-none">
                                          <Link href={item.href} className="hover:underline">{item.text}</Link>
                                      </p>
                                      <p className="text-sm text-muted-foreground">{item.time}</p>
                                    </div>
                                    {item.type === 'user_report' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">Dismiss</Button>
                                            <Button size="sm" variant="destructive">Warn User</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
