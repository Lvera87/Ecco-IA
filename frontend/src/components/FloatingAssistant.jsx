import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Sparkles, MessageSquare, User, Bot, Loader2, X, Minimize2, Maximize2
} from 'lucide-react';
import { residentialApi } from '../api/residential';
import { useUser } from '../context/UserContext';
import Card from './ui/Card';

const FloatingAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: '¡Hola! Soy Ecco. ¿En qué puedo ayudarte a ahorrar hoy?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { claimMission, missions } = useUser();

    // Auto-claim logic (simplified from page version)
    useEffect(() => {
        if (!isOpen || !missions) return;
        const auditorMission = missions.find(m => m.title === 'Auditor Novato' && m.status === 'active');
        if (auditorMission) {
            setTimeout(() => {
                claimMission(auditorMission.id);
            }, 5000);
        }
    }, [isOpen, missions]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const data = await residentialApi.askAssistant(userMessage);
            setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: 'Tuve un problema de conexión. Intenta de nuevo.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl z-50 transition-all hover:scale-110 group"
            >
                <MessageSquare size={28} className="group-hover:animate-bounce" />
                <span className="absolute -top-1 -right-1 flex size-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-3 bg-emerald-300"></span>
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-200">
            <Card className="flex-1 flex flex-col overflow-hidden shadow-2xl border-emerald-500/20 border-2">
                {/* Header */}
                <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} />
                        <h3 className="font-bold">Asistente Ecco</h3>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                        <Minimize2 size={18} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/95">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`size-8 rounded-full flex items-center justify-center shrink-0
                                    ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-emerald-600'}`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm
                                    ${msg.role === 'user'
                                        ? 'bg-emerald-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-2 max-w-[85%]">
                                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Bot size={14} />
                                </div>
                                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none">
                                    <Loader2 size={16} className="animate-spin text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleSendMessage} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Discute tu consumo..."
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none py-3 pl-4 pr-12 rounded-xl focus:ring-1 focus:ring-emerald-500 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default FloatingAssistant;
