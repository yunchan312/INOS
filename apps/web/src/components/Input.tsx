import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className = '', ...rest },
  ref,
) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={['input-underline text-sm', className].join(' ').trim()}
        {...rest}
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-neutral-400">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, error, className = '', ...rest }, ref) {
    return (
      <div>
        {label && (
          <label className="block text-xs font-medium text-neutral-500 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={['input-underline text-sm resize-none', className]
            .join(' ')
            .trim()}
          {...rest}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-neutral-400">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
