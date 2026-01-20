import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SoundButton } from '@/components/SoundButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Download,
  FileText,
  Building2,
  Calendar,
  Brain,
  Loader2,
  FileDown,
} from 'lucide-react';
import {
  exportClientsToPDF,
  exportMeetingsToPDF,
  exportBriefsToPDF,
  exportAllDataToPDF,
} from '@/lib/pdfExport';
import useSound from '@/hooks/useSound';

const DataExportPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { playClick, playSuccess } = useSound();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [data, setData] = useState({
    clients: [] as any[],
    meetings: [] as any[],
    briefs: [] as any[],
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [clientsRes, meetingsRes, briefsRes] = await Promise.all([
      supabase.from('companies').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('meetings').select('*, companies(name)').eq('user_id', user.id).order('meeting_date', { ascending: false }),
      supabase.from('ai_briefs').select('*, companies(name)').eq('user_id', user.id).order('generated_at', { ascending: false }),
    ]);

    setData({
      clients: clientsRes.data || [],
      meetings: meetingsRes.data || [],
      briefs: briefsRes.data || [],
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleExport = async (type: 'clients' | 'meetings' | 'briefs' | 'all') => {
    playClick();
    setExporting(type);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay for UX

      switch (type) {
        case 'clients':
          exportClientsToPDF(data.clients);
          break;
        case 'meetings':
          exportMeetingsToPDF(data.meetings);
          break;
        case 'briefs':
          exportBriefsToPDF(data.briefs);
          break;
        case 'all':
          exportAllDataToPDF(data.clients, data.meetings, data.briefs);
          break;
      }

      playSuccess();
      toast({ title: 'Export successful!', description: 'Your PDF has been downloaded.' });
    } catch (error: any) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <FileDown size={24} />
          Data Export
        </h1>
        <p className="text-muted-foreground text-sm">
          Export your data to PDF format for reporting and backup
        </p>
      </div>

      {/* Export Options */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Clients Export */}
        <Card className="group hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="text-primary" size={20} />
              </div>
              <div>
                <CardTitle className="text-base">Clients</CardTitle>
                <CardDescription className="text-xs">{data.clients.length} records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all client data including contact info, sectors, and verification status.
            </p>
            <SoundButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleExport('clients')}
              disabled={exporting !== null || data.clients.length === 0}
            >
              {exporting === 'clients' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Download size={14} />
                  Export PDF
                </>
              )}
            </SoundButton>
          </CardContent>
        </Card>

        {/* Meetings Export */}
        <Card className="group hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="text-accent" size={20} />
              </div>
              <div>
                <CardTitle className="text-base">Meetings</CardTitle>
                <CardDescription className="text-xs">{data.meetings.length} records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export meeting history with dates, locations, attendees, and status.
            </p>
            <SoundButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleExport('meetings')}
              disabled={exporting !== null || data.meetings.length === 0}
            >
              {exporting === 'meetings' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Download size={14} />
                  Export PDF
                </>
              )}
            </SoundButton>
          </CardContent>
        </Card>

        {/* AI Briefs Export */}
        <Card className="group hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Brain className="text-purple-500" size={20} />
              </div>
              <div>
                <CardTitle className="text-base">AI Briefs</CardTitle>
                <CardDescription className="text-xs">{data.briefs.length} records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export AI-generated briefs with summaries and generation dates.
            </p>
            <SoundButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleExport('briefs')}
              disabled={exporting !== null || data.briefs.length === 0}
            >
              {exporting === 'briefs' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Download size={14} />
                  Export PDF
                </>
              )}
            </SoundButton>
          </CardContent>
        </Card>

        {/* Full Export */}
        <Card className="group hover:shadow-lg transition-shadow border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileText className="text-primary" size={20} />
              </div>
              <div>
                <CardTitle className="text-base">Complete Export</CardTitle>
                <Badge variant="secondary" className="text-xs">All Data</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export everything in one comprehensive PDF report.
            </p>
            <SoundButton
              variant="hero"
              size="sm"
              className="w-full"
              onClick={() => handleExport('all')}
              disabled={exporting !== null}
            >
              {exporting === 'all' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Download size={14} />
                  Export All
                </>
              )}
            </SoundButton>
          </CardContent>
        </Card>
      </div>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
          <CardDescription>Overview of data available for export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Clients</span>
                <Building2 size={16} className="text-primary" />
              </div>
              <p className="text-2xl font-bold">{data.clients.length}</p>
              <p className="text-xs text-muted-foreground">
                {data.clients.filter((c) => c.verified).length} verified
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Meetings</span>
                <Calendar size={16} className="text-accent" />
              </div>
              <p className="text-2xl font-bold">{data.meetings.length}</p>
              <p className="text-xs text-muted-foreground">
                {data.meetings.filter((m) => m.status === 'scheduled').length} scheduled
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">AI Briefs</span>
                <Brain size={16} className="text-purple-500" />
              </div>
              <p className="text-2xl font-bold">{data.briefs.length}</p>
              <p className="text-xs text-muted-foreground">
                Generated reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExportPage;
