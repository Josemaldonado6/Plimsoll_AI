import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

export default function SupportWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Welcome to Plimsoll AI. I am your autonomous sales agent. How can I help you modernize your fleet today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, open]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        // Simulated AI Response
        setTimeout(() => {
            let botText = "I can connect you with a human sales director for that specific request.";
            const lower = userMsg.text.toLowerCase();

            if (lower.includes("price") || lower.includes("cost") || lower.includes("quote")) {
                botText = "Our pricing is dynamic based on vessel DWT. For a Handy-size veseel, it starts around $750 per survey. You can use the calculator on our landing page for an exact quote.";
            } else if (lower.includes("api") || lower.includes("integration")) {
                botText = "Yes, we offer a full REST API for ERP integration (SAP/Navis). Documentation is available upon request.";
            } else if (lower.includes("demo")) {
                botText = "I've flagged your interest. A 'Booking Link' has been sent to your email (simulated).";
            }

            const botMsg: Message = { id: Date.now() + 1, text: botText, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {open && (
                <div className="mb-4 w-80 h-96 bg-[#112240] border border-[#64ffda]/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-[#0a192f] p-4 border-b border-[#64ffda]/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[#64ffda] font-bold text-xs uppercase tracking-widest">Plimsoll Agent</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-[#8892b0] hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl text-xs ${msg.sender === 'user'
                                        ? 'bg-[#64ffda] text-[#0a192f] rounded-br-none font-medium'
                                        : 'bg-[#1a2c4e] text-gray-200 rounded-bl-none border border-[#64ffda]/10'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-[#0a192f] border-t border-[#64ffda]/10 flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about pricing..."
                            className="flex-1 bg-[#112240] border border-[#64ffda]/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#64ffda]/50"
                        />
                        <button
                            onClick={handleSend}
                            className="p-2 bg-[#64ffda]/10 text-[#64ffda] rounded-lg hover:bg-[#64ffda]/20"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Float Button */}
            <button
                onClick={() => setOpen(!open)}
                className="w-14 h-14 rounded-full bg-[#64ffda] text-[#0a192f] flex items-center justify-center shadow-[0_0_20px_rgba(100,255,218,0.4)] hover:scale-110 transition-transform duration-300"
            >
                {open ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
}
