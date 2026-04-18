import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { ticketService } from "@/services/ticketService";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, ArrowLeft, Send, Clock, AlertCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"] & {
  customers: {
    profile_id: string;
    profiles: { full_name: string | null; email: string | null } | null;
  } | null;
  ticket_messages: { count: number }[];
};
type TicketWithMessages = Database["public"]["Tables"]["support_tickets"]["Row"] & {
  customers: {
    profile_id: string;
    profiles: { full_name: string | null; email: string | null } | null;
  } | null;
  ticket_messages: Array<
    Database["public"]["Tables"]["ticket_messages"]["Row"] & {
      profiles: { full_name: string | null; email: string | null } | null;
    }
  >;
};

export default function BusinessSupport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMessages | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (business) {
      loadTickets();
    }
  }, [business, activeTab]);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, business_id")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "business_owner" || !profile.business_id) {
      router.push("/");
      return;
    }

    await loadBusinessData(profile.business_id);
  };

  const loadBusinessData = async (businessId: string) => {
    try {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      if (data) {
        setBusiness(data);
      }
    } catch (error) {
      console.error("Error loading business:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    if (!business) return;

    try {
      const statusFilter = activeTab === "all" ? undefined : activeTab as any;
      const data = await ticketService.getBusinessTickets(business.id, statusFilter);
      setTickets(data as SupportTicket[]);
    } catch (error) {
      console.error("Error loading tickets:", error);
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
      await ticketService.addMessage(selectedTicket.id, replyMessage, false);
      setReplyMessage("");
      await handleViewTicket(selectedTicket.id);
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: Database["public"]["Enums"]["ticket_status"]) => {
    if (!selectedTicket) return;

    try {
      await ticketService.updateTicketStatus(selectedTicket.id, status);
      await handleViewTicket(selectedTicket.id);
      await loadTickets();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUpdatePriority = async (priority: Database["public"]["Enums"]["ticket_priority"]) => {
    if (!selectedTicket) return;

    try {
      await ticketService.updateTicketPriority(selectedTicket.id, priority);
      await handleViewTicket(selectedTicket.id);
    } catch (error) {
      console.error("Error updating priority:", error);
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
      <SEO title="Customer Support" description="Manage customer support tickets" />

      <div className="min-h-screen bg-muted/30">
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-accent" />
              <h1 className="text-lg font-heading font-semibold">Customer Support</h1>
            </div>
            {selectedTicket && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTicket(null);
                  loadTickets();
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tickets
              </Button>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Ticket Detail View */}
          {selectedTicket ? (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
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
                    <Card key={msg.id} className={!msg.is_from_customer ? "ml-0 mr-12" : "ml-12 mr-0 bg-accent/5"}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">
                            {msg.is_from_customer 
                              ? selectedTicket.customers?.profiles?.full_name || "Customer"
                              : "You (Support)"}
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

              {/* Ticket Actions Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Customer Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium">
                        {selectedTicket.customers?.profiles?.full_name || "Unknown"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium text-sm">
                        {selectedTicket.customers?.profiles?.email || "No email"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Update Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={handleUpdateStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Update Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={selectedTicket.priority}
                      onValueChange={handleUpdatePriority}
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
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Tickets List */
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Tickets</TabsTrigger>
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <div className="space-y-4">
                    {tickets.length === 0 ? (
                      <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="font-heading font-semibold mb-2">No support tickets</h3>
                          <p className="text-sm text-muted-foreground">
                            {activeTab === "all" 
                              ? "No support tickets yet" 
                              : `No ${activeTab.replace("_", " ")} tickets`}
                          </p>
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
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-heading font-semibold">{ticket.subject}</h3>
                                  {ticket.priority === "urgent" && (
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  From: {ticket.customers?.profiles?.full_name || "Unknown Customer"}
                                </p>
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
                              <div className="text-right">
                                <span className="text-sm text-muted-foreground block">
                                  {new Date(ticket.updated_at).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(ticket.updated_at).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </>
  );
}