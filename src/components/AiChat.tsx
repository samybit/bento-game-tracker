'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/app/actions';
import { Send, Bot, User, Loader2, ArrowLeftSquare } from 'lucide-react';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AiChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const parseMarkdown = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-gray-100">$1</span>');
    formatted = formatted.replace(/\n[\*\-]\s/g, '<br><span class="text-[#6189ff] inline-block mt-2 mr-2 font-bold">•</span>');
    formatted = formatted.replace(/^[\*\-]\s/g, '<span class="text-[#6189ff] inline-block mr-2 font-bold">•</span>');
    formatted = formatted.replace(/\n/g, '<br>');
    return { __html: formatted };
  };

  // Dispatch an event to the AddGameForm component
  const handleFillForm = (tasks: string[]) => {
    const formattedTasks = tasks.join('\n');
    window.dispatchEvent(new CustomEvent('fill-achievements', { detail: formattedTasks }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

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
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm text-center px-4">
            Ask me about achievements, game lore, or how to unlock specific milestones.
          </div>
        ) : (
          messages.map((msg, idx) => {
            // --- NEW: Extract JSON block if it exists ---
            let textContent = msg.content;
            let extractedTasks: string[] = [];

            if (msg.role === 'model') {
              const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
              if (jsonMatch) {
                try {
                  extractedTasks = JSON.parse(jsonMatch[1]);
                  // Remove the JSON block from the readable text
                  textContent = textContent.replace(jsonMatch[0], '').trim();
                } catch (e) {
                  console.error("Failed to parse AI JSON", e);
                }
              }
            }

            return (
              <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                )}

                <div className={`flex flex-col gap-2 max-w-[85%]`}>
                  {/* Normal Text Chat Bubble */}
                  {textContent && (
                    <div
                      className={`p-3 text-sm rounded-lg ${msg.role === 'user'
                          ? 'bg-[#6189ff] text-white rounded-tr-none'
                          : 'bg-[#1a1a1a] border border-[#262626] text-gray-300 rounded-tl-none'
                        }`}
                      dangerouslySetInnerHTML={parseMarkdown(textContent)}
                    />
                  )}

                  {/* Interactive Tasks UI Card */}
                  {extractedTasks.length > 0 && (
                    <div className="bg-[#121212] border border-[#262626] rounded-lg p-3 mt-1 shadow-md">
                      <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Suggested Tasks</div>
                      <ul className="text-sm text-gray-300 mb-3 space-y-1">
                        {extractedTasks.slice(0, 3).map((task, i) => (
                          <li key={i} className="flex gap-2"><span className="text-[#6189ff]">•</span> {task}</li>
                        ))}
                        {extractedTasks.length > 3 && (
                          <li className="text-xs text-gray-500 italic ml-4">+ {extractedTasks.length - 3} more</li>
                        )}
                      </ul>
                      <button
                        onClick={() => handleFillForm(extractedTasks)}
                        className="w-full flex items-center justify-center gap-2 bg-[#262626] hover:bg-[#333] text-[#10b981] py-1.5 rounded-md text-sm font-medium transition-colors border border-[#333]"
                      >
                        <ArrowLeftSquare className="w-4 h-4" />
                        Send to Form
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#6189ff] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            );
          })
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

      <form onSubmit={handleSubmit} className="p-3 border-t border-[#262626] bg-[#0a0a0a]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemini for a roadmap..."
            disabled={isLoading}
            className="flex-1 bg-transparent border border-[#262626] rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#6189ff] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#6189ff] hover:bg-[#5179ef] text-white p-2 rounded-lg transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center w-10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}