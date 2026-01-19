import { Brain, MessageSquare, AlertTriangle, Target, Building2, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface BriefContent {
  summary?: string;
  talking_points?: string[];
  risks?: string[];
  opportunities?: string[];
  suggested_questions?: string[];
  company_overview?: string;
  recent_news?: string[];
}

interface AIBriefCardProps {
  companyName?: string;
  meetingTitle?: string;
  meetingDate?: string;
  content: BriefContent;
  generatedAt: string;
}

const AIBriefCard = ({
  companyName,
  meetingTitle,
  meetingDate,
  content,
  generatedAt,
}: AIBriefCardProps) => {
  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h3 className="font-semibold">{meetingTitle || 'AI Brief'}</h3>
            {companyName && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 size={12} />
                {companyName}
              </p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          AI Generated
        </Badge>
      </div>

      {meetingDate && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 px-3 py-2 rounded-lg">
          <Calendar size={14} />
          <span>Meeting: {format(new Date(meetingDate), 'MMM d, yyyy h:mm a')}</span>
        </div>
      )}

      {/* Summary */}
      {content.summary && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <MessageSquare size={14} className="text-primary" />
            Executive Summary
          </h4>
          <p className="text-sm text-muted-foreground">{content.summary}</p>
        </div>
      )}

      {/* Company Overview */}
      {content.company_overview && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Building2 size={14} className="text-primary" />
            Company Overview
          </h4>
          <p className="text-sm text-muted-foreground">{content.company_overview}</p>
        </div>
      )}

      {/* Talking Points */}
      {content.talking_points && content.talking_points.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Target size={14} className="text-primary" />
            Key Talking Points
          </h4>
          <ul className="space-y-1.5">
            {content.talking_points.map((point, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Opportunities */}
      {content.opportunities && content.opportunities.length > 0 && (
        <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2 text-green-400">Opportunities</h4>
          <ul className="space-y-1">
            {content.opportunities.map((opp, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                {opp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {content.risks && content.risks.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2 text-red-400 flex items-center gap-1">
            <AlertTriangle size={14} />
            Potential Risks
          </h4>
          <ul className="space-y-1">
            {content.risks.map((risk, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-red-400 mt-1">!</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Questions */}
      {content.suggested_questions && content.suggested_questions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Suggested Questions</h4>
          <ul className="space-y-1.5">
            {content.suggested_questions.map((q, i) => (
              <li key={i} className="text-sm text-muted-foreground italic">
                "{q}"
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
        Generated {format(new Date(generatedAt), 'MMM d, yyyy h:mm a')}
      </div>
    </div>
  );
};

export default AIBriefCard;
