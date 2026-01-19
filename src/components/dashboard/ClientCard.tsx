import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Clock, ArrowRight, Sparkles, CheckCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ClientCardProps {
  company: {
    id: string;
    name: string;
    sector: string | null;
    headquarters: string | null;
    email?: string | null;
    contact_number?: string | null;
    verified?: boolean | null;
  };
  requirement?: {
    requirement_type: string;
    location: string | null;
    area_sqft: string | null;
    status: string | null;
  };
  meeting?: {
    meeting_date: string;
    title: string;
  };
  onGenerateBrief?: () => void;
}

const ClientCard = ({ company, requirement, meeting, onGenerateBrief }: ClientCardProps) => {
  const navigate = useNavigate();
  return (
    <div className="glass-card p-5 hover-lift group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-semibold">{company.name}</h3>
            {company.sector && (
              <p className="text-sm text-muted-foreground">{company.sector}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {company.verified && (
            <Badge className="bg-accent/20 text-accent border-accent/30 gap-1 text-xs">
              <CheckCircle size={10} />
              Verified
            </Badge>
          )}
          {requirement?.status && (
            <Badge
              variant={requirement.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {requirement.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Contact Info */}
      {(company.email || company.contact_number) && (
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
          {company.email && (
            <div className="flex items-center gap-1">
              <Mail size={12} />
              <span className="truncate max-w-[140px]">{company.email}</span>
            </div>
          )}
          {company.contact_number && (
            <div className="flex items-center gap-1">
              <Phone size={12} />
              <span>{company.contact_number}</span>
            </div>
          )}
        </div>
      )}

      {requirement && (
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin size={14} />
            <span>{requirement.location || 'Location TBD'}</span>
          </div>
          {requirement.area_sqft && (
            <p className="text-muted-foreground">
              Requirement: {requirement.requirement_type} • {requirement.area_sqft} sq ft
            </p>
          )}
        </div>
      )}

      {meeting && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 px-3 py-2 rounded-lg mb-4">
          <Clock size={14} />
          <span>
            Meeting: {format(new Date(meeting.meeting_date), 'MMM d, h:mm a')}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/dashboard/clients/${company.id}`)}
        >
          View Details
          <ArrowRight size={14} className="ml-1" />
        </Button>
        {meeting && (
          <Button
            variant="hero"
            size="sm"
            className="gap-1"
            onClick={onGenerateBrief}
          >
            <Sparkles size={14} />
            AI Brief
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClientCard;
