import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Newspaper,
  Building2,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Bell,
  FileText,
  Target,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const Product = () => {
  const navigate = useNavigate();

  const coreFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Briefs',
      description: 'Get intelligent pre-meeting summaries with talking points, risks, and opportunities automatically generated from multiple data sources.',
    },
    {
      icon: Building2,
      title: 'Company Intelligence',
      description: 'Deep insights into client companies—financials, leadership changes, expansion plans, and recent news all in one place.',
    },
    {
      icon: Newspaper,
      title: 'Real-Time News Feed',
      description: 'Stay updated with curated Indian CRE news, FDI announcements, SEZ updates, and regulatory changes relevant to your clients.',
    },
    {
      icon: Calendar,
      title: 'Smart Meeting Calendar',
      description: 'Sync your meetings and get automated briefs delivered before each client interaction. Never be unprepared again.',
    },
    {
      icon: BarChart3,
      title: 'Market Analytics',
      description: 'Track market trends, property prices, and investment flows across Indian cities with our comprehensive analytics dashboard.',
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Get notified about important developments—company announcements, regulatory changes, or market movements affecting your deals.',
    },
  ];

  const aiCapabilities = [
    {
      title: 'Natural Language Queries',
      description: 'Ask questions in plain English and get intelligent answers about any company or market.',
    },
    {
      title: 'Sentiment Analysis',
      description: 'Understand market sentiment and company perception from news and social media.',
    },
    {
      title: 'Predictive Insights',
      description: 'AI-powered predictions on company moves, market trends, and deal timing.',
    },
    {
      title: 'Action Recommendations',
      description: 'Get suggested next steps and talking points based on comprehensive analysis.',
    },
  ];

  const integrations = [
    { name: 'MCA Database', icon: FileText },
    { name: 'BSE/NSE Data', icon: TrendingUp },
    { name: 'Google Calendar', icon: Calendar },
    { name: 'Indian News Sources', icon: Globe },
  ];

  return (
    <div className="py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Your AI-Powered{' '}
            <span className="text-gradient">Sales Command Center</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            PropIntelix combines artificial intelligence, real-time data aggregation, and intuitive design to give you an unfair advantage in every client meeting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate('/auth?signup=true')}>
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="hero-outline" size="lg" onClick={() => navigate('/demo')}>
              Request Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Core Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to research, prepare, and close deals faster.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
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

      {/* AI Capabilities */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Powered by{' '}
                <span className="text-gradient">Advanced AI</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Our AI engine processes thousands of data points to deliver actionable insights tailored to your specific needs and context.
              </p>
              <div className="space-y-4">
                {aiCapabilities.map((cap, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{cap.title}</h4>
                      <p className="text-sm text-muted-foreground">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-8 h-8 text-primary" />
                  <span className="font-display text-xl font-bold">AI Brief Preview</span>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-primary mb-2">Meeting Brief: Tata Realty</h4>
                  <p className="text-sm text-muted-foreground">
                    Recent ₹500Cr investment in Pune commercial project signals aggressive expansion. Key talking point: Their Q3 results show 23% YoY growth in leasing revenue...
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-accent mb-2">Suggested Actions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Highlight portfolio properties near their new IT park</li>
                    <li>• Discuss flexible lease terms given market conditions</li>
                    <li>• Reference recent SEZ policy changes in Maharashtra</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-muted-foreground mb-8">
              Your data is protected with bank-level encryption, SOC 2 compliance, and hosted on secure Indian data centers.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: 'AES-256 Encryption', desc: 'Data encrypted at rest and in transit' },
                { title: 'Indian Data Centers', desc: 'Compliant with Indian data localization' },
                { title: 'Role-Based Access', desc: 'Granular permissions for teams' },
              ].map((item, index) => (
                <div key={index} className="glass-card p-4">
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join hundreds of CRE professionals using PropIntelix to close more deals.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/auth?signup=true')}>
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Product;
