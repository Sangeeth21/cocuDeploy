"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { handleSearch } from "@/app/actions";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" aria-label="Search" disabled={pending} className="bg-accent hover:bg-accent/90 h-8 w-8">
      {pending ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
    </Button>
  );
}

export function SearchBar() {
  const { toast } = useToast();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const searchAction = async (formData: FormData) => {
    const searchQuery = formData.get("searchQuery") as string;
    if (!searchQuery?.trim()) {
      return;
    }

    toast({
        title: "Searching...",
        description: `Looking for "${searchQuery}"`,
    });

    const result = await handleSearch({ searchQuery });
    
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: result.error,
      });
    } else if (result.enhancedSearchQuery) {
        toast({
            title: "AI Search Assistant",
            description: `We enhanced your search to: "${result.enhancedSearchQuery}"`,
        });
        router.push(`/products?q=${encodeURIComponent(result.enhancedSearchQuery)}`);
    } else {
        router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form action={searchAction} className="relative w-full">
      <div className="relative flex items-center">
        <Input
          type="search"
          name="searchQuery"
          placeholder="Search products..."
          className="pr-10 h-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <SubmitButton />
        </div>
      </div>
    </form>
  );
}
