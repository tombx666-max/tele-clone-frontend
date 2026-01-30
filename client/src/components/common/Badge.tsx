import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-500/20 text-gray-300',
    success: 'bg-green-500/20 text-green-300',
    warning: 'bg-yellow-500/20 text-yellow-300',
    danger: 'bg-red-500/20 text-red-300',
    info: 'bg-blue-500/20 text-blue-300',
    purple: 'bg-purple-500/20 text-purple-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}

// Role-specific badge
export function RoleBadge({ role }: { role: 'ADMIN' | 'PRO' | 'USER' }) {
  const variants: Record<string, 'purple' | 'warning' | 'info'> = {
    ADMIN: 'purple',
    PRO: 'warning',
    USER: 'info',
  };

  return <Badge variant={variants[role]}>{role}</Badge>;
}
