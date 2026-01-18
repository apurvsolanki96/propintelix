import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  Building2, 
  Users, 
  Newspaper, 
  Clock, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const playClickSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleT08');
    audio.volume = 0.15;
    audio.play().catch(() => {});
  };

  const handleCta = (path: string) => {
    playClickSound();
    navigate(path);
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get intelligent pre-meeting briefs curated from financial data, news, and social media.',
    },
    {
      icon: Newspaper,
      title: 'Real-Time Market Intel',
      description: 'Stay updated with Indian CRE news, FDI announcements, and regulatory changes.',
    },
    {
      icon: Building2,
      title: 'Company Intelligence',
      description: 'Deep-dive into client financials, recent moves, and expansion plans.',
    },
    {
      icon: TrendingUp,
      title: 'Sales Acceleration',
      description: 'Walk into meetings better informed. Close deals faster with contextual insights.',
    },
  ];

  const stats = [
    { value: '40%', label: 'Faster Deal Closure' },
    { value: '5hrs', label: 'Saved Per Week' },
    { value: '₹2.5Cr+', label: 'Deals Influenced' },
    { value: '98%', label: 'Client Satisfaction' },
  ];

  const testimonials = [
    {
      quote: "PropIntelix has transformed how our team prepares for client meetings. The AI briefs are incredibly accurate.",
      author: "Rajesh Sharma",
      role: "Senior Director, JLL India",
      rating: 5,
    },
    {
      quote: "Finally, a CRE platform built for the Indian market. The FDI and policy updates are invaluable.",
      author: "Priya Menon",
      role: "VP Sales, Colliers",
      rating: 5,
    },
    {
      quote: "We've reduced our research time by 70%. The ROI on PropIntelix is phenomenal.",
      author: "Vikram Patel",
      role: "Managing Partner, CRE Advisors",
      rating: 5,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="hero-gradient relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">India's #1 AI-Powered CRE Platform</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Close More Deals with{' '}
              <span className="text-gradient">AI-Powered</span>{' '}
              Sales Intelligence
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              PropIntelix delivers timely, contextual company insights before every meeting—so your sales team is always prepared and never caught off guard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => handleCta('/auth?signup=true')}
                className="group"
              >
                Start 14-Day Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl"
                onClick={() => handleCta('/demo')}
              >
                Book a Demo
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="kpi-value text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-gradient">Win More Deals</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Automated intelligence gathering so you can focus on what matters—building relationships and closing deals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How PropIntelix Works
            </h2>
            <p className="text-muted-foreground">
              From data to insights in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Add Your Clients',
                description: 'Input client companies and upcoming meeting details into your dashboard.',
              },
              {
                step: '02',
                title: 'AI Aggregates Data',
                description: 'Our AI scans news, financials, social media, and regulatory updates relevant to each client.',
              },
              {
                step: '03',
                title: 'Get Smart Briefs',
                description: 'Receive actionable pre-meeting briefs with talking points, risks, and opportunities.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Trusted by Leading CRE Professionals
            </h2>
            <p className="text-muted-foreground">
              See why top commercial real estate firms across India love PropIntelix
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="border-t border-border pt-4">
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 hero-gradient relative">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join hundreds of CRE professionals who are closing more deals with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => handleCta('/auth?signup=true')}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="hero-outline" 
              size="xl"
              onClick={() => handleCta('/pricing')}
            >
              View Pricing
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
