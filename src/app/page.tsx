

"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mockProducts, mockCategories, mockHeroCampaigns } from "@/lib/mock-data";
import { ArrowRight, CheckCircle, Truck, Gift, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
      <section className="w-full">
         <Carousel
            opts={{
                loop: true,
            }}
            className="w-full"
            >
            <CarouselContent>
                {mockHeroCampaigns.map((campaign, index) => (
                <CarouselItem key={index}>
                    <div className="relative h-[60vh] md:h-[70vh]">
                        <Image
                            src={campaign.imageUrl}
                            alt={campaign.title}
                            fill
                            className="object-cover"
                            data-ai-hint={campaign.hint}
                            priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                             <div className="container mx-auto text-white p-4">
                                <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 drop-shadow-lg">
                                    {campaign.title}
                                </h1>
                                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 drop-shadow-md">
                                    {campaign.description}
                                </p>
                                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                                    <Link href={campaign.link}>
                                    {campaign.cta} <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
        </Carousel>
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
    </div>
  );
}
