import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { ticketService } from "@/services/ticketService";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, ArrowLeft, Send, Clock } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"] & {
  ticket_messages: { count: number }[];
};
type TicketWithMessages = Database["public"]["Tables"]["support_tickets"]["Row"] & {
  businesses: { name: string } | null;
  ticket_messages: Array<
    Database["public"]["Tables"]["ticket_messages"]["Row"] & {
      profiles: { full_name: string | null; email: string | null } | null;
    }
  >;
};

export default function CustomerSupport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMessages | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "customer") {
      router.push("/");
      return;
    }

    await loadCustomerData(session.user.id);
  };

  const loadCustomerData = async (userId: string) => {
    try {
      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("profile_id", userId)
        .single();

      if (customerData) {
        setCustomer(customerData);
        await loadTickets(customerData.id);
      }
    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async (customerId: string) => {
    try {
      const data = await ticketService.getCustomerTickets(customerId);
      setTickets(data as SupportTicket[]);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setSubmitting(true);
    try {
      await ticketService.createTicket({
        business_id: customer.business_id,
        customer_id: customer.id,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
      });

      setFormData({ subject: "", message: "", priority: "medium" });
      setShowNewTicket(false);
      await loadTickets(customer.id);
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTicket = async (ticketId: string) => {
    try {
      const data = await ticketService.getTicketById(ticketId);
      setSelectedTicket(data as TicketWithMessages);
    } catch (error) {
      console.error("Error loading ticket:", error);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setSubmitting(true);
    try {
      await ticketService.addMessage(selectedTicket.id, replyMessage, true);
      setReplyMessage("");
      await handleViewTicket(selectedTicket.id);
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "default";
      case "in_progress": return "secondary";
      case "resolved": return "outline";
      case "closed": return "outline";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Support Tickets" description="View and manage your support tickets" />

      <div className="min-h-screen bg-muted/30">
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-accent" />
              <h1 className="text-lg font-heading font-semibold">Support Tickets</h1>
            </div>
            {!showNewTicket && !selectedTicket && (
              <Button onClick={() => setShowNewTicket(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            )}
            {(showNewTicket || selectedTicket) && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewTicket(false);
                  setSelectedTicket(null);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* New Ticket Form */}
          {showNewTicket && (
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription>Describe your issue and we'll get back to you soon</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Provide detailed information about your issue"
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Ticket"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Ticket Detail View */}
          {selectedTicket && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle>{selectedTicket.subject}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(selectedTicket.status)}>
                          {selectedTicket.status}
                        </Badge>
                        <Badge variant={getPriorityColor(selectedTicket.priority)}>
                          {selectedTicket.priority} priority
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(selectedTicket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Messages Thread */}
              <div className="space-y-4">
                {selectedTicket.ticket_messages?.map((msg) => (
                  <Card key={msg.id} className={msg.is_from_customer ? "ml-0 mr-12" : "ml-12 mr-0 bg-accent/5"}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">
                          {msg.is_from_customer ? "You" : selectedTicket.businesses?.name || "Support"}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Reply Form */}
              {selectedTicket.status !== "closed" && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        rows={4}
                      />
                      <Button onClick={handleReply} disabled={submitting || !replyMessage.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Tickets List */}
          {!showNewTicket && !selectedTicket && (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-heading font-semibold mb-2">No support tickets</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Create your first support ticket to get help
                    </p>
                    <Button onClick={() => setShowNewTicket(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ticket
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="hover:border-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleViewTicket(ticket.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold mb-2">{ticket.subject}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                            <Badge variant={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {ticket.ticket_messages?.[0]?.count || 0} messages
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(ticket.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}