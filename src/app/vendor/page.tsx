import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ListChecks, LineChart, Package, MessageSquare, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const previewTemplates = [
    { name: "Modern Minimal", hint: "minimalist interior" },
    { name: "Bold & Vibrant", hint: "vibrant abstract" },
    { name: "Classic Elegance", hint: "classic architecture" }
];


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
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                        Explore Templates
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Template Gallery</DialogTitle>
                        <DialogDescription>
                            Here are some of the layouts available to vendors. Sign up to create your own!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                        {previewTemplates.map((template) => (
                             <Card key={template.name} className="overflow-hidden group">
                                <CardHeader className="p-0">
                                    <div className="relative aspect-video w-full overflow-hidden">
                                        <Image 
                                            src={`https://placehold.co/600x400.png`} 
                                            alt={`${template.name} Template Preview`} 
                                            fill 
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint={template.hint}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="font-headline text-lg">{template.name}</CardTitle>
                                </CardContent>
                            </Card>
                        ))}
                         <Card className="overflow-hidden group border-primary border-2">
                                <CardHeader className="p-0 bg-primary/10">
                                     <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center">
                                        <Sparkles className="h-16 w-16 text-primary" />
                                     </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="font-headline text-lg">Your Custom Template</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">This feature allows you to fully customize the layout and components of your product page.</p>
                                </CardContent>
                            </Card>
                    </div>
                </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
