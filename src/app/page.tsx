import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mockProducts, mockCategories } from "@/lib/mock-data";
import { ArrowRight, CheckCircle, Truck, Gift } from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";


const ProductCard = dynamic(() => import('@/components/product-card').then(mod => mod.ProductCard), {
  loading: () => <div className="flex flex-col space-y-3">
      <Skeleton className="h-[225px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
       <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-2/4" />
      </div>
    </div>,
});

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="bg-card py-20 md:py-32">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 text-primary">
            Discover Your Next Favorite Thing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Shop from thousands of unique products, curated by a community of creators and vendors.
          </p>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <Link href="/products">
              Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section id="featured" className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="py-16 bg-muted/40">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mockCategories.map((category) => (
              <Link href={`/products?category=${category.name}`} key={category.name}>
                <div className="group text-center flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-2 border-2 border-transparent group-hover:border-primary transition-all duration-300 shadow-md">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={`${category.name.toLowerCase()}`}
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Why ShopSphere?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
              <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-headline">Quality Guaranteed</h3>
              <p className="text-muted-foreground">Every product is vetted for quality and authenticity by our team.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
              <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-headline">Fast Shipping</h3>
              <p className="text-muted-foreground">Reliable and fast shipping to your doorstep, wherever you are.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
              <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <Gift className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-headline">Support Creators</h3>
              <p className="text-muted-foreground">Your purchase directly supports independent vendors and creators.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
