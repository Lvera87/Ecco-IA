import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, X, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { industrialApi } from '../../api/industrial';
import Button from '../ui/Button'; // Assuming generic Button exists
import Card from '../ui/Card'; // Assuming generic Card exists

const EcoAssistant = () => {
    const { chatHistory, addChatMessage } = useApp();
    const location = useLocation();
    const scrollRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    // Close chat on navigation
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isOpen, isThinking]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isThinking) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: inputValue
        };

        // 1. Add user message immediately
        addChatMessage(userMsg);
        setInputValue("");
        setIsThinking(true);

        try {
            // 2. Call backend API
            const response = await industrialApi.askAssistant(userMsg.content);

            // 3. Add AI response
            const aiMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.response || "Lo siento, no pude procesar tu solicitud."
            };
            addChatMessage(aiMsg);

        } catch (error) {
            console.error("Error chatting with assistant:", error);
            const errorMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Tuve un problema de conexión. ¿Podrías intentarlo de nuevo?"
            };
            addChatMessage(errorMsg);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Chat Window */}
            {isOpen && (
                <div
                    className="w-[350px] md:w-[400px] h-[500px] bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                <Bot className="text-white" size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Eco Asistente Industrial</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                    <span className="text-emerald-100 text-xs">En línea (Gemini Pro)</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                    >
                        {chatHistory.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                                        ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                                        }
                                    `}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="mb-1 flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                            <Sparkles size={10} />
                                            Asistente IA
                                        </div>
                                    )}
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                                    <Loader2 className="animate-spin text-emerald-500" size={16} />
                                    <span className="text-slate-400 text-xs">Analizando datos de planta...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Pregunta sobre consumo, eficiencia..."
                                className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-slate-700 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isThinking}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-emerald-900/20"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    group flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110
                    ${isOpen ? 'bg-slate-700 text-slate-300 rotate-90' : 'bg-gradient-to-tr from-emerald-500 to-green-400 text-white'}
                `}
            >
                {isOpen ? <X size={24} /> : <Bot size={28} className="fill-current" />}

                {/* Tooltip hint when closed */}
                {!isOpen && (
                    <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 shadow-xl">
                        ¿Necesitas ayuda?
                    </span>
                )}

                {/* Ping animation when idle */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></span>
                )}
                {!isOpen && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                )}
            </button>
        </div>
    );
};

export default EcoAssistant;
