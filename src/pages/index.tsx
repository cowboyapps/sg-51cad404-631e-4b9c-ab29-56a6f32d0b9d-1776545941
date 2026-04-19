import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/router";
import { 
  Zap, Globe, Mail, MessageSquare, CreditCard, Palette, 
  Search, BarChart3, Users, Shield, Check, ArrowRight,
  Server, Smartphone, Clock
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: Globe,
      title: "Instant Domain Setup",
      description: "Purchase domains directly through our marketplace with automatic DNS configuration. Zero technical knowledge required.",
      badge: "Auto-Setup"
    },
    {
      icon: Palette,
      title: "Complete White-Labeling",
      description: "Customize colors, fonts, logos, and layouts. Your brand, your way. Professional theme editor with live preview.",
      badge: "Brand Control"
    },
    {
      icon: Mail,
      title: "Branded Email System",
      description: "Send automated emails from your own domain. Custom sender names, logos, and footers. SPF/DKIM configured automatically.",
      badge: "Professional"
    },
    {
      icon: MessageSquare,
      title: "Built-In Support Tickets",
      description: "Complete ticketing system with email notifications. Customers can contact you, you respond—all tracked and organized.",
      badge: "Customer Care"
    },
    {
      icon: CreditCard,
      title: "Automated Billing",
      description: "Subscription management, invoicing, payment processing, and dunning—all automated. Focus on your service, not paperwork.",
      badge: "Recurring Revenue"
    },
    {
      icon: Search,
      title: "SEO Optimization",
      description: "Built-in SEO tools: meta tags, Open Graph images, sitemaps. Get discovered on Google from day one.",
      badge: "Visibility"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track revenue, customer growth, churn rates, and MRR. Make data-driven decisions with beautiful charts.",
      badge: "Insights"
    },
    {
      icon: Server,
      title: "IPTV Credential Management",
      description: "Auto-generate Xtream Codes credentials, manage MAG devices, M3U URLs. Everything your customers need.",
      badge: "Automated"
    },
    {
      icon: Smartphone,
      title: "Customer Self-Service",
      description: "Beautiful customer portal for account management, billing history, support tickets, and credential access.",
      badge: "24/7 Access"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up & Configure",
      description: "Create your account, choose your branding, and optionally purchase a domain—all in under 5 minutes."
    },
    {
      number: "02",
      title: "Launch Your Site",
      description: "Your customer-facing website goes live immediately with your custom domain, theme, and pricing plans."
    },
    {
      number: "03",
      title: "Start Growing",
      description: "Customers sign up, billing runs automatically, support tickets are managed—you focus on providing great service."
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime SLA" },
    { value: "<5min", label: "Setup Time" },
    { value: "$0", label: "Setup Fees" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <>
      <SEO 
        title="Launch Your IPTV Business in Minutes | Professional Platform"
        description="Complete all-in-one platform for IPTV businesses. Automated billing, customer management, domain marketplace, white-label branding. Start in under 5 minutes."
      />
      
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-base sm:text-xl font-bold">IPTV Platform</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" onClick={() => router.push("/pricing")} className="hidden sm:inline-flex">
                  Pricing
                </Button>
                <Button variant="ghost" onClick={() => router.push("/login")} className="hidden sm:inline-flex">
                  Login
                </Button>
                <Button onClick={() => router.push("/signup")} size="sm">
                  <span className="hidden sm:inline">Start Free Trial</span>
                  <span className="sm:hidden">Sign Up</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-12 sm:py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container mx-auto relative">
            <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
              <Badge variant="secondary" className="mb-2 sm:mb-4">
                🚀 Launch in Under 5 Minutes
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">
                Launch Your IPTV Business
                <span className="block text-primary mt-2">Without the Technical Headaches</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Complete all-in-one platform with automated billing, customer management, 
                domain marketplace, and white-label branding. Everything you need to run 
                a professional IPTV service.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4">
                <Button size="lg" onClick={() => router.push("/signup")} className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push("/pricing")} className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-8 sm:pt-12 border-t">
                {stats.map((stat, index) => (
                  <div key={index} className="space-y-1 sm:space-y-2">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 sm:py-24 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-8 sm:mb-16 space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
                Everything You Need, All in One Platform
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Stop juggling multiple tools. Get a complete IPTV business platform with 
                professional features that normally cost thousands per month.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-24 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8 sm:mb-16 space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
                Launch Your IPTV Business in 3 Steps
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                From signup to first customer in under 5 minutes. No technical knowledge required.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex flex-col items-start sm:items-center text-left sm:text-center space-y-3 sm:space-y-4">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl sm:text-2xl font-bold text-primary">{step.number}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-heading font-semibold">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 sm:py-24 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="border-primary/30">
                <CardContent className="pt-6 sm:pt-8">
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/20" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base sm:text-lg md:text-xl italic mb-4 sm:mb-6">
                        "This platform saved me months of development time and thousands in setup costs. 
                        I was able to launch my IPTV service in a weekend and started getting customers immediately."
                      </p>
                      <div>
                        <p className="font-semibold">Alex Martinez</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">StreamPro IPTV, Miami</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-24 px-4">
          <div className="container mx-auto">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-8 sm:pt-12 text-center">
                <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
                    Ready to Launch Your IPTV Business?
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                    Join hundreds of successful IPTV businesses using our platform. 
                    Start your 14-day free trial today—no credit card required.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4">
                    <Button size="lg" onClick={() => router.push("/signup")} className="w-full sm:w-auto">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => router.push("/pricing")} className="w-full sm:w-auto">
                      View Pricing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 py-8 sm:py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  <span className="font-bold">IPTV Platform</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The complete solution for launching and scaling IPTV businesses.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Button variant="link" className="h-auto p-0" onClick={() => router.push("/pricing")}>Pricing</Button></li>
                  <li><Button variant="link" className="h-auto p-0">Features</Button></li>
                  <li><Button variant="link" className="h-auto p-0">Documentation</Button></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Button variant="link" className="h-auto p-0">About</Button></li>
                  <li><Button variant="link" className="h-auto p-0">Blog</Button></li>
                  <li><Button variant="link" className="h-auto p-0">Contact</Button></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Button variant="link" className="h-auto p-0">Privacy Policy</Button></li>
                  <li><Button variant="link" className="h-auto p-0">Terms of Service</Button></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
              <p>© 2026 IPTV Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}