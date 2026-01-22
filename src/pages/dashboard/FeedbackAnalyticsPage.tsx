import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  ThumbsUp,
  BarChart3,
  MessageSquare,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';

interface FeedbackStats {
  totalFeedback: number;
  avgOverallRating: number;
  avgCommunication: number;
  avgResponseTime: number;
  avgProfessionalism: number;
  recommendRate: number;
  repeatCustomers: number;
  dealsClosed: number;
  clientsRemoved: number;
  totalDealValue: string;
}

const FeedbackAnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    avgOverallRating: 0,
    avgCommunication: 0,
    avgResponseTime: 0,
    avgProfessionalism: 0,
    recommendRate: 0,
    repeatCustomers: 0,
    dealsClosed: 0,
    clientsRemoved: 0,
    totalDealValue: '₹0',
  });

  const fetchFeedback = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('client_feedback')
      .select(`
        *,
        companies:company_id (name, sector)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setFeedbacks(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data: any[]) => {
    const dealClosures = data.filter((f) => f.feedback_type === 'deal_closure');
    const removals = data.filter((f) => f.feedback_type === 'removal');

    const avgRating = (key: string) => {
      const valid = data.filter((f) => f[key] != null);
      if (valid.length === 0) return 0;
      return valid.reduce((sum, f) => sum + f[key], 0) / valid.length;
    };

    const recommendYes = data.filter((f) => f.would_recommend === true).length;
    const recommendTotal = data.filter((f) => f.would_recommend !== null).length;

    setStats({
      totalFeedback: data.length,
      avgOverallRating: avgRating('overall_rating'),
      avgCommunication: avgRating('communication_rating'),
      avgResponseTime: avgRating('response_time_rating'),
      avgProfessionalism: avgRating('professionalism_rating'),
      recommendRate: recommendTotal > 0 ? (recommendYes / recommendTotal) * 100 : 0,
      repeatCustomers: data.filter((f) => f.is_repeat_customer).length,
      dealsClosed: dealClosures.length,
      clientsRemoved: removals.length,
      totalDealValue: dealClosures.reduce((sum, f) => {
        const val = parseFloat(f.deal_value?.replace(/[^0-9.]/g, '') || '0');
        return sum + val;
      }, 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }),
    });
  };

  useEffect(() => {
    fetchFeedback();
  }, [user]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

  const pieData = [
    { name: 'Deals Closed', value: stats.dealsClosed },
    { name: 'Clients Removed', value: stats.clientsRemoved },
  ];

  const ratingData = [
    { name: 'Overall', rating: stats.avgOverallRating },
    { name: 'Communication', rating: stats.avgCommunication },
    { name: 'Response Time', rating: stats.avgResponseTime },
    { name: 'Professionalism', rating: stats.avgProfessionalism },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-primary" />
          Feedback Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Monitor CSAT scores, customer satisfaction, and KPIs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CSAT Score</p>
                <p className="text-3xl font-bold">{stats.avgOverallRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">out of 10</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recommend Rate</p>
                <p className="text-3xl font-bold">{stats.recommendRate.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">would work again</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <ThumbsUp className="text-accent" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Repeat Customers</p>
                <p className="text-3xl font-bold">{stats.repeatCustomers}</p>
                <p className="text-xs text-muted-foreground">returning clients</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <RefreshCw className="text-secondary-foreground" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deal Value</p>
                <p className="text-2xl font-bold">{stats.totalDealValue}</p>
                <p className="text-xs text-muted-foreground">{stats.dealsClosed} deals</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ratings Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="rating" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Outcome Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              <Badge className="bg-primary/20 text-primary">
                <TrendingUp size={14} className="mr-1" />
                {stats.dealsClosed} Deals Closed
              </Badge>
              <Badge variant="secondary">
                <TrendingDown size={14} className="mr-1" />
                {stats.clientsRemoved} Removed
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare size={18} />
            Recent Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.slice(0, 10).map((feedback) => (
                <div
                  key={feedback.id}
                  className="p-4 bg-muted/50 rounded-lg flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {feedback.companies?.name || 'Unknown Client'}
                      </span>
                      <Badge
                        variant={feedback.feedback_type === 'deal_closure' ? 'default' : 'secondary'}
                      >
                        {feedback.feedback_type === 'deal_closure' ? 'Deal Closed' : 'Removed'}
                      </Badge>
                      {feedback.is_repeat_customer && (
                        <Badge variant="outline" className="text-xs">
                          Repeat Customer
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {feedback.reason || feedback.additional_comments || 'No comments provided'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(feedback.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    {feedback.overall_rating && (
                      <div className="flex items-center gap-1 text-primary">
                        <Star size={16} />
                        <span className="font-bold">{feedback.overall_rating}/10</span>
                      </div>
                    )}
                    {feedback.deal_value && (
                      <p className="text-sm font-medium text-accent mt-1">{feedback.deal_value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>No feedback collected yet</p>
              <p className="text-sm">Close deals or remove clients to start collecting feedback</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackAnalyticsPage;
