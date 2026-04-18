import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tv, CreditCard, Settings, LogOut, Copy, Check, Server, Activity } from "lucide-react";
import { authService } from "@/services/authService";
import { StatusBadge } from "@/components/StatusBadge";
import type { Database } from "@/integrations/supabase/types";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"] & {
  subscription_plans: { name: string; price: number; billing_cycle: string } | null;
};

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type Ticket = Database["public"]["Tables"]["support_tickets"]["Row"];

type Customer = Database["public"]["Tables"]["customers"]["Row"] & {
  subscriptions: Subscription[];
  businesses: { name: string; logo_url: string | null } | null;
};

export default function CustomerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [usageStats, setUsageStats] = useState({
    bandwidth: 0,
    watchTime: 0,
    devices: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) return router.push("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, id")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "customer") {
      return router.push("/");
    }

    await loadCustomerData(profile.id);
  };

  const loadCustomerData = async (userId: string) => {
    try {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("*, businesses(name, logo_url)")
        .eq("profile_id", userId)
        .single();

      if (customerError) throw customerError;

      if (customerData) {
        const [subResult, invoicesResult, ticketsResult, usageResult] = await Promise.all([
          supabase
            .from("subscriptions")
            .select("*, subscription_plans(name, price, billing_cycle)")
            .eq("customer_id", customerData.id)
            .eq("status", "active")
            .maybeSingle(),
          supabase
            .from("invoices")
            .select("*")
            .eq("customer_id", customerData.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("support_tickets")
            .select("*")
            .eq("customer_id", customerData.id)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("usage_logs")
            .select("*")
            .eq("customer_id", customerData.id)
            .gte("logged_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        if (subResult.data) setSubscription(subResult.data as any);
        if (invoicesResult.data) setInvoices(invoicesResult.data);
        if (ticketsResult.data) setTickets(ticketsResult.data);
        
        setCustomer({
          ...customerData,
          businesses: Array.isArray(customerData.businesses) ? customerData.businesses[0] : customerData.businesses,
          subscriptions: subResult.data ? [subResult.data as any] : []
        } as Customer);

        if (usageResult.data) {
          const logs = usageResult.data;
          const totalBandwidth = logs.reduce((sum, log) => sum + Number(log.bandwidth_mb || 0), 0);
          const totalWatchTime = logs.reduce((sum, log) => sum + Number(log.watch_minutes || 0), 0);
          const devices = new Set(logs.map(log => JSON.stringify(log.device_info))).size;
          
          setUsageStats({
            bandwidth: Math.round(totalBandwidth / 1024), // GB
            watchTime: Math.round(totalWatchTime / 60), // hours
            devices,
          });
        }
      }
    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your account...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No customer account found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSubscription = customer.subscriptions?.find(s => s.status === "active");

  return (
    <>
      <SEO title="My Account - Customer Portal" />
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {customer.businesses?.logo_url && (
                  <img src={customer.businesses.logo_url} alt="Logo" className="h-8 w-8 rounded" />
                )}
                <h1 className="text-xl font-heading font-semibold">
                  {customer.businesses?.name || "IPTV Service"}
                </h1>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Account Status Banner */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-semibold mb-1">Account Status</h2>
                  <p className="text-sm text-muted-foreground">
                    Your subscription is {customer.subscription_status}
                  </p>
                </div>
                <StatusBadge status={customer.subscription_status as any} type="customer" />
              </div>
            </CardContent>
          </Card>

          {/* Active Service Details */}
          {activeSubscription && (
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Tv className="h-5 w-5 text-primary" />
                      Active Service
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {activeSubscription.subscription_plans?.name} — ${activeSubscription.subscription_plans?.price}/{activeSubscription.subscription_plans?.billing_cycle}
                    </CardDescription>
                  </div>
                  <StatusBadge status={activeSubscription.status as any} />
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Billing Info */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Billing Information
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Period</span>
                      <span className="font-medium">
                        {new Date(activeSubscription.current_period_start).toLocaleDateString()} — {new Date(activeSubscription.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Billing Date</span>
                      <span className="font-medium">
                        {new Date(activeSubscription.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Usage (Last 30 Days)
                      </CardTitle>
                      <Badge variant="outline">Beta</Badge>
                    </div>
                    <CardDescription>Your streaming activity summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Bandwidth</div>
                        <div className="text-2xl font-bold">{usageStats.bandwidth} GB</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Watch Time</div>
                        <div className="text-2xl font-bold">{usageStats.watchTime} hrs</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Devices</div>
                        <div className="text-2xl font-bold">{usageStats.devices}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* IPTV Credentials */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Your IPTV Credentials
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Xtream Codes / M3U Section */}
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Xtream Codes / M3U</p>
                      
                      {activeSubscription.iptv_username && (
                        <div className="bg-background rounded-lg p-3 border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Username</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handleCopy(activeSubscription.iptv_username!, "username")}
                            >
                              {copiedField === "username" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <code className="text-sm font-mono block break-all">{activeSubscription.iptv_username}</code>
                        </div>
                      )}

                      {activeSubscription.iptv_password && (
                        <div className="bg-background rounded-lg p-3 border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Password</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handleCopy(activeSubscription.iptv_password!, "password")}
                            >
                              {copiedField === "password" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <code className="text-sm font-mono block break-all">{activeSubscription.iptv_password}</code>
                        </div>
                      )}

                      {activeSubscription.iptv_server_url && (
                        <div className="bg-background rounded-lg p-3 border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Server URL</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handleCopy(activeSubscription.iptv_server_url!, "server")}
                            >
                              {copiedField === "server" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <code className="text-sm font-mono block break-all text-xs">{activeSubscription.iptv_server_url}</code>
                        </div>
                      )}
                    </div>

                    {/* MAG Device Section */}
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">MAG Device</p>
                      
                      {activeSubscription.iptv_mac_address ? (
                        <div className="bg-background rounded-lg p-3 border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">MAC Address</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handleCopy(activeSubscription.iptv_mac_address!, "mac")}
                            >
                              {copiedField === "mac" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <code className="text-sm font-mono block">{activeSubscription.iptv_mac_address}</code>
                        </div>
                      ) : (
                        <div className="bg-muted/20 rounded-lg p-3 border border-dashed border-border/50">
                          <p className="text-sm text-muted-foreground text-center">No MAG device registered</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {(!activeSubscription.iptv_username && !activeSubscription.iptv_password) && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                      <p className="text-sm text-amber-200">
                        Your IPTV credentials are being provisioned. Please check back in a few minutes or contact support if this persists.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing History
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Active Subscription */}
          {!activeSubscription && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Tv className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-heading font-semibold mb-2">No Active Subscription</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a plan to start enjoying IPTV services
                </p>
                <Button>Browse Plans</Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}