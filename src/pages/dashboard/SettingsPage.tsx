import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    role: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        company_name: data.company_name || '',
        role: data.role || '',
        phone: data.phone || '',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Profile updated successfully!' });
      fetchProfile();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const planLabel = profile?.plan === 'delight' ? 'Delight' : profile?.plan === 'basic' ? 'Basic' : 'Trial';

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4">Profile Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Rajesh Sharma"
            />
          </div>

          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Your Company"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Sales Manager"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <Button type="submit" variant="hero" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check size={16} className="mr-1" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Plan Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Current Plan</h2>
          <Badge
            variant={profile?.plan === 'delight' ? 'default' : 'secondary'}
            className="text-sm"
          >
            {planLabel}
          </Badge>
        </div>

        {profile?.plan === 'trial' && profile?.trial_ends_at && (
          <p className="text-sm text-muted-foreground mb-4">
            Trial ends on {format(new Date(profile.trial_ends_at), 'MMMM d, yyyy')}
          </p>
        )}

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          {profile?.plan === 'delight' ? (
            <>
              <p>✓ Full AI agent access</p>
              <p>✓ Automated pre-meeting briefs</p>
              <p>✓ Indian news & FDI alerts</p>
              <p>✓ Social media & financial insights</p>
              <p>✓ Unlimited AI brief generation</p>
            </>
          ) : (
            <>
              <p>✓ Company overview</p>
              <p>✓ Basic news access</p>
              <p>✓ Manual refresh</p>
              <p className="text-muted-foreground/60">✗ AI briefs (upgrade required)</p>
            </>
          )}
        </div>

        <Button variant="hero-outline">Upgrade Plan</Button>
      </div>
    </div>
  );
};

export default SettingsPage;
