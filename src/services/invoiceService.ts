<![CDATA[import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];

export const invoiceService = {
  async getInvoicesByBusiness(businessId: string) {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        customers!invoices_customer_id_fkey(
          profiles!customers_profile_id_fkey(full_name, email)
        ),
        subscriptions!invoices_subscription_id_fkey(
          subscription_plans(name)
        )
      `)
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    console.log("getInvoicesByBusiness:", { businessId, data, error });
    if (error) throw error;
    return data || [];
  },

  async getInvoicesByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        subscriptions!invoices_subscription_id_fkey(
          subscription_plans(name)
        )
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    console.log("getInvoicesByCustomer:", { customerId, data, error });
    if (error) throw error;
    return data || [];
  },

  async createInvoice(invoice: InvoiceInsert) {
    const { data, error } = await supabase
      .from("invoices")
      .insert(invoice)
      .select()
      .single();

    console.log("createInvoice:", { invoice, data, error });
    if (error) throw error;
    return data;
  },

  async updateInvoiceStatus(
    id: string,
    status: Database["public"]["Enums"]["invoice_status"],
    paidAt?: string
  ) {
    const updates: InvoiceUpdate = { status };
    if (paidAt) updates.paid_at = paidAt;

    const { data, error } = await supabase
      .from("invoices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    console.log("updateInvoiceStatus:", { id, status, data, error });
    if (error) throw error;
    return data;
  },

  async generateInvoiceForSubscription(subscriptionId: string) {
    // Fetch subscription details
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select(`
        *,
        subscription_plans(price),
        customers!subscriptions_customer_id_fkey(business_id)
      `)
      .eq("id", subscriptionId)
      .single();

    if (subError) throw subError;
    if (!subscription) throw new Error("Subscription not found");

    const plan = subscription.subscription_plans as any;
    const customer = subscription.customers as any;

    // Create invoice
    return this.createInvoice({
      customer_id: subscription.customer_id,
      subscription_id: subscriptionId,
      business_id: customer.business_id,
      amount: plan.price,
      status: "pending",
      due_date: subscription.current_period_end,
    });
  },
};
</![CDATA[>
