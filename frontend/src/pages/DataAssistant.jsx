import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Sparkles, Factory, Zap, Shield, AlertCircle,
  MessageSquare, User, Bot, Loader2, ArrowRight
} from 'lucide-react';
import { industrialApi } from '../api/industrial';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const DataAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: '¡Hola! Soy tu Asistente de Ecco-IA Industrial. Estoy analizando los datos técnicos de tu planta en tiempo real. ¿Cómo puedo ayudarte a optimizar tu consumo hoy?'
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
      const data = await industrialApi.askAssistant(userMessage);
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Lo siento, tuve un problema al conectarme con el cerebro de Ecco. ¿Podrías intentar de nuevo?'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full -ml-48 -mb-48" />
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full flex flex-col p-6 relative z-10 overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Sparkles className="text-blue-500" /> Asistente Ecco Industrial
            </h1>
            <p className="text-slate-500 mt-1 dark:text-slate-400">Consultoría energética avanzada procesada por Gemini 2.5</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
            <div className="size-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">IA Conectada</span>
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-blue-400 border border-slate-700'}`}
                  >
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
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
                  <div className="size-10 rounded-2xl bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center animate-pulse">
                    <Bot size={20} />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-tl-none flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">ECCO está pensando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-6 py-4 flex gap-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800 no-scrollbar">
            {[
              "¿Cómo reducir consumo en horas pico?",
              "Analítica por Turnos (Shift Analytics)",
              "Monitor de Intensidad Energética (kWh/m²)",
              "Reporte de Desperdicio por Activo",
              "Sugerencias de mantenimiento predictivo"
            ].map((suggest, i) => (
              <button
                key={i}
                onClick={() => setInput(suggest)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
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
                placeholder="Escribe tu consulta sobre la planta..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 py-4 pl-6 pr-16 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-800 dark:text-white transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </Card>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-between px-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
            <Shield size={12} className="text-emerald-500" /> Datos cifrados • Ecco-IA Engine v2.5
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-[10px] text-slate-400 hover:text-blue-500 font-bold uppercase tracking-widest transition-colors">Ver Reporte Técnico</a>
            <a href="#" className="text-[10px] text-slate-400 hover:text-blue-500 font-bold uppercase tracking-widest transition-colors">Exportar Historial</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataAssistant;
