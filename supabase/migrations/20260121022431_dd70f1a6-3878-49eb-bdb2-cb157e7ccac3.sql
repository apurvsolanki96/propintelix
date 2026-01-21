-- Create notifications table for real-time notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create agent_chats table for agent handoff system
CREATE TABLE public.agent_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  client_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL DEFAULT 'coordinator',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_messages table for chat history
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.agent_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_handoffs table for tracking handoffs
CREATE TABLE public.agent_handoffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.agent_chats(id) ON DELETE CASCADE,
  from_agent_id UUID NOT NULL,
  to_agent_id UUID NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for agent tables
ALTER TABLE public.agent_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_handoffs ENABLE ROW LEVEL SECURITY;

-- Policies for agent_chats
CREATE POLICY "Users can view their own agent chats" 
ON public.agent_chats 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE POLICY "Users can create agent chats" 
ON public.agent_chats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent chats" 
ON public.agent_chats 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = agent_id);

-- Policies for agent_messages
CREATE POLICY "Users can view messages in their chats" 
ON public.agent_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agent_chats 
    WHERE id = chat_id AND (user_id = auth.uid() OR agent_id = auth.uid())
  )
);

CREATE POLICY "Users can create messages in their chats" 
ON public.agent_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_chats 
    WHERE id = chat_id AND (user_id = auth.uid() OR agent_id = auth.uid())
  )
);

-- Policies for agent_handoffs
CREATE POLICY "Users can view their handoffs" 
ON public.agent_handoffs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agent_chats 
    WHERE id = chat_id AND (user_id = auth.uid() OR agent_id = auth.uid())
  )
);

CREATE POLICY "Users can create handoffs" 
ON public.agent_handoffs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_chats 
    WHERE id = chat_id AND (user_id = auth.uid() OR agent_id = auth.uid())
  )
);

CREATE POLICY "Users can update their handoffs" 
ON public.agent_handoffs 
FOR UPDATE 
USING (from_agent_id = auth.uid() OR to_agent_id = auth.uid());

-- Enable realtime for agent tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_messages;

-- Add triggers for updated_at
CREATE TRIGGER update_agent_chats_updated_at
BEFORE UPDATE ON public.agent_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();