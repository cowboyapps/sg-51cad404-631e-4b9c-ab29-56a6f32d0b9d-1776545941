import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type BusinessInsert = Database["public"]["Tables"]["businesses"]["Insert"];
type BusinessUpdate = Database["public"]["Tables"]["businesses"]["Update"];

export const businessService = {
  async getAllBusinesses() {
    const { data, error } = await supabase
      .from("businesses")
      .select("*, profiles!businesses_owner_id_fkey(full_name, email)")
      .order("created_at", { ascending: false });

    console.log("getAllBusinesses:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async getBusinessById(id: string) {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .single();

    console.log("getBusinessById:", { id, data, error });
    if (error) throw error;
    return data;
  },

  async getBusinessBySlug(slug: string) {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("slug", slug)
      .single();

    console.log("getBusinessBySlug:", { slug, data, error });
    if (error) throw error;
    return data;
  },

  async getUserBusiness(userId: string) {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();

    console.log("getUserBusiness:", { userId, data, error });
    if (error) throw error;
    return data;
  },

  async createBusiness(business: BusinessInsert) {
    const { data, error } = await supabase
      .from("businesses")
      .insert(business)
      .select()
      .single();

    console.log("createBusiness:", { business, data, error });
    if (error) throw error;
    return data;
  },

  async updateBusiness(id: string, updates: BusinessUpdate) {
    const { data, error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    console.log("updateBusiness:", { id, updates, data, error });
    if (error) throw error;
    return data;
  },

  async updateBusinessStatus(id: string, status: Database["public"]["Enums"]["business_status"]) {
    return this.updateBusiness(id, { status, updated_at: new Date().toISOString() });
  },
};