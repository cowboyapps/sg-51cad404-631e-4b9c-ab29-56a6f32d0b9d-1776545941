import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Tv, Key, ShieldAlert } from "lucide-react";
import { authService } from "@/services/authService";
import { StatusBadge } from "@/components/StatusBadge";
import type { Database } from "@/integrations/supabase/types";

// Extended type definition in case Supabase type generation hasn't completed yet
type Customer = Database["public"]["Tables"]["customers"]["Row"] & {
  profiles: { full_name: string | null; email: string | null } | null;
  subscriptions: (Database["public"]["Tables"]["subscriptions"]["Row"] & {
    subscription_plans: { name: string } | null;
    iptv_username?: string | null;
    iptv_password?: string | null;
    iptv_mac_address?: string | null;
    iptv_server_url?: string | null;
  })[];
};

export default function CustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) return router.push("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, business_id")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "business_owner" || !profile.business_id) {
      return router.push("/");
    }

    await loadCustomers(profile.business_id);
  };

  const loadCustomers = async (businessId: string) => {
    const { data, error } = await supabase
      .from("customers")
      .select(`
        *,
        profiles(full_name, email),
        subscriptions(
          *,
          subscription_plans(name)
        )
      `)
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading customers:", error);
    } else {
      setCustomers(data as any);
    }
    setLoading(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEO title="Customers - Business Dashboard" />
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-semibold">Customers</h1>
                <p className="text-sm text-muted-foreground">Manage your subscribers and their IPTV credentials</p>
              </div>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers by email or name..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading customers...</div>
          ) : (
            <div className="grid gap-6">
              {filteredCustomers.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Tv className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No customers found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredCustomers.map(customer => (
                  <Card key={customer.id}>
                    <CardHeader className="pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{customer.profiles?.full_name || 'Unnamed User'}</CardTitle>
                          <CardDescription>{customer.profiles?.email}</CardDescription>
                        </div>
                        <StatusBadge status={customer.subscription_status as any} type="customer" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Tv className="h-4 w-4 text-primary" /> Active Services
                      </h4>
                      {customer.subscriptions && customer.subscriptions.length > 0 ? (
                        <div className="space-y-4">
                          {customer.subscriptions.map(sub => (
                            <div key={sub.id} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <span className="font-medium text-primary block">{sub.subscription_plans?.name || 'Unknown Plan'}</span>
                                  <span className="text-xs text-muted-foreground">Renews: {new Date(sub.current_period_end).toLocaleDateString()}</span>
                                </div>
                                <StatusBadge status={sub.status as any} />
                              </div>
                              
                              {/* IPTV Credentials Section */}
                              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Xtream Codes / M3U</Label>
                                  <div className="bg-background rounded px-3 py-2 text-sm font-mono flex justify-between items-center group">
                                    <span>User: <span className="text-foreground">{sub.iptv_username || 'Not set'}</span></span>
                                  </div>
                                  <div className="bg-background rounded px-3 py-2 text-sm font-mono flex justify-between items-center">
                                    <span>Pass: <span className="text-foreground">{sub.iptv_password || 'Not set'}</span></span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">MAG Device</Label>
                                  <div className="bg-background rounded px-3 py-2 text-sm font-mono flex justify-between items-center">
                                    <span>MAC: <span className="text-foreground">{sub.iptv_mac_address || 'Not registered'}</span></span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end gap-2 mt-4 pt-4">
                                <Button variant="outline" size="sm">
                                  <Key className="h-4 w-4 mr-2" /> Manage Credentials
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                                  <ShieldAlert className="h-4 w-4 mr-2" /> Suspend Service
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No active subscriptions.</p>
                      )}
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