import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";
import { OpenAI } from "https://esm.sh/openai@4.47.1";

// Initialize OpenAI client (will use GEMINI_API_KEY from environment)
const openai = new OpenAI({
  apiKey: Deno.env.get("GEMINI_API_KEY"),
  baseURL: "https://api.openai.com/v1", // Use standard OpenAI base URL
});

serve(async (req) => {
  try {
    const { subscriber_id, formData } = await req.json();

    if (!subscriber_id || !formData) {
      return new Response(JSON.stringify({ error: "Missing subscriber_id or formData" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Generate letter content using Gemini API
    const prompt = `You are an AI legal assistant. Draft a professional legal letter based on the following details.
      Sender: ${formData.sender_name} at ${formData.sender_address}
      Recipient: ${formData.recipient_name} at ${formData.recipient_address}
      Subject/Matter: ${formData.subject}
      Desired Resolution: ${formData.desired_resolution}
      
      The letter should be formal, clear, and persuasive. Do not include any placeholder text like [Date] or [Signature]. Just provide the body of the letter.`;

    const completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash", // Using the available model slug
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    });

    const generated_content = completion.choices[0].message.content;

    // 2. Insert into Supabase database
    const supabaseClient = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    const { data, error } = await supabaseClient
      .from("letters")
      .insert({
        subscriber_id: subscriber_id,
        form_data: formData,
        generated_content: generated_content,
        status: "under_attorney_review",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(JSON.stringify({ error: "Database insertion failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-letter:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

