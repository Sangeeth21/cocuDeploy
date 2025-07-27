
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorSidebarLayout } from "../_components/vendor-sidebar-layout";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";

const salesData = [
  { date: "Jan", revenue: 4000 },
  { date: "Feb", revenue: 3000 },
  { date: "Mar", revenue: 5000 },
  { date: "Apr", revenue: 4500 },
  { date: "May", revenue: 6000 },
  { date: "Jun", revenue: 5500 },
];

const trafficData = [
  { source: "Google", visitors: 1200 },
  { source: "Facebook", visitors: 800 },
  { source: "Instagram", visitors: 1500 },
  { source: "Direct", visitors: 600 },
  { source: "Other", visitors: 300 },
];

export default function VendorAnalyticsPage() {
    return (
        <VendorSidebarLayout>
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
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Traffic Sources</CardTitle>
                        <CardDescription>Where your visitors are coming from.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trafficData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="source" width={80} />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="visitors" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </VendorSidebarLayout>
    );
}

