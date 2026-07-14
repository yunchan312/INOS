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
        <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={['input-underline text-sm', className].join(' ').trim()}
        {...rest}
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
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
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
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
          <p className="mt-1 text-xs text-muted">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
