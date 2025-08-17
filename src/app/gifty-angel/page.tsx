
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { ChatContainer, ChatMessage, ChatResponseOptions, ChatProductCarousel } from "@/components/chatbot-ui";
import type { DisplayProduct } from "@/lib/types";

type Stage = "initial" | "occasion" | "recipient" | "vibe" | "budget" | "results";

const occasionOptions = ["Birthday", "Anniversary", "Farewell", "Festival", "Just Because"];
const recipientOptions = ["Partner", "Friend", "Family", "Colleague"];
const vibeOptions = ["Classy", "Cute", "Funny", "Minimal", "Luxury", "Eco-friendly"];
const budgetOptions = ["< ₹1000", "₹1000-₹2500", "₹2500-₹5000", "₹5000+"];

export default function GiftyAngelPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [stage, setStage] = useState<Stage>("initial");
    const [history, setHistory] = useState<any[]>([]);

    const handleSelect = (value: string, nextStage: Stage) => {
        setHistory(prev => [...prev, { value }]);
        setStage(nextStage);
    };

    const renderCurrentStep = () => {
        switch (stage) {
            case "initial":
                return (
                    <>
                        <ChatMessage sender="bot" message="Hi there! I'm Gifty Angel, your personal guide to finding the perfect gift. ✨" />
                        <ChatMessage sender="bot" message="To get started, what's the occasion?" />
                        <ChatResponseOptions options={occasionOptions} onSelect={(val) => handleSelect(val, 'recipient')} />
                    </>
                );
            case "recipient":
                return (
                     <>
                        <ChatMessage sender="bot" message="Great! Who is this special gift for?" />
                        <ChatResponseOptions options={recipientOptions} onSelect={(val) => handleSelect(val, 'vibe')} />
                    </>
                );
            case 'vibe':
                 return (
                     <>
                        <ChatMessage sender="bot" message="Got it. What kind of vibe are you going for?" />
                        <ChatResponseOptions options={vibeOptions} onSelect={(val) => handleSelect(val, 'budget')} />
                    </>
                );
            case 'budget':
                return (
                    <>
                       <ChatMessage sender="bot" message="Perfect! What's your budget?" />
                       <ChatResponseOptions options={budgetOptions} onSelect={(val) => handleSelect(val, 'results')} />
                   </>
               );
            case 'results':
                return (
                    <>
                        <ChatMessage sender="bot" message="Based on your choices, I've curated a few collections for you! Here are some ideas to get you started." />
                        <Card>
                            <CardHeader>
                                <CardTitle>Safe & Sweet Picks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChatProductCarousel products={mockProducts.slice(0, 4)} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Personal & Memorable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChatProductCarousel products={mockProducts.slice(4, 8)} />
                            </CardContent>
                        </Card>
                    </>
                )
        }
    }

    return (
        <ChatContainer title="Gifty Angel" description="Your personal gift finder">
            {renderCurrentStep()}
        </ChatContainer>
    );
}
