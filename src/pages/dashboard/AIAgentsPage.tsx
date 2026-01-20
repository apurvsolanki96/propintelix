import { useState } from 'react';
import { SoundButton } from '@/components/SoundButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  Calendar,
  Newspaper,
  Target,
  MessageSquare,
  CheckCircle,
  Clock,
  Play,
  Pause,
  User,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import useSound from '@/hooks/useSound';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAgentsPage = () => {
  const { playClick, playSuccess, playNotification } = useSound();
  const [activeAgent, setActiveAgent] = useState<'coordinator' | 'marketpulse' | 'coach'>('coordinator');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm the PropIntelix AI Coordinator. I can help you with client onboarding, verification, and scheduling. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [coachSession, setCoachSession] = useState<'idle' | 'active' | 'completed'>('idle');
  const [coachScore, setCoachScore] = useState<any>(null);

  const agents = [
    {
      id: 'coordinator' as const,
      name: 'PropIntelix AI Assistant',
      description: 'Automated client onboarding, verification, and scheduling',
      icon: Bot,
      color: 'bg-primary/10 text-primary',
      status: 'online',
    },
    {
      id: 'marketpulse' as const,
      name: 'Market Pulse AI',
      description: 'Daily market intelligence and GCC trends',
      icon: Newspaper,
      color: 'bg-accent/10 text-accent',
      status: 'online',
    },
    {
      id: 'coach' as const,
      name: 'Negotiation Coach',
      description: 'Interactive sales simulation and training',
      icon: Target,
      color: 'bg-purple-500/10 text-purple-500',
      status: 'online',
    },
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    playClick();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        coordinator: [
          "I'll help you onboard this client. First, could you provide their company name and email address?",
          "Great! I've initiated the verification process. The client will receive an email shortly. Once they reply with 'i verify', I'll schedule a meeting for the next business day.",
          "The client has been verified! I've scheduled a meeting for tomorrow at 10 AM. I'm also preparing a briefing package with 2-4 property options near their preferred location.",
          "I've found 3 excellent properties matching their requirements in BKC, Mumbai. The briefing package has been sent to both you and the client.",
        ],
        marketpulse: [
          "Here's today's Market Pulse: GCC demand in Bengaluru has increased by 15% this quarter. Major MNCs like Google and Microsoft are actively scouting for additional office space.",
          "Breaking: SEBI has announced new REIT regulations that could impact commercial property valuations. I recommend reviewing your portfolio positions.",
          "Trend Alert: Co-working spaces in Pune are seeing a 22% surge in occupancy. This could be a good opportunity for your clients looking for flexible space solutions.",
        ],
        coach: [
          "Let's start a practice session. I'll play the role of a skeptical CFO. Your goal is to pitch a premium office space in Hyderabad. Ready?",
          "Interesting pitch! However, I'm concerned about the ROI given current market conditions. How would you address the 15% higher rental compared to our current location?",
          "Good point about the talent attraction benefits. But what about the transition costs? Our current lease ends in 6 months.",
        ],
      };

      const agentResponses = responses[activeAgent];
      const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      playNotification();
    }, 1500);
  };

  const startCoachSession = () => {
    playClick();
    setCoachSession('active');
    setChatMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Welcome to the Negotiation Coach! I'll be playing the role of a skeptical but friendly CFO of a large tech company. Your task is to pitch a premium office space in Hyderabad's HITEC City. Remember: stay professional, address objections with data, and build rapport. Let's begin - give me your opening pitch!",
        timestamp: new Date(),
      },
    ]);
  };

  const endCoachSession = () => {
    playSuccess();
    setCoachSession('completed');
    setCoachScore({
      tone: 8,
      objectionHandling: 7,
      factUsage: 9,
      overall: 8,
      feedback: "Great use of market data when addressing the price concern. You could improve by acknowledging the CFO's budget constraints more empathetically before presenting counter-arguments. Your closing was strong - the ROI calculation was particularly effective.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Sparkles size={24} />
          AI Agents
        </h1>
        <p className="text-muted-foreground text-sm">
          Intelligent assistants to automate your workflow
        </p>
      </div>

      {/* Agent Selection */}
      <div className="grid sm:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeAgent === agent.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              playClick();
              setActiveAgent(agent.id);
              if (agent.id !== 'coach') {
                setChatMessages([
                  {
                    id: '1',
                    role: 'assistant',
                    content: agent.id === 'coordinator'
                      ? "Hello! I'm the PropIntelix AI Coordinator. I can help you with client onboarding, verification, and scheduling. How can I assist you today?"
                      : "Welcome to Market Pulse AI! I provide daily market intelligence on commercial real estate trends, GCC activity, and policy updates. What would you like to know?",
                    timestamp: new Date(),
                  },
                ]);
              }
              if (agent.id === 'coach') {
                setCoachSession('idle');
                setCoachScore(null);
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${agent.color}`}>
                  <agent.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{agent.name}</h3>
                    <span className="w-2 h-2 bg-accent rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{agent.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat Interface */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeAgent === 'coordinator' && <Bot className="text-primary" size={20} />}
                {activeAgent === 'marketpulse' && <Newspaper className="text-accent" size={20} />}
                {activeAgent === 'coach' && <Target className="text-purple-500" size={20} />}
                <div>
                  <CardTitle className="text-base">
                    {agents.find((a) => a.id === activeAgent)?.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {activeAgent === 'coach' && coachSession === 'active'
                      ? 'Practice Session Active'
                      : 'Online'}
                  </CardDescription>
                </div>
              </div>
              {activeAgent === 'coach' && (
                <div>
                  {coachSession === 'idle' && (
                    <SoundButton variant="hero" size="sm" onClick={startCoachSession}>
                      <Play size={14} />
                      Start Practice
                    </SoundButton>
                  )}
                  {coachSession === 'active' && (
                    <SoundButton variant="outline" size="sm" onClick={endCoachSession}>
                      <Pause size={14} />
                      End Session
                    </SoundButton>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80 pr-4">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={msg.role === 'user' ? 'bg-primary/20' : 'bg-muted'}>
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(msg.timestamp, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted">
                        <Bot size={14} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {(activeAgent !== 'coach' || coachSession === 'active') && (
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <SoundButton onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                  <Send size={16} />
                </SoundButton>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {activeAgent === 'coach' && coachSession === 'completed' && coachScore && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp size={16} />
                  Performance Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Tone & Professionalism</span>
                  <Badge variant="secondary">{coachScore.tone}/10</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Objection Handling</span>
                  <Badge variant="secondary">{coachScore.objectionHandling}/10</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Fact Usage</span>
                  <Badge variant="secondary">{coachScore.factUsage}/10</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge className="bg-accent">{coachScore.overall}/10</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{coachScore.feedback}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agent Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeAgent === 'coordinator' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Client onboarding & verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Automated email workflows</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Meeting scheduling</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Property briefing packages</span>
                  </div>
                </>
              )}
              {activeAgent === 'marketpulse' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Daily market intelligence</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>GCC & MNC activity tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>City-wise trends analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Policy update alerts</span>
                  </div>
                </>
              )}
              {activeAgent === 'coach' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Role-play negotiations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Objection handling practice</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Performance scoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-accent" />
                    <span>Personalized feedback</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAgentsPage;
