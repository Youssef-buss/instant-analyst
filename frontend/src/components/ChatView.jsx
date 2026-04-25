import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { askQuestion } from '../api/client';
import ReactMarkdown from 'react-markdown';

const ChatView = ({ file }) => {
  const [messages, setMessages] = useState([
    { role: 'system', content: `Hello! I'm ready to answer questions about **${file?.name}**. What would you like to know?` }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mutation = useMutation({
    mutationFn: (question) => askQuestion(file, question),
    onSuccess: (data) => {
      let answerText = data.answer || 'No answer provided.';
      if (typeof answerText === 'object') {
        answerText = Object.entries(answerText)
          .map(([key, value]) => `- **${key}**: ${value}`)
          .join('\n');
      }
      setMessages(prev => [...prev, { role: 'system', content: answerText }]);
    },
    onError: (error) => {
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${error.message}` }]);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || mutation.isPending) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    mutation.mutate(userMsg);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-surface rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-lg font-semibold flex items-center">
          <Bot className="w-5 h-5 mr-2 text-primary" />
          Ask Your Data
        </h2>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${msg.role === 'user' ? 'bg-primary ml-3' : 'bg-slate-700 mr-3'}`}
              >
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-primary" />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}>
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="prose prose-invert max-w-none text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {mutation.isPending && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 mr-3 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your dataset..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            disabled={mutation.isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || mutation.isPending}
            className="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
