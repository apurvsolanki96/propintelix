import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Video,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Demo = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    role: '',
    teamSize: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.company) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: 'Demo Request Received!',
      description: "We'll reach out within 24 hours to schedule your demo.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="py-20 min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">
              Demo Request Submitted!
            </h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your interest in PropIntelix. Our team will reach out to you within 24 hours to schedule your personalized demo.
            </p>
            <div className="glass-card p-6 text-left space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Demo typically takes 30-45 minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-primary" />
                <span>Conducted via Google Meet or Zoom</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span>Flexible scheduling across time zones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Left Column - Info */}
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              See PropIntelix in <span className="text-gradient">Action</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Get a personalized walkthrough of how PropIntelix can transform your sales process. Our team will demonstrate features tailored to your use case.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">30-Minute Personalized Demo</h3>
                  <p className="text-sm text-muted-foreground">
                    See how PropIntelix works with your specific workflow and use cases.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Live Q&A Session</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask our experts anything about features, pricing, or implementation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">No Commitment Required</h3>
                  <p className="text-sm text-muted-foreground">
                    Just a friendly conversation to see if PropIntelix is right for you.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4">Trusted by leading CRE firms</h4>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>JLL</span>
                <span>•</span>
                <span>CBRE</span>
                <span>•</span>
                <span>Knight Frank</span>
                <span>•</span>
                <span>Colliers</span>
                <span>•</span>
                <span>Cushman & Wakefield</span>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold mb-6">Request Your Demo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rajesh Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Work Email *</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rajesh@company.com"
                    required
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Company *</label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-foreground"
                  >
                    <option value="">Select role</option>
                    <option value="sales">Sales Representative</option>
                    <option value="broker">Broker / Consultant</option>
                    <option value="manager">Sales Manager</option>
                    <option value="director">Director / VP</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Team Size</label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-foreground"
                  >
                    <option value="">Select size</option>
                    <option value="1">Just me</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-20">6-20 people</option>
                    <option value="20+">20+ people</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Anything specific you'd like to see?</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your use case or specific features you're interested in..."
                  rows={4}
                />
              </div>
              
              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Request Demo'
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to our Privacy Policy and Terms of Service.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
