import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Sparkles, Zap, Shield,
    MessageSquare, User, Bot, Loader2, Home
} from 'lucide-react';
import { residentialApi } from '../api/residential';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ResidentialAssistant = () => {
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: '¡Hola! Soy tu asistente Ecco-IA para el hogar. He analizado tu perfil y tus electrodomésticos. ¿En qué puedo ayudarte hoy para reducir tu factura de energía?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                content: 'Lo siento, tuve un problema al conectarme con mis servidores. ¿Podrías intentar de nuevo en un momento?'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full -ml-48 -mb-48" />
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full flex flex-col p-6 relative z-10 overflow-hidden">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Sparkles className="text-emerald-500" /> Asistente Ecco Hogar
                        </h1>
                        <p className="text-slate-500 mt-1 dark:text-slate-400">Consultoría energética personalizada para tu vivienda</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">IA Activa</span>
                    </div>
                </div>

                {/* Chat Area */}
                <Card className="flex-1 flex flex-col overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
                    ${msg.role === 'user'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-800 text-emerald-400 border border-slate-700'}`}
                                    >
                                        {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                                            ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                                            : 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 rounded-tl-none'}`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-4 max-w-[80%]">
                                    <div className="size-10 rounded-2xl bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center animate-pulse">
                                        <Bot size={20} />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-tl-none flex items-center gap-3">
                                        <Loader2 size={16} className="animate-spin text-emerald-500" />
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ecco está analizando...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="px-6 py-4 flex gap-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800 no-scrollbar">
                        {[
                            "¿Cómo reducir mi factura este mes?",
                            "¿Qué consume más en mi casa?",
                            "Consejos para mi nevera",
                            "¿Vale la pena cambiar a bombillos LED?",
                            "¿Cuánto me ahorro si apago la TV?"
                        ].map((suggest, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(suggest)}
                                className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                            >
                                {suggest}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                        <form onSubmit={handleSendMessage} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pregúntale algo a tu asistente energético..."
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 py-4 pl-6 pr-16 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm text-slate-800 dark:text-white transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </form>
                    </div>
                </Card>

                {/* Footer info */}
                <div className="mt-6 flex items-center justify-between px-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                        <Shield size={12} className="text-emerald-500" /> Analítica Privada • Ecco-IA Engine v2.5
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ResidentialAssistant;
