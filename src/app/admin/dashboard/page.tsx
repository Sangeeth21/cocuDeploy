
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, DollarSign, Users, CreditCard, Activity, BellRing, Check, X, ShieldAlert, Package, User, Megaphone, Building, Database } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, where, getDocs,getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order, User as UserType, MarketingCampaign } from "@/lib/types";
import { seedDatabase } from '../actions';
import { useToast } from "@/hooks/use-toast";


export default function AdminDashboardPage() {
    const { toast } = useToast();
    const [stats, setStats] = useState({
        revenue: 0,
        signups: 0,
        orders: 0,
        vendors: 0,
    });
    const [recentSales, setRecentSales] = useState<Order[]>([]);
    const [activity, setActivity] = useState<any[]>([]);
    const [heroCampaigns, setHeroCampaigns] = useState<MarketingCampaign[]>([]);
    const [bannerCampaign, setBannerCampaign] = useState<MarketingCampaign | null>(null);
    const [corporateHeroCampaigns, setCorporateHeroCampaigns] = useState<MarketingCampaign[]>([]);
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        // Fetch stats
        const fetchStats = async () => {
            const ordersQuery = query(collection(db, "orders"), where("status", "!=", "Cancelled"));
            const usersQuery = query(collection(db, "users"), where("role", "==", "Customer"));
            const vendorsQuery = query(collection(db, "users"), where("role", "==", "Vendor"));
            
            const ordersSnapshot = await getDocs(ordersQuery);
            const usersSnapshot = await getCountFromServer(usersQuery);
            const vendorsSnapshot = await getCountFromServer(vendorsQuery);

            const totalRevenue = ordersSnapshot.docs.reduce((acc, doc) => acc + doc.data().total, 0);
            
            setStats({
                revenue: totalRevenue,
                signups: usersSnapshot.data().count,
                orders: ordersSnapshot.size,
                vendors: vendorsSnapshot.data().count
            });
        };
        fetchStats();

        // Fetch recent sales (live)
        const salesQuery = query(collection(db, "orders"), orderBy("date", "desc"), limit(5));
        const unsubscribeSales = onSnapshot(salesQuery, (querySnapshot) => {
            const salesData: Order[] = [];
            querySnapshot.forEach((doc) => {
                salesData.push({ id: doc.id, ...doc.data() } as Order);
            });
            setRecentSales(salesData);
        });
        
        // Fetch Activity (live)
        const activityQuery = query(collection(db, "notifications"), where("forAdmin", "==", true), orderBy("timestamp", "desc"), limit(5));
        const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
            const activityData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActivity(activityData);
        });
        
        // Fetch Campaigns (live)
        const campaignsQuery = query(collection(db, "marketingCampaigns"), where("status", "==", "Active"));
        const unsubCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
            const campaigns: MarketingCampaign[] = [];
            snapshot.forEach(doc => campaigns.push({ id: doc.id, ...doc.data() } as MarketingCampaign));
            setHeroCampaigns(campaigns.filter(c => c.placement === 'hero' && c.creatives && c.creatives.length > 0));
            setBannerCampaign(campaigns.find(c => c.placement === 'banner' && c.creatives && c.creatives.length > 0) || null);
            setCorporateHeroCampaigns(campaigns.filter(c => c.placement === 'hero' && c.creatives && c.creatives.length > 0));
        });

        return () => {
            unsubscribeSales();
            unsubscribeActivity();
            unsubCampaigns();
        };
    }, []);

    const handleSeedDatabase = async () => {
        setIsSeeding(true);
        const result = await seedDatabase();
        if(result.success) {
            toast({
                title: "Database Seeded!",
                description: "Your database has been populated with sample data.",
            });
        } else {
             toast({
                variant: "destructive",
                title: "Seeding Failed",
                description: result.message,
            });
        }
        setIsSeeding(false);
    }

    const notificationIcons: { [key: string]: React.ElementType } = {
        'user_report': ShieldAlert,
        'new_vendor': User,
        'default': BellRing,
    };

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
         <Button onClick={handleSeedDatabase} disabled={isSeeding}>
            <Database className="mr-2 h-4 w-4" />
            {isSeeding ? 'Seeding...' : 'Seed Database'}
        </Button>
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
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
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
            <div className="text-2xl font-bold">+{stats.signups}</div>
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
            <div className="text-2xl font-bold">+{stats.orders}</div>
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
            <div className="text-2xl font-bold">+{stats.vendors}</div>
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
                    {activity.map(item => {
                        const Icon = notificationIcons[item.type] || notificationIcons.default;
                        const timestamp = item.timestamp?.toDate ? new Date(item.timestamp.toDate()).toLocaleTimeString() : 'Just now';
                        return (
                            <div key={item.id} className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${item.variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                                    <Icon className={`h-5 w-5 ${item.variant === 'destructive' ? 'text-destructive' : 'text-primary'}`}/>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="grid gap-1">
                                      <p className="text-sm font-medium leading-none">
                                          <Link href={item.href || '#'} className="hover:underline">{item.text}</Link>
                                      </p>
                                      <p className="text-sm text-muted-foreground">{timestamp}</p>
                                    </div>
                                    {item.actions && (
                                        <div className="flex gap-2">
                                            {item.actions.map((action: any) => (
                                                <Button key={action.label} size="sm" variant={action.variant || 'outline'}>{action.label}</Button>
                                            ))}
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
