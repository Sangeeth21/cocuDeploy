
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User } from "lucide-react";
import { ProductCard } from "./product-card";
import { B2bProductCard } from "@/app/corporate/_components/b2b-product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { DisplayProduct } from "@/lib/types";

export function ChatContainer({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="container max-w-3xl mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold font-headline">{title}</h1>
                <p className="text-muted-foreground mt-2">{description}</p>
            </div>
            <Card className="h-[70vh] flex flex-col">
                <ScrollArea className="flex-1">
                    <CardContent className="p-6 space-y-6">
                        {children}
                    </CardContent>
                </ScrollArea>
            </Card>
        </div>
    )
}

export function ChatMessage({ sender, message }: { sender: "bot" | "user", message: string }) {
    return (
        <div className={`flex items-start gap-4 ${sender === 'user' ? 'justify-end' : ''}`}>
            {sender === 'bot' && (
                <Avatar className="h-8 w-8 border">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
            )}
             <div className={`rounded-lg p-3 max-w-sm ${sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{message}</p>
            </div>
             {sender === 'user' && (
                <Avatar className="h-8 w-8 border">
                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}

export function ChatResponseOptions({ options, onSelect }: { options: string[], onSelect: (option: string) => void }) {
    return (
         <div className="flex flex-wrap gap-2 justify-center py-4">
            {options.map((option) => (
                <Button key={option} variant="outline" onClick={() => onSelect(option)}>
                    {option}
                </Button>
            ))}
        </div>
    )
}


export function ChatProductCarousel({ products }: { products: DisplayProduct[] }) {
    return (
        <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
                {products.map((product) => (
                    <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                        <ProductCard product={product} />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    );
}

export function ChatB2bProductCarousel({ products }: { products: DisplayProduct[] }) {
    return (
        <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
                {products.map((product) => (
                    <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                        <B2bProductCard product={product} />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    );
}
