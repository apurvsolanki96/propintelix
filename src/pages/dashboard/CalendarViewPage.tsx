import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AddMeetingModal from '@/components/dashboard/AddMeetingModal';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  List,
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';

const CalendarViewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const fetchMeetings = async () => {
    if (!user) return;
    setLoading(true);

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data } = await supabase
      .from('meetings')
      .select(`
        *,
        companies(id, name, sector)
      `)
      .eq('user_id', user.id)
      .gte('meeting_date', start.toISOString())
      .lte('meeting_date', end.toISOString())
      .order('meeting_date', { ascending: true });

    setMeetings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMeetings();
  }, [user, currentMonth]);

  const handleGenerateBrief = async (meeting: any) => {
    if (!user) return;
    setGenerating(meeting.id);

    try {
      const response = await supabase.functions.invoke('generate-ai-brief', {
        body: {
          meeting_id: meeting.id,
          company_id: meeting.company_id,
          company_name: meeting.companies?.name,
          company_sector: meeting.companies?.sector,
          meeting_title: meeting.title,
          meeting_date: meeting.meeting_date,
          agenda: meeting.agenda,
        },
      });

      if (response.error) throw response.error;

      toast({ title: 'AI Brief generated successfully!' });
      navigate('/dashboard/ai-briefs');
    } catch (error: any) {
      toast({
        title: 'Error generating brief',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  // Get meetings for selected date
  const selectedDateMeetings = meetings.filter((m) =>
    isSameDay(new Date(m.meeting_date), selectedDate)
  );

  // Get days with meetings for calendar highlighting
  const daysWithMeetings = meetings.map((m) => new Date(m.meeting_date));

  const modifiers = {
    hasMeeting: daysWithMeetings,
  };

  const modifiersStyles = {
    hasMeeting: {
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      borderRadius: '50%',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your meetings in calendar view
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/meetings')}
            className="gap-1"
          >
            <List size={16} />
            List View
          </Button>
          <AddMeetingModal onSuccess={fetchMeetings} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon size={20} />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                  )
                }
              >
                <ChevronLeft size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                  )
                }
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>

        {/* Selected Day Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isToday(selectedDate) ? 'bg-primary' : 'bg-muted'
                  }`}
                />
                {format(selectedDate, 'EEEE, MMM d')}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : selectedDateMeetings.length > 0 ? (
              <div className="space-y-3">
                {selectedDateMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-4 bg-muted/50 rounded-lg border border-border/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{meeting.title}</h4>
                        {meeting.companies?.name && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Building2 size={12} />
                            {meeting.companies.name}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={meeting.status === 'scheduled' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {meeting.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(meeting.meeting_date), 'h:mm a')}
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          {meeting.location}
                        </div>
                      )}
                    </div>

                    {meeting.agenda && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {meeting.agenda}
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1"
                      onClick={() => handleGenerateBrief(meeting)}
                      disabled={generating === meeting.id}
                    >
                      {generating === meeting.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      Generate AI Brief
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon
                  className="mx-auto text-muted-foreground mb-3"
                  size={32}
                />
                <p className="text-sm text-muted-foreground mb-4">
                  No meetings on this day
                </p>
                <AddMeetingModal onSuccess={fetchMeetings} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">This Month Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{meetings.length}</p>
              <p className="text-sm text-muted-foreground">Total Meetings</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-accent">
                {meetings.filter((m) => m.status === 'scheduled').length}
              </p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">
                {meetings.filter((m) => m.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">
                {new Set(meetings.map((m) => m.company_id).filter(Boolean)).size}
              </p>
              <p className="text-sm text-muted-foreground">Companies</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarViewPage;