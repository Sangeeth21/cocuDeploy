import { Button } from "@/components/ui/button";
import { PackageX } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-20rem)] py-20 text-center">
      <div className="flex flex-col items-center gap-6">
        <PackageX className="h-24 w-24 text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-headline">404 - Page Not Found</h1>
          <p className="text-lg text-muted-foreground">
            Sorry, we couldn't find the page you were looking for.
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">
              Go back to Homepage
            </Link>
          </Button>
           <Button variant="outline" asChild>
            <Link href="/products">
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
