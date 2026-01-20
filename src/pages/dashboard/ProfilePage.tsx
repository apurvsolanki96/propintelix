import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SoundButton } from '@/components/SoundButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Loader2,
  Check,
  Shield,
  Bell,
  Volume2,
  Moon,
  UserCog,
} from 'lucide-react';
import { format } from 'date-fns';
import useSound from '@/hooks/useSound';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { playSuccess, playClick } = useSound();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    role: '',
    phone: '',
  });
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    emailNotifications: true,
    meetingReminders: true,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    playClick();
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
      playSuccess();
      toast({ title: 'Profile updated successfully!' });
      fetchProfile();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const userInitials = formData.full_name
    ? formData.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  const planLabel = profile?.plan === 'delight' ? 'Delight' : profile?.plan === 'basic' ? 'Basic' : 'Trial';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <UserCog size={24} />
          Profile & Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your account, preferences, and settings
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar & Email */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-lg">{formData.full_name || 'Set your name'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1">{planLabel} Plan</Badge>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="Your company"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="Sales Manager"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <SoundButton type="submit" variant="hero" disabled={loading} soundType="success">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check size={16} />
                    Save Changes
                  </>
                )}
              </SoundButton>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Plan Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={16} />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge
                variant={profile?.plan === 'delight' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {planLabel}
              </Badge>

              {profile?.plan === 'trial' && profile?.trial_ends_at && (
                <p className="text-xs text-muted-foreground">
                  Trial ends on {format(new Date(profile.trial_ends_at), 'MMMM d, yyyy')}
                </p>
              )}

              <div className="space-y-1 text-xs text-muted-foreground">
                {profile?.plan === 'delight' ? (
                  <>
                    <p>✓ Full AI agent access</p>
                    <p>✓ Automated pre-meeting briefs</p>
                    <p>✓ Unlimited AI brief generation</p>
                  </>
                ) : (
                  <>
                    <p>✓ Company overview</p>
                    <p>✓ Basic news access</p>
                    <p className="text-muted-foreground/60">✗ AI briefs (upgrade required)</p>
                  </>
                )}
              </div>

              <SoundButton variant="hero-outline" size="sm" className="w-full">
                Upgrade Plan
              </SoundButton>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-muted-foreground" />
                  <Label htmlFor="sound" className="text-sm">Sound Effects</Label>
                </div>
                <Switch
                  id="sound"
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => {
                    playClick();
                    setPreferences({ ...preferences, soundEnabled: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-muted-foreground" />
                  <Label htmlFor="notifications" className="text-sm">Notifications</Label>
                </div>
                <Switch
                  id="notifications"
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) => {
                    playClick();
                    setPreferences({ ...preferences, notificationsEnabled: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground" />
                  <Label htmlFor="emailNotifications" className="text-sm">Email Alerts</Label>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => {
                    playClick();
                    setPreferences({ ...preferences, emailNotifications: checked });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
