
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSearchSuggestions } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export function SearchBar() {
  const { toast } = useToast();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);


  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length > 0) {
      setLoading(true);
      const result = await getSearchSuggestions({ searchQuery });
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Suggestion Error",
          description: result.error,
        });
        setSuggestions([]);
      } else if (result.suggestions) {
        setSuggestions(result.suggestions);
      }
      setLoading(false);
    } else {
      setSuggestions([]);
    }
  }, [toast]);

  useEffect(() => {
    if (debouncedQuery) {
        fetchSuggestions(debouncedQuery);
    } else {
        setSuggestions([]);
    }
  }, [debouncedQuery, fetchSuggestions]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setSuggestions([]);
    setIsFocused(false);
    router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
  };
  
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSearch(query);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <form onSubmit={handleFormSubmit} className="relative flex items-center">
        <Input
          type="search"
          name="searchQuery"
          placeholder="Search products..."
          className="pr-10 h-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          autoComplete="off"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <Button type="submit" size="icon" aria-label="Search" className="bg-accent hover:bg-accent/90 h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
        </div>
      </form>
      {isFocused && (query.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          {loading && <div className="p-2 text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</div>}
          {!loading && suggestions.length > 0 && (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li 
                    key={index} 
                    className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        handleSearch(suggestion);
                    }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
          {!loading && debouncedQuery && suggestions.length === 0 && (
             <div className="p-2 text-sm text-muted-foreground">No suggestions found.</div>
          )}
        </div>
      )}
    </div>
  );
}
