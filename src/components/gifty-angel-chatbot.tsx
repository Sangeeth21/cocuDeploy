
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from "@/lib/mock-data";
import { ChatContainer, ChatMessage, ChatResponseOptions, ChatProductCarousel } from "@/components/chatbot-ui";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { X, MessageSquare, Bot, Gift, Send } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";


type Stage = "initial" | "occasion" | "recipient" | "vibe" | "budget" | "results";

const occasionOptions = ["Birthday", "Anniversary", "Farewell", "Festival", "Just Because"];
const recipientOptions = ["Partner", "Friend", "Family", "Colleague"];
const vibeOptions = ["Classy", "Cute", "Funny", "Minimal", "Luxury", "Eco-friendly"];
const budgetOptions = ["< ₹1000", "₹1000-₹2500", "₹2500-₹5000", "₹5000+"];
const SESSION_STORAGE_KEY = 'gifty_angel_chat_session';


export function GiftyAngelChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [stage, setStage] = useState<Stage>("initial");
    const [history, setHistory] = useState<{ sender: 'user' | 'bot', message: string }[]>([]);
    const [isCustomInputActive, setIsCustomInputActive] = useState(false);
    const [customInputValue, setCustomInputValue] = useState("");

    // Load state from sessionStorage on mount
    useEffect(() => {
        try {
            const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (savedState) {
                const { savedStage, savedHistory } = JSON.parse(savedState);
                if (savedStage && savedHistory) {
                    setStage(savedStage);
                    setHistory(savedHistory);
                }
            }
        } catch (error) {
            console.error("Could not load chat state from session storage", error);
        }
    }, []);

    // Save state to sessionStorage on change
    useEffect(() => {
        try {
            const stateToSave = JSON.stringify({ savedStage: stage, savedHistory: history });
            sessionStorage.setItem(SESSION_STORAGE_KEY, stateToSave);
        } catch (error) {
            console.error("Could not save chat state to session storage", error);
        }
    }, [stage, history]);


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
            initial: 'recipient',
            occasion: 'recipient',
            recipient: 'vibe',
            vibe: 'budget',
            budget: 'results',
            results: 'results',
        };
        handleSelect(customInputValue, nextStageMap[stage]);
    }
    
    const resetChat = () => {
        setStage('initial');
        setHistory([]);
        setIsCustomInputActive(false);
        setCustomInputValue("");
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    
    const handleOpenChange = (open: boolean) => {
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
                        <ChatMessage sender="bot" message="Hi there! I'm Gifty Angel, your personal guide to finding the perfect gift. ✨" />
                        <ChatMessage sender="bot" message="To get started, what's the occasion?" />
                        {!isCustomInputActive && <ChatResponseOptions options={occasionOptions} onSelect={(val) => handleSelect(val, 'recipient')} onCustomClick={handleCustomClick} />}
                    </>
                );
            case "recipient":
                 return (
                     <>
                        {renderHistory}
                        <ChatMessage sender="bot" message="Great! Who is this special gift for?" />
                        {!isCustomInputActive && <ChatResponseOptions options={recipientOptions} onSelect={(val) => handleSelect(val, 'vibe')} onCustomClick={handleCustomClick} />}
                    </>
                );
            case 'vibe':
                 return (
                     <>
                        {renderHistory}
                        <ChatMessage sender="bot" message="Got it. What kind of vibe are you going for?" />
                        {!isCustomInputActive && <ChatResponseOptions options={vibeOptions} onSelect={(val) => handleSelect(val, 'budget')} onCustomClick={handleCustomClick} />}
                    </>
                );
            case 'budget':
                return (
                    <>
                       {renderHistory}
                       <ChatMessage sender="bot" message="Perfect! What's your budget?" />
                       {!isCustomInputActive && <ChatResponseOptions options={budgetOptions} onSelect={(val) => handleSelect(val, 'results')} onCustomClick={handleCustomClick} />}
                   </>
               );
            case 'results':
                return (
                    <>
                        {renderHistory}
                        <ChatMessage sender="bot" message="Based on your choices, I've curated a few collections for you! Here are some ideas to get you started." />
                        <Card>
                            <CardHeader className="p-2">
                                <CardTitle className="text-base">Safe & Sweet Picks</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                                <ChatProductCarousel products={mockProducts.slice(0, 4)} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="p-2">
                                <CardTitle className="text-base">Personal & Memorable</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                                <ChatProductCarousel products={mockProducts.slice(4, 8)} />
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
                        <Image src="/gifty-angel.png" alt="Gifty Angel" fill className="object-contain p-2" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0 mr-4" align="end">
                     <div className="flex flex-col h-[60vh]">
                        <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground rounded-t-lg flex-shrink-0">
                             <div className="flex items-center gap-2">
                                <Gift className="h-5 w-5"/>
                                <h4 className="font-semibold">Gifty Angel</h4>
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
                        {stage !== 'initial' && (
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
