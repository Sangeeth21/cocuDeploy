
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockReviews } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ReviewsPreview() {
    return (
        <div>
          <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {mockReviews.map(review => (
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
                        <p className="text-xs text-muted-foreground">{review.date}</p>
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
