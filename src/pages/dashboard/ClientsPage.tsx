import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ClientCard from '@/components/dashboard/ClientCard';
import AddClientModal from '@/components/dashboard/AddClientModal';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Search } from 'lucide-react';

const ClientsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCompanies = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('companies')
      .select(`
        *,
        client_requirements(*),
        meetings(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setCompanies(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, [user]);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sector?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground text-sm">
            Manage your client companies and requirements
          </p>
        </div>
        <AddClientModal onSuccess={fetchCompanies} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <ClientCard
              key={company.id}
              company={company}
              requirement={company.client_requirements?.[0]}
              meeting={company.meetings?.find((m: any) => new Date(m.meeting_date) >= new Date())}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Building2 className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="font-semibold mb-2">
            {searchQuery ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Try a different search term'
              : 'Add your first client to start tracking requirements'}
          </p>
          {!searchQuery && <AddClientModal onSuccess={fetchCompanies} />}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
