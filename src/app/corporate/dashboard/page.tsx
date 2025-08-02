
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mockProducts, mockCategories, mockCorporateCampaigns } from "@/lib/mock-data";
import { ArrowRight, Store } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { B2bProductCard } from "../_components/b2b-product-card";


const DefaultHeroSlide = () => (
    <div className="relative h-[60vh] md:h-[70vh]">
        <Image
            src={'https://placehold.co/1920x1080.png'}
            alt="Welcome to the Corporate Portal"
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
                        Corporate Gifting, Perfected
                    </h1>
                </div>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 drop-shadow-md">
                    Discover premium products available for bulk purchase and customization.
                </p>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                    <Link href="/corporate/products">
                        Browse All Products <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </div>
    </div>
);


export default function CorporateMarketplacePage() {
    const heroCampaigns = (mockCorporateCampaigns || []).filter(c => c.placement === 'hero' && c.status === 'Active' && c.creatives);
    const inlineCampaign = (mockCorporateCampaigns || []).find(c => c.placement === 'inline-banner' && c.status === 'Active');

  return (
    <div className="space-y-8">
      <section className="w-full -m-4 sm:-m-6 md:-m-8">
         <Carousel
            opts={{
                loop: heroCampaigns.length > 1,
            }}
            className="w-full"
            >
            <CarouselContent>
                {heroCampaigns.length > 0 ? heroCampaigns.map((campaign, index) => (
                <CarouselItem key={index}>
                    <div className="relative h-[50vh] md:h-[60vh]">
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
                                    <Link href={`/corporate/products?campaign=${campaign.id}`}>
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

      <section id="featured-b2b" className="pt-16">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Featured Bulk Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockProducts.filter(p => p.b2bEnabled).slice(0, 4).map((product) => (
              <B2bProductCard key={product.id} product={product} />
            ))}
          </div>
      </section>
      
      <section className="py-16">
            {inlineCampaign ? (
                <div className="relative aspect-video md:aspect-[3/1] w-full rounded-lg overflow-hidden">
                    <Image src={inlineCampaign.creatives![0].imageUrl || 'https://placehold.co/1200x400.png'} alt={inlineCampaign.creatives![0].title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white p-4 text-center">
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold font-headline">{inlineCampaign.creatives![0].title}</h2>
                            <p className="text-sm md:text-base mt-1 mb-2">{inlineCampaign.creatives![0].description}</p>
                            <Button size="sm" asChild>
                            <Link href={`/corporate/products?campaign=${inlineCampaign.id}`}>{inlineCampaign.creatives![0].cta}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                 <div>
                    <h2 className="text-3xl font-bold text-center mb-8 font-headline">Top Tier Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {mockProducts.filter(p => p.b2bEnabled).slice(4, 8).map((product) => (
                         <B2bProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}
      </section>

      <section id="categories-b2b" className="py-16 bg-muted/40 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mockCategories.map((category) => (
              <Link href={`/corporate/products?category=${category.name}`} key={category.name}>
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
      </section>
    </div>
  );
}
