import React, { useState, useRef, useEffect } from 'react';

const WEBHOOK_URL = 'https://jeffbotia-production.up.railway.app/webhook/bot-dudas';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '¡Bienvenido a Escala Inmobiliaria! Estoy aquí para ayudarte a encontrar tu propiedad ideal. ¿Qué tipo de inmueble buscas?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: text.trim() }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      // Handle multiple response shapes: raw OpenAI, wrapped, or n8n formats
      const respuesta =
        data?.choices?.[0]?.message?.content ||
        data?.respuesta ||
        data?.output ||
        data?.text ||
        (Array.isArray(data) && data[0]?.choices?.[0]?.message?.content) ||
        'Lo siento, no pude generar una respuesta. Intenta más tarde.';

      setMessages((prev) => [...prev, { role: 'bot', text: respuesta }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '⚠️ El servicio no está disponible en este momento. Por favor, contáctanos por WhatsApp al 3045335855.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickOption = (text) => {
    sendMessage(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Popup */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out] flex flex-col" style={{ maxHeight: '500px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-escala-accent to-orange-500 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold">Asesor Virtual</h3>
              <p className="text-white/80 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-300 rounded-full inline-block"></span>
                En línea
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 bg-gray-50 overflow-y-auto" style={{ minHeight: '250px', maxHeight: '340px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 bg-escala-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-escala-accent text-white rounded-br-md'
                      : 'bg-white text-gray-700 rounded-tl-md shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2 mb-3">
                <div className="w-7 h-7 bg-escala-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Options (only show if just the welcome message) */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-2 mt-2">
                <button
                  onClick={() => handleQuickOption('Busco vivienda en arriendo')}
                  className="w-full text-left p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-sm text-gray-700 border border-gray-100"
                >
                  🏠 Busco vivienda en arriendo
                </button>
                <button
                  onClick={() => handleQuickOption('Quiero comprar una propiedad')}
                  className="w-full text-left p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-sm text-gray-700 border border-gray-100"
                >
                  💰 Quiero comprar propiedad
                </button>
                <button
                  onClick={() => handleQuickOption('Quiero hablar con un asesor humano')}
                  className="w-full text-left p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-sm text-gray-700 border border-gray-100"
                >
                  📞 Quiero hablar con un asesor
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-escala-accent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-escala-accent text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:hover:bg-escala-accent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-escala-accent to-orange-500 text-white p-4 rounded-full shadow-lg hover:shadow-[0_8px_25px_rgba(249,115,22,0.5)] hover:scale-110 transition-all duration-300 flex items-center justify-center ${isOpen ? 'rotate-90' : ''}`}
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
      </button>
    </div>
  );
};

export default FloatingChatbot;

