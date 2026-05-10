import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatResponse {
  reply?: string;
}

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8000/api/chat';

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello, I am ready to help. Send your question anytime.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createMessage = (text: string, sender: Message['sender']): Message => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    sender,
    timestamp: new Date(),
  });

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const requestAIReply = async (message: string): Promise<string> => {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, stream: false, history: [] }),
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const data: ChatResponse = await response.json();
    const reply = data.reply?.trim();

    if (!reply) {
      throw new Error('Invalid API response');
    }

    return reply;
  };

  const handleSend = async () => {
    const userInput = inputValue.trim();

    // Prevent empty submissions and duplicate sends while awaiting response.
    if (!userInput || isLoading) return;

    appendMessage(createMessage(userInput, 'user'));
    setInputValue('');
    setIsLoading(true);

    try {
      const aiReply = await requestAIReply(userInput);
      appendMessage(createMessage(aiReply, 'ai'));
    } catch {
      appendMessage(createMessage('Server is unavailable', 'ai'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-600 to-sky-600 shadow-[0_12px_28px_rgba(37,99,235,0.2)] flex items-center justify-center group border border-white/60"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        animate={
          !isOpen
            ? {
                boxShadow: [
                  '0 10px 24px rgba(37, 99, 235, 0.16)',
                  '0 12px 30px rgba(45, 212, 191, 0.12)',
                  '0 10px 24px rgba(37, 99, 235, 0.16)',
                ],
              }
            : {
                boxShadow: '0 18px 38px rgba(37, 99, 235, 0.22)',
              }
        }
        transition={{
          boxShadow:
            !isOpen
              ? {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : { duration: 0.3 },
        }}
      >
        {/* Idle pulse ring when closed */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-blue-300 opacity-30"
          />
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[340px] md:w-[360px] h-[450px] max-h-[70vh] sm:max-h-[80vh] bg-white/96 backdrop-blur-xl rounded-[14px] shadow-[0_18px_50px_rgba(15,23,42,0.14)] border border-slate-200 flex flex-col overflow-hidden hover:border-slate-300 transition-colors duration-300"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-[0_8px_18px_rgba(37,99,235,0.14)]"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-slate-900">AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-green-500"
                    />
                    <span className="text-xs text-slate-500">Online</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`max-w-[80%] px-4 py-3 rounded-2xl transition-all duration-200 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-sky-600 text-white rounded-br-md shadow-[0_8px_18px_rgba(37,99,235,0.12)]'
                        : 'bg-slate-100 text-slate-800 rounded-bl-md hover:bg-slate-200'
                    }`}
                  >
                    {message.sender === 'ai' ? (
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(marked.parse(message.text || '')),
                        }}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    )}
                  </motion.div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md bg-slate-100">
                    <div className="flex gap-1.5">
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-slate-400"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        className="w-2 h-2 rounded-full bg-slate-400"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-slate-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white"
            >
              <div className="flex items-center gap-2">
                <motion.input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? 'Menunggu respons...' : 'Type a message...'}
                  disabled={isLoading}
                  whileFocus={{ scale: 1.02 }}
                  className="flex-1 bg-white text-slate-800 placeholder:text-slate-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all text-sm border border-slate-300"
                />
                <motion.button
                  onClick={handleSend}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  disabled={isLoading || !inputValue.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-[0_8px_18px_rgba(37,99,235,0.14)] hover:shadow-[0_12px_22px_rgba(37,99,235,0.2)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Chat berjalan tanpa login dan tidak menyimpan riwayat percakapan.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}