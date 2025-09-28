import React, { useRef, useEffect, HTMLAttributes, forwardRef } from 'react';

interface ContentEditableDivProps extends HTMLAttributes<HTMLDivElement> {
  initialHTML: string;
  onHTMLChange: (html: string) => void;
}

export const ContentEditableDiv = forwardRef<HTMLDivElement, ContentEditableDivProps>(
  ({ initialHTML, onHTMLChange, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const currentRef = (ref as React.MutableRefObject<HTMLDivElement>) || internalRef;

    useEffect(() => {
      if (currentRef.current && currentRef.current.innerHTML !== initialHTML) {
        currentRef.current.innerHTML = initialHTML;
      }
    }, [initialHTML]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      onHTMLChange(e.currentTarget.innerHTML);
    };

    return (
      <div
        {...props}
        ref={currentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
      />
    );
  }
);

ContentEditableDiv.displayName = 'ContentEditableDiv';