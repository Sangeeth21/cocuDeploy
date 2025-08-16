

"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store } from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DisplayProduct, Category, MarketingCampaign } from "@/lib/types";


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

const DefaultHeroSlide = () => (
    <div className="relative h-[60vh] md:h-[70vh]">
        <Image
            src={'https://placehold.co/1920x1080.png'}
            alt="Welcome to Co & Cu"
            fill
            className="object-cover"
            priority
            data-ai-hint="abstract background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="container mx-auto text-white p-4">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <Store className="h-12 w-12" />
                    <h1 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-lg">
                        Co & Cu
                    </h1>
                </div>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 drop-shadow-md">
                    Your one-stop online marketplace for everything you need.
                </p>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                    <Link href="/products">
                        Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </div>
    </div>
);


export default function Home() {
    const [heroCampaigns, setHeroCampaigns] = useState<MarketingCampaign[]>([]);
    const [inlineCampaign, setInlineCampaign] = useState<MarketingCampaign | null>(null);
    const [featuredProducts, setFeaturedProducts] = useState<DisplayProduct[]>([]);
    const [newArrivals, setNewArrivals] = useState<DisplayProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        // Fetch Campaigns
        const campaignsQuery = query(collection(db, "marketingCampaigns"), where("status", "==", "Active"));
        const unsubCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
            const campaigns: MarketingCampaign[] = [];
            snapshot.forEach(doc => campaigns.push({ id: doc.id, ...doc.data() } as MarketingCampaign));
            setHeroCampaigns(campaigns.filter(c => c.placement === 'hero' && c.creatives && c.creatives.length > 0));
            setInlineCampaign(campaigns.find(c => c.placement === 'inline-banner' && c.creatives && c.creatives.length > 0) || null);
        });

        // Fetch Products
        const productsQuery = query(collection(db, "products"), where("status", "==", "Live"), limit(8));
        const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
            const products: DisplayProduct[] = [];
            snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() } as DisplayProduct));
            // Client-side sort
            products.sort((a, b) => b.rating - a.rating);
            setFeaturedProducts(products.slice(0, 4));
            setNewArrivals(products.slice(4, 8));
        });

        // Fetch Categories
        const categoriesQuery = query(collection(db, "categories"), orderBy("name"));
        const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
            const cats: Category[] = [];
            snapshot.forEach(doc => cats.push(doc.data() as Category));
            setCategories(cats);
        });


        return () => {
            unsubCampaigns();
            unsubProducts();
            unsubCategories();
        };
    }, []);

  return (
    <div className="flex flex-col">
      <section className="w-full">
         <Carousel
            opts={{
                loop: heroCampaigns.length > 1,
            }}
            className="w-full"
            >
            <CarouselContent>
                {heroCampaigns.length > 0 ? heroCampaigns.map((campaign, index) => (
                <CarouselItem key={campaign.id}>
                    <div className="relative h-[60vh] md:h-[70vh]">
                        <Image
                            src={campaign.creatives![0].imageUrl || 'https://placehold.co/1920x1080.png'}
                            alt={campaign.creatives![0].title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                             <div className="container mx-auto text-white p-4">
                                <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 drop-shadow-lg">
                                    {campaign.creatives![0].title}
                                </h1>
                                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 drop-shadow-md">
                                    {campaign.creatives![0].description}
                                </p>
                                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                                    <Link href={`/products?campaign=${campaign.id}`}>
                                    {campaign.creatives![0].cta} <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CarouselItem>
                )) : (
                    <CarouselItem>
                        <DefaultHeroSlide />
                    </CarouselItem>
                )}
            </CarouselContent>
            {heroCampaigns.length > 1 && <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
            </>}
        </Carousel>
      </section>

      <section id="featured" className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto">
            {inlineCampaign ? (
                <div className="relative aspect-video md:aspect-[2.4/1] w-full rounded-lg overflow-hidden">
                    <Image src={inlineCampaign.creatives![0].imageUrl || 'https://placehold.co/1200x500.png'} alt={inlineCampaign.creatives![0].title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white p-4 text-center">
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold font-headline">{inlineCampaign.creatives![0].title}</h2>
                            <p className="text-sm md:text-base mt-1 mb-2">{inlineCampaign.creatives![0].description}</p>
                            <Button size="sm" asChild>
                            <Link href={`/products?campaign=${inlineCampaign.id}`}>{inlineCampaign.creatives![0].cta}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                 <div>
                    <h2 className="text-3xl font-bold text-center mb-8 font-headline">New Arrivals</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {newArrivals.map((product) => (
                        <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
      </section>

      <section id="categories" className="py-16 bg-muted/40">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
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
    </div>
  );
}
