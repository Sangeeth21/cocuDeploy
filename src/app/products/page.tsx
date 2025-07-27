import { ProductCard } from "@/components/product-card";
import { mockProducts, mockCategories } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ProductsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const query = searchParams?.q ?? '';

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Explore Our Products</h1>
        {query && <p className="text-lg text-muted-foreground mt-2">Showing results for: "{query}"</p>}
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
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
                          <Checkbox id={category.name} />
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
                          <Checkbox id={`rating-${rating}`} />
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

        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">{mockProducts.length} products</p>
            <Select>
              <SelectTrigger className="w-[180px]">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
