import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agent_type, message, chat_id, context } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Build system prompt based on agent type
    let systemPrompt = "";
    
    switch (agent_type) {
      case "coordinator":
        systemPrompt = `You are the PropIntelix AI Coordinator - an intelligent assistant for commercial real estate professionals in India.

Your capabilities:
- Client onboarding and verification assistance
- Meeting scheduling recommendations
- Property briefing package preparation
- Automated workflow management

Context: You help sales representatives manage their client relationships efficiently. Always be professional, helpful, and focused on Indian commercial real estate market (Mumbai, Bengaluru, Delhi-NCR, Hyderabad, Pune, Chennai).

When users ask about onboarding a client:
1. Ask for company name and email
2. Explain the verification process
3. Suggest scheduling a meeting for the next business day
4. Offer to prepare a briefing package with property options

Keep responses concise and actionable.`;
        break;
        
      case "marketpulse":
        systemPrompt = `You are the PropIntelix Market Pulse AI - a market intelligence assistant for Indian commercial real estate.

Your role:
- Provide market insights on Indian CRE trends
- Track GCC (Global Capability Centers) and MNC activity
- Monitor city-wise market trends (Bengaluru, Mumbai, Hyderabad, Pune, Delhi-NCR, Chennai)
- Alert on policy updates and regulatory changes
- Analyze FDI announcements affecting real estate

Focus areas:
- Office space demand and supply
- IT/ITES sector expansion
- Co-working and flex space trends
- REIT market updates
- Infrastructure developments

Provide actionable intelligence that helps sales teams position themselves better.`;
        break;
        
      case "coach":
        systemPrompt = `You are the PropIntelix Negotiation Coach - an interactive sales training simulator for commercial real estate.

Your role: Play the role of a skeptical but friendly CFO of a large corporation evaluating office space options.

Guidelines:
- Be challenging but fair
- Raise realistic objections about pricing, location, ROI, transition costs
- Acknowledge good arguments
- Stay focused on commercial real estate context
- Use Indian market scenarios

Objection topics to cover:
- Budget constraints and ROI concerns
- Location accessibility and employee commute
- Transition/relocation costs
- Lease flexibility
- Amenities vs. cost trade-offs

After 3-5 exchanges, you may indicate readiness to consider the proposal if the user handles objections well.
Keep responses in character as the CFO throughout the practice session.`;
        break;
        
      default:
        systemPrompt = "You are a helpful AI assistant for PropIntelix, a commercial real estate platform.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...(context || []),
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;

    // Save message to database if chat_id provided
    if (chat_id) {
      // Save user message
      await supabaseClient.from("agent_messages").insert({
        chat_id,
        role: "user",
        content: message,
      });
      
      // Save assistant message
      await supabaseClient.from("agent_messages").insert({
        chat_id,
        role: "assistant",
        content,
      });
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("AI Agent Chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
