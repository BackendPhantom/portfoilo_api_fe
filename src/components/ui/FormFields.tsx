/* ============================================
   Devfolio — Form Input Components
   ============================================ */

import {
  forwardRef,
  useState,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

/* ---- Shared wrapper ---- */
interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export function FieldWrapper({
  label,
  error,
  hint,
  required,
  children,
  htmlFor,
  className,
}: FieldWrapperProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-surface-300">
          {label}
          {required && <span className="ml-1 text-danger-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-surface-500">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1 text-xs text-danger-500"
          role="alert"
          aria-live="polite">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ---- Base input styling ---- */
const inputBase =
  "w-full rounded-lg border border-surface-700 bg-surface-800/50 px-3.5 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed";

const inputError =
  "border-danger-500 focus:border-danger-500 focus:ring-danger-500";

/* ---- TextInput ---- */
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <FieldWrapper
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={inputId}>
        <input
          ref={ref}
          id={inputId}
          className={cn(inputBase, error && inputError, className)}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          required={required}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
TextInput.displayName = "TextInput";

/* ---- PasswordInput ---- */
interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <FieldWrapper
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={inputId}>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={cn(inputBase, "pr-10", error && inputError, className)}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            required={required}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 cursor-pointer"
            aria-label={visible ? "Hide password" : "Show password"}>
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </FieldWrapper>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

/* ---- TextArea ---- */
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <FieldWrapper
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            inputBase,
            "min-h-[100px] resize-y",
            error && inputError,
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          required={required}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
TextArea.displayName = "TextArea";

/* ---- Select ---- */
interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      label,
      error,
      hint,
      required,
      options,
      placeholder,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <FieldWrapper
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={inputId}>
        <select
          ref={ref}
          id={inputId}
          className={cn(
            inputBase,
            "cursor-pointer appearance-none",
            error && inputError,
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          required={required}
          {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }
);
SelectInput.displayName = "SelectInput";

/* ---- Toggle / Switch ---- */
interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled,
  className,
}: ToggleProps) {
  const id = useId();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
          checked ? "bg-brand-600" : "bg-surface-700",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <label htmlFor={id} className="text-sm text-surface-300 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}

/* ---- Image Upload ---- */
interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
  hint?: string;
  accept?: string;
  className?: string;
  previewSize?: "sm" | "md" | "lg";
}

const previewSizes = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function ImageUpload({
  label,
  value,
  onChange,
  error,
  hint,
  accept = "image/*",
  className,
  previewSize = "md",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onChange(file);
  };

  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      htmlFor={id}
      className={className}>
      <div className="flex items-center gap-4">
        {preview && (
          <img
            src={preview}
            alt="Upload preview"
            className={cn(
              "rounded-lg object-cover border border-surface-700",
              previewSizes[previewSize]
            )}
          />
        )}
        <div>
          <label
            htmlFor={id}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-surface-700 bg-surface-800/50 px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-700">
            {preview ? "Change image" : "Upload image"}
          </label>
          <input
            id={id}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="sr-only"
          />
          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onChange(null);
              }}
              className="ml-2 text-xs text-danger-500 hover:underline cursor-pointer">
              Remove
            </button>
          )}
        </div>
      </div>
    </FieldWrapper>
  );
}

/* ---- Tag Input (Multi-Select) ---- */
interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  error?: string;
  hint?: string;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  label,
  value,
  onChange,
  suggestions = [],
  error,
  hint,
  placeholder = "Add tag…",
  className,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const id = useId();

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !value.includes(s.toLowerCase())
  );

  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      htmlFor={id}
      className={className}>
      <div
        className={cn(
          "flex flex-wrap gap-2 rounded-lg border border-surface-700 bg-surface-800/50 px-3 py-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500",
          error && "border-danger-500"
        )}>
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-brand-600/20 px-2 py-0.5 text-xs font-medium text-brand-400">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-brand-400 hover:text-brand-300 cursor-pointer"
              aria-label={`Remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <input
            id={id}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="w-full border-none bg-transparent p-0 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-0"
          />
          {showSuggestions && filtered.length > 0 && (
            <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-48 overflow-auto rounded-lg border border-surface-700 bg-surface-800 py-1 shadow-xl">
              {filtered.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={() => addTag(s)}
                    className="w-full px-3 py-1.5 text-left text-sm text-surface-300 hover:bg-surface-700 hover:text-surface-100 cursor-pointer">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </FieldWrapper>
  );
}
