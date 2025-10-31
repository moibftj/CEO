import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";

serve(async (req) => {
  try {
    const { employee_id, amount } = await req.json();

    if (!employee_id || typeof amount !== 'number') {
      return new Response(JSON.stringify({ error: "Missing employee_id or invalid amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Call the RPC function defined in schema.sql
    const { error } = await supabaseClient.rpc('update_employee_metrics', {
      p_employee_id: employee_id,
      p_amount: amount,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return new Response(JSON.stringify({ error: "Failed to update employee metrics" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in calculate-commission:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

