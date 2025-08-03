

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Chart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
});

const salesData = [
  { month: "Jan", revenue: 12000 }, { month: "Feb", revenue: 15000 }, { month: "Mar", revenue: 10000 },
  { month: "Apr", revenue: 22000 }, { month: "May", revenue: 18000 }, { month: "Jun", revenue: 25000 },
];

const trafficData = [
   { source: "LinkedIn", visitors: 2500 }, { source: "Direct", visitors: 1800 }, { source: "Email", visitors: 1200 },
   { source: "Referrals", visitors: 900 }, { source: "Other", visitors: 400 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  visitors: { label: "Visitors", color: "hsl(var(--accent))" }
};


export default function CorporateAnalyticsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Corporate Analytics</h1>
                <p className="text-muted-foreground">Track your corporate and bulk sales performance.</p>
            </div>
            <div className="grid gap-8 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Bulk Sales Overview</CardTitle>
                        <CardDescription>Monthly revenue from corporate orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Sources</CardTitle>
                        <CardDescription>Where your corporate clients are coming from.</CardDescription>
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
