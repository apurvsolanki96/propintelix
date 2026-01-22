import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Building2,
  Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type AuthMode = 'signin' | 'signup' | 'otp' | 'forgot_password' | 'reset_password';
type LoginMethod = 'email' | 'phone';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get('signup') === 'true' ? 'signup' : 'signin'
  );
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    name: '',
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    const identifier = loginMethod === 'email' ? formData.email : formData.phone;
    if (!identifier) {
      toast({ title: 'Error', description: `Please enter your ${loginMethod}`, variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { identifier, identifier_type: loginMethod },
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: 'OTP Sent!',
        description: `Check your ${loginMethod === 'email' ? 'inbox' : 'messages'} for the verification code.`,
      });

      // For development, show OTP in toast
      if (data?.otp) {
        toast({
          title: 'Development Mode',
          description: `Your OTP is: ${data.otp}`,
        });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const identifier = loginMethod === 'email' ? formData.email : formData.phone;
    if (!otpCode || otpCode.length !== 6) {
      toast({ title: 'Error', description: 'Please enter the 6-digit OTP', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp-login', {
        body: { identifier, otp_code: otpCode, identifier_type: loginMethod },
      });

      if (error) throw error;

      if (data?.magic_link) {
        window.location.href = data.magic_link;
      } else if (data?.verified) {
        toast({
          title: 'Verified!',
          description: 'OTP verified. Redirecting...',
        });
        // For demo, navigate directly
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset_password`,
      });

      if (error) throw error;

      toast({
        title: 'Reset link sent!',
        description: 'Check your email for the password reset link.',
      });
      setMode('signin');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { name: formData.name },
          },
        });
        if (error) throw error;
        toast({ title: 'Account created!', description: 'You can now access your dashboard.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const features = [
    { icon: CheckCircle2, title: 'AI-Powered Matches', desc: 'Get instant property recommendations.' },
    { icon: Shield, title: 'Verified B2B Listings', desc: '100% verified commercial inventory.' },
    { icon: Building2, title: 'Smart Lead Management', desc: 'Track and manage leads effortlessly.' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
        </div>

        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div>
            <img src={logo} alt="PropIntelix" className="h-12" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
              The Premier B2B<br />
              Commercial Real Estate<br />
              <span className="text-primary">Intelligence Platform</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md">
              Empowering agents and businesses with AI-driven insights, verified listings, and seamless lead management.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <feature.icon className="text-accent" size={16} />
                </div>
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="PropIntelix" className="h-12 mx-auto" />
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'otp' && 'Quick Login'}
              {mode === 'forgot_password' && 'Reset Password'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {mode === 'signin' && 'Sign in to access your dashboard and leads.'}
              {mode === 'signup' && 'Start your 14-day free trial today.'}
              {mode === 'otp' && 'Login with a one-time password sent to you.'}
              {mode === 'forgot_password' && "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {/* OTP Mode Toggle */}
          {(mode === 'signin' || mode === 'otp') && (
            <div className="flex rounded-lg border border-border overflow-hidden mb-6">
              <button
                onClick={() => { setMode('signin'); setOtpSent(false); }}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  mode === 'signin' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                }`}
              >
                <Mail size={16} /> Email
              </button>
              <button
                onClick={() => { setMode('otp'); setLoginMethod('email'); setOtpSent(false); }}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  mode === 'otp' && loginMethod === 'email' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                }`}
              >
                OTP (Email)
              </button>
              <button
                onClick={() => { setMode('otp'); setLoginMethod('phone'); setOtpSent(false); }}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  mode === 'otp' && loginMethod === 'phone' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                }`}
              >
                <Phone size={16} /> Phone
              </button>
            </div>
          )}

          <div className="space-y-6">
            {/* OTP Login */}
            {mode === 'otp' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                      </label>
                      <Input
                        name={loginMethod}
                        type={loginMethod === 'email' ? 'email' : 'tel'}
                        value={loginMethod === 'email' ? formData.email : formData.phone}
                        onChange={handleChange}
                        placeholder={loginMethod === 'email' ? 'name@company.com' : '+91 98765 43210'}
                      />
                    </div>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Send OTP
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to{' '}
                        <span className="font-medium text-foreground">
                          {loginMethod === 'email' ? formData.email : formData.phone}
                        </span>
                      </p>
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={setOtpCode}
                        className="justify-center"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otpCode.length !== 6}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Verify & Sign In
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                    <button
                      onClick={() => { setOtpSent(false); setOtpCode(''); }}
                      className="text-sm text-primary hover:underline w-full text-center"
                    >
                      Resend OTP
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Password Login / Signup */}
            {(mode === 'signin' || mode === 'signup') && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Rajesh Sharma"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">Company Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot_password')}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </form>
            )}

            {/* Forgot Password */}
            {mode === 'forgot_password' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <button
                  onClick={() => setMode('signin')}
                  className="text-sm text-primary hover:underline w-full text-center"
                >
                  Back to Sign In
                </button>
              </div>
            )}

            {/* Divider */}
            {(mode === 'signin' || mode === 'signup') && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" size="lg" disabled className="gap-2">
                    SSO
                  </Button>
                </div>
              </>
            )}

            {/* Toggle Auth Mode */}
            <div className="text-center text-sm">
              {mode === 'signin' || mode === 'otp' ? (
                <>
                  <span className="text-muted-foreground">Don't have an account?</span>{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Request Access
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  <span className="text-muted-foreground">Already have an account?</span>{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
