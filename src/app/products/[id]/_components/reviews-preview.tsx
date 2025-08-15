
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Review } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewsPreview({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        const q = query(collection(db, "reviews"), where("productId", "==", productId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData: Review[] = [];
            snapshot.forEach(doc => reviewsData.push({ id: doc.id, ...doc.data() } as Review));
            setReviews(reviewsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [productId]);

    if (loading) {
        return <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    }

    if (reviews.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
                <p className="text-muted-foreground">No reviews for this product yet.</p>
            </div>
        )
    }

    return (
        <div>
          <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {reviews.map(review => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.avatarUrl} alt={review.author} data-ai-hint="person face" />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('h-4 w-4', i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/30')} />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-1">{review.title}</h3>
                  <p className="text-muted-foreground text-sm">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    )
}
