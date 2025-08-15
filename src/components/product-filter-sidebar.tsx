
"use client";

import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Category } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const MAX_PRICE = 500;

interface ProductFilterSidebarProps {
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  selectedRatings: number[];
  onRatingChange: (rating: number) => void;
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  clearFilters: () => void;
}

export function ProductFilterSidebar({
  selectedCategories,
  onCategoryChange,
  selectedRatings,
  onRatingChange,
  priceRange,
  onPriceRangeChange,
  clearFilters,
}: ProductFilterSidebarProps) {

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const cats: Category[] = [];
        snapshot.forEach(doc => cats.push(doc.data() as Category));
        setCategories(cats);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold font-headline">Filters</h2>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          </div>
          <Accordion
            type="multiple"
            defaultValue={["category", "rating", "price"]}
            className="w-full"
          >
            <AccordionItem value="category">
              <AccordionTrigger className="font-semibold">
                Category{" "}
                {selectedCategories.length > 0 && (
                  <Badge className="ml-2">{selectedCategories.length}</Badge>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-3/4" />
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category.name}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category.name}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() => onCategoryChange(category.name)}
                        />
                        <Label htmlFor={category.name} className="font-normal">
                          {category.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price">
              <AccordionTrigger className="font-semibold">
                Price Range
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 px-1">
                  <Slider
                    min={0}
                    max={MAX_PRICE}
                    step={10}
                    value={priceRange}
                    onValueChange={(value: [number, number]) =>
                      onPriceRangeChange(value)
                    }
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rating">
              <AccordionTrigger className="font-semibold">
                Rating{" "}
                {selectedRatings.length > 0 && (
                  <Badge className="ml-2">{selectedRatings.length}</Badge>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={selectedRatings.includes(rating)}
                        onCheckedChange={() => onRatingChange(rating)}
                      />
                      <Label
                        htmlFor={`rating-${rating}`}
                        className="font-normal"
                      >
                        {rating} stars & up
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </aside>
  );
}
