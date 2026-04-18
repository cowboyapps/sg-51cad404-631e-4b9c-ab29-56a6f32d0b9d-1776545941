import Stripe from "stripe";
import { supabase } from "@/integrations/supabase/client";

// Initialize Stripe with secret key (server-side only)
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey, {
    apiVersion: "2024-12-18.acacia",
  });
};

export const stripeService = {
  /**
   * Create or retrieve Stripe customer for a business
   */
  async getOrCreateCustomer(businessId: string, email: string, name: string): Promise<string> {
    const stripe = getStripeInstance();

    // Check if customer already exists
    const { data: business } = await supabase
      .from("businesses")
      .select("stripe_customer_id")
      .eq("id", businessId)
      .single();

    if (business?.stripe_customer_id) {
      return business.stripe_customer_id;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        business_id: businessId,
      },
    });

    // Update business with customer ID
    await supabase
      .from("businesses")
      .update({ stripe_customer_id: customer.id })
      .eq("id", businessId);

    return customer.id;
  },

  /**
   * Create checkout session for new subscription
   */
  async createCheckoutSession(
    businessId: string,
    priceId: string,
    email: string,
    businessName: string
  ): Promise<string> {
    const stripe = getStripeInstance();
    const customerId = await this.getOrCreateCustomer(businessId, email, businessName);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/business?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/business`,
      metadata: {
        business_id: businessId,
      },
      subscription_data: {
        metadata: {
          business_id: businessId,
        },
        trial_period_days: 14, // 14-day free trial
      },
    });

    return session.url || "";
  },

  /**
   * Create billing portal session for subscription management
   */
  async createPortalSession(customerId: string): Promise<string> {
    const stripe = getStripeInstance();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/business`,
    });

    return session.url;
  },

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string) {
    const stripe = getStripeInstance();
    return await stripe.subscriptions.retrieve(subscriptionId);
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
    const stripe = getStripeInstance();

    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  },

  /**
   * Update subscription (upgrade/downgrade)
   */
  async updateSubscription(subscriptionId: string, newPriceId: string) {
    const stripe = getStripeInstance();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: "create_prorations",
    });
  },

  /**
   * Sync Stripe product with pricing tier
   */
  async syncPricingTierToStripe(
    tierName: string,
    displayName: string,
    monthlyPrice: number,
    yearlyPrice: number
  ): Promise<{ monthlyPriceId: string; yearlyPriceId: string }> {
    const stripe = getStripeInstance();

    // Create or update product
    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find((p) => p.metadata.tier_name === tierName);

    if (!product) {
      product = await stripe.products.create({
        name: displayName,
        metadata: {
          tier_name: tierName,
        },
      });
    }

    // Create monthly price
    const monthlyPrice_obj = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(monthlyPrice * 100), // Convert to cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        tier_name: tierName,
        billing_period: "monthly",
      },
    });

    // Create yearly price
    const yearlyPrice_obj = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(yearlyPrice * 100), // Convert to cents
      currency: "usd",
      recurring: {
        interval: "year",
      },
      metadata: {
        tier_name: tierName,
        billing_period: "yearly",
      },
    });

    return {
      monthlyPriceId: monthlyPrice_obj.id,
      yearlyPriceId: yearlyPrice_obj.id,
    };
  },
};