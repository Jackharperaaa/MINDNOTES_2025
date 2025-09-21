import { useState } from 'react';
import { FileText, CheckSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { NoteType } from '@/types';

interface CreateNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: NoteType) => void;
}

export const CreateNoteDialog = ({ isOpen, onClose, onSelect }: CreateNoteDialogProps) => {
  const { t } = useLanguage();

  const handleSelect = (type: NoteType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center mb-4">{t('chooseNoteType')}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2 hover:bg-accent/50"
            onClick={() => handleSelect('freeform')}
          >
            <FileText className="w-8 h-8 text-primary" />
            <div className="text-center">
              <div className="font-medium">{t('emptyNote')}</div>
              <div className="text-xs text-muted-foreground">{t('emptyNoteDesc')}</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2 hover:bg-accent/50"
            onClick={() => handleSelect('checklist')}
          >
            <CheckSquare className="w-8 h-8 text-primary" />
            <div className="text-center">
              <div className="font-medium">{t('createChecklist')}</div>
              <div className="text-xs text-muted-foreground">{t('createChecklistDesc')}</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};