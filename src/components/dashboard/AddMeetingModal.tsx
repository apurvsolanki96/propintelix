import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
}

interface AddMeetingModalProps {
  onSuccess: () => void;
  preselectedCompanyId?: string;
}

const AddMeetingModal = ({ onSuccess, preselectedCompanyId }: AddMeetingModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    company_id: preselectedCompanyId || '',
    meeting_date: '',
    meeting_time: '',
    location: '',
    agenda: '',
  });

  useEffect(() => {
    if (open && user) {
      fetchCompanies();
    }
  }, [open, user]);

  const fetchCompanies = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('companies')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name');
    if (data) setCompanies(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const meetingDateTime = new Date(`${formData.meeting_date}T${formData.meeting_time}`);

      const { error } = await supabase.from('meetings').insert({
        user_id: user.id,
        title: formData.title,
        company_id: formData.company_id || null,
        meeting_date: meetingDateTime.toISOString(),
        location: formData.location || null,
        agenda: formData.agenda || null,
        status: 'scheduled',
      });

      if (error) throw error;

      toast({ title: 'Meeting scheduled successfully!' });
      setOpen(false);
      setFormData({
        title: '',
        company_id: '',
        meeting_date: '',
        meeting_time: '',
        location: '',
        agenda: '',
      });
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm" className="gap-1">
          <Plus size={16} />
          Schedule Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule New Meeting</DialogTitle>
          <DialogDescription>
            Set up a new meeting with your client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Q1 Requirements Discussion"
              required
            />
          </div>

          <div>
            <Label htmlFor="company_id">Client Company</Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) => setFormData({ ...formData, company_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="meeting_date">Date *</Label>
              <Input
                id="meeting_date"
                name="meeting_date"
                type="date"
                value={formData.meeting_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="meeting_time">Time *</Label>
              <Input
                id="meeting_time"
                name="meeting_time"
                type="time"
                value={formData.meeting_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="WeWork, BKC, Mumbai"
            />
          </div>

          <div>
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea
              id="agenda"
              name="agenda"
              value={formData.agenda}
              onChange={handleChange}
              placeholder="Key topics to discuss..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMeetingModal;
