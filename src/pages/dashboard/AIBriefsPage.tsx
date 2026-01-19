import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AIBriefCard from '@/components/dashboard/AIBriefCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AIBriefsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [briefs, setBriefs] = useState<any[]>([]);

  const fetchBriefs = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('ai_briefs')
      .select(`
        *,
        meetings(title, meeting_date),
        companies(name)
      `)
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false });

    setBriefs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBriefs();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">AI Briefs</h1>
        <p className="text-muted-foreground text-sm">
          AI-generated meeting briefs and insights for your clients
        </p>
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : briefs.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {briefs.map((brief) => (
            <AIBriefCard
              key={brief.id}
              companyName={brief.companies?.name}
              meetingTitle={brief.meetings?.title}
              meetingDate={brief.meetings?.meeting_date}
              content={brief.content}
              generatedAt={brief.generated_at}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Brain className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="font-semibold mb-2">No AI briefs yet</h3>
          <p className="text-muted-foreground mb-4">
            Schedule a meeting and generate your first AI brief to get started
          </p>
          <Link to="/dashboard/meetings">
            <Button variant="hero">Go to Meetings</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AIBriefsPage;
