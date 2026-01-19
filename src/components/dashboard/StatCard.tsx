import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
}: StatCardProps) => {
  return (
    <div className="glass-card p-5 hover-lift">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold font-display">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs mt-1",
                changeType === 'positive' && "text-green-400",
                changeType === 'negative' && "text-red-400",
                changeType === 'neutral' && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg bg-primary/10", iconColor)}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
