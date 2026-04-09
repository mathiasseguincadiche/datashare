import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export default function Input({
  label,
  hint,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name || label;

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input
        id={inputId}
        className={`input ${error ? 'input--error' : ''} ${className}`.trim()}
        {...props}
      />
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
