
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerification } from "@/context/vendor-verification-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Chart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
});


const salesData = {
  personalized: [
    { month: "Jan", revenue: 4000 }, { month: "Feb", revenue: 3000 }, { month: "Mar", revenue: 5000 },
    { month: "Apr", revenue: 4500 }, { month: "May", revenue: 6000 }, { month: "Jun", revenue: 5500 },
  ],
  corporate: [
    { month: "Jan", revenue: 12000 }, { month: "Feb", revenue: 15000 }, { month: "Mar", revenue: 10000 },
    { month: "Apr", revenue: 22000 }, { month: "May", revenue: 18000 }, { month: "Jun", revenue: 25000 },
  ]
};

const trafficData = {
  personalized: [
    { source: "Google", visitors: 1200 }, { source: "Facebook", visitors: 800 }, { source: "Instagram", visitors: 1500 },
    { source: "Direct", visitors: 600 }, { source: "Other", visitors: 300 },
  ],
  corporate: [
     { source: "LinkedIn", visitors: 2500 }, { source: "Direct", visitors: 1800 }, { source: "Email", visitors: 1200 },
     { source: "Referrals", visitors: 900 }, { source: "Other", visitors: 400 },
  ]
};

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  visitors: { label: "Visitors", color: "hsl(var(--accent))" }
};


function AnalyticsView({ type }: { type: 'personalized' | 'corporate' }) {
    return (
         <div className="grid gap-8 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>Monthly revenue for the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart data={salesData[type]}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>Where your visitors are coming from.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart data={trafficData[type]} layout="vertical">
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
    )
}

export default function VendorAnalyticsPage() {
    const { vendorType } = useVerification();
    
    if (vendorType === 'both') {
        return (
             <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-headline">Analytics</h1>
                    <p className="text-muted-foreground">Track your store's performance.</p>
                </div>
                 <Tabs defaultValue="personalized">
                    <TabsList>
                        <TabsTrigger value="personalized">Personalized Retail</TabsTrigger>
                        <TabsTrigger value="corporate">Corporate & Bulk</TabsTrigger>
                    </TabsList>
                    <TabsContent value="personalized">
                        <AnalyticsView type="personalized" />
                    </TabsContent>
                    <TabsContent value="corporate">
                         <AnalyticsView type="corporate" />
                    </TabsContent>
                </Tabs>
             </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Analytics</h1>
                <p className="text-muted-foreground">Track your store's performance.</p>
            </div>
            <AnalyticsView type={vendorType || 'personalized'} />
        </div>
    );
}
