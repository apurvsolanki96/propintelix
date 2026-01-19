import { useEffect, useState } from 'react';
import { Building2, Calendar, TrendingUp, Brain, Newspaper, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/dashboard/StatCard';
import ClientCard from '@/components/dashboard/ClientCard';
import MeetingCard from '@/components/dashboard/MeetingCard';
import NewsCard from '@/components/dashboard/NewsCard';
import AddClientModal from '@/components/dashboard/AddClientModal';
import AddMeetingModal from '@/components/dashboard/AddMeetingModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    upcomingMeetings: 0,
    aiBriefs: 0,
    activeDeals: 0,
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch companies with requirements
      const { data: companiesData } = await supabase
        .from('companies')
        .select(`
          *,
          client_requirements(*),
          meetings(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      // Fetch upcoming meetings
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select(`
          *,
          companies(name)
        `)
        .eq('user_id', user.id)
        .gte('meeting_date', new Date().toISOString())
        .order('meeting_date', { ascending: true })
        .limit(3);

      // Fetch news
      const { data: newsData } = await supabase
        .from('news_items')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(4);

      // Fetch counts
      const { count: clientCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: meetingCount } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('meeting_date', new Date().toISOString());

      const { count: briefCount } = await supabase
        .from('ai_briefs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: activeDeals } = await supabase
        .from('client_requirements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      setCompanies(companiesData || []);
      setMeetings(meetingsData || []);
      setNews(newsData || []);
      setStats({
        totalClients: clientCount || 0,
        upcomingMeetings: meetingCount || 0,
        aiBriefs: briefCount || 0,
        activeDeals: activeDeals || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground text-sm">
            Here's what's happening with your clients today.
          </p>
        </div>
        <div className="flex gap-2">
          <AddClientModal onSuccess={fetchData} />
          <AddMeetingModal onSuccess={fetchData} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              change="+3 this month"
              changeType="positive"
              icon={Building2}
            />
            <StatCard
              title="Upcoming Meetings"
              value={stats.upcomingMeetings}
              change="Next 7 days"
              changeType="neutral"
              icon={Calendar}
            />
            <StatCard
              title="AI Briefs Generated"
              value={stats.aiBriefs}
              change="This month"
              changeType="positive"
              icon={Brain}
            />
            <StatCard
              title="Active Requirements"
              value={stats.activeDeals}
              change="In progress"
              changeType="neutral"
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Clients */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Recent Clients</h2>
            <Link to="/dashboard/clients">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View all <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : companies.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {companies.map((company) => (
                <ClientCard
                  key={company.id}
                  company={company}
                  requirement={company.client_requirements?.[0]}
                  meeting={company.meetings?.find((m: any) => new Date(m.meeting_date) >= new Date())}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Building2 className="mx-auto mb-3 text-muted-foreground" size={40} />
              <p className="text-muted-foreground mb-4">No clients yet. Add your first client to get started!</p>
              <AddClientModal onSuccess={fetchData} />
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Upcoming Meetings</h2>
            <Link to="/dashboard/meetings">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View all <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : meetings.length > 0 ? (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  id={meeting.id}
                  title={meeting.title}
                  meetingDate={meeting.meeting_date}
                  location={meeting.location}
                  attendees={meeting.attendees}
                  status={meeting.status}
                  companyName={meeting.companies?.name}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 text-center">
              <Calendar className="mx-auto mb-3 text-muted-foreground" size={32} />
              <p className="text-sm text-muted-foreground mb-3">No upcoming meetings</p>
              <AddMeetingModal onSuccess={fetchData} />
            </div>
          )}
        </div>
      </div>

      {/* News Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <Newspaper size={18} className="text-primary" />
            Market Intelligence
          </h2>
          <Link to="/dashboard/news">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              View all <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {news.map((item) => (
              <NewsCard
                key={item.id}
                title={item.title}
                summary={item.summary}
                source={item.source}
                category={item.category}
                relevanceSectors={item.relevance_sectors}
                publishedAt={item.published_at}
                url={item.url}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
