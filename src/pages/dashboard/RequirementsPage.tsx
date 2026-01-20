import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SoundButton } from '@/components/SoundButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Ruler,
  Loader2,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import useSound from '@/hooks/useSound';

interface Requirement {
  id: string;
  company_id: string;
  requirement_type: string;
  location: string | null;
  area_sqft: string | null;
  budget: string | null;
  timeline: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  companies?: { name: string };
}

const RequirementsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { playClick, playSuccess } = useSound();
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_id: '',
    requirement_type: '',
    location: '',
    area_sqft: '',
    budget: '',
    timeline: '',
    notes: '',
    status: 'active',
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [reqRes, compRes] = await Promise.all([
      supabase
        .from('client_requirements')
        .select('*, companies(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('companies').select('id, name').eq('user_id', user.id),
    ]);

    setRequirements(reqRes.data || []);
    setCompanies(compRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const resetForm = () => {
    setFormData({
      company_id: '',
      requirement_type: '',
      location: '',
      area_sqft: '',
      budget: '',
      timeline: '',
      notes: '',
      status: 'active',
    });
    setEditingReq(null);
  };

  const handleOpenModal = (req?: Requirement) => {
    playClick();
    if (req) {
      setEditingReq(req);
      setFormData({
        company_id: req.company_id,
        requirement_type: req.requirement_type,
        location: req.location || '',
        area_sqft: req.area_sqft || '',
        budget: req.budget || '',
        timeline: req.timeline || '',
        notes: req.notes || '',
        status: req.status || 'active',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.company_id || !formData.requirement_type) return;

    setSaving(true);
    try {
      const data = {
        ...formData,
        user_id: user.id,
        location: formData.location || null,
        area_sqft: formData.area_sqft || null,
        budget: formData.budget || null,
        timeline: formData.timeline || null,
        notes: formData.notes || null,
      };

      if (editingReq) {
        const { error } = await supabase
          .from('client_requirements')
          .update(data)
          .eq('id', editingReq.id);
        if (error) throw error;
        toast({ title: 'Requirement updated!' });
      } else {
        const { error } = await supabase.from('client_requirements').insert(data);
        if (error) throw error;
        toast({ title: 'Requirement added!' });
      }

      playSuccess();
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;

    playClick();
    try {
      const { error } = await supabase.from('client_requirements').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Requirement deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    playClick();
    try {
      const { error } = await supabase
        .from('client_requirements')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast({ title: `Status updated to ${status}` });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      case 'on-hold':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FileText size={24} />
            Client Requirements
          </h1>
          <p className="text-muted-foreground text-sm">
            Track and manage space requirements for your clients
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <SoundButton variant="hero" onClick={() => handleOpenModal()}>
              <Plus size={16} />
              Add Requirement
            </SoundButton>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingReq ? 'Edit Requirement' : 'Add New Requirement'}
              </DialogTitle>
              <DialogDescription>
                Track space requirements for your clients
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Client *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(v) => setFormData({ ...formData, company_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Requirement Type *</Label>
                  <Select
                    value={formData.requirement_type}
                    onValueChange={(v) => setFormData({ ...formData, requirement_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Office Space">Office Space</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                      <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Mumbai, BKC"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Area (sq ft)</Label>
                  <Input
                    value={formData.area_sqft}
                    onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                    placeholder="e.g., 5000-10000"
                  />
                </div>
                <div>
                  <Label>Budget</Label>
                  <Input
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g., ₹50L-1Cr"
                  />
                </div>
              </div>

              <div>
                <Label>Timeline</Label>
                <Input
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="e.g., Q2 2026"
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <SoundButton type="submit" variant="hero" disabled={saving} className="flex-1">
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingReq ? (
                    'Update Requirement'
                  ) : (
                    'Add Requirement'
                  )}
                </SoundButton>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Requirements List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48 bg-muted/50" />
            </Card>
          ))}
        </div>
      ) : requirements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="font-medium mb-2">No requirements yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first client requirement to start tracking
            </p>
            <SoundButton variant="hero" onClick={() => handleOpenModal()}>
              <Plus size={16} />
              Add Requirement
            </SoundButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requirements.map((req) => (
            <Card key={req.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{req.requirement_type}</CardTitle>
                    <CardDescription>{req.companies?.name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {req.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span>{req.location}</span>
                  </div>
                )}
                {req.area_sqft && (
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler size={14} className="text-muted-foreground" />
                    <span>{req.area_sqft} sq ft</span>
                  </div>
                )}
                {req.budget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={14} className="text-muted-foreground" />
                    <span>{req.budget}</span>
                  </div>
                )}
                {req.timeline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-muted-foreground" />
                    <span>{req.timeline}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Select
                    value={req.status || 'active'}
                    onValueChange={(v) => updateStatus(req.id, v)}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenModal(req)}
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={() => handleDelete(req.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Updated {format(new Date(req.updated_at), 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequirementsPage;
