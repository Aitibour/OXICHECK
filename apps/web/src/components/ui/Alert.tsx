import clsx from 'clsx';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantConfig: Record<AlertVariant, { icon: typeof CheckCircleIcon; bg: string; text: string; border: string }> = {
  info: { icon: InformationCircleIcon, bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  success: { icon: CheckCircleIcon, bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  warning: { icon: ExclamationTriangleIcon, bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  error: { icon: XCircleIcon, bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={clsx('rounded-brand border p-4', config.bg, config.border, className)}
    >
      <div className="flex gap-3">
        <Icon className={clsx('h-5 w-5 shrink-0 mt-0.5', config.text)} aria-hidden="true" />
        <div className={config.text}>
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
