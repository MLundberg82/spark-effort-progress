import * as React from 'react';

type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'destructive';
};

type ToastActionElement = React.ReactElement;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cx(
      'fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 outline-none',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', open = true, ...props }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cx(
          'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border p-4 shadow-lg transition-all',
          variant === 'destructive'
            ? 'border-red-500/30 bg-red-500/10 text-red-50'
            : 'border-white/10 bg-zinc-950 text-white',
          className,
        )}
        {...props}
      />
    );
  },
);
Toast.displayName = 'Toast';

const ToastTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cx('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cx('text-sm text-white/70', className)} {...props} />
));
ToastDescription.displayName = 'ToastDescription';

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cx(
      'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white',
      className,
    )}
    {...props}
  >
    ×
  </button>
));
ToastClose.displayName = 'ToastClose';

const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cx(
      'inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/10 px-3 text-sm font-semibold text-lime-200 transition hover:bg-lime-400/20',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

type ToastVariant = NonNullable<ToastProps['variant']>;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};

export type { ToastProps, ToastActionElement, ToastVariant };