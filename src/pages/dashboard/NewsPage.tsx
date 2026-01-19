import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import NewsCard from '@/components/dashboard/NewsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Newspaper } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All News' },
  { value: 'market', label: 'Market' },
  { value: 'policy', label: 'Policy' },
  { value: 'investment', label: 'Investment' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'regulatory', label: 'Regulatory' },
];

const NewsPage = () => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchNews = async () => {
    setLoading(true);

    let query = supabase
      .from('news_items')
      .select('*')
      .order('published_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    const { data } = await query;
    setNews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">News & Market Intelligence</h1>
        <p className="text-muted-foreground text-sm">
          Stay updated with the latest Indian CRE market news
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : news.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              title={item.title}
              summary={item.summary}
              source={item.source}
              category={item.category}
              relevanceSectors={item.relevance_sectors}
              publishedAt={item.published_at}
              url={item.url}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Newspaper className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="font-semibold mb-2">No news found</h3>
          <p className="text-muted-foreground">
            Try selecting a different category
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
