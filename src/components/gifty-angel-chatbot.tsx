
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from "@/lib/mock-data";
import { ChatContainer, ChatMessage, ChatResponseOptions, ChatProductCarousel } from "@/components/chatbot-ui";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { X, MessageSquare } from "lucide-react";

type Stage = "initial" | "occasion" | "recipient" | "vibe" | "budget" | "results";

const occasionOptions = ["Birthday", "Anniversary", "Farewell", "Festival", "Just Because"];
const recipientOptions = ["Partner", "Friend", "Family", "Colleague"];
const vibeOptions = ["Classy", "Cute", "Funny", "Minimal", "Luxury", "Eco-friendly"];
const budgetOptions = ["< ₹1000", "₹1000-₹2500", "₹2500-₹5000", "₹5000+"];

export function GiftyAngelChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [stage, setStage] = useState<Stage>("initial");
    const [history, setHistory] = useState<{ value: string }[]>([]);

    const handleSelect = (value: string, nextStage: Stage) => {
        setHistory(prev => [...prev, { value }]);
        setStage(nextStage);
    };
    
    const resetChat = () => {
        setStage('initial');
        setHistory([]);
    }
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset chat state when dialog is closed
            setTimeout(() => resetChat(), 300);
        }
        setIsOpen(open);
    }

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
                        <ChatMessage sender="user" message={history[0].value} />
                        <ChatMessage sender="bot" message="Great! Who is this special gift for?" />
                        <ChatResponseOptions options={recipientOptions} onSelect={(val) => handleSelect(val, 'vibe')} />
                    </>
                );
            case 'vibe':
                 return (
                     <>
                        <ChatMessage sender="user" message={history[0].value} />
                        <ChatMessage sender="bot" message="Great! Who is this special gift for?" />
                        <ChatMessage sender="user" message={history[1].value} />
                        <ChatMessage sender="bot" message="Got it. What kind of vibe are you going for?" />
                        <ChatResponseOptions options={vibeOptions} onSelect={(val) => handleSelect(val, 'budget')} />
                    </>
                );
            case 'budget':
                return (
                    <>
                       <ChatMessage sender="user" message={history[0].value} />
                       <ChatMessage sender="bot" message="Great! Who is this special gift for?" />
                       <ChatMessage sender="user" message={history[1].value} />
                       <ChatMessage sender="bot" message="Got it. What kind of vibe are you going for?" />
                       <ChatMessage sender="user" message={history[2].value} />
                       <ChatMessage sender="bot" message="Perfect! What's your budget?" />
                       <ChatResponseOptions options={budgetOptions} onSelect={(val) => handleSelect(val, 'results')} />
                   </>
               );
            case 'results':
                return (
                    <>
                        <ChatMessage sender="user" message={history[0].value} />
                        <ChatMessage sender="bot" message="Great! Who is this special gift for?" />
                        <ChatMessage sender="user" message={history[1].value} />
                        <ChatMessage sender="bot" message="Got it. What kind of vibe are you going for?" />
                        <ChatMessage sender="user" message={history[2].value} />
                        <ChatMessage sender="bot" message="Perfect! What's your budget?" />
                        <ChatMessage sender="user" message={history[3].value} />
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
        <>
            <Button 
                className="fixed bottom-24 right-6 h-20 w-20 rounded-full shadow-2xl z-40 animate-float"
                variant="ghost"
                size="icon"
                onClick={() => handleOpenChange(true)}
            >
                 <Image src="/gifty-angel.png" alt="Gifty Angel" width={80} height={80} className="object-contain" />
            </Button>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0">
                    <ChatContainer title="Gifty Angel" description="Your personal gift finder">
                        {renderCurrentStep()}
                    </ChatContainer>
                </DialogContent>
            </Dialog>
            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
