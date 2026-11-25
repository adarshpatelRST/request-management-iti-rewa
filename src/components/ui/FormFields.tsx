import React from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  hideErrorMessage?: boolean;
}

export interface FormInputProps
  extends BaseFieldProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  showCount?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      required,
      error,
      helperText,
      className = '',
      id,
      hideErrorMessage,
      showCount,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id || `field-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const currentLength = typeof value === 'string' ? value.length : undefined;
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 flex items-center gap-1"
          >
            <span>{label}</span>
            {required && (
              <span className="text-rose-600 font-bold" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {showCount && maxLength && (
            <span className="text-[11px] font-mono text-slate-400">
              {currentLength !== undefined ? `${currentLength}/${maxLength}` : `max ${maxLength}`}
            </span>
          )}
        </div>
        <input
          id={inputId}
          ref={ref}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20'
          } disabled:bg-slate-100 disabled:text-slate-500`}
          {...props}
        />
        {helperText && !error && (
          <p className="text-[11px] text-slate-500">{helperText}</p>
        )}
        {error && !hideErrorMessage && (
          <div
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-0.5"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';

export interface FormSelectProps
  extends BaseFieldProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      required,
      error,
      helperText,
      options,
      placeholder,
      className = '',
      id,
      hideErrorMessage,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 flex items-center gap-1"
        >
          <span>{label}</span>
          {required && (
            <span className="text-rose-600 font-bold" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <select
          id={selectId}
          ref={ref}
          aria-invalid={!!error}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20'
          } disabled:bg-slate-100 disabled:text-slate-500`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {helperText && !error && (
          <p className="text-[11px] text-slate-500">{helperText}</p>
        )}
        {error && !hideErrorMessage && (
          <div
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-0.5"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);
FormSelect.displayName = 'FormSelect';

export interface FormTextareaProps
  extends BaseFieldProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  showCount?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      required,
      error,
      helperText,
      className = '',
      id,
      rows = 3,
      maxLength = 250,
      hideErrorMessage,
      showCount = true,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const currentLength = typeof value === 'string' ? value.length : undefined;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-slate-700 flex items-center gap-1"
          >
            <span>{label}</span>
            {required && (
              <span className="text-rose-600 font-bold" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {showCount && (
            <span className="text-[11px] font-mono text-slate-400">
              {currentLength !== undefined ? `${currentLength}/${maxLength}` : `max ${maxLength}`}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white transition-colors focus:outline-none focus:ring-2 resize-none h-[88px] min-h-[88px] max-h-[88px] overflow-y-auto ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20'
          } disabled:bg-slate-100 disabled:text-slate-500`}
          {...props}
        />
        {helperText && !error && (
          <p className="text-[11px] text-slate-500">{helperText}</p>
        )}
        {error && !hideErrorMessage && (
          <div
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-0.5"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);
FormTextarea.displayName = 'FormTextarea';
