import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import type { Database } from "@/integrations/supabase/types";
import { 
  ArrowLeft, CreditCard, Download, ExternalLink, 
  Calendar, DollarSign, CheckCircle, AlertCircle,
  TrendingUp, Receipt, Check, Settings, Plus, Clock
} from "lucide-react";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type PaymentHistory = Database["public"]["Tables"]["payment_history"]["Row"];

export default function Billing() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [currentTier, setCurrentTier] = useState<any>(null);
  const [availableTiers, setAvailableTiers] = useState<any[]>([]);
  const [processingAction, setProcessingAction] = useState(false);

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

    if (profile?.role !== "business_owner" || !profile.business_id) {
      router.push("/");
      return;
    }

    loadBillingData(profile.business_id);
  };

  const loadBillingData = async (businessId: string) => {
    try {
      const [businessResult, paymentsResult, tiersResult] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", businessId).single(),
        supabase
          .from("payment_history")
          .select("*")
          .eq("business_id", businessId)
          .order("paid_at", { ascending: false })
          .limit(10),
        supabase
          .from("platform_pricing")
          .select("*")
          .eq("is_active", true)
          .order("sort_order")
      ]);

      if (businessResult.data) {
        setBusiness(businessResult.data);
        
        // Find current tier
        const tier = tiersResult.data?.find(t => t.id === businessResult.data.pricing_tier_id);
        setCurrentTier(tier);
      }

      if (paymentsResult.data) setPayments(paymentsResult.data);
      if (tiersResult.data) setAvailableTiers(tiersResult.data);
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!business) return;

    setProcessingAction(true);
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          priceId,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout process");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!business?.stripe_customer_id) return;

    setProcessingAction(true);
    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to open billing portal");
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      trialing: { variant: "secondary", label: "Trial" },
      past_due: { variant: "destructive", label: "Past Due" },
      canceled: { variant: "outline", label: "Canceled" },
      incomplete: { variant: "outline", label: "Incomplete" },
    };

    const config = statusMap[status || ""] || { variant: "outline" as const, label: "No Subscription" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading billing information...</div>
      </div>
    );
  }

  const hasActiveSubscription = business?.subscription_status && 
    ["active", "trialing", "past_due"].includes(business.subscription_status);

  return (
    <>
      <SEO title="Billing - Business Dashboard" />
      
      <div className="min-h-screen bg-background">
        {/* Header - Mobile Responsive */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push("/business")} className="flex-shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-heading font-semibold truncate">Billing & Subscription</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Manage your platform subscription
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading billing information...</p>
            </div>
          ) : business ? (
            <>
              {/* Current Subscription Card - Mobile Optimized */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <CreditCard className="h-5 w-5 text-primary" />
                        {currentTier ? currentTier.display_name : "No Active Plan"}
                      </CardTitle>
                      {currentTier && (
                        <CardDescription className="mt-2 text-sm">
                          ${Number(currentTier.monthly_price).toFixed(2)}/month or ${Number(currentTier.yearly_price).toFixed(2)}/year
                        </CardDescription>
                      )}
                    </div>
                    {business.subscription_status && (
                      <StatusBadge 
                        status={business.subscription_status as any} 
                        type="business" 
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {currentTier && (
                    <>
                      {/* Subscription Details - Mobile Stacked */}
                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Billing Cycle</h3>
                          <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Current Period</p>
                            <p className="font-medium text-sm sm:text-base">
                              {business.current_period_end 
                                ? `Renews ${new Date(business.current_period_end).toLocaleDateString()}`
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold mb-3">Payment Method</h3>
                          <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Status</p>
                            <p className="font-medium text-sm sm:text-base">
                              {business.subscription_status === "active" ? "Payment Active" : "Update Required"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Features List - Mobile Responsive */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3">Plan Features</h3>
                        <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                          {Array.isArray(currentTier.features) && currentTier.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-xs sm:text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons - Mobile Stacked */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        {business.stripe_subscription_id ? (
                          <Button 
                            onClick={handleManageSubscription} 
                            disabled={managingSubscription}
                            className="w-full sm:flex-1"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {managingSubscription ? "Loading..." : "Manage Subscription"}
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => router.push("/pricing")}
                            className="w-full sm:flex-1"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Subscribe to a Plan
                          </Button>
                        )}
                        <Button variant="outline" className="w-full sm:flex-1">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      </div>
                    </>
                  )}

                  {!currentTier && (
                    <div className="text-center py-8 sm:py-12">
                      <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold mb-2">No Active Subscription</h3>
                      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
                        Choose a plan to unlock all platform features
                      </p>
                      <Button onClick={() => router.push("/pricing")} className="w-full sm:w-auto">
                        View Pricing Plans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trial Notice - Mobile Optimized */}
              {business.subscription_status === "trialing" && business.trial_end && (
                <Card className="border-accent bg-accent/5">
                  <CardContent className="py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">Free Trial Active</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                          Your trial ends on {new Date(business.trial_end).toLocaleDateString()}. 
                          Add a payment method to continue using the platform after your trial.
                        </p>
                        <Button size="sm" className="w-full sm:w-auto">
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment History - Horizontal Scroll on Mobile */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Payment History</CardTitle>
                      <CardDescription className="text-sm">Your billing and invoice records</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-left text-sm text-muted-foreground">
                            <th className="pb-3 pl-4 sm:pl-0 font-medium whitespace-nowrap">Date</th>
                            <th className="pb-3 font-medium whitespace-nowrap">Amount</th>
                            <th className="pb-3 font-medium whitespace-nowrap">Status</th>
                            <th className="pb-3 pr-4 sm:pr-0 font-medium whitespace-nowrap">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-muted/50">
                              <td className="py-4 pl-4 sm:pl-0 text-sm whitespace-nowrap">
                                {new Date(payment.paid_at).toLocaleDateString()}
                              </td>
                              <td className="py-4 font-medium whitespace-nowrap">
                                ${Number(payment.amount_paid).toFixed(2)}
                              </td>
                              <td className="py-4">
                                <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                                  {payment.status}
                                </Badge>
                              </td>
                              <td className="py-4 pr-4 sm:pr-0">
                                {payment.stripe_invoice_id && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <a 
                                      href={`https://dashboard.stripe.com/invoices/${payment.stripe_invoice_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                      <span className="hidden sm:inline">View</span>
                                    </a>
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {payments.length === 0 && (
                        <div className="text-center py-12 px-4">
                          <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground text-sm">No payment history yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Business not found</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}