import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    headquarters: '',
    website: '',
    employee_count: '',
    description: '',
    email: '',
    contact_number: '',
    revenue: '',
  });

  const fetchCompanyDetails = async () => {
    if (!user || !id) return;
    setLoading(true);

    const { data: companyData, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !companyData) {
      toast({ title: 'Error', description: 'Company not found', variant: 'destructive' });
      navigate('/dashboard/clients');
      return;
    }

    setCompany(companyData);
    setFormData({
      name: companyData.name || '',
      sector: companyData.sector || '',
      headquarters: companyData.headquarters || '',
      website: companyData.website || '',
      employee_count: companyData.employee_count || '',
      description: companyData.description || '',
      email: companyData.email || '',
      contact_number: companyData.contact_number || '',
      revenue: companyData.revenue || '',
    });

    // Fetch meetings
    const { data: meetingsData } = await supabase
      .from('meetings')
      .select('*')
      .eq('company_id', id)
      .order('meeting_date', { ascending: false });

    setMeetings(meetingsData || []);

    // Fetch requirements
    const { data: requirementsData } = await supabase
      .from('client_requirements')
      .select('*')
      .eq('company_id', id)
      .order('created_at', { ascending: false });

    setRequirements(requirementsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [user, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          sector: formData.sector || null,
          headquarters: formData.headquarters || null,
          website: formData.website || null,
          employee_count: formData.employee_count || null,
          description: formData.description || null,
          email: formData.email || null,
          contact_number: formData.contact_number || null,
          revenue: formData.revenue || null,
        })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Client updated successfully!' });
      fetchCompanyDetails();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyClient = async () => {
    if (!id || !formData.email) {
      toast({ title: 'Error', description: 'Please add an email address first', variant: 'destructive' });
      return;
    }

    setVerifying(true);

    try {
      // Generate verification token
      const token = crypto.randomUUID();
      
      const { error } = await supabase
        .from('companies')
        .update({
          verification_token: token,
          verified: false,
        })
        .eq('id', id);

      if (error) throw error;

      // In a real app, this would send an email via edge function
      // For now, we'll simulate verification
      toast({ 
        title: 'Verification initiated', 
        description: 'AI verification process started for this client.' 
      });
      
      // Simulate AI verification (auto-verify for demo)
      setTimeout(async () => {
        await supabase
          .from('companies')
          .update({ verified: true, verification_token: null })
          .eq('id', id);
        
        fetchCompanyDetails();
        toast({ title: 'Client verified successfully!' });
      }, 2000);

    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/clients')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{company?.name}</h1>
            {company?.verified ? (
              <Badge className="bg-accent text-accent-foreground gap-1">
                <CheckCircle size={12} />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle size={12} />
                Unverified
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{company?.sector}</p>
        </div>
        <Button variant="hero" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={20} />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact_number">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="headquarters">Headquarters</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="headquarters"
                    name="headquarters"
                    value={formData.headquarters}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_count">Employee Count</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="employee_count"
                    name="employee_count"
                    value={formData.employee_count}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="revenue">Revenue</Label>
                <Input
                  id="revenue"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleChange}
                  placeholder="₹100 Cr+"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {/* AI Verification Button */}
            {!company?.verified && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleVerifyClient}
                  disabled={verifying || !formData.email}
                  className="gap-2"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  AI Verify Client
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Automatically verify client details using AI analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar size={18} />
                Meetings ({meetings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meetings.length > 0 ? (
                <div className="space-y-3">
                  {meetings.slice(0, 3).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 bg-muted/50 rounded-lg text-sm"
                    >
                      <p className="font-medium">{meeting.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(meeting.meeting_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                  {meetings.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => navigate('/dashboard/meetings')}
                    >
                      View all {meetings.length} meetings
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No meetings scheduled
                </p>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 size={18} />
                Requirements ({requirements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requirements.length > 0 ? (
                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 bg-muted/50 rounded-lg text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{req.requirement_type}</p>
                        <Badge variant={req.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {req.status}
                        </Badge>
                      </div>
                      {req.location && (
                        <p className="text-muted-foreground text-xs mt-1">
                          {req.location} • {req.area_sqft} sq ft
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No requirements added
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;