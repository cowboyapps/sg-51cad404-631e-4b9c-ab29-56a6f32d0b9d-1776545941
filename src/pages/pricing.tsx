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
      <SEO title="Pricing Plans | IPTV Business Platform" />
      
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-primary flex-shrink-0" />
                <span className="text-base sm:text-lg font-bold">IPTV Platform</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="ghost" onClick={() => router.push("/")} className="hidden sm:inline-flex">
                  Home
                </Button>
                <Button variant="ghost" onClick={() => router.push("/login")}>
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">Login</span>
                </Button>
                <Button onClick={() => router.push("/signup")} size="sm">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-12 sm:py-16 px-4 text-center">
          <div className="container mx-auto max-w-4xl space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold">
              Simple, Transparent Pricing
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Choose the perfect plan for your IPTV business. All plans include 14-day free trial.
            </p>
            
            {/* Billing Toggle - Mobile Optimized */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 pt-4">
              <span className={`text-sm sm:text-base ${!isYearly ? "font-semibold" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-14 items-center rounded-full transition-colors ${
                  isYearly ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-transform ${
                    isYearly ? "translate-x-6 sm:translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-sm sm:text-base ${isYearly ? "font-semibold" : "text-muted-foreground"}`}>
                Yearly
                <Badge variant="secondary" className="ml-2 text-[10px] sm:text-xs">Save 20%</Badge>
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-12 sm:pb-24 px-4">
          <div className="container mx-auto">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading pricing...</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                {tiers.map((tier, index) => {
                  const features = Array.isArray(tier.features) ? (tier.features as string[]) : [];
                  const isPopular = index === 1;

                  return (
                    <Card 
                      key={tier.id} 
                      className={`relative ${isPopular ? "border-primary shadow-lg scale-100 sm:scale-105" : ""}`}
                    >
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="text-xs sm:text-sm">Most Popular</Badge>
                        </div>
                      )}
                      
                      <CardHeader className="pt-8 sm:pt-10">
                        <CardTitle className="text-xl sm:text-2xl">{tier.display_name}</CardTitle>
                        <CardDescription className="text-sm sm:text-base">{tier.description}</CardDescription>
                        <div className="mt-4 sm:mt-6">
                          <span className="text-3xl sm:text-4xl font-bold">
                            ${isYearly 
                              ? (Number(tier.yearly_price) / 12).toFixed(0)
                              : Number(tier.monthly_price).toFixed(0)}
                          </span>
                          <span className="text-sm sm:text-base text-muted-foreground">/month</span>
                          {isYearly && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              Billed ${Number(tier.yearly_price).toFixed(0)} yearly
                            </p>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4 sm:space-y-6">
                        <Button 
                          className="w-full"
                          variant={isPopular ? "default" : "outline"}
                          onClick={() => router.push("/signup")}
                        >
                          Start Free Trial
                        </Button>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <p className="text-xs sm:text-sm font-semibold">What's included:</p>
                          {features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 sm:gap-3">
                              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-8 sm:mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  q: "Do I need a credit card for the free trial?",
                  a: "No! Start your 14-day free trial without entering any payment information. You'll only be charged after your trial ends if you choose to continue."
                },
                {
                  q: "Can I change plans later?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the charges."
                },
                {
                  q: "What happens if I exceed my customer limit?",
                  a: "We'll notify you when you're approaching your limit. You can upgrade to a higher tier at any time to accommodate more customers."
                },
                {
                  q: "Is there a setup fee?",
                  a: "No setup fees, no hidden charges. What you see is what you pay. Just the monthly or yearly subscription fee."
                }
              ].map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Start your 14-day free trial today. No credit card required.
            </p>
            <Button size="lg" onClick={() => router.push("/signup")} className="w-full sm:w-auto">
              Start Free Trial
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}