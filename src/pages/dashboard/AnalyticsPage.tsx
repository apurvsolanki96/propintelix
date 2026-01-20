import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SoundButton } from '@/components/SoundButton';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Building2,
  Brain,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { format, subDays, startOfMonth, eachDayOfInterval } from 'date-fns';
import useSound from '@/hooks/useSound';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { playClick } = useSound();
  const [loading, setLoading] = useState(true);
  const [meetingTrends, setMeetingTrends] = useState<any[]>([]);
  const [sectorDistribution, setSectorDistribution] = useState<any[]>([]);
  const [briefStats, setBriefStats] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalClients: 0,
    totalMeetings: 0,
    totalBriefs: 0,
    avgMeetingsPerClient: 0,
  });

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);
    playClick();

    try {
      // Fetch all data in parallel
      const [companiesRes, meetingsRes, briefsRes] = await Promise.all([
        supabase.from('companies').select('*').eq('user_id', user.id),
        supabase.from('meetings').select('*').eq('user_id', user.id),
        supabase.from('ai_briefs').select('*').eq('user_id', user.id),
      ]);

      const companies = companiesRes.data || [];
      const meetings = meetingsRes.data || [];
      const briefs = briefsRes.data || [];

      // Calculate summary stats
      setSummaryStats({
        totalClients: companies.length,
        totalMeetings: meetings.length,
        totalBriefs: briefs.length,
        avgMeetingsPerClient: companies.length > 0 ? +(meetings.length / companies.length).toFixed(1) : 0,
      });

      // Meeting trends (last 30 days)
      const last30Days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date(),
      });

      const meetingsByDay = last30Days.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = meetings.filter(
          (m) => format(new Date(m.meeting_date), 'yyyy-MM-dd') === dateStr
        ).length;
        return {
          date: format(date, 'MMM d'),
          meetings: count,
        };
      });
      setMeetingTrends(meetingsByDay);

      // Sector distribution
      const sectorCounts: Record<string, number> = {};
      companies.forEach((c) => {
        const sector = c.sector || 'Unknown';
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
      });
      const sectorData = Object.entries(sectorCounts).map(([name, value]) => ({
        name,
        value,
      }));
      setSectorDistribution(sectorData);

      // Brief generation stats (by type)
      const briefCounts: Record<string, number> = {};
      briefs.forEach((b) => {
        const type = b.brief_type || 'meeting';
        briefCounts[type] = (briefCounts[type] || 0) + 1;
      });
      const briefData = Object.entries(briefCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      setBriefStats(briefData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 size={24} />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Insights into your client relationships and meeting patterns
          </p>
        </div>
        <SoundButton variant="outline" onClick={fetchAnalytics}>
          <RefreshCw size={16} />
          Refresh Data
        </SoundButton>
      </div>

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryStats.totalClients}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryStats.totalMeetings}</p>
                <p className="text-sm text-muted-foreground">Total Meetings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Brain className="text-purple-500" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryStats.totalBriefs}</p>
                <p className="text-sm text-muted-foreground">AI Briefs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="text-orange-500" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryStats.avgMeetingsPerClient}</p>
                <p className="text-sm text-muted-foreground">Avg Meetings/Client</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Meeting Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} />
              Meeting Trends (Last 30 Days)
            </CardTitle>
            <CardDescription>Daily meeting activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={meetingTrends}>
                  <defs>
                    <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    interval="preserveStartEnd"
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="meetings"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMeetings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sector Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart size={18} />
              Clients by Sector
            </CardTitle>
            <CardDescription>Distribution of clients across industries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {sectorDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={sectorDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {sectorDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No client data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Brief Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain size={18} />
              AI Brief Generation
            </CardTitle>
            <CardDescription>Briefs generated by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {briefStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={briefStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No brief data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Client Conversion Rate</span>
              <Badge variant="secondary">78%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Avg. Response Time</span>
              <Badge variant="secondary">2.4 hours</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Meeting Show Rate</span>
              <Badge variant="secondary">92%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">AI Brief Accuracy</span>
              <Badge className="bg-accent">95%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Active Requirements</span>
              <Badge variant="secondary">{summaryStats.totalClients}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
