import React, { useRef, useEffect, HTMLAttributes, forwardRef } from 'react';

interface ContentEditableDivProps extends HTMLAttributes<HTMLDivElement> {
  initialHTML: string;
  onBlur: (html: string) => void;
}

export const ContentEditableDiv = forwardRef<HTMLDivElement, ContentEditableDivProps>(
  ({ initialHTML, onBlur, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);

    // Use the passed ref or the internal ref
    const currentRef = (ref as React.MutableRefObject<HTMLDivElement>) || internalRef;

    useEffect(() => {
      if (currentRef.current && currentRef.current.innerHTML !== initialHTML) {
        currentRef.current.innerHTML = initialHTML;
      }
    }, [initialHTML]);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      onBlur(e.currentTarget.innerHTML);
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    return (
      <div
        ref={currentRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

ContentEditableDiv.displayName = 'ContentEditableDiv';