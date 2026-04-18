import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Building2, DollarSign, Users, TrendingUp, LogOut } from "lucide-react";
import { authService } from "@/services/authService";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    trial: 0,
    suspended: 0,
  });

  useEffect(() => {
    checkAuth();
    loadData();
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

    if (profile?.role !== "master_admin") {
      router.push("/");
    }
  };

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const businessList = data || [];
      setBusinesses(businessList);

      const counts = {
        total: businessList.length,
        active: businessList.filter(b => b.status === "active").length,
        trial: businessList.filter(b => b.status === "trial").length,
        suspended: businessList.filter(b => b.status === "suspended").length,
      };
      setMetrics(counts);
    } catch (error) {
      console.error("Error loading businesses:", error);
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

  return (
    <>
      <SEO 
        title="Master Admin - IPTV Business Platform"
        description="Manage all IPTV businesses and platform operations"
      />
      
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary" />
              <div>
                <h1 className="text-lg font-heading font-semibold">Master Admin</h1>
                <p className="text-sm text-muted-foreground">Platform Management</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Businesses"
              value={metrics.total}
              icon={Building2}
              trend={{ value: 12, label: "vs last month" }}
            />
            <MetricCard
              title="Active"
              value={metrics.active}
              icon={TrendingUp}
              className="text-green-600"
            />
            <MetricCard
              title="Trial"
              value={metrics.trial}
              icon={Users}
              className="text-blue-600"
            />
            <MetricCard
              title="Suspended"
              value={metrics.suspended}
              icon={DollarSign}
              className="text-amber-600"
            />
          </div>

          {/* Businesses Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>IPTV Businesses</CardTitle>
                  <CardDescription>Manage all registered businesses</CardDescription>
                </div>
                <Button onClick={() => router.push("/admin/businesses/new")}>
                  Add Business
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Business</th>
                      <th className="pb-3 font-medium">Slug</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {businesses.map((business) => (
                      <tr key={business.id} className="hover:bg-muted/50">
                        <td className="py-4">
                          <div className="font-medium">{business.name}</div>
                        </td>
                        <td className="py-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            /{business.slug}
                          </code>
                        </td>
                        <td className="py-4">
                          <StatusBadge status={business.status} type="business" />
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {new Date(business.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/businesses/${business.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {businesses.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No businesses yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}