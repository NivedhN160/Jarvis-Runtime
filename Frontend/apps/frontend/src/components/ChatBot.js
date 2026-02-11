import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const ChatBot = ({ isOpen, setIsOpen }) => {
    // const [isOpen, setIsOpen] = useState(false); // Managed by parent now
    const [mode, setMode] = useState('assistant'); // 'assistant' or 'writer'
    const [messages, setMessages] = useState([
        { role: 'system', content: 'Hi! I can help you find creators, draft requests, or answer questions about Mat-Cha.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (messageText = input) => {
        if (typeof messageText !== 'string' && messageText.preventDefault) {
            messageText.preventDefault();
            messageText = input;
        }

        if (!messageText.trim()) return;

        const userMessage = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Context Logic
            let history = messages
                .filter(m => m.role !== 'system')
                .map(m => ({ role: m.role === 'system' ? 'assistant' : m.role, content: m.content }));

            // Add Mode System Prompt
            let systemPrompt = "You are a helpful assistant for the Mat-Cha collaboration platform.";
            if (mode === 'writer') {
                systemPrompt = "You are an expert AI Copywriter and Content Strategist. Your goal is to write high-converting, engaging content for creators and brands. Output clean, formatted text without generic fluff.";
            }

            // Override history[0] or prepend
            history = [{ role: 'system', content: systemPrompt }, ...history];

            const response = await axios.post(`${API}/ai/chat`, {
                message: userMessage.content,
                history: history
            });

            const botMessage = { role: 'assistant', content: response.data.response };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to get response");
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now." }]);
        } finally {
            setLoading(false);
        }
    };

    const runPreset = (text) => {
        handleSend(text);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {isOpen && (
                <Card className="mb-4 w-[350px] md:w-[450px] h-[600px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden">
                    {/* Header */}
                    <div className={`p-4 border-b flex items-center justify-between rounded-t-lg transition-colors ${mode === 'writer' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-primary/5'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${mode === 'writer' ? 'bg-purple-200 text-purple-700' : 'bg-primary/20 text-primary'}`}>
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Mat-Cha AI</h3>
                                <div className="flex gap-2 text-xs mt-0.5">
                                    <button
                                        onClick={() => { setMode('assistant'); setMessages([{ role: 'system', content: 'Hi! How can I help you today?' }]); }}
                                        className={`${mode === 'assistant' ? 'font-bold text-foreground underline' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Assistant
                                    </button>
                                    <span className="text-muted-foreground/40">|</span>
                                    <button
                                        onClick={() => { setMode('writer'); setMessages([{ role: 'system', content: 'Ready to create! What are we writing today?' }]); }}
                                        className={`${mode === 'writer' ? 'font-bold text-purple-600 underline' : 'text-muted-foreground hover:text-purple-600'}`}
                                    >
                                        Writer Mode
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-card border border-border text-foreground rounded-bl-none'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-2xl px-4 py-2 rounded-bl-none flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="text-xs text-muted-foreground">Generating content...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preset Prompts (Writer Mode Only) */}
                    {mode === 'writer' && !loading && messages.length < 3 && (
                        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar mask-fade">
                            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-7 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200" onClick={() => runPreset("Write a viral Twitter thread about AI tools")}>
                                🐦 Viral Thread
                            </Button>
                            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-7 bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200" onClick={() => runPreset("Generate a catchy Instagram caption for a travel vlog")}>
                                📸 Insta Caption
                            </Button>
                            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-7 bg-red-50 hover:bg-red-100 text-red-700 border-red-200" onClick={() => runPreset("Outline a 5-minute YouTube tutorial script about coding")}>
                                🎥 YT Script
                            </Button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t bg-background">
                        <form onSubmit={(e) => handleSend(e)} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={mode === 'writer' ? "Describe content to generate..." : "Ask helpful questions..."}
                                className="flex-1 text-sm focus-visible:ring-offset-0"
                                disabled={loading}
                            />
                            <Button type="submit" size="icon" disabled={loading || !input.trim()} className={mode === 'writer' ? 'bg-purple-600 hover:bg-purple-700' : ''}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${isOpen ? 'rotate-90' : 'rotate-0'} ${mode === 'writer' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-primary hover:bg-primary/90'}`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
    );
};

export default ChatBot;
