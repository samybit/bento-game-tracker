'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/app/actions';
import { Send, Bot, User, Loader2 } from 'lucide-react';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AiChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Simple markdown parser replicating your vanilla JS logic
  const parseMarkdown = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-gray-100">$1</span>');
    formatted = formatted.replace(/\n[\*\-]\s/g, '<br><span class="text-[#8b5cf6] inline-block mt-2 mr-2 font-bold">•</span>');
    formatted = formatted.replace(/^[\*\-]\s/g, '<span class="text-[#8b5cf6] inline-block mr-2 font-bold">•</span>');
    formatted = formatted.replace(/\n/g, '<br>');
    return { __html: formatted };
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

    // Send to Server Action
    const result = await sendChatMessage(userText, messages);

    setIsLoading(false);

    if (result.reply) {
      setMessages([...newMessages, { role: 'model', content: result.reply }]);
    } else {
      setMessages([...newMessages, { role: 'model', content: "Sorry, I couldn't reach the server." }]);
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat History */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm text-center px-4">
            Ask me about achievements, game lore, or how to unlock specific milestones.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-[#0a0a0a]" />
                </div>
              )}

              <div
                className={`p-3 text-sm rounded-lg max-w-[85%] ${msg.role === 'user'
                    ? 'bg-[#8b5cf6] text-white rounded-tr-none'
                    : 'bg-[#1a1a1a] border border-[#262626] text-gray-300 rounded-tl-none'
                  }`}
                dangerouslySetInnerHTML={parseMarkdown(msg.content)}
              />

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <div className="p-3 bg-[#1a1a1a] border border-[#262626] rounded-lg rounded-tl-none">
              <Loader2 className="w-4 h-4 text-[#10b981] animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#262626] bg-[#0a0a0a]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemini..."
            disabled={isLoading}
            className="flex-1 bg-transparent border border-[#262626] rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white p-2 rounded-lg transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center w-10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}