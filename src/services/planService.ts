import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
type PlanInsert = Database["public"]["Tables"]["subscription_plans"]["Insert"];
type PlanUpdate = Database["public"]["Tables"]["subscription_plans"]["Update"];

export const planService = {
  async getBusinessPlans(businessId: string) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("business_id", businessId)
      .order("price", { ascending: true });

    console.log("getBusinessPlans:", { businessId, data, error });
    if (error) throw error;
    return data || [];
  },

  async getPlanById(id: string) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", id)
      .single();

    console.log("getPlanById:", { id, data, error });
    if (error) throw error;
    return data;
  },

  async createPlan(plan: PlanInsert) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .insert(plan)
      .select()
      .single();

    console.log("createPlan:", { plan, data, error });
    if (error) throw error;
    return data;
  },

  async updatePlan(id: string, updates: PlanUpdate) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    console.log("updatePlan:", { id, updates, data, error });
    if (error) throw error;
    return data;
  },

  async deletePlan(id: string) {
    // Check if plan has active subscribers
    const { count } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("plan_id", id)
      .in("status", ["active", "trial"]);

    if (count && count > 0) {
      throw new Error(`Cannot delete plan with ${count} active subscribers`);
    }

    const { error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", id);

    console.log("deletePlan:", { id, error });
    if (error) throw error;
  },

  async togglePlanStatus(id: string, isActive: boolean) {
    return this.updatePlan(id, { is_active: isActive });
  },
};