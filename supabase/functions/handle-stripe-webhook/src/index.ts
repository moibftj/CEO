import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";
import Stripe from "https://esm.sh/stripe@14.25.0";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client with Service Role Key
const supabaseAdmin = createClient(
  Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: { persistSession: false },
  }
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret!);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriberId = session.client_reference_id;
        const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert cents to dollars
        const type = session.mode === 'subscription' ? 'subscription' : 'one-time';

        if (!subscriberId) {
            console.error("Missing client_reference_id in session");
            return new Response("Missing client_reference_id", { status: 400 });
        }

        // 1. Insert transaction record
        const { error: transactionError } = await supabaseAdmin
            .from("transactions")
            .insert({
                subscriber_id: subscriberId,
                amount: amount,
                type: type,
                stripe_session_id: session.id,
            });

        if (transactionError) {
            console.error("Transaction insert error:", transactionError);
            // Still proceed to update subscription if applicable
        }

        // 2. Update subscription status (if applicable)
        if (session.mode === 'subscription' && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const { error: subError } = await supabaseAdmin
                .from("subscriptions")
                .upsert({
                    subscriber_id: subscriberId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: subscription.id,
                    plan_status: subscription.status,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                }, { onConflict: 'subscriber_id' });

            if (subError) {
                console.error("Subscription upsert error:", subError);
            }
        }

        // 3. Calculate commission (if coupon was used - simplified logic for MVP)
        // In a real app, coupon info would be in session metadata.
        // For MVP, we'll assume a hardcoded employee ID for demonstration if a coupon was used.
        // This part needs refinement based on actual Stripe implementation details.
        // For now, we skip commission calculation as the mechanism to link session to employee is missing in the canvas.
        // The canvas only mentions: "On redemption / payment success → call calculate-commission".
        // We will assume the `calculate-commission` function is called by a separate process or is triggered by a different event/metadata in a full implementation.
        // For the sake of completing the MVP flow, we will assume the employee ID is passed via metadata.
        
        // **MVP SIMPLIFICATION**: If a coupon was used, we'd get the employee ID from metadata.
        // Since we don't have the metadata, we'll skip this for now and focus on the core flow.

        break;
      
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // Handle subscription status changes
        const subscription = event.data.object as Stripe.Subscription;
        const { error: subUpdateError } = await supabaseAdmin
            .from("subscriptions")
            .update({
                plan_status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

        if (subUpdateError) {
            console.error("Subscription update error:", subUpdateError);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("Error processing event:", err);
    return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
  }
});

