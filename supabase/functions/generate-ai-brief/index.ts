import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const inputSchema = z.object({
  meeting_id: z.string().uuid(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    const rawInput = await req.json();
    const parseResult = inputSchema.safeParse(rawInput);
    
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input: meeting_id must be a valid UUID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { meeting_id } = parseResult.data;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CRITICAL: Verify ownership by fetching the meeting with user_id check
    // This ensures users can only generate briefs for their own meetings
    const { data: meeting, error: meetingError } = await supabaseClient
      .from("meetings")
      .select(`
        *,
        companies(id, name, sector, headquarters)
      `)
      .eq("id", meeting_id)
      .eq("user_id", user.id)
      .single();

    if (meetingError || !meeting) {
      console.error("Access denied or meeting not found:", meetingError);
      return new Response(
        JSON.stringify({ error: "Meeting not found or access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use verified data from database instead of user-provided inputs
    const company_name = meeting.companies?.name || "Not specified";
    const company_sector = meeting.companies?.sector || "Not specified";
    const meeting_title = meeting.title;
    const meeting_date = meeting.meeting_date;
    // Limit agenda length to prevent cost escalation
    const agenda = (meeting.agenda || "General discussion").substring(0, 2000);

    const prompt = `You are an AI assistant for PropIntelix, an Indian commercial real estate sales insights platform. Generate a comprehensive pre-meeting brief for a sales representative.

Meeting Details:
- Title: ${meeting_title}
- Date: ${meeting_date}
- Company: ${company_name}
- Sector: ${company_sector}
- Agenda: ${agenda}

Generate a JSON response with the following structure:
{
  "summary": "A 2-3 sentence executive summary of key points for this meeting",
  "company_overview": "Brief overview of the company in Indian CRE context",
  "talking_points": ["4-5 key talking points relevant to Indian commercial real estate"],
  "opportunities": ["3-4 potential business opportunities"],
  "risks": ["2-3 potential risks or concerns to be aware of"],
  "suggested_questions": ["3-4 strategic questions to ask during the meeting"]
}

Focus on Indian commercial real estate context, mentioning relevant cities (Mumbai, Bengaluru, Delhi-NCR, Hyderabad, Pune), sectors (IT/ITES, BFSI, Manufacturing), and current market trends.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const briefContent = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content };

    // Save to database using verified meeting and company IDs
    const { error: insertError } = await supabaseClient.from("ai_briefs").insert({
      user_id: user.id,
      meeting_id: meeting.id,
      company_id: meeting.company_id,
      brief_type: "meeting",
      content: briefContent,
    });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, content: briefContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Generate AI Brief error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
