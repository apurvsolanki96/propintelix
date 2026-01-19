import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import MeetingCard from '@/components/dashboard/MeetingCard';
import AddMeetingModal from '@/components/dashboard/AddMeetingModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MeetingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);

  const fetchMeetings = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('meetings')
      .select(`
        *,
        companies(id, name, sector, headquarters)
      `)
      .eq('user_id', user.id)
      .order('meeting_date', { ascending: true });

    setMeetings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMeetings();
  }, [user]);

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

  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.meeting_date) >= new Date()
  );
  const pastMeetings = meetings.filter(
    (m) => new Date(m.meeting_date) < new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Meetings</h1>
          <p className="text-muted-foreground text-sm">
            Schedule and manage your client meetings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/calendar')}
            className="gap-1"
          >
            <CalendarDays size={16} />
            Calendar View
          </Button>
          <AddMeetingModal onSuccess={fetchMeetings} />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : meetings.length > 0 ? (
        <div className="space-y-8">
          {upcomingMeetings.length > 0 && (
            <div>
              <h2 className="font-medium text-sm text-muted-foreground mb-4">
                Upcoming ({upcomingMeetings.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="relative">
                    {generating === meeting.id && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                    <MeetingCard
                      id={meeting.id}
                      title={meeting.title}
                      meetingDate={meeting.meeting_date}
                      location={meeting.location}
                      attendees={meeting.attendees}
                      status={meeting.status}
                      companyName={meeting.companies?.name}
                      onGenerateBrief={() => handleGenerateBrief(meeting)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastMeetings.length > 0 && (
            <div>
              <h2 className="font-medium text-sm text-muted-foreground mb-4">
                Past ({pastMeetings.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {pastMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    id={meeting.id}
                    title={meeting.title}
                    meetingDate={meeting.meeting_date}
                    location={meeting.location}
                    attendees={meeting.attendees}
                    status="completed"
                    companyName={meeting.companies?.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="font-semibold mb-2">No meetings scheduled</h3>
          <p className="text-muted-foreground mb-4">
            Schedule your first meeting to start using AI briefs
          </p>
          <AddMeetingModal onSuccess={fetchMeetings} />
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
