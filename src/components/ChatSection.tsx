import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatSectionProps {
  onCreateTaskListFromAI?: (title: string, tasks: string[], videoUrl?: string) => void;
}

export const ChatSection = ({ onCreateTaskListFromAI }: ChatSectionProps) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    t('suggestion1'),
    t('suggestion2'),
    t('suggestion3'),
    t('suggestion4'),
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Chama a nova Edge Function 'gemini-proxy'
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          user_message: content
        },
      });

      if (error) {
        throw new Error(`Erro ao invocar a Edge Function: ${error.message}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      const botResponse = data.response || "Desculpe, não consegui processar sua solicitação agora.";

      // Lógica para extrair o título e as tarefas da resposta formatada
      const taskListMatch = botResponse.match(/TITULO:\s*(.+?)(?:\n|\r\n)TAREFAS:\s*((?:\d+\.\s*.+(?:\n|\r\n?)*)+)/i);
      
      let displayMessage = "";
      
      if (taskListMatch) {
        const title = taskListMatch[1].trim();
        const taskText = taskListMatch[2];
        const tasks = taskText.split(/\d+\.\s*/).filter(task => task.trim()).map(task => task.trim().replace(/\n|\r\n/g, ''));
        
        if (tasks.length > 0) {
          // Atraso para dar tempo de ver a mensagem antes da transição de tela
          setTimeout(() => {
            onCreateTaskListFromAI?.(title, tasks);
          }, 500);
          
          displayMessage = `${t('createdTaskList')}: "${title}" ${t('withTasks')} ${tasks.length} ${t('tasks')} ${t('forYou')}`;
        } else {
          displayMessage = botResponse;
        }
      } else {
        displayMessage = botResponse;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: displayMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `❌ Erro: ${error instanceof Error ? error.message : 'Ocorreu um problema.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">{t('aiChat')}</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {t('chatSubtitle')}
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto mb-6 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('chatWelcomeTitle')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t('chatWelcomeSubtitle')}
            </p>

            {/* Suggestions */}
            <div className="grid gap-2 max-w-md mx-auto">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-3 rounded-lg bg-secondary border border-border hover:bg-accent transition-colors duration-200 text-sm text-muted-foreground hover:text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-foreground border border-border'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className={`p-3 rounded-md text-sm ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground border border-border'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-secondary text-foreground border border-border flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-secondary border border-border p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-sm text-muted-foreground">{t('thinking')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('askAI')}
          className="flex-1 bg-secondary border-border"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};