
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order } from "@/lib/types";

const Chart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
});

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  visitors: { label: "Visitors", color: "hsl(var(--accent))" } // Placeholder
};

const trafficData = [
  { source: "Google", visitors: 1200 }, { source: "Facebook", visitors: 800 }, { source: "Instagram", visitors: 1500 },
  { source: "Direct", visitors: 600 }, { source: "Other", visitors: 300 },
];

export default function PersonalAnalyticsPage() {
    const [salesData, setSalesData] = useState<{ month: string, revenue: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const vendorId = "VDR001"; // Placeholder

    useEffect(() => {
        const fetchSalesData = async () => {
            setLoading(true);
            const productsQuery = query(collection(db, "products"), where("vendorId", "==", vendorId));
            const productsSnapshot = await getDocs(productsQuery);
            const vendorProductIds = productsSnapshot.docs.map(doc => doc.id);

            if (vendorProductIds.length === 0) {
                setLoading(false);
                return;
            }

            const ordersQuery = query(collection(db, "orders"));
            const ordersSnapshot = await getDocs(ordersQuery);
            
            const monthlySales: { [key: string]: number } = {};

            ordersSnapshot.forEach(doc => {
                const order = doc.data() as Order;
                const orderDate = order.date.toDate();
                const month = orderDate.toLocaleString('default', { month: 'short' });
                
                const vendorItemsInOrder = order.items.filter(item => vendorProductIds.includes(item.productId));
                const orderRevenueFromVendor = vendorItemsInOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                
                if (orderRevenueFromVendor > 0) {
                    if (monthlySales[month]) {
                        monthlySales[month] += orderRevenueFromVendor;
                    } else {
                        monthlySales[month] = orderRevenueFromVendor;
                    }
                }
            });
            
            const formattedSalesData = Object.entries(monthlySales).map(([month, revenue]) => ({ month, revenue }));
            setSalesData(formattedSalesData);
            setLoading(false);
        };
        fetchSalesData();
    }, [vendorId]);


    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Analytics</h1>
                <p className="text-muted-foreground">Track your store's performance.</p>
            </div>
            <div className="grid gap-8 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Monthly revenue for your products.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-[300px] w-full" /> : (
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart data={salesData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Traffic Sources</CardTitle>
                        <CardDescription>Where your visitors are coming from (Placeholder Data).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart data={trafficData} layout="vertical">
                                <CartesianGrid horizontal={false} />
                                <YAxis dataKey="source" type="category" tickLine={false} tickMargin={10} axisLine={false} width={80} />
                                <XAxis type="number" />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="visitors" fill="var(--color-visitors)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
