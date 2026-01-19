import { ExternalLink, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  title: string;
  summary: string | null;
  source: string | null;
  category: string | null;
  relevanceSectors: string[] | null;
  publishedAt: string | null;
  url?: string | null;
}

const categoryColors: Record<string, string> = {
  market: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  policy: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  investment: 'bg-green-500/10 text-green-400 border-green-500/20',
  infrastructure: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  regulatory: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const NewsCard = ({
  title,
  summary,
  source,
  category,
  relevanceSectors,
  publishedAt,
  url,
}: NewsCardProps) => {
  return (
    <div className="glass-card p-4 hover-lift group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          {category && (
            <Badge
              variant="outline"
              className={`text-xs mb-2 ${categoryColors[category] || ''}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          )}
          <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {summary && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{summary}</p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">{source}</span>
        {publishedAt && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
          </div>
        )}
      </div>

      {relevanceSectors && relevanceSectors.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {relevanceSectors.slice(0, 3).map((sector) => (
            <span
              key={sector}
              className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
            >
              {sector}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsCard;
