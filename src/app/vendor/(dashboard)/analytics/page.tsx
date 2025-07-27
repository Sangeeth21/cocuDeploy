
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
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
];

const trafficData = [
  { source: "Google", visitors: 1200 },
  { source: "Facebook", visitors: 800 },
  { source: "Instagram", visitors: 1500 },
  { source: "Direct", visitors: 600 },
  { source: "Other", visitors: 300 },
];

const salesChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

const trafficChartConfig = {
    visitors: {
        label: "Visitors",
        color: "hsl(var(--accent))",
    }
}


export default function VendorAnalyticsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Analytics</h1>
                <p className="text-muted-foreground">Track your store's performance.</p>
            </div>
            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Monthly revenue for the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                            <BarChart data={salesData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
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
                         <ChartContainer config={trafficChartConfig} className="h-[300px] w-full">
                            <BarChart data={trafficData} layout="vertical">
                                <CartesianGrid horizontal={false} />
                                <YAxis
                                    dataKey="source"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    width={80}
                                />
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
