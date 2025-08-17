
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from "@/lib/mock-data";
import { B2bProductCard } from "../_components/b2b-product-card";
import { ChatContainer, ChatMessage, ChatResponseOptions, ChatProductCarousel, ChatB2bProductCarousel } from "@/components/chatbot-ui";
import type { DisplayProduct } from "@/lib/types";

type Stage = "initial" | "purpose" | "quantity" | "budget" | "tone" | "results";

const purposeOptions = ["Corporate Event", "Client Gifting", "Employee Rewards", "Festive Bulk Order"];
const quantityOptions = ["0-100", "100-200", "200+"];
const budgetOptions = ["₹0-₹200", "₹200-₹500", "₹500-₹1500", "₹1500+"];
const toneOptions = ["Premium", "Eco-friendly", "Functional", "Festive", "Luxury Branding"];


export default function CoWorkerPage() {
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
                        <ChatMessage sender="bot" message="Welcome. I am Co-Worker, your assistant for corporate and bulk procurement." />
                        <ChatMessage sender="bot" message="To begin, what is the purpose of this order?" />
                        <ChatResponseOptions options={purposeOptions} onSelect={(val) => handleSelect(val, 'quantity')} />
                    </>
                );
            case "quantity":
                 return (
                     <>
                        <ChatMessage sender="bot" message="Understood. What is the approximate quantity required per product?" />
                        <ChatResponseOptions options={quantityOptions} onSelect={(val) => handleSelect(val, 'budget')} />
                    </>
                );
            case 'budget':
                return (
                    <>
                       <ChatMessage sender="bot" message="Thank you. Please select the budget per unit." />
                       <ChatResponseOptions options={budgetOptions} onSelect={(val) => handleSelect(val, 'tone')} />
                   </>
               );
             case 'tone':
                return (
                    <>
                       <ChatMessage sender="bot" message="Excellent. What is the desired tone for the branding and products?" />
                       <ChatResponseOptions options={toneOptions} onSelect={(val) => handleSelect(val, 'results')} />
                   </>
               );
            case 'results':
                return (
                    <>
                        <ChatMessage sender="bot" message="Based on your requirements, here are three curated package options." />
                        <Card>
                            <CardHeader>
                                <CardTitle>Budget-Friendly Pack</CardTitle>
                                <CardDescription>Practical, scalable, and cost-effective solutions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChatB2bProductCarousel products={mockProducts.slice(0, 3)} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Balanced Premium Pack</CardTitle>
                                 <CardDescription>A blend of value and high-impact presentation.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChatB2bProductCarousel products={mockProducts.slice(3, 6)} />
                            </CardContent>
                        </Card>
                    </>
                )
        }
    }

    return (
        <ChatContainer title="Co-Worker" description="Your corporate procurement assistant">
            {renderCurrentStep()}
        </ChatContainer>
    );
}
