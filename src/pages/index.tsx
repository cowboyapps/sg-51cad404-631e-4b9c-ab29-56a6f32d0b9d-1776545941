import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import Link from "next/link";
import { ArrowRight, Zap, Users, DollarSign, Globe, Settings, BarChart3 } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Globe,
      title: "Beautiful Websites",
      description: "Launch professional IPTV websites in minutes with our drag-and-drop builder",
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Manage subscribers, track activity, and provide exceptional support",
    },
    {
      icon: DollarSign,
      title: "Automated Billing",
      description: "Complete billing system with invoicing, subscriptions, and payment processing",
    },
    {
      icon: Settings,
      title: "Full Configuration",
      description: "Customize plans, pricing, branding, and business settings to match your brand",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track revenue, subscriber growth, and business performance in real-time",
    },
    {
      icon: Zap,
      title: "All-in-One Platform",
      description: "Everything you need to run your IPTV business from a single dashboard",
    },
  ];

  return (
    <>
      <SEO 
        title="IPTV Business Platform - Launch Your IPTV Service in Minutes"
        description="Complete platform for IPTV businesses with website builder, customer management, and automated billing system. Start your IPTV business today."
      />
      
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="text-xl font-bold font-heading">IPTV Platform</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-medium hover:text-accent">
                Login
              </Link>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 lg:py-28">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center space-y-8">
              <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl lg:text-6xl">
                Launch Your IPTV Business
                <span className="block text-accent mt-2">In Minutes, Not Months</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete platform with website builder, customer management, and automated billing. 
                Everything IPTV business owners need to launch and scale their service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-base">
                  <Link href="/signup">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-heading mb-4">Everything You Need</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A complete IPTV business platform designed for service providers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold font-heading mb-4">Ready to Launch Your IPTV Business?</h2>
                <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                  Join IPTV providers using our platform to manage their business and serve customers better
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary" />
                <span className="font-semibold font-heading">IPTV Platform</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2026 IPTV Platform. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}