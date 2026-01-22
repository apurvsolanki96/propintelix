import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier, identifier_type } = await req.json();

    if (!identifier || !identifier_type) {
      return new Response(
        JSON.stringify({ error: "Missing identifier or identifier_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate identifier format
    if (identifier_type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (identifier_type === "phone") {
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      if (!phoneRegex.test(identifier.replace(/\s/g, ""))) {
        return new Response(
          JSON.stringify({ error: "Invalid phone format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store OTP using database function
    const { data, error } = await supabase.rpc("create_otp", {
      p_identifier: identifier,
      p_identifier_type: identifier_type,
      p_otp_code: otp,
      p_expires_minutes: 10,
    });

    if (error) {
      console.error("Error creating OTP:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In production, you would send the OTP via email/SMS service
    // For demo purposes, we'll log it and return success
    console.log(`OTP for ${identifier}: ${otp}`);

    // For development/demo, return the OTP (remove in production!)
    const isDevelopment = true; // Set to false in production

    return new Response(
      JSON.stringify({
        success: true,
        message: `OTP sent to ${identifier_type === "email" ? "your email" : "your phone"}`,
        ...(isDevelopment && { otp }), // Only include OTP in development
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-otp:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
