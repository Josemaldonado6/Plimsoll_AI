import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

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
                <div className="mb-4 w-80 h-96 bg-[#020617] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                            <span className="text-yellow-400 font-black text-[10px] uppercase tracking-widest">Plimsoll AI Support</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-xs ${msg.sender === 'user'
                                    ? 'bg-yellow-400 text-black rounded-br-none font-black uppercase tracking-tight'
                                    : 'bg-white/5 text-slate-300 rounded-bl-none border border-white/5 font-medium'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type command..."
                            className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-400/30 transition-all font-mono"
                        />
                        <button
                            onClick={handleSend}
                            className="p-2.5 bg-yellow-400/10 text-yellow-400 rounded-xl hover:bg-yellow-400 transition-all hover:text-black border border-yellow-400/20"
                        >
                            <Send size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}

            {/* Float Button */}
            <button
                onClick={() => setOpen(!open)}
                className="w-16 h-16 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-[0_0_30px_rgba(253,224,47,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 relative group"
            >
                <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
                {open ? <X size={24} strokeWidth={3} className="relative z-10" /> : <MessageSquare size={24} strokeWidth={3} className="relative z-10" />}
            </button>
        </div>
    );
}
