import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  Briefcase, 
  ArrowRight,
  CheckCircle2,
  Quote
} from 'lucide-react';

const UseCases = () => {
  const navigate = useNavigate();

  const useCases = [
    {
      icon: Users,
      title: 'Sales Representatives',
      subtitle: 'Individual sales professionals in CRE',
      description: 'Spend less time researching and more time selling. PropIntelix gives you instant access to company intelligence before every meeting.',
      benefits: [
        'Pre-meeting briefs delivered automatically',
        'Company financials and news at your fingertips',
        'Talking points and suggested questions',
        'Track multiple prospects efficiently',
      ],
      testimonial: {
        quote: 'I used to spend 2 hours researching before each meeting. Now it takes me 5 minutes to review my AI brief.',
        author: 'Amit Verma',
        role: 'Senior Sales Executive, Knight Frank',
      },
    },
    {
      icon: Briefcase,
      title: 'Brokers & Consultants',
      subtitle: 'Independent and agency brokers',
      description: 'Build stronger client relationships with deeper insights. Show your expertise with market intelligence that sets you apart from competitors.',
      benefits: [
        'Market trend analysis for client meetings',
        'FDI and policy alerts relevant to deals',
        'Client portfolio management',
        'Competitive intelligence reports',
      ],
      testimonial: {
        quote: 'PropIntelix helps me look like an expert in every meeting. The regulatory updates alone have saved multiple deals.',
        author: 'Sneha Kapoor',
        role: 'Principal Consultant, JLL',
      },
    },
    {
      icon: Building,
      title: 'CRE Firms & Teams',
      subtitle: 'Commercial real estate organizations',
      description: 'Equip your entire team with AI-powered intelligence. Standardize research quality and accelerate deal velocity across your organization.',
      benefits: [
        'Team-wide intelligence sharing',
        'Centralized client database',
        'Performance analytics dashboard',
        'Custom integrations & SSO',
      ],
      testimonial: {
        quote: "We've reduced our average deal cycle by 30% since implementing PropIntelix across our team of 15.",
        author: 'Rahul Mehra',
        role: 'Managing Director, CBRE India',
      },
    },
  ];

  return (
    <div className="py-20">
      {/* Header */}
      <section className="container mx-auto px-4 mb-20 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Built for <span className="text-gradient">CRE Professionals</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Whether you're an individual sales rep or a large enterprise team, PropIntelix adapts to your workflow.
        </p>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4">
        <div className="space-y-20">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <useCase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">{useCase.title}</h2>
                    <p className="text-sm text-muted-foreground">{useCase.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">{useCase.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {useCase.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="hero" onClick={() => navigate('/auth?signup=true')}>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className={`glass-card p-8 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-lg mb-6">&ldquo;{useCase.testimonial.quote}&rdquo;</p>
                <div className="border-t border-border pt-4">
                  <div className="font-semibold">{useCase.testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{useCase.testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Industry Stats */}
      <section className="py-20 mt-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              The Indian CRE Opportunity
            </h2>
            <p className="text-muted-foreground">
              India's commercial real estate market is booming. Are you equipped to capitalize?
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '$50B+', label: 'Annual CRE Investment in India' },
              { value: '15%', label: 'YoY Market Growth' },
              { value: '100+', label: 'Active SEZs Nationwide' },
              { value: '₹1.2L Cr', label: 'Office Space Under Construction' },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-6 text-center">
                <div className="kpi-value text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate('/auth?signup=true')}>
              Start Free Trial
            </Button>
            <Button variant="hero-outline" size="lg" onClick={() => navigate('/demo')}>
              Book a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UseCases;
