import type { NextApiRequest, NextApiResponse } from "next";
import { stripeService } from "@/services/stripeService";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: "Missing business ID" });
    }

    // Get business Stripe customer ID
    const { data: business, error } = await supabase
      .from("businesses")
      .select("stripe_customer_id")
      .eq("id", businessId)
      .single();

    if (error || !business?.stripe_customer_id) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Create portal session
    const portalUrl = await stripeService.createPortalSession(business.stripe_customer_id);

    return res.status(200).json({ url: portalUrl });
  } catch (error: any) {
    console.error("Portal error:", error);
    return res.status(500).json({ error: error.message || "Failed to create portal session" });
  }
}