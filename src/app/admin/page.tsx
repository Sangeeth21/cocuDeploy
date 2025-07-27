import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, BarChart3, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="container py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Admin Portal</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Oversee platform operations, manage users, and analyze performance.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/login">Access Admin Dashboard</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>View, edit, and manage all user accounts, including customers, vendors, and other admins.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Settings className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline">Platform Config</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Configure platform-wide settings, payment gateways, shipping options, and more.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline">Sales Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Access detailed reports and dashboards to monitor sales performance and trends.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <ShieldCheck className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline">Content Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Review and moderate product listings and user-generated content to maintain quality standards.</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
