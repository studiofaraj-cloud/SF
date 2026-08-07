import * as React from 'react';

import {cn} from '@/lib/utils';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  /**
   * When true, the textarea grows to fit its content (no inner scrollbar),
   * on mount and as the user types. Works for controlled and uncontrolled use.
   */
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({className, autoResize, onInput, value, defaultValue, ...props}, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref]
    );

    const resize = React.useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    // Fit to content on mount and whenever the value changes programmatically.
    React.useEffect(() => {
      resize();
    }, [resize, value, defaultValue]);

    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          autoResize && 'resize-none overflow-hidden',
          className
        )}
        ref={setRefs}
        value={value}
        defaultValue={defaultValue}
        onInput={(e) => {
          resize();
          onInput?.(e);
        }}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
