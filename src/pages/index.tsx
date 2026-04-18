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
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">IPTV Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/pricing")}>
                Pricing
              </Button>
              <Button variant="ghost" onClick={() => router.push("/login")}>
                Sign In
              </Button>
              <Button onClick={() => router.push("/signup")}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container mx-auto relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge variant="outline" className="text-sm px-4 py-1.5">
                <Zap className="h-3 w-3 mr-1.5 inline" />
                Launch in Under 5 Minutes
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                The Complete Platform for
                <span className="text-primary"> IPTV Businesses</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to launch and scale a professional IPTV service. 
                Automated billing, customer management, domain marketplace, and white-label branding—all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" onClick={() => router.push("/signup")} className="text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push("/pricing")} className="text-lg px-8">
                  View Pricing
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-3xl mx-auto">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline">Complete Solution</Badge>
              <h2 className="text-4xl font-bold">Everything You Need, Nothing You Don't</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built specifically for IPTV businesses. No generic features, no bloat—just what you actually need.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="text-xs">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline">Simple Process</Badge>
              <h2 className="text-4xl font-bold">Launch in Three Steps</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From zero to fully operational IPTV business in under 5 minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-4" />
                  )}
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary text-2xl font-bold border-2 border-primary/20">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="border-primary/20">
                <CardContent className="p-12 text-center space-y-6">
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="text-primary text-3xl">★</div>
                    ))}
                  </div>
                  <blockquote className="text-2xl font-medium leading-relaxed">
                    "This platform saved me weeks of development time. I went from idea to live IPTV business in literally 3 minutes. 
                    The domain marketplace and auto-DNS setup is genius—no technical headaches."
                  </blockquote>
                  <div className="pt-4">
                    <div className="font-semibold text-lg">Michael Rodriguez</div>
                    <div className="text-muted-foreground">Founder, StreamPro IPTV</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-16 text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">
                    Ready to Launch Your IPTV Business?
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Join hundreds of IPTV providers using our platform. Start your free trial today—no credit card required.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button size="lg" onClick={() => router.push("/signup")} className="text-lg px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => router.push("/pricing")} className="text-lg px-8">
                    View Pricing
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 py-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
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
            
            <div className="pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
              <p>© 2026 IPTV Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}