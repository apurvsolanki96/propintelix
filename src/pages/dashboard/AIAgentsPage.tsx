import { useState, useEffect } from 'react';
import { SoundButton } from '@/components/SoundButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  ArrowRightLeft,
  Users,
  History,
} from 'lucide-react';
import { format } from 'date-fns';
import useSound from '@/hooks/useSound';
import { useAgentChat, ChatMessage } from '@/hooks/useAgentChat';
import { useAgentHandoff } from '@/hooks/useAgentHandoff';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { toast } from 'sonner';

const AIAgentsPage = () => {
  const { playClick, playSuccess, playNotification } = useSound();
  const [activeAgent, setActiveAgent] = useState<'coordinator' | 'marketpulse' | 'coach'>('coordinator');
  const [inputMessage, setInputMessage] = useState('');
  const [coachSession, setCoachSession] = useState<'idle' | 'active' | 'completed'>('idle');
  const [coachScore, setCoachScore] = useState<any>(null);
  const [showHandoffDialog, setShowHandoffDialog] = useState(false);
  const [handoffReason, setHandoffReason] = useState('');
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedChatHistory, setSelectedChatHistory] = useState<ChatMessage[]>([]);

  const { createNotification } = useRealtimeNotifications();
  const { 
    availableChats, 
    pendingHandoffs, 
    requestHandoff, 
    acceptHandoff, 
    getChatHistory 
  } = useAgentHandoff();

  const {
    messages,
    isTyping,
    chatId,
    sendMessage,
    initializeChat,
    evaluateSession,
    clearMessages,
    setInitialMessage,
  } = useAgentChat({
    agentType: activeAgent,
    onNewMessage: (msg) => {
      if (msg.role === 'assistant') {
        playNotification();
      }
    },
  });

  const agents = [
    {
      id: 'coordinator' as const,
      name: 'PropIntelix AI Assistant',
      description: 'Automated client onboarding, verification, and scheduling',
      icon: Bot,
      color: 'bg-primary/10 text-primary',
      status: 'online',
      greeting: "Hello! I'm the PropIntelix AI Coordinator. I can help you with client onboarding, verification, and scheduling. How can I assist you today?",
    },
    {
      id: 'marketpulse' as const,
      name: 'Market Pulse AI',
      description: 'Daily market intelligence and GCC trends',
      icon: Newspaper,
      color: 'bg-accent/10 text-accent',
      status: 'online',
      greeting: "Welcome to Market Pulse AI! I provide daily market intelligence on commercial real estate trends, GCC activity, and policy updates across India. What would you like to know?",
    },
    {
      id: 'coach' as const,
      name: 'Negotiation Coach',
      description: 'Interactive sales simulation and training',
      icon: Target,
      color: 'bg-purple-500/10 text-purple-500',
      status: 'online',
      greeting: "Welcome to the Negotiation Coach! I'll be playing the role of a skeptical but friendly CFO of a large tech company. Your task is to pitch a premium office space. Start by clicking 'Start Practice' to begin your session!",
    },
  ];

  // Initialize chat on agent change
  useEffect(() => {
    const currentAgent = agents.find(a => a.id === activeAgent);
    if (currentAgent && activeAgent !== 'coach') {
      clearMessages();
      setInitialMessage({
        id: '1',
        role: 'assistant',
        content: currentAgent.greeting,
        timestamp: new Date(),
      });
    }
  }, [activeAgent]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    playClick();
    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const startCoachSession = async () => {
    playClick();
    setCoachSession('active');
    setCoachScore(null);
    clearMessages();
    setInitialMessage({
      id: '1',
      role: 'assistant',
      content: "Welcome to the Negotiation Coach! I'll be playing the role of a skeptical but friendly CFO of a large tech company. Your task is to pitch a premium office space in Hyderabad's HITEC City. Remember: stay professional, address objections with data, and build rapport. Let's begin - give me your opening pitch!",
      timestamp: new Date(),
    });
    await initializeChat();
  };

  const endCoachSession = async () => {
    playSuccess();
    setCoachSession('completed');
    
    const evaluation = await evaluateSession();
    if (evaluation) {
      setCoachScore(evaluation);
      
      // Create notification for session completion
      createNotification(
        'Coaching Session Complete',
        `You scored ${evaluation.overall}/10 overall. ${evaluation.feedback?.slice(0, 100)}...`,
        'success'
      );
    }
  };

  const handleRequestHandoff = async () => {
    if (!chatId || !handoffReason.trim()) {
      toast.error('Please provide a reason for the handoff');
      return;
    }

    const success = await requestHandoff(chatId, handoffReason);
    if (success) {
      setShowHandoffDialog(false);
      setHandoffReason('');
      createNotification(
        'Handoff Requested',
        'Your chat has been marked for handoff. Another agent will take over.',
        'info'
      );
    }
  };

  const handleViewHistory = async (chatIdToView: string) => {
    const history = await getChatHistory(chatIdToView);
    setSelectedChatHistory(history);
    setShowHistoryDialog(true);
  };

  const handleAcceptHandoff = async (chat: any) => {
    const handoff = pendingHandoffs.find(h => h.chatId === chat.id);
    if (handoff) {
      const success = await acceptHandoff(chat.id, handoff.id);
      if (success) {
        createNotification(
          'Handoff Accepted',
          `You have taken over the chat with ${chat.clientName}`,
          'success'
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Sparkles size={24} />
            AI Agents
          </h1>
          <p className="text-muted-foreground text-sm">
            Intelligent assistants powered by AI
          </p>
        </div>
        
        {/* Handoff Notifications */}
        {availableChats.length > 0 && (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
            <ArrowRightLeft size={14} className="mr-1" />
            {availableChats.length} chats available for handoff
          </Badge>
        )}
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
                      : 'Online • Powered by AI'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {activeAgent !== 'coach' && chatId && (
                  <SoundButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHandoffDialog(true)}
                  >
                    <ArrowRightLeft size={14} />
                    Handoff
                  </SoundButton>
                )}
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
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80 pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
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
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
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
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={isTyping}
                />
                <SoundButton onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                  {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </SoundButton>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Coach Performance Report */}
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
                  <Badge className="bg-accent text-accent-foreground">{coachScore.overall}/10</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{coachScore.feedback}</p>
              </CardContent>
            </Card>
          )}

          {/* Available Handoffs */}
          {availableChats.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users size={16} />
                  Available for Handoff
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableChats.slice(0, 3).map((chat) => (
                  <div key={chat.id} className="p-2 bg-muted/50 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{chat.clientName}</span>
                      <Badge variant="outline" className="text-xs">{chat.agentType}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleViewHistory(chat.id)}
                      >
                        <History size={12} className="mr-1" />
                        View History
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleAcceptHandoff(chat)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Agent Capabilities */}
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
                    <span>AI-powered performance scoring</span>
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

      {/* Handoff Dialog */}
      <Dialog open={showHandoffDialog} onOpenChange={setShowHandoffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Chat Handoff</DialogTitle>
            <DialogDescription>
              Transfer this chat to another available agent. The chat history will be preserved for seamless continuation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for Handoff</label>
              <Textarea
                placeholder="e.g., Going on leave, need specialist assistance..."
                value={handoffReason}
                onChange={(e) => setHandoffReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHandoffDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestHandoff}>
              Request Handoff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
            <DialogDescription>
              Review the conversation before accepting the handoff.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-3 p-4">
              {selectedChatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className={msg.role === 'user' ? 'bg-primary/20' : 'bg-muted'}>
                      {msg.role === 'user' ? 'U' : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {selectedChatHistory.length === 0 && (
                <p className="text-center text-muted-foreground">No messages in this chat yet.</p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIAgentsPage;
