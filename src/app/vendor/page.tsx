import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, LineChart, Package, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function VendorPage() {
  return (
    <div className="container py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Vendor Portal</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Manage your products, track sales, and connect with your customers all in one place.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/login">Access Your Dashboard</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Product Listing</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Easily add, edit, and manage your product inventory.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Order Management</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Fulfill orders, manage returns, and track shipments.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sales Tracking</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Analyze your sales data with powerful analytics tools.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customer Communication</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Communicate directly with your customers to build loyalty.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline">Landing Page Templates</CardTitle>
            <CardDescription>
              Create beautiful, custom landing pages for your products with our easy-to-use template generator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature allows vendors to create new templates for product detail pages to better showcase their items.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/vendor/templates">Explore Templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
