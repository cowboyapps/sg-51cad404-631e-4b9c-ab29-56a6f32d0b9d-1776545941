import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"];
type TicketMessage = Database["public"]["Tables"]["ticket_messages"]["Row"];
type TicketStatus = Database["public"]["Enums"]["ticket_status"];
type TicketPriority = Database["public"]["Enums"]["ticket_priority"];

export const ticketService = {
  // Create a new support ticket
  async createTicket(data: {
    business_id: string;
    customer_id: string;
    subject: string;
    message: string;
    priority?: TicketPriority;
  }) {
    // Create the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        business_id: data.business_id,
        customer_id: data.customer_id,
        subject: data.subject,
        priority: data.priority || "medium",
        status: "open",
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Add the first message
    const { error: messageError } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticket.id,
        sender_id: (await supabase.auth.getSession()).data.session?.user.id,
        message: data.message,
        is_from_customer: true,
      });

    if (messageError) throw messageError;

    return ticket;
  },

  // Get tickets for a customer
  async getCustomerTickets(customerId: string) {
    const { data, error } = await supabase
      .from("support_tickets")
      .select(`
        *,
        ticket_messages(count)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    console.log("getCustomerTickets:", { customerId, data, error });
    if (error) throw error;
    return data || [];
  },

  // Get tickets for a business
  async getBusinessTickets(businessId: string, status?: TicketStatus) {
    let query = supabase
      .from("support_tickets")
      .select(`
        *,
        customers!support_tickets_customer_id_fkey(
          profile_id,
          profiles!customers_profile_id_fkey(full_name, email)
        ),
        ticket_messages(count)
      `)
      .eq("business_id", businessId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    console.log("getBusinessTickets:", { businessId, status, data, error });
    if (error) throw error;
    return data || [];
  },

  // Get ticket by ID with messages
  async getTicketById(ticketId: string) {
    const { data, error } = await supabase
      .from("support_tickets")
      .select(`
        *,
        customers!support_tickets_customer_id_fkey(
          profile_id,
          profiles!customers_profile_id_fkey(full_name, email)
        ),
        businesses(name),
        ticket_messages(
          *,
          profiles!ticket_messages_sender_id_fkey(full_name, email)
        )
      `)
      .eq("id", ticketId)
      .single();

    console.log("getTicketById:", { ticketId, data, error });
    if (error) throw error;
    return data;
  },

  // Add a message to a ticket
  async addMessage(ticketId: string, message: string, isFromCustomer: boolean) {
    const session = await supabase.auth.getSession();
    
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: session.data.session?.user.id,
        message,
        is_from_customer: isFromCustomer,
      })
      .select()
      .single();

    if (error) throw error;

    // Update ticket timestamp
    await supabase
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    return data;
  },

  // Update ticket status
  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const { data, error } = await supabase
      .from("support_tickets")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", ticketId)
      .select()
      .single();

    console.log("updateTicketStatus:", { ticketId, status, data, error });
    if (error) throw error;
    return data;
  },

  // Update ticket priority
  async updateTicketPriority(ticketId: string, priority: TicketPriority) {
    const { data, error } = await supabase
      .from("support_tickets")
      .update({ 
        priority,
        updated_at: new Date().toISOString()
      })
      .eq("id", ticketId)
      .select()
      .single();

    console.log("updateTicketPriority:", { ticketId, priority, data, error });
    if (error) throw error;
    return data;
  },
};