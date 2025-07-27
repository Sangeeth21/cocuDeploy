
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, DollarSign, Users, CreditCard, Activity } from "lucide-react";
import Link from "next/link";


const mockRecentSales = [
    { id: '1', name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: 199.99, avatar: 'https://placehold.co/40x40.png' },
    { id: '2', name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: 39.00, avatar: 'https://placehold.co/40x40.png' },
    { id: '3', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: 299.00, avatar: 'https://placehold.co/40x40.png' },
    { id: '4', name: 'William Kim', email: 'will@email.com', amount: 99.00, avatar: 'https://placehold.co/40x40.png' },
    { id: '5', name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: 39.00, avatar: 'https://placehold.co/40x40.png' },
]

export default function AdminDashboardPage() {
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
                    <CardDescription>You made 265 sales this month.</CardDescription>
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
                        {mockRecentSales.map(sale => (
                            <TableRow key={sale.id}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={sale.avatar} alt={sale.name} data-ai-hint="person face" />
                                            <AvatarFallback>{sale.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{sale.name}</div>
                                            <div className="text-sm text-muted-foreground">{sale.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">${sale.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center">
                 <div className="grid gap-2">
                    <CardTitle>New Users</CardTitle>
                    <CardDescription>A list of recent user and vendor sign-ups.</CardDescription>
                </div>
                 <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/admin/users">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="grid gap-8">
                <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Avatar" data-ai-hint="person face" />
                        <AvatarFallback>OM</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">Olivia Martin</p>
                        <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                    </div>
                    <div className="ml-auto font-medium"><Badge>Customer</Badge></div>
                </div>
                <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Avatar" data-ai-hint="company logo" />
                        <AvatarFallback>TC</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">Timeless Co.</p>
                        <p className="text-sm text-muted-foreground">contact@timeless.co</p>
                    </div>
                    <div className="ml-auto font-medium"><Badge variant="secondary">Vendor</Badge></div>
                </div>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Avatar" data-ai-hint="person face" />
                        <AvatarFallback>JL</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">Jackson Lee</p>
                        <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
                    </div>
                    <div className="ml-auto font-medium"><Badge>Customer</Badge></div>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
