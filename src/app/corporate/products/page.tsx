
"use client";

import { useState, useMemo, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DisplayProduct } from "@/lib/types";
import { ProductFilterSidebar } from "@/components/product-filter-sidebar";
import { B2bProductCard } from "../_components/b2b-product-card";
import { Button } from "@/components/ui/button";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MAX_PRICE = 500;

export default function CorporateProductsPage() {
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [sortOption, setSortOption] = useState('featured');
  
  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, "products"), where("b2bEnabled", "==", true));

    // Apply filters
    if (selectedCategories.length > 0) {
        q = query(q, where('category', 'in', selectedCategories));
    }
    if (selectedRatings.length > 0) {
        q = query(q, where('rating', '>=', Math.min(...selectedRatings)));
    }
    q = query(q, where('price', '>=', priceRange[0]), where('price', '<=', priceRange[1]));
    
     // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        q = query(q, orderBy('price', 'asc'));
        break;
      case 'price-desc':
        q = query(q, orderBy('price', 'desc'));
        break;
      case 'rating':
        q = query(q, orderBy('rating', 'desc'));
        break;
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const productsData: DisplayProduct[] = [];
        querySnapshot.forEach((doc) => {
            productsData.push({ id: doc.id, ...doc.data() } as DisplayProduct);
        });
        setProducts(productsData);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategories, selectedRatings, priceRange, sortOption]);

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

  return (
    <div className="container space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">All Corporate Products</h1>
        <p className="text-muted-foreground mt-2">Browse all products available for bulk purchasing.</p>
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
            <p className="text-muted-foreground w-full sm:w-auto text-center sm:text-left">{products.length} products</p>
            <Select onValueChange={setSortOption} defaultValue="featured">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Average Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.length > 0 ? (
                products.map((product) => (
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
