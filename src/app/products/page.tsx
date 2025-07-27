
"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { mockProducts, mockCategories } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Product } from "@/lib/types";
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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sortOption, setSortOption] = useState('featured');

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const filteredAndSortedProducts = useMemo(() => {
    let products: Product[] = mockProducts;

    if (query) {
      products = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    }

    if (selectedCategories.length > 0) {
      products = products.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedRatings.length > 0) {
      products = products.filter(p => {
        const minRating = Math.min(...selectedRatings);
        return p.rating >= minRating;
      });
    }

    switch (sortOption) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Assuming higher ID means newer, for mock data
        products.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        // Default sort or could be based on a specific property
        break;
    }

    return products;
  }, [query, selectedCategories, selectedRatings, sortOption]);


  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Explore Our Products</h1>
        {query && <p className="text-lg text-muted-foreground mt-2">Showing results for: "{query}"</p>}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold font-headline mb-4">Filters</h2>
              <Accordion type="multiple" defaultValue={['category', 'rating']} className="w-full">
                <AccordionItem value="category">
                  <AccordionTrigger className="font-semibold">Category</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {mockCategories.map(category => (
                        <div key={category.name} className="flex items-center space-x-2">
                          <Checkbox id={category.name} onCheckedChange={() => handleCategoryChange(category.name)} />
                          <Label htmlFor={category.name} className="font-normal">{category.name}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="rating">
                  <AccordionTrigger className="font-semibold">Rating</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {[4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center space-x-2">
                          <Checkbox id={`rating-${rating}`} onCheckedChange={() => handleRatingChange(rating)} />
                          <Label htmlFor={`rating-${rating}`} className="font-normal">{rating} stars & up</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <p className="text-muted-foreground w-full sm:w-auto text-center sm:text-left">{filteredAndSortedProducts.length} products</p>
            <Select onValueChange={setSortOption} defaultValue="featured">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Average Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
