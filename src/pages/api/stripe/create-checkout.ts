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
    const { businessId, priceId } = req.body;

    if (!businessId || !priceId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get business details
    const { data: business, error } = await supabase
      .from("businesses")
      .select("id, business_name, slug, profiles!businesses_owner_id_fkey(email)")
      .eq("id", businessId)
      .single();

    if (error || !business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const email = (business.profiles as any)?.email || "noemail@example.com";

    // Create checkout session
    const checkoutUrl = await stripeService.createCheckoutSession(
      business.id,
      priceId,
      email,
      business.business_name
    );

    return res.status(200).json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
}