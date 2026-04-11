import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function ButtonColorful({
  className,
  label = 'Start',
  ...props
}: ButtonColorfulProps) {
  return (
    <Button
      className={cn(
        'relative h-9 px-4 overflow-hidden',
        'bg-[#1d0e1a]',
        'transition-all duration-200',
        'group',
        className,
      )}
      {...props}
    >
      {/* Gradient background effect */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-gradient-to-r from-[#efdbea] via-[#9c528b] to-[#341830]',
          'opacity-55 group-hover:opacity-90',
          'blur transition-opacity duration-500',
        )}
      />

      {/* Content */}
      <div className="relative flex items-center justify-center gap-1.5">
        <span className="text-white text-sm font-medium">{label}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-white/90" />
      </div>
    </Button>
  );
}
