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
    const { identifier, otp_code, identifier_type } = await req.json();

    if (!identifier || !otp_code) {
      return new Response(
        JSON.stringify({ error: "Missing identifier or OTP code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify OTP using database function
    const { data: isValid, error: verifyError } = await supabase.rpc("verify_otp", {
      p_identifier: identifier,
      p_otp_code: otp_code,
    });

    if (verifyError || !isValid) {
      console.error("OTP verification failed:", verifyError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user exists
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    let user = users?.users?.find((u) => 
      identifier_type === "email" ? u.email === identifier : u.phone === identifier
    );

    if (!user) {
      // Create new user with email/phone
      const createData: any = {
        email_confirm: true,
        phone_confirm: true,
      };

      if (identifier_type === "email") {
        createData.email = identifier;
        createData.password = crypto.randomUUID(); // Random password for OTP-only login
      } else {
        createData.phone = identifier;
        createData.password = crypto.randomUUID();
      }

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser(createData);

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      user = newUser.user;
    }

    // Generate magic link / session for the user
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: identifier_type === "email" ? identifier : `${user.id}@otp.propintelix.com`,
      options: {
        redirectTo: `${req.headers.get("origin")}/dashboard`,
      },
    });

    if (sessionError) {
      console.error("Error generating session:", sessionError);
      
      // Fallback: Create a session directly
      // Since we verified the OTP, we can sign in the user
      return new Response(
        JSON.stringify({
          success: true,
          user_id: user?.id,
          verified: true,
          message: "OTP verified successfully. Please use password login.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: user?.id,
        magic_link: session?.properties?.action_link,
        verified: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-otp-login:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
