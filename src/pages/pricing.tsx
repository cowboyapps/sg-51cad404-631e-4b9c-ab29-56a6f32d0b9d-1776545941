import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Check, Server, ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PricingTier = Database["public"]["Tables"]["platform_pricing"]["Row"];

export default function Pricing() {
  const router = useRouter();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricingTiers();
  }, []);

  const loadPricingTiers = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_pricing")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      console.error("Error loading pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (tier: PricingTier) => {
    return billingCycle === "monthly" ? tier.monthly_price : tier.yearly_price;
  };

  const getSavingsPercentage = (tier: PricingTier) => {
    const monthlyCost = Number(tier.monthly_price) * 12;
    const yearlyCost = Number(tier.yearly_price);
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  return (
    <>
      <SEO 
        title="Pricing Plans | IPTV Platform"
        description="Choose the perfect plan for your IPTV business. Flexible pricing with all features included. Start your free trial today."
      />
      
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/login")}>
                Sign In
              </Button>
              <Button onClick={() => router.push("/signup")}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <Badge variant="outline" className="mb-2">Simple, Transparent Pricing</Badge>
            <h1 className="text-5xl font-bold">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All plans include 14-day free trial. No credit card required to start.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")} className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly
                  <Badge variant="secondary" className="ml-2 text-xs">Save up to 20%</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Pricing Cards */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading pricing...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {tiers.map((tier, index) => {
                const features = Array.isArray(tier.features) ? tier.features : [];
                const isPopular = index === 1; // Middle tier is popular

                return (
                  <Card 
                    key={tier.id} 
                    className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : 'border-border/50'}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-8">
                      <CardTitle className="text-2xl">{tier.display_name}</CardTitle>
                      <CardDescription className="text-base">{tier.description}</CardDescription>
                      
                      <div className="pt-6">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-bold">${getPrice(tier)}</span>
                          <span className="text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                        </div>
                        {billingCycle === "yearly" && (
                          <p className="text-sm text-primary mt-2">
                            Save {getSavingsPercentage(tier)}% with yearly billing
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <Button 
                        className="w-full" 
                        variant={isPopular ? "default" : "outline"}
                        onClick={() => router.push("/signup")}
                      >
                        Start Free Trial
                      </Button>

                      <div className="space-y-3">
                        {features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I change plans later?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                    and we'll prorate the difference.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens after the trial?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    After your 14-day free trial, you'll be charged based on your selected plan and billing cycle. 
                    You can cancel anytime during the trial with no charges.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Are domains included?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Domain purchases are separate from your subscription. Buy domains through our marketplace at $25/year 
                    with automatic DNS setup, or use your own domain for free.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We accept all major credit cards (Visa, MasterCard, American Express) via Stripe. 
                    All payments are secure and encrypted.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-24 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground">
              Join hundreds of IPTV businesses using our platform
            </p>
            <Button size="lg" onClick={() => router.push("/signup")} className="text-lg px-8">
              Start Your Free Trial
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </>
  );
}