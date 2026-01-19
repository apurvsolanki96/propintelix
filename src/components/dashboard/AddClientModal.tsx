import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AddClientModalProps {
  onSuccess: () => void;
}

const sectors = [
  'IT/ITES',
  'BFSI',
  'Manufacturing',
  'Healthcare',
  'Retail',
  'E-commerce',
  'Logistics',
  'Pharma',
  'Consulting',
  'Other',
];

const AddClientModal = ({ onSuccess }: AddClientModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    headquarters: '',
    website: '',
    employee_count: '',
    description: '',
    email: '',
    contact_number: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('companies').insert({
        user_id: user.id,
        name: formData.name,
        sector: formData.sector || null,
        headquarters: formData.headquarters || null,
        website: formData.website || null,
        employee_count: formData.employee_count || null,
        description: formData.description || null,
        email: formData.email || null,
        contact_number: formData.contact_number || null,
      });

      if (error) throw error;

      toast({ title: 'Client added successfully!' });
      setOpen(false);
      setFormData({
        name: '',
        sector: '',
        headquarters: '',
        website: '',
        employee_count: '',
        description: '',
        email: '',
        contact_number: '',
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
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter the details of the company you want to add as a client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tata Consultancy Services"
              required
            />
          </div>

          <div>
            <Label htmlFor="sector">Sector</Label>
            <Select
              value={formData.sector}
              onValueChange={(value) => setFormData({ ...formData, sector: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contact_number">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="headquarters">Headquarters</Label>
            <Input
              id="headquarters"
              name="headquarters"
              value={formData.headquarters}
              onChange={handleChange}
              placeholder="Mumbai, Maharashtra"
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.tcs.com"
            />
          </div>

          <div>
            <Label htmlFor="employee_count">Employee Count</Label>
            <Input
              id="employee_count"
              name="employee_count"
              value={formData.employee_count}
              onChange={handleChange}
              placeholder="500,000+"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the company..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;
