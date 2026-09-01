import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent/90 active:scale-[0.98] shadow-sm shadow-accent/20',
  secondary:
    'bg-surface text-text border border-border hover:bg-bg active:scale-[0.98]',
  ghost: 'text-text-muted hover:text-text hover:bg-bg active:scale-[0.98]',
  danger:
    'bg-danger/10 text-danger hover:bg-danger/20 active:scale-[0.98]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      fullWidth = false,
      loading = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-[var(--radius-button)] px-5 py-3
          text-sm font-medium
          transition-all duration-150 ease-out
          disabled:opacity-50 disabled:pointer-events-none
          ${variantStyles[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
