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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              <h1 className="text-base sm:text-lg font-heading font-semibold">Customer Support</h1>
            </div>
            {selectedTicket && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTicket(null);
                  loadTickets();
                }}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tickets
              </Button>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Ticket Detail View */}
          {selectedTicket ? (
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 w-full">
                        <CardTitle className="text-base sm:text-lg leading-tight">{selectedTicket.subject}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={getStatusColor(selectedTicket.status)}>
                            {selectedTicket.status}
                          </Badge>
                          <Badge variant={getPriorityColor(selectedTicket.priority)}>
                            {selectedTicket.priority} priority
                          </Badge>
                          <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
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
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="space-y-4">
                        <Textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply..."
                          rows={4}
                          className="text-sm"
                        />
                        <Button onClick={handleReply} disabled={submitting || !replyMessage.trim()} className="w-full sm:w-auto">
                          <Send className="h-4 w-4 mr-2" />
                          {submitting ? "Sending..." : "Send Reply"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Ticket Actions Sidebar */}
              <div className="space-y-4 order-1 lg:order-2">
                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                    <CardTitle className="text-sm sm:text-base">Customer Info</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-2">
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
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                    <CardTitle className="text-sm sm:text-base">Update Status</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
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
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                    <CardTitle className="text-sm sm:text-base">Update Priority</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
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
                <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                  <TabsList className="mb-4 sm:mb-6 inline-flex min-w-max h-auto p-1">
                    <TabsTrigger value="all">All Tickets</TabsTrigger>
                    <TabsTrigger value="open">Open</TabsTrigger>
                    <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    <TabsTrigger value="closed">Closed</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab}>
                  <div className="space-y-3 sm:space-y-4">
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
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex-1 w-full">
                                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                  <h3 className="font-heading font-semibold text-sm sm:text-base leading-tight">{ticket.subject}</h3>
                                  {ticket.priority === "urgent" && (
                                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 truncate">
                                  From: {ticket.customers?.profiles?.full_name || "Unknown Customer"}
                                </p>
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                  <Badge variant={getStatusColor(ticket.status)} className="text-[10px] sm:text-xs">
                                    {ticket.status}
                                  </Badge>
                                  <Badge variant={getPriorityColor(ticket.priority)} className="text-[10px] sm:text-xs">
                                    {ticket.priority}
                                  </Badge>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    {ticket.ticket_messages?.[0]?.count || 0} messages
                                  </span>
                                </div>
                              </div>
                              <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                                <span className="text-xs sm:text-sm text-muted-foreground block">
                                  {new Date(ticket.updated_at).toLocaleDateString()}
                                </span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {new Date(ticket.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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