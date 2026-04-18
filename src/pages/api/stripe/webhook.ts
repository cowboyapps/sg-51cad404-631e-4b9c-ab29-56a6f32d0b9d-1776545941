import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "@/integrations/supabase/client";
import { buffer } from "micro";

// Disable body parsing for webhook
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"]!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.business_id;

        if (businessId && session.subscription) {
          await supabase
            .from("businesses")
            .update({
              stripe_subscription_id: session.subscription as string,
              subscription_status: "trialing",
            })
            .eq("id", businessId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const businessId = subscription.metadata?.business_id;

        if (businessId) {
          await supabase
            .from("businesses")
            .update({
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_end: subscription.trial_end 
                ? new Date(subscription.trial_end * 1000).toISOString() 
                : null,
            })
            .eq("id", businessId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const businessId = subscription.metadata?.business_id;

        if (businessId) {
          await supabase
            .from("businesses")
            .update({
              subscription_status: "canceled",
            })
            .eq("id", businessId);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription;

        if (subscription) {
          // Get business ID from subscription
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription as string);
          const businessId = stripeSubscription.metadata?.business_id;

          if (businessId) {
            // Record payment in history
            await supabase.from("payment_history").insert({
              business_id: businessId,
              stripe_invoice_id: invoice.id,
              amount_paid: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: "paid",
              invoice_url: invoice.hosted_invoice_url,
              paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
            });

            // Update subscription status
            await supabase
              .from("businesses")
              .update({
                subscription_status: "active",
              })
              .eq("id", businessId);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription;

        if (subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription as string);
          const businessId = stripeSubscription.metadata?.business_id;

          if (businessId) {
            await supabase
              .from("businesses")
              .update({
                subscription_status: "past_due",
              })
              .eq("id", businessId);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}