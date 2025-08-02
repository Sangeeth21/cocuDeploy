
"use client";

import { useState, useMemo } from "react";
import { mockProducts } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DisplayProduct } from "@/lib/types";
import { ProductFilterSidebar } from "@/components/product-filter-sidebar";
import { B2bProductCard } from "../_components/b2b-product-card";
import { Button } from "@/components/ui/button";


const MAX_PRICE = 500;

export default function CorporateMarketplacePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
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
  
  const clearFilters = () => {
      setSelectedCategories([]);
      setSelectedRatings([]);
      setPriceRange([0, MAX_PRICE]);
  }

  const filteredAndSortedProducts = useMemo(() => {
    let products: DisplayProduct[] = mockProducts.filter(p => p.b2bEnabled);

    if (selectedCategories.length > 0) {
      products = products.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedRatings.length > 0) {
      const minRating = Math.min(...selectedRatings);
      products = products.filter(p => p.rating >= minRating);
    }
    
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortOption) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        break;
    }

    return products;
  }, [selectedCategories, selectedRatings, sortOption, priceRange]);


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Corporate Marketplace</h1>
        <p className="text-muted-foreground mt-2">Browse products available for bulk ordering and corporate gifting.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <ProductFilterSidebar
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            selectedRatings={selectedRatings}
            onRatingChange={handleRatingChange}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            clearFilters={clearFilters}
        />

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
            {filteredAndSortedProducts.length > 0 ? (
                filteredAndSortedProducts.map((product) => (
                    <B2bProductCard key={product.id} product={product} />
                ))
            ) : (
                 <div className="sm:col-span-2 xl:col-span-3 text-center py-16">
                    <h2 className="text-2xl font-semibold">No products found</h2>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                     <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
