import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, text?: string) => void;
  selectedText?: string;
}

export const LinkDialog = ({ isOpen, onClose, onSubmit, selectedText }: LinkDialogProps) => {
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLinkText(selectedText || '');
      setUrl('');
    }
  }, [isOpen, selectedText]);

  useEffect(() => {
    // Valida URL em tempo real
    if (url.trim()) {
      try {
        let testUrl = url.trim();
        if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
          testUrl = 'https://' + testUrl;
        }
        new URL(testUrl);
        setIsValidUrl(true);
      } catch {
        setIsValidUrl(false);
      }
    } else {
      setIsValidUrl(false);
    }
  }, [url]);

  const handleSubmit = () => {
    if (isValidUrl) {
      let validUrl = url.trim();
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      onSubmit(validUrl, linkText.trim() || selectedText);
      handleClose();
    }
  };

  const handleClose = () => {
    setUrl('');
    setLinkText('');
    setIsValidUrl(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidUrl) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-background border border-border rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Adicionar Link</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Texto selecionado */}
            {selectedText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-muted rounded-lg border"
              >
                <div className="text-sm text-muted-foreground mb-1">Texto selecionado:</div>
                <div className="text-sm font-medium text-foreground break-words">"{selectedText}"</div>
              </motion.div>
            )}

            {/* Campos do formulário */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  URL do Link *
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="exemplo.com ou https://exemplo.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full pr-10 ${
                      url && !isValidUrl ? 'border-red-500 focus:border-red-500' : ''
                    } ${
                      url && isValidUrl ? 'border-green-500 focus:border-green-500' : ''
                    }`}
                    autoFocus
                  />
                  {url && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidUrl ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {url && !isValidUrl ? (
                    <span className="text-red-500">URL inválida</span>
                  ) : (
                    'Digite a URL (https:// será adicionado automaticamente se necessário)'
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Texto do Link (opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Texto que aparecerá como link"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Deixe vazio para usar o texto selecionado
                </div>
              </div>
            </div>

            {/* Preview do link */}
            {isValidUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Preview:</div>
                <div className="text-sm">
                  <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer">
                    {linkText || selectedText || url}
                  </span>
                  <span className="text-muted-foreground ml-2">→ {url}</span>
                </div>
              </motion.div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!isValidUrl}
              >
                <Check className="w-4 h-4 mr-2" />
                Adicionar Link
              </Button>
            </div>

            {/* Dica de uso */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
            >
              <div className="text-xs text-amber-600 dark:text-amber-400">
                💡 <strong>Dica:</strong> Selecione o texto que deseja transformar em link antes de abrir este diálogo.
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};