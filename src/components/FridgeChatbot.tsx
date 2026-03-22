import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Sparkles, RotateCcw } from 'lucide-react';
import { useFridge } from '@/lib/fridge-context';
import { mockSustainability } from '@/lib/mock-data';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  "What's expiring soon? ⏰",
  "Suggest a recipe 🍳",
  "How's my sustainability? 🌿",
  "What's in my fridge? 🧊",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fridge-chat`;

export default function FridgeChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { items } = useFridge();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
  }, []);

  const getFridgeContext = useCallback(() => ({
    items: items.map(i => ({
      name: i.name, quantity: i.quantity, unit: i.unit,
      expiryDate: i.expiryDate, category: i.category,
      consumed: i.consumed, addedBy: i.addedBy, cost: i.cost,
    })),
    sustainability: mockSustainability,
  }), [items]);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages, fridgeContext: getFridgeContext() }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Something went wrong' }));
      throw new Error(err.error || `Error ${resp.status}`);
    }
    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let assistantSoFar = '';

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (json === '[DONE]') return;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) upsert(content);
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }
  }, [getFridgeContext]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      await streamChat([...messages, userMsg]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${e.message || 'Something went wrong.'}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, streamChat]);

  const toggleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const hasSpeech = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 active:scale-95",
          open ? "bg-muted text-muted-foreground rotate-90" : "bg-primary text-primary-foreground hover:shadow-xl"
        )}
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 z-50 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center gap-2 border-b bg-primary/5 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">FreshKeep Assistant</p>
              <p className="text-[11px] text-muted-foreground">Ask me about your fridge 🧊</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                aria-label="New chat"
                title="New chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center pt-4 pb-2">
                  👋 Hi! How can I help with your fridge today?
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted active:scale-95">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                msg.role === 'user' ? "ml-auto bg-primary text-primary-foreground rounded-br-md" : "mr-auto bg-muted rounded-bl-md"
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="mr-auto flex gap-1 rounded-2xl bg-muted px-4 py-3 rounded-bl-md">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t px-3 py-2.5">
            <div className="flex items-center gap-2">
              {hasSpeech && (
                <button onClick={toggleVoice} className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors active:scale-95",
                  isListening ? "bg-destructive text-destructive-foreground" : "bg-muted hover:bg-muted/80"
                )} aria-label={isListening ? "Stop listening" : "Voice input"}>
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder={isListening ? "Listening…" : "Ask about your fridge…"}
                className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isLoading}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 active:scale-95"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
