import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { meeting_id, company_id, company_name, company_sector, meeting_title, meeting_date, agenda } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const prompt = `You are an AI assistant for PropIntelix, an Indian commercial real estate sales insights platform. Generate a comprehensive pre-meeting brief for a sales representative.

Meeting Details:
- Title: ${meeting_title}
- Date: ${meeting_date}
- Company: ${company_name || "Not specified"}
- Sector: ${company_sector || "Not specified"}
- Agenda: ${agenda || "General discussion"}

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

    // Save to database
    const { error: insertError } = await supabaseClient.from("ai_briefs").insert({
      user_id: user.id,
      meeting_id,
      company_id,
      brief_type: "meeting",
      content: briefContent,
    });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, content: briefContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
