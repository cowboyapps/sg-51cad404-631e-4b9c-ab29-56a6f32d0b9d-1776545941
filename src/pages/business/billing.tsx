import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, DollarSign, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { invoiceService } from "@/services/invoiceService";
import { MetricCard } from "@/components/MetricCard";
import { EmptyState } from "@/components/EmptyState";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  customers: {
    profiles: { full_name: string | null; email: string | null } | null;
  } | null;
  subscriptions: {
    subscription_plans: { name: string } | null;
  } | null;
};

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    overdueCount: 0,
    paidThisMonth: 0,
  });

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

    await loadInvoices(profile.business_id);
  };

  const loadInvoices = async (businessId: string) => {
    const data = await invoiceService.getInvoicesByBusiness(businessId);
    setInvoices(data as any);

    // Calculate metrics
    const totalRevenue = data.reduce((sum, inv) => inv.status === "paid" ? sum + inv.amount : sum, 0);
    const pendingAmount = data.reduce((sum, inv) => inv.status === "pending" ? sum + inv.amount : sum, 0);
    const overdueCount = data.filter(inv => inv.status === "overdue").length;
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const paidThisMonth = data.reduce((sum, inv) => {
      if (inv.status === "paid" && inv.paid_at && new Date(inv.paid_at) >= firstDayOfMonth) {
        return sum + inv.amount;
      }
      return sum;
    }, 0);

    setMetrics({ totalRevenue, pendingAmount, overdueCount, paidThisMonth });
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "overdue":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "cancelled":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "";
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.customers?.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customers?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <SEO title="Billing & Invoices - Business Dashboard" />
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-semibold">Billing & Invoices</h1>
                <p className="text-sm text-muted-foreground">Track payments and revenue</p>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={`$${metrics.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              description="All-time revenue"
            />
            <MetricCard
              title="This Month"
              value={`$${metrics.paidThisMonth.toLocaleString()}`}
              icon={TrendingUp}
              description="Paid invoices this month"
              className="border-accent/20"
            />
            <MetricCard
              title="Pending"
              value={`$${metrics.pendingAmount.toLocaleString()}`}
              icon={Clock}
              description="Awaiting payment"
            />
            <MetricCard
              title="Overdue"
              value={metrics.overdueCount.toString()}
              icon={AlertCircle}
              description="Past due invoices"
              className="border-destructive/20"
            />
          </div>

          {/* Filters & Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer name or email..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "paid", "pending", "overdue", "cancelled"].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading invoices...</div>
              ) : filteredInvoices.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="No invoices found"
                  description="Invoices will appear here when customers subscribe to plans"
                />
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm">
                            #{invoice.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {invoice.customers?.profiles?.full_name || "Unknown"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {invoice.customers?.profiles?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {invoice.subscriptions?.subscription_plans?.name || "N/A"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${invoice.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}