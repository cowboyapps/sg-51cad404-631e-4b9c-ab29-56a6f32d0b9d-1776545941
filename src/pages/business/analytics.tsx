import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, Users, Database as DatabaseIcon, Activity, Download } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"] & {
  profiles?: { full_name: string | null; email: string | null } | null;
};

export default function Analytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string>("");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [usageData, setUsageData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({
    totalBandwidth: 0,
    activeCustomers: 0,
    avgWatchTime: 0,
    peakStreams: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (businessId) {
      loadAnalytics();
    }
  }, [businessId, dateRange]);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", session.user.id)
      .single();

    if (!business) {
      router.push("/");
      return;
    }

    setBusinessId(business.id);
  };

  const loadAnalytics = async () => {
    try {
      const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Load usage logs
      const { data: logs, error: logsError } = await supabase
        .from("usage_logs")
        .select("*")
        .eq("business_id", businessId)
        .gte("logged_at", startDate.toISOString())
        .order("logged_at", { ascending: false });

      if (logsError) throw logsError;

      // Load customers
      const { data: customerData, error: customersError } = await supabase
        .from("customers")
        .select("*, profiles!customers_profile_id_fkey(full_name, email)")
        .eq("business_id", businessId);

      if (customersError) throw customersError;

      setUsageData(logs || []);
      setCustomers((customerData as any) || []);

      // Calculate stats
      const totalBandwidth = (logs || []).reduce((sum, log) => sum + Number(log.bandwidth_mb || 0), 0);
      const activeCustomerIds = new Set((logs || []).map(log => log.customer_id));
      const totalWatchMinutes = (logs || []).reduce((sum, log) => sum + Number(log.watch_minutes || 0), 0);
      const peakStreams = Math.max(...(logs || []).map(log => Number(log.concurrent_streams || 0)), 0);

      setStats({
        totalBandwidth: Math.round(totalBandwidth / 1024), // Convert to GB
        activeCustomers: activeCustomerIds.size,
        avgWatchTime: activeCustomerIds.size > 0 ? Math.round(totalWatchMinutes / activeCustomerIds.size) : 0,
        peakStreams,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerUsage = (customerId: string) => {
    const customerLogs = usageData.filter(log => log.customer_id === customerId);
    const totalBandwidth = customerLogs.reduce((sum, log) => sum + Number(log.bandwidth_mb || 0), 0);
    const totalWatchTime = customerLogs.reduce((sum, log) => sum + Number(log.watch_minutes || 0), 0);
    const peakStreams = Math.max(...customerLogs.map(log => Number(log.concurrent_streams || 0)), 0);

    return {
      bandwidth: (totalBandwidth / 1024).toFixed(2), // GB
      watchTime: totalWatchTime,
      peakStreams,
      activeDevices: new Set(customerLogs.map(log => JSON.stringify(log.device_info))).size,
    };
  };

  const exportCSV = () => {
    const csvData = customers.map(customer => {
      const usage = getCustomerUsage(customer.id);
      return {
        customer: customer.profiles?.full_name || customer.profiles?.email || "Unknown",
        bandwidth_gb: usage.bandwidth,
        watch_hours: (usage.watchTime / 60).toFixed(1),
        peak_streams: usage.peakStreams,
        active_devices: usage.activeDevices,
      };
    });

    const headers = ["Customer", "Bandwidth (GB)", "Watch Hours", "Peak Streams", "Active Devices"];
    const csv = [
      headers.join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usage-report-${dateRange}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Usage Analytics | Business Dashboard" />
      
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/business")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-lg font-heading font-semibold">Usage Analytics</h1>
                  <p className="text-sm text-muted-foreground">Monitor customer streaming activity</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Bandwidth</CardTitle>
                <DatabaseIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBandwidth} GB</div>
                <p className="text-xs text-muted-foreground mt-1">Across all customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">With recent activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Watch Time</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgWatchTime} min</div>
                <p className="text-xs text-muted-foreground mt-1">Per active customer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Peak Concurrent</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.peakStreams}</div>
                <p className="text-xs text-muted-foreground mt-1">Simultaneous streams</p>
              </CardContent>
            </Card>
          </div>

          {/* Per-Customer Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Usage Details</CardTitle>
              <CardDescription>Individual usage breakdown for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Bandwidth (GB)</th>
                      <th className="pb-3 font-medium">Watch Time</th>
                      <th className="pb-3 font-medium">Peak Streams</th>
                      <th className="pb-3 font-medium">Devices</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.map((customer) => {
                      const usage = getCustomerUsage(customer.id);
                      return (
                        <tr key={customer.id} className="hover:bg-muted/50">
                          <td className="py-4">
                            <div>
                              <div className="font-medium">{customer.profiles?.full_name || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{customer.profiles?.email || "No email"}</div>
                            </div>
                          </td>
                          <td className="py-4 font-mono">{usage.bandwidth}</td>
                          <td className="py-4">
                            {(usage.watchTime / 60).toFixed(1)} hrs
                          </td>
                          <td className="py-4">{usage.peakStreams}</td>
                          <td className="py-4">
                            <Badge variant="outline">{usage.activeDevices} device{usage.activeDevices !== 1 ? 's' : ''}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {customers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No customer data available</p>
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