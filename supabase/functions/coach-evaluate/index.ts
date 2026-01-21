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
    const { messages } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const conversationText = messages.map((m: any) => 
      `${m.role === 'user' ? 'Sales Rep' : 'CFO'}: ${m.content}`
    ).join('\n');

    const evaluationPrompt = `You are an expert sales trainer evaluating a negotiation practice session. Analyze the following conversation between a sales representative (pitching commercial real estate) and a CFO (skeptical but fair).

Conversation:
${conversationText}

Provide a JSON evaluation with the following structure:
{
  "tone": <score 1-10>,
  "objectionHandling": <score 1-10>,
  "factUsage": <score 1-10>,
  "overall": <score 1-10>,
  "feedback": "<detailed feedback string - 2-3 sentences highlighting strengths and areas for improvement>"
}

Scoring criteria:
- Tone (1-10): Professionalism, warmth, confidence
- Objection Handling (1-10): How well they addressed concerns, used reframing
- Fact Usage (1-10): Use of data, market knowledge, specific examples
- Overall (1-10): Overall effectiveness of the pitch

Be encouraging but honest. Focus on actionable improvements.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: evaluationPrompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      tone: 7,
      objectionHandling: 7,
      factUsage: 7,
      overall: 7,
      feedback: "Session completed. Keep practicing to improve your negotiation skills."
    };

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Coach Evaluate error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
