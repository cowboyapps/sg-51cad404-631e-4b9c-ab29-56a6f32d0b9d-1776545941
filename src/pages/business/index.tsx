import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, DollarSign, TrendingUp, CreditCard, LogOut, Settings, Package, BarChart3, MessageSquare, AlertCircle } from "lucide-react";
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
        {/* Header - Mobile Responsive */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-lg font-heading font-semibold truncate">{business.name}</h1>
                  <StatusBadge status={business.status} type="business" />
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push("/business/billing")}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/business/plans")}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Plans & Pricing
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/business/page-builder")}>
                  <Package className="h-4 w-4 mr-2" />
                  Page Builder
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/business/analytics")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/business/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button variant="outline" size="sm" className="lg:hidden flex-shrink-0" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Navigation - Horizontal Scroll */}
            <div className="lg:hidden overflow-x-auto mt-3 -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                <Button variant="outline" size="sm" onClick={() => router.push("/business/billing")}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/business/plans")}>
                  Plans
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/business/page-builder")}>
                  Builder
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/business/analytics")}>
                  Analytics
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/business/settings")}>
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Metrics - Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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

          {/* Quick Actions - Responsive Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Card className="hover:border-accent/50 transition-colors cursor-pointer" onClick={() => router.push("/business/customers")}>
              <CardContent className="pt-6">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent mb-3" />
                <h3 className="font-heading font-semibold mb-1 text-sm sm:text-base">Manage Customers</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">View and manage subscriber accounts</p>
              </CardContent>
            </Card>

            <Card className="hover:border-accent/50 transition-colors cursor-pointer" onClick={() => router.push("/business/plans")}>
              <CardContent className="pt-6">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-accent mb-3" />
                <h3 className="font-heading font-semibold mb-1 text-sm sm:text-base">Subscription Plans</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Configure pricing packages</p>
              </CardContent>
            </Card>

            <Card className="hover:border-accent/50 transition-colors cursor-pointer" onClick={() => router.push("/business/billing")}>
              <CardContent className="pt-6">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-accent mb-3" />
                <h3 className="font-heading font-semibold mb-1 text-sm sm:text-base">Billing & Invoices</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Track payments and revenue</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Customers - Horizontal Scroll on Mobile */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Recent Customers</CardTitle>
                  <CardDescription className="text-sm">Your latest customer sign-ups</CardDescription>
                </div>
                <Button variant="outline" onClick={() => router.push("/business/customers")} className="w-full sm:w-auto">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 pl-4 sm:pl-0 font-medium whitespace-nowrap">Customer</th>
                        <th className="pb-3 font-medium whitespace-nowrap">Email</th>
                        <th className="pb-3 font-medium whitespace-nowrap">Status</th>
                        <th className="pb-3 pr-4 sm:pr-0 font-medium whitespace-nowrap">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-muted/50">
                          <td className="py-4 pl-4 sm:pl-0">
                            <div className="font-medium whitespace-nowrap">
                              {customer.profiles?.full_name || "Unknown"}
                            </div>
                          </td>
                          <td className="py-4 text-sm text-muted-foreground whitespace-nowrap">
                            {customer.profiles?.email || "No email"}
                          </td>
                          <td className="py-4">
                            <StatusBadge status={customer.subscription_status} type="customer" />
                          </td>
                          <td className="py-4 pr-4 sm:pr-0 text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(customer.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {customers.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No customers yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Share your website link to start getting sign-ups
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trial Notice - Mobile Optimized */}
          {business.status === "trial" && (
            <Card className="border-accent bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">You're on a trial</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                      Your trial period will end soon. Upgrade to continue using all features without interruption.
                    </p>
                    <Button size="sm" className="w-full sm:w-auto">
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