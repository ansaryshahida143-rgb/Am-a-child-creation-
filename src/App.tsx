import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, Sparkles, Loader2 } from "lucide-react";
import { chat } from "./lib/gemini";
import { cn } from "./lib/utils";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello! I'm Suttumani. How can I help you today? 😊" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      history.push({ role: "user", parts: [{ text: userMessage }] });

      const response = await chat(history);
      if (response) {
        setMessages((prev) => [...prev, { role: "model", text: response }]);
      }
    } catch (error: any) {
      let errorMessage = "I'm sorry, I encountered a little hiccup. Could you try again? 🙏";
      
      if (error.message === "API_KEY_MISSING") {
        errorMessage = "It looks like my API key is missing. Please check the environment settings! 🔑";
      } else if (error.message === "PERMISSION_DENIED") {
        errorMessage = "I don't have permission to use this model right now. Maybe try again in a moment? 🔒";
      }

      setMessages((prev) => [
        ...prev,
        { role: "model", text: errorMessage }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#5A5A40]/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5A5A40] flex items-center justify-center text-white shadow-lg">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Suttumani</h1>
              <p className="text-xs text-[#5A5A40]/60 font-medium uppercase tracking-widest">Friendly Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#5A5A40]/40">
            <Sparkles size={18} />
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="max-w-3xl mx-auto px-4 py-8 pb-32">
        <div 
          ref={scrollRef}
          className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 scrollbar-thin scrollbar-thumb-[#5A5A40]/20"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "flex gap-4",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === "user" ? "bg-[#5A5A40] text-white" : "bg-white border border-[#5A5A40]/20 text-[#5A5A40]"
                )}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={cn(
                  "max-w-[80%] px-5 py-3 rounded-2xl shadow-sm",
                  msg.role === "user" 
                    ? "bg-[#5A5A40] text-white rounded-tr-none" 
                    : "bg-white text-[#1A1A1A] border border-[#5A5A40]/10 rounded-tl-none"
                )}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-[#5A5A40]/20 text-[#5A5A40] flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-[#5A5A40]/10 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-[#5A5A40]/40" />
                <span className="text-sm text-[#5A5A40]/60 italic">Suttumani is thinking...</span>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#F5F5F0] via-[#F5F5F0] to-transparent pt-10 pb-8 px-4">
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message to Suttumani..."
            className="w-full bg-white border border-[#5A5A40]/20 rounded-full px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all shadow-xl placeholder:text-[#5A5A40]/30"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#5A5A40] text-white flex items-center justify-center hover:bg-[#4A4A30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-[10px] text-[#5A5A40]/40 mt-4 uppercase tracking-[0.2em]">
          Powered by Gemini • Suttumani v1.0
        </p>
      </footer>
    </div>
  );
}

