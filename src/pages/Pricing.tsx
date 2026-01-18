import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, X, Zap, Crown, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const navigate = useNavigate();

  const playClickSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleT08');
    audio.volume = 0.15;
    audio.play().catch(() => {});
  };

  const handlePlanSelect = (plan: string) => {
    playClickSound();
    navigate(`/auth?signup=true&plan=${plan}`);
  };

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for individual brokers and small teams',
      monthlyPrice: 1999,
      yearlyPrice: 19999,
      icon: Zap,
      popular: false,
      features: [
        { name: 'Up to 25 client profiles', included: true },
        { name: 'Company overview & financials', included: true },
        { name: 'Recent news alerts', included: true },
        { name: 'Manual data refresh', included: true },
        { name: 'Basic meeting calendar', included: true },
        { name: 'Email support', included: true },
        { name: 'AI-generated briefs', included: false },
        { name: 'FDI & policy alerts', included: false },
        { name: 'Social media insights', included: false },
        { name: 'Smart recommendations', included: false },
      ],
    },
    {
      name: 'Delight',
      description: 'Full AI power for serious CRE professionals',
      monthlyPrice: 4999,
      yearlyPrice: 49999,
      icon: Crown,
      popular: true,
      features: [
        { name: 'Unlimited client profiles', included: true },
        { name: 'Company overview & financials', included: true },
        { name: 'Real-time news monitoring', included: true },
        { name: 'Auto-sync & refresh', included: true },
        { name: 'Smart meeting calendar', included: true },
        { name: 'Priority support + chat', included: true },
        { name: 'AI-generated pre-meeting briefs', included: true },
        { name: 'FDI & regulatory alerts', included: true },
        { name: 'Social media monitoring', included: true },
        { name: 'Smart action recommendations', included: true },
      ],
    },
  ];

  const faqs = [
    {
      q: 'Can I try PropIntelix before committing?',
      a: 'Yes! We offer a 14-day free trial on both plans. No credit card required to start.',
    },
    {
      q: 'What happens after my trial ends?',
      a: 'Your account will be paused until you choose a plan. Your data is safe and will be available when you subscribe.',
    },
    {
      q: 'Can I switch plans later?',
      a: 'Absolutely! You can upgrade or downgrade anytime. Changes take effect from the next billing cycle.',
    },
    {
      q: 'Is there a discount for teams?',
      a: 'Yes, we offer volume discounts for teams of 5+. Contact our sales team for custom pricing.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit/debit cards, UPI, net banking, and corporate invoicing for annual plans.',
    },
  ];

  return (
    <div className="py-20">
      {/* Header */}
      <div className="container mx-auto px-4 text-center mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Simple, <span className="text-gradient">Transparent</span> Pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          Choose the plan that fits your team. Start with a 14-day free trial.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              isYearly ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-foreground transition-transform duration-200 ${
                isYearly ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <span className="ml-2 text-accent font-medium">Save 17%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 mb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-8 relative ${
                plan.popular ? 'border-primary/50 shadow-glow' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  plan.popular ? 'bg-primary/20' : 'bg-secondary'
                }`}>
                  <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ₹{isYearly ? Math.round(plan.yearlyPrice / 12).toLocaleString() : plan.monthlyPrice.toLocaleString()}
                </span>
                <span className="text-muted-foreground">/month</span>
                {isYearly && (
                  <div className="text-sm text-muted-foreground">
                    Billed ₹{plan.yearlyPrice.toLocaleString()}/year
                  </div>
                )}
              </div>
              
              <Button
                variant={plan.popular ? 'hero' : 'outline'}
                className="w-full mb-6"
                size="lg"
                onClick={() => handlePlanSelect(plan.name.toLowerCase())}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {feature.included ? (
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="container mx-auto px-4 mb-20">
        <div className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Need a Custom Enterprise Solution?
          </h2>
          <p className="text-muted-foreground mb-6">
            Get dedicated support, custom integrations, SLA guarantees, and volume pricing for your organization.
          </p>
          <Button variant="hero" size="lg" onClick={() => navigate('/contact')}>
            Contact Sales
          </Button>
        </div>
      </div>

      {/* FAQs */}
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card p-6">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-muted-foreground text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
