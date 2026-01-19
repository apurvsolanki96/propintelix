import { Calendar, MapPin, Users, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isTomorrow } from 'date-fns';

interface MeetingCardProps {
  id: string;
  title: string;
  meetingDate: string;
  location: string | null;
  attendees: string[] | null;
  status: string | null;
  companyName?: string;
  onGenerateBrief?: () => void;
}

const MeetingCard = ({
  id,
  title,
  meetingDate,
  location,
  attendees,
  status,
  companyName,
  onGenerateBrief,
}: MeetingCardProps) => {
  const date = new Date(meetingDate);
  const dateLabel = isToday(date)
    ? 'Today'
    : isTomorrow(date)
    ? 'Tomorrow'
    : format(date, 'MMM d');

  return (
    <div className="glass-card p-4 hover-lift">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
            <span className="text-xs font-medium">{format(date, 'MMM')}</span>
            <span className="text-lg font-bold leading-none">{format(date, 'd')}</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            {companyName && (
              <p className="text-xs text-muted-foreground">{companyName}</p>
            )}
          </div>
        </div>
        <Badge
          variant={status === 'scheduled' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {dateLabel}
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-2">
          <Clock size={12} />
          <span>{format(date, 'h:mm a')}</span>
        </div>
        {location && (
          <div className="flex items-center gap-2">
            <MapPin size={12} />
            <span>{location}</span>
          </div>
        )}
        {attendees && attendees.length > 0 && (
          <div className="flex items-center gap-2">
            <Users size={12} />
            <span>{attendees.length} attendee{attendees.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <Button
        variant="hero"
        size="sm"
        className="w-full gap-1"
        onClick={onGenerateBrief}
      >
        <Sparkles size={14} />
        Generate AI Brief
      </Button>
    </div>
  );
};

export default MeetingCard;
