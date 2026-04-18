import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, DollarSign, TrendingUp, CreditCard, LogOut, Settings } from "lucide-react";
import { authService } from "@/services/authService";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"] & {
  profiles: { full_name: string | null; email: string | null };
};

export default function BusinessDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    trialExpiring: 0,
  });

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
      .select("role, business_id")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "business_owner") {
      router.push("/");
      return;
    }

    if (!profile.business_id) {
      console.error("Business owner has no business_id");
      return;
    }

    await loadBusinessData(profile.business_id);
  };

  const loadBusinessData = async (businessId: string) => {
    try {
      // Load business details
      const { data: businessData } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      if (businessData) {
        setBusiness(businessData);
      }

      // Load customers
      const { data: customersData } = await supabase
        .from("customers")
        .select("*, profiles!customers_profile_id_fkey(full_name, email)")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5);

      console.log("Customers:", { data: customersData });
      
      const customerList = customersData || [];
      setCustomers(customerList as Customer[]);

      // Calculate metrics (mock data for now - will connect to real subscriptions later)
      setMetrics({
        totalCustomers: customerList.length,
        activeSubscriptions: customerList.filter(c => c.subscription_status === "active").length,
        monthlyRevenue: 2450,
        trialExpiring: 3,
      });
    } catch (error) {
      console.error("Error loading business data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Business not found</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${business.name} - Business Dashboard`}
        description="Manage your IPTV business, customers, and billing"
      />
      
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary" />
              <div>
                <h1 className="text-lg font-heading font-semibold">{business.name}</h1>
                <StatusBadge status={business.status} type="business" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/business/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Customers"
              value={metrics.totalCustomers}
              icon={Users}
              trend={{ value: 12, label: "vs last month" }}
            />
            <MetricCard
              title="Active Subscriptions"
              value={metrics.activeSubscriptions}
              icon={TrendingUp}
              className="text-green-600"
            />
            <MetricCard
              title="Monthly Revenue"
              value={`$${metrics.monthlyRevenue}`}
              icon={DollarSign}
              className="text-blue-600"
            />
            <MetricCard
              title="Trial Expiring"
              value={metrics.trialExpiring}
              icon={CreditCard}
              className="text-amber-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/business/customers")}>
              <CardHeader>
                <CardTitle className="text-lg">Manage Customers</CardTitle>
                <CardDescription>View and manage all your customers</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/business/plans")}>
              <CardHeader>
                <CardTitle className="text-lg">Subscription Plans</CardTitle>
                <CardDescription>Configure your pricing and packages</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/business/website")}>
              <CardHeader>
                <CardTitle className="text-lg">Website Builder</CardTitle>
                <CardDescription>Customize your customer-facing site</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Customers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Customers</CardTitle>
                  <CardDescription>Your latest customer sign-ups</CardDescription>
                </div>
                <Button variant="outline" onClick={() => router.push("/business/customers")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-muted/50">
                        <td className="py-4">
                          <div className="font-medium">
                            {customer.profiles?.full_name || "Unknown"}
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {customer.profiles?.email || "No email"}
                        </td>
                        <td className="py-4">
                          <StatusBadge status={customer.subscription_status} type="customer" />
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {customers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No customers yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Share your website link to start getting sign-ups
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trial Notice */}
          {business.status === "trial" && (
            <Card className="border-accent bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">You're on a trial</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your trial period will end soon. Upgrade to continue using all features without interruption.
                    </p>
                    <Button size="sm">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}