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
  TrendingUp, Receipt
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
      <SEO title="Billing & Subscription | Business Dashboard" />
      
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/business")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Billing & Subscription</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your platform subscription and payments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-6">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>Your active plan and billing status</CardDescription>
            </CardHeader>
            <CardContent>
              {hasActiveSubscription ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{currentTier?.display_name || "Unknown Plan"}</h3>
                          {getStatusBadge(business?.subscription_status || null)}
                        </div>
                        <p className="text-muted-foreground">{currentTier?.description}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {business?.current_period_end && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Renews:</span>
                            <span className="font-medium">
                              {new Date(business.current_period_end).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {business?.trial_end && new Date(business.trial_end) > new Date() && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">Trial ends:</span>
                            <span className="font-medium">
                              {new Date(business.trial_end).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {currentTier?.features && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium mb-2">Included Features:</p>
                          <div className="grid md:grid-cols-2 gap-2">
                            {currentTier.features.slice(0, 6).map((feature: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-primary" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        ${Number(currentTier?.monthly_price || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button onClick={handleManageSubscription} disabled={processingAction}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                    <Button variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-6">
                    Subscribe to a plan to unlock all platform features
                  </p>
                  <Button onClick={() => router.push("/pricing")}>
                    View Available Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Plans */}
          {!hasActiveSubscription && availableTiers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>Select a subscription tier to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {availableTiers.map((tier) => (
                    <Card key={tier.id} className="border-2 hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle>{tier.display_name}</CardTitle>
                        <CardDescription>{tier.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-3xl font-bold">
                            ${Number(tier.monthly_price).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">per month</div>
                        </div>

                        <div className="space-y-2">
                          {tier.features?.slice(0, 5).map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button 
                          className="w-full"
                          onClick={() => handleSubscribe(tier.stripe_monthly_price_id)}
                          disabled={!tier.stripe_monthly_price_id || processingAction}
                        >
                          {tier.stripe_monthly_price_id ? "Subscribe Now" : "Coming Soon"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>Your invoices and payment records</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            ${Number(payment.amount_paid).toFixed(2)} {payment.currency?.toUpperCase()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : "Pending"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
                        {payment.invoice_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment history yet
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}