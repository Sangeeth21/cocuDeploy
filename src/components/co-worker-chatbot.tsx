
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from "@/lib/mock-data";
import { ChatContainer, ChatMessage, ChatResponseOptions, ChatB2bProductCarousel } from "@/components/chatbot-ui";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { X, MessageSquare, Bot, Gift, Send, Building } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";

type Stage = "initial" | "purpose" | "quantity" | "budget" | "tone" | "results";

const purposeOptions = ["Corporate Event", "Client Gifting", "Employee Rewards", "Festive Bulk Order"];
const quantityOptions = ["0-100", "100-200", "200+"];
const budgetOptions = ["< ₹500", "₹500-₹1500", "₹1500-₹5000", "₹5000+"];
const toneOptions = ["Premium", "Eco-friendly", "Functional", "Festive", "Luxury Branding"];

const b2bProducts = mockProducts.filter(p => p.b2bEnabled);

export function CoWorkerChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [stage, setStage] = useState<Stage>("initial");
    const [history, setHistory] = useState<{ sender: 'user' | 'bot', message: string }[]>([]);
    const [isCustomInputActive, setIsCustomInputActive] = useState(false);
    const [customInputValue, setCustomInputValue] = useState("");

    const addMessageToHistory = (sender: 'user' | 'bot', message: string) => {
        setHistory(prev => [...prev, { sender, message }]);
    };

    const handleSelect = (value: string, nextStage: Stage) => {
        addMessageToHistory('user', value);
        setStage(nextStage);
        setIsCustomInputActive(false);
        setCustomInputValue("");
    };
    
    const handleCustomClick = () => {
        setIsCustomInputActive(true);
    }
    
    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customInputValue.trim()) return;

        const nextStageMap: Record<Stage, Stage> = {
            initial: 'quantity',
            purpose: 'quantity',
            quantity: 'budget',
            budget: 'tone',
            tone: 'results',
            results: 'results',
        };
        handleSelect(customInputValue, nextStageMap[stage]);
    }
    
    const resetChat = () => {
        setStage('initial');
        setHistory([]);
        setIsCustomInputActive(false);
        setCustomInputValue("");
    }
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setTimeout(() => resetChat(), 300);
        }
        setIsOpen(open);
    }

    const renderCurrentStep = () => {
        const renderHistory = history.map((msg, index) => (
            <ChatMessage key={index} sender={msg.sender} message={msg.message} />
        ));

        switch (stage) {
            case "initial":
                return (
                    <>
                        <ChatMessage sender="bot" message="Welcome. I am Co-Worker, your assistant for corporate and bulk procurement." />
                        <ChatMessage sender="bot" message="To begin, what is the purpose of this order?" />
                        {!isCustomInputActive && <ChatResponseOptions options={purposeOptions} onSelect={(val) => handleSelect(val, 'quantity')} onCustomClick={handleCustomClick} />}
                    </>
                );
            case "quantity":
                 return (
                     <>
                        {renderHistory}
                        <ChatMessage sender="bot" message="Understood. What is the approximate quantity required per product?" />
                        {!isCustomInputActive && <ChatResponseOptions options={quantityOptions} onSelect={(val) => handleSelect(val, 'budget')} onCustomClick={handleCustomClick} />}
                    </>
                );
            case 'budget':
                return (
                    <>
                       {renderHistory}
                       <ChatMessage sender="bot" message="Thank you. Please select the budget per unit." />
                       {!isCustomInputActive && <ChatResponseOptions options={budgetOptions} onSelect={(val) => handleSelect(val, 'tone')} onCustomClick={handleCustomClick} />}
                   </>
               );
             case 'tone':
                return (
                    <>
                       {renderHistory}
                       <ChatMessage sender="bot" message="Excellent. What is the desired tone for the branding and products?" />
                       {!isCustomInputActive && <ChatResponseOptions options={toneOptions} onSelect={(val) => handleSelect(val, 'results')} onCustomClick={handleCustomClick} />}
                   </>
               );
            case 'results':
                return (
                    <>
                        {renderHistory}
                        <ChatMessage sender="bot" message="Based on your requirements, here are three curated package options." />
                        <Card>
                            <CardHeader className="p-2">
                                <CardTitle className="text-base">Budget-Friendly Pack</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                                <ChatB2bProductCarousel products={b2bProducts.slice(0, 4)} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="p-2">
                                <CardTitle className="text-base">Balanced Premium Pack</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                                <ChatB2bProductCarousel products={b2bProducts.slice(4, 8)} />
                            </CardContent>
                        </Card>
                    </>
                )
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-40">
            <Popover open={isOpen} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button 
                        className="h-16 w-16 md:h-20 md:w-20 rounded-full shadow-2xl animate-float p-0"
                        variant="ghost"
                        size="icon"
                    >
                        <Image src="/co-worker.png" alt="Co-Worker Assistant" fill className="object-contain p-2" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0 mr-4" align="end">
                     <div className="flex flex-col h-[60vh]">
                        <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground rounded-t-lg flex-shrink-0">
                             <div className="flex items-center gap-2">
                                <Building className="h-5 w-5"/>
                                <h4 className="font-semibold">Co-Worker Assistant</h4>
                             </div>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary/80" onClick={() => handleOpenChange(false)}>
                                <X className="h-4 w-4"/>
                             </Button>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-6">
                                {renderCurrentStep()}
                                {isCustomInputActive && (
                                    <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 pt-4">
                                        <Input 
                                            placeholder="Type your answer..." 
                                            value={customInputValue}
                                            onChange={(e) => setCustomInputValue(e.target.value)}
                                            autoFocus
                                        />
                                        <Button type="submit" size="icon">
                                            <Send className="h-4 w-4"/>
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </ScrollArea>
                         {stage === 'results' && (
                            <div className="p-2 border-t">
                                <Button variant="link" size="sm" onClick={resetChat}>Start Over</Button>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
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
        </div>
    );
}
