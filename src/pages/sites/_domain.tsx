import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tv, Check, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];

export default function CustomDomainSite() {
  const router = useRouter();
  const { domain } = router.query;
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (domain) {
      loadBusinessByDomain(domain as string);
    }
  }, [domain]);

  const loadBusinessByDomain = async (customDomain: string) => {
    try {
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("custom_domain", customDomain)
        .maybeSingle();

      if (businessError || !businessData) {
        setLoading(false);
        return;
      }

      if (businessData.status === "suspended") {
        setLoading(false);
        return;
      }

      setBusiness(businessData);

      const { data: plansData } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("business_id", businessData.id)
        .eq("is_active", true)
        .order("price", { ascending: true });

      setPlans(plansData || []);
    } catch (error) {
      console.error("Error loading business:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !business) return;

    setSubmitting(true);
    setError("");

    try {
      const { user } = await authService.signUp(formData.email, formData.password);
      if (!user) throw new Error("User creation failed");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "customer",
          full_name: formData.fullName,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          profile_id: user.id,
          business_id: business.id,
          subscription_status: "active",
        })
        .select()
        .single();

      if (customerError) throw customerError;

      const plan = plans.find((p) => p.id === selectedPlan);
      if (!plan) throw new Error("Plan not found");

      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + (plan.billing_cycle === "yearly" ? 12 : (plan.billing_cycle as string) === "quarterly" ? 3 : 1));

      const { error: subError } = await supabase
        .from("subscriptions")
        .insert({
          customer_id: customer.id,
          plan_id: selectedPlan,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
        });

      if (subError) throw subError;

      router.push("/customer");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <Tv className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-heading font-semibold text-xl mb-2">Service Not Found</h2>
            <p className="text-muted-foreground">
              This domain is not configured or the service is unavailable.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${business.name} - IPTV Service`}
        description={business.description || "Subscribe to our IPTV service"}
      />

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Tv className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold">{business.name}</h1>
                {business.description && (
                  <p className="text-sm text-muted-foreground">{business.description}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!showSignup ? (
            <>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-heading font-bold mb-4">
                  Choose Your Plan
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Select the perfect IPTV package for your entertainment needs
                </p>
              </div>

              {plans.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">
                      No subscription plans available at this time.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`hover:border-accent transition-colors ${
                        selectedPlan === plan.id ? "border-accent" : ""
                      }`}
                    >
                      <CardHeader>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-4xl font-heading font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/{plan.billing_cycle}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {plan.description && (
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        )}
                        <div className="space-y-2">
                          {((plan.features as string[]) || []).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setSelectedPlan(plan.id);
                            setShowSignup(true);
                          }}
                        >
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Create Your Account</CardTitle>
                  <CardDescription>
                    Sign up to start enjoying {business.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Password</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-1">Selected Plan</p>
                      <p className="text-xl font-heading font-semibold">
                        {plans.find((p) => p.id === selectedPlan)?.name}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowSignup(false);
                          setSelectedPlan(null);
                          setError("");
                        }}
                        disabled={submitting}
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Complete Signup"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        <footer className="border-t mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 {business.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}