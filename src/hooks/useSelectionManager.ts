import { useState, useCallback, useRef } from 'react';

export const useSelectionManager = () => {
  const [savedSelectionRange, setSavedSelectionRange] = useState<Range | null>(null);
  const selectionRef = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      selectionRef.current = range;
      setSavedSelectionRange(range);
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (selectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRef.current);
      }
    }
  }, []);

  const clearSelection = useCallback(() => {
    selectionRef.current = null;
    setSavedSelectionRange(null);
  }, []);

  const applyToSelection = useCallback((callback: (range: Range) => void) => {
    if (selectionRef.current) {
      callback(selectionRef.current);
    }
  }, []);

  return {
    savedSelectionRange,
    saveSelection,
    restoreSelection,
    clearSelection,
    applyToSelection
  };
};