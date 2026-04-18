import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { domainService } from "@/services/domainService";
import { 
  Settings, 
  Globe, 
  ArrowLeft, 
  Save, 
  ExternalLink, 
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Palette,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

interface DomainSearchResult {
  domain: string;
  available: boolean;
  price: number;
}

export default function BusinessSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    custom_domain: "",
    email_domain: "",
  });

  // Email branding state
  const [emailBranding, setEmailBranding] = useState({
    from_name: "",
    reply_to: "",
    footer_text: "",
    logo_url: "",
  });

  // SEO settings state
  const [seoSettings, setSeoSettings] = useState({
    title: "",
    description: "",
    keywords: "",
    og_image: "",
    favicon: "",
  });

  // Site theme state
  const [siteTheme, setSiteTheme] = useState({
    primary_color: "#06B6D4",
    accent_color: "#0EA5E9",
    background_color: "#0A0A0B",
    card_color: "#131316",
    heading_font: "Plus Jakarta Sans",
    body_font: "Work Sans",
    layout_style: "modern",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Domain marketplace state
  const [domainSearch, setDomainSearch] = useState("");
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", session.user.id)
        .single();

      if (!profile?.business_id) {
        setError("No business found");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", profile.business_id)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setBusiness(data);
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          custom_domain: data.custom_domain || "",
          email_domain: data.email_domain || "",
        });

        // Load email branding
        const branding = (data.email_branding as any) || {};
        setEmailBranding({
          from_name: branding.from_name || "",
          reply_to: branding.reply_to || "",
          footer_text: branding.footer_text || "",
          logo_url: branding.logo_url || "",
        });

        // Load SEO settings
        const seo = (data.seo_settings as any) || {};
        setSeoSettings({
          title: seo.title || "",
          description: seo.description || "",
          keywords: seo.keywords || "",
          og_image: seo.og_image || "",
          favicon: seo.favicon || "",
        });

        // Load site theme
        const theme = (data.site_theme as any) || {};
        setSiteTheme({
          primary_color: theme.primary_color || "#06B6D4",
          accent_color: theme.accent_color || "#0EA5E9",
          background_color: theme.background_color || "#0A0A0B",
          card_color: theme.card_color || "#131316",
          heading_font: theme.heading_font || "Plus Jakarta Sans",
          body_font: theme.body_font || "Work Sans",
          layout_style: theme.layout_style || "modern",
        });
      }
    } catch (error) {
      console.error("Error loading business:", error);
      setError("Failed to load business settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!business) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          custom_domain: formData.custom_domain || null,
          email_domain: formData.email_domain || null,
          email_branding: emailBranding,
          seo_settings: seoSettings,
          site_theme: siteTheme,
          updated_at: new Date().toISOString(),
        })
        .eq("id", business.id);

      if (updateError) throw updateError;

      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      loadBusiness(); // Reload to get updated data
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDomainSearch = async () => {
    if (!domainSearch.trim()) return;

    setSearching(true);
    setSearchResults([]);

    try {
      const results = await domainService.searchDomain(domainSearch);
      setSearchResults(results);
    } catch (error) {
      console.error("Domain search error:", error);
      setError("Failed to search domains");
    } finally {
      setSearching(false);
    }
  };

  const handleDomainPurchase = async (domain: string, price: number) => {
    if (!business) return;

    setPurchasing(true);
    setError("");
    setSuccess("");

    try {
      await domainService.purchaseDomain(business.id, domain, price);
      setSuccess(`Domain ${domain} purchased successfully! DNS configured automatically.`);
      setTimeout(() => setSuccess(""), 5000);
      loadBusiness(); // Reload to show new domain
      setSearchResults([]);
      setDomainSearch("");
    } catch (error) {
      console.error("Domain purchase error:", error);
      setError("Failed to purchase domain. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const toggleAutoRenew = async () => {
    if (!business?.domain_managed_by_platform) return;

    try {
      const newValue = !business.domain_auto_renew;
      await domainService.updateAutoRenew(business.id, newValue);
      setSuccess(`Auto-renewal ${newValue ? "enabled" : "disabled"}`);
      setTimeout(() => setSuccess(""), 3000);
      loadBusiness();
    } catch (error) {
      console.error("Error toggling auto-renew:", error);
      setError("Failed to update auto-renewal setting");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Business not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fontOptions = [
    "Plus Jakarta Sans",
    "Work Sans",
    "Inter",
    "Poppins",
    "Roboto",
    "Montserrat",
    "Open Sans",
    "Lato",
    "Raleway",
    "Nunito"
  ];

  const layoutOptions = [
    { value: "modern", label: "Modern (Card-based)" },
    { value: "classic", label: "Classic (Traditional)" },
    { value: "minimal", label: "Minimal (Clean)" },
  ];

  return (
    <>
      <SEO 
        title={`Settings - ${business.name}`}
        description="Configure your IPTV business settings"
      />
      
      <div className="min-h-screen bg-background">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/business")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
                  <Settings className="h-8 w-8" />
                  Business Settings
                </h1>
                <p className="text-muted-foreground mt-1">Manage your IPTV business configuration</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-accent/10 border border-accent text-accent px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="branding">Email Branding</TabsTrigger>
              <TabsTrigger value="seo">SEO Settings</TabsTrigger>
              <TabsTrigger value="theme">Site Theme</TabsTrigger>
              <TabsTrigger value="domain">Domain & Email</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your business name and description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Business Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your IPTV Business Name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                      placeholder="your-business"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your site will be accessible at: /sites/{formData.slug}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="A brief description of your IPTV service"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Branding Tab */}
            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Branding
                  </CardTitle>
                  <CardDescription>Customize how your automated emails appear to customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="from_name">Sender Name</Label>
                    <Input
                      id="from_name"
                      value={emailBranding.from_name}
                      onChange={(e) => setEmailBranding({ ...emailBranding, from_name: e.target.value })}
                      placeholder="StreamTV Support"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This name will appear in the "From" field of all automated emails
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="reply_to">Reply-To Email</Label>
                    <Input
                      id="reply_to"
                      type="email"
                      value={emailBranding.reply_to}
                      onChange={(e) => setEmailBranding({ ...emailBranding, reply_to: e.target.value })}
                      placeholder="support@yourdomain.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Customer replies will go to this email address
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="logo_url">Email Header Logo URL</Label>
                    <Input
                      id="logo_url"
                      type="url"
                      value={emailBranding.logo_url}
                      onChange={(e) => setEmailBranding({ ...emailBranding, logo_url: e.target.value })}
                      placeholder="https://yourdomain.com/logo.png"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Logo displayed at the top of email templates (recommended: 200x60px)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="footer_text">Email Footer Text</Label>
                    <Textarea
                      id="footer_text"
                      value={emailBranding.footer_text}
                      onChange={(e) => setEmailBranding({ ...emailBranding, footer_text: e.target.value })}
                      placeholder="© 2024 Your IPTV Business. All rights reserved."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Appears at the bottom of all email templates
                    </p>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">Email Preview</h4>
                    <div className="bg-background p-4 rounded border text-sm">
                      <div className="flex items-center gap-2 mb-3">
                        {emailBranding.logo_url && (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                        <p className="text-xs text-muted-foreground">
                          From: {emailBranding.from_name || "Your Business Name"}
                        </p>
                      </div>
                      <p className="text-muted-foreground mb-2">[Email content will appear here]</p>
                      <hr className="my-3 border-border" />
                      <p className="text-xs text-muted-foreground">
                        {emailBranding.footer_text || "© 2024 Your Business. All rights reserved."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Settings Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    SEO Configuration
                  </CardTitle>
                  <CardDescription>Optimize your public site for search engines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seo_title">Meta Title</Label>
                    <Input
                      id="seo_title"
                      value={seoSettings.title}
                      onChange={(e) => setSeoSettings({ ...seoSettings, title: e.target.value })}
                      placeholder="Premium IPTV Service - Stream Your Favorite Content"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {seoSettings.title.length}/60 characters • Appears in search results
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="seo_description">Meta Description</Label>
                    <Textarea
                      id="seo_description"
                      value={seoSettings.description}
                      onChange={(e) => setSeoSettings({ ...seoSettings, description: e.target.value })}
                      placeholder="Experience premium IPTV streaming with thousands of channels, VOD library, and crystal-clear quality."
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {seoSettings.description.length}/160 characters • Appears in search snippets
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      value={seoSettings.keywords}
                      onChange={(e) => setSeoSettings({ ...seoSettings, keywords: e.target.value })}
                      placeholder="iptv, streaming, live tv, vod, sports streaming"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Helps search engines understand your content
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="og_image">Open Graph Image URL</Label>
                    <Input
                      id="og_image"
                      type="url"
                      value={seoSettings.og_image}
                      onChange={(e) => setSeoSettings({ ...seoSettings, og_image: e.target.value })}
                      placeholder="https://yourdomain.com/og-image.png"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Image shown when your site is shared on social media (1200x630px recommended)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <Input
                      id="favicon"
                      type="url"
                      value={seoSettings.favicon}
                      onChange={(e) => setSeoSettings({ ...seoSettings, favicon: e.target.value })}
                      placeholder="https://yourdomain.com/favicon.ico"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Browser tab icon (32x32px recommended)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Site Theme Tab */}
            <TabsContent value="theme" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Site Theme Customization
                  </CardTitle>
                  <CardDescription>Customize the look and feel of your customer-facing site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Color Scheme</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary_color">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primary_color"
                            type="color"
                            value={siteTheme.primary_color}
                            onChange={(e) => setSiteTheme({ ...siteTheme, primary_color: e.target.value })}
                            className="w-20 h-10"
                          />
                          <Input
                            value={siteTheme.primary_color}
                            onChange={(e) => setSiteTheme({ ...siteTheme, primary_color: e.target.value })}
                            placeholder="#06B6D4"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Main brand color for CTAs and highlights</p>
                      </div>

                      <div>
                        <Label htmlFor="accent_color">Accent Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="accent_color"
                            type="color"
                            value={siteTheme.accent_color}
                            onChange={(e) => setSiteTheme({ ...siteTheme, accent_color: e.target.value })}
                            className="w-20 h-10"
                          />
                          <Input
                            value={siteTheme.accent_color}
                            onChange={(e) => setSiteTheme({ ...siteTheme, accent_color: e.target.value })}
                            placeholder="#0EA5E9"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Secondary color for interactive elements</p>
                      </div>

                      <div>
                        <Label htmlFor="background_color">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="background_color"
                            type="color"
                            value={siteTheme.background_color}
                            onChange={(e) => setSiteTheme({ ...siteTheme, background_color: e.target.value })}
                            className="w-20 h-10"
                          />
                          <Input
                            value={siteTheme.background_color}
                            onChange={(e) => setSiteTheme({ ...siteTheme, background_color: e.target.value })}
                            placeholder="#0A0A0B"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Main page background</p>
                      </div>

                      <div>
                        <Label htmlFor="card_color">Card Background</Label>
                        <div className="flex gap-2">
                          <Input
                            id="card_color"
                            type="color"
                            value={siteTheme.card_color}
                            onChange={(e) => setSiteTheme({ ...siteTheme, card_color: e.target.value })}
                            className="w-20 h-10"
                          />
                          <Input
                            value={siteTheme.card_color}
                            onChange={(e) => setSiteTheme({ ...siteTheme, card_color: e.target.value })}
                            placeholder="#131316"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Cards and elevated surfaces</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Typography</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="heading_font">Heading Font</Label>
                        <select
                          id="heading_font"
                          value={siteTheme.heading_font}
                          onChange={(e) => setSiteTheme({ ...siteTheme, heading_font: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                          {fontOptions.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">Font for titles and headers</p>
                      </div>

                      <div>
                        <Label htmlFor="body_font">Body Font</Label>
                        <select
                          id="body_font"
                          value={siteTheme.body_font}
                          onChange={(e) => setSiteTheme({ ...siteTheme, body_font: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                          {fontOptions.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">Font for body text and paragraphs</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Layout Style</Label>
                    <div className="grid md:grid-cols-3 gap-3 mt-2">
                      {layoutOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSiteTheme({ ...siteTheme, layout_style: option.value })}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            siteTheme.layout_style === option.value
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          <p className="font-medium">{option.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Theme Preview</h4>
                    <div 
                      className="p-6 rounded-lg border"
                      style={{ 
                        backgroundColor: siteTheme.background_color,
                        color: "#FFFFFF"
                      }}
                    >
                      <div 
                        className="p-4 rounded-lg mb-4"
                        style={{ backgroundColor: siteTheme.card_color }}
                      >
                        <h3 
                          className="text-xl font-bold mb-2"
                          style={{ 
                            fontFamily: siteTheme.heading_font,
                            color: siteTheme.primary_color 
                          }}
                        >
                          Sample Heading
                        </h3>
                        <p style={{ fontFamily: siteTheme.body_font }}>
                          This is how your body text will appear on your customer-facing site.
                        </p>
                      </div>
                      <button
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{ 
                          backgroundColor: siteTheme.accent_color,
                          color: "#FFFFFF"
                        }}
                      >
                        Sample Button
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Domain & Email Tab */}
            <TabsContent value="domain" className="space-y-6">
              {/* Custom Email Domain */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Custom Email Domain
                      </CardTitle>
                      <CardDescription>Send automated emails from your own domain</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email_domain">Email Sending Domain</Label>
                    <Input
                      id="email_domain"
                      value={formData.email_domain}
                      onChange={(e) => setFormData({ ...formData, email_domain: e.target.value.toLowerCase() })}
                      placeholder="mg.yourdomain.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We recommend using a subdomain like 'mg' or 'mail' for better deliverability.
                    </p>
                  </div>

                  {formData.email_domain && (
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">DNS Configuration Required:</p>
                          <Badge variant={business?.email_domain_verified ? "default" : "outline"}>
                            {business?.email_domain_verified ? "Verified" : "Pending Verification"}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-xs font-mono bg-background p-3 rounded border">
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground w-16">Type:</span>
                            <span>TXT</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground w-16">Name:</span>
                            <span>{formData.email_domain}</span>
                          </div>
                          <div className="flex items-start gap-2 break-all">
                            <span className="text-muted-foreground w-16">Value:</span>
                            <span>v=spf1 include:mailgun.org ~all</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs font-mono bg-background p-3 rounded border mt-2">
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground w-16">Type:</span>
                            <span>TXT</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground w-16">Name:</span>
                            <span>mx._domainkey.{formData.email_domain}</span>
                          </div>
                          <div className="flex items-start gap-2 break-all">
                            <span className="text-muted-foreground w-16">Value:</span>
                            <span>k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add these TXT records to your DNS provider to authorize us to send emails on your behalf.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Domain Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Custom Domain Configuration
                  </CardTitle>
                  <CardDescription>
                    Buy a domain through our marketplace or use your existing domain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={business.domain_managed_by_platform ? "managed" : "manual"}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="marketplace">Buy New Domain</TabsTrigger>
                      <TabsTrigger value="manual">Use Existing Domain</TabsTrigger>
                    </TabsList>

                    {/* Domain Marketplace Tab */}
                    <TabsContent value="marketplace" className="space-y-4">
                      <div className="bg-accent/5 border border-accent/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">✨ Instant Setup - No Configuration Required</h4>
                        <p className="text-sm text-muted-foreground">
                          Purchasing through our marketplace automatically configures DNS and email settings. Your site will be live within minutes!
                        </p>
                      </div>

                      {business.domain_managed_by_platform && business.custom_domain ? (
                        <div className="space-y-4">
                          <div className="bg-muted/50 p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-medium">{business.custom_domain}</p>
                                <p className="text-sm text-muted-foreground">Managed by Platform</p>
                              </div>
                              <Badge>Active</Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Expires</p>
                                <p className="font-medium">
                                  {business.domain_registration_expires 
                                    ? new Date(business.domain_registration_expires).toLocaleDateString()
                                    : "N/A"
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Auto-Renewal</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={business.domain_auto_renew ? "default" : "outline"}>
                                    {business.domain_auto_renew ? "Enabled" : "Disabled"}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleAutoRenew}
                                  >
                                    Toggle
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {business.email_domain && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Email Domain</p>
                                    <p className="font-medium">{business.email_domain}</p>
                                  </div>
                                  <Badge variant="default">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" asChild>
                              <a href={`https://${business.custom_domain}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Visit Site
                              </a>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Search for a domain (e.g., myiptv)"
                              value={domainSearch}
                              onChange={(e) => setDomainSearch(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && handleDomainSearch()}
                            />
                            <Button onClick={handleDomainSearch} disabled={searching || !domainSearch.trim()}>
                              {searching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {searchResults.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Available Domains:</p>
                              {searchResults.map((result) => (
                                <div
                                  key={result.domain}
                                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                >
                                  <div className="flex items-center gap-2">
                                    {result.available ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-destructive" />
                                    )}
                                    <span className="font-medium">{result.domain}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold">${result.price}/year</span>
                                    {result.available && (
                                      <Button
                                        onClick={() => handleDomainPurchase(result.domain, result.price)}
                                        disabled={purchasing}
                                      >
                                        {purchasing ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          "Purchase"
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                            <h4 className="font-medium">What's Included:</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                                <span>Automatic DNS configuration for your site</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                                <span>Email domain setup with SPF/DKIM verification</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                                <span>Auto-renewal to prevent service interruption</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                                <span>Free SSL certificate included</span>
                              </li>
                            </ul>
                            <p className="text-xs text-muted-foreground mt-3">
                              <strong>Pricing:</strong> {domainService.getPricing().retail}/year • 
                              Wholesale cost: {domainService.getPricing().wholesale}/year
                            </p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Manual Domain Tab */}
                    <TabsContent value="manual" className="space-y-4">
                      <div>
                        <Label htmlFor="custom_domain">Your Domain</Label>
                        <Input
                          id="custom_domain"
                          value={formData.custom_domain}
                          onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value.toLowerCase() })}
                          placeholder="streaming.yourdomain.com"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use a subdomain for your IPTV service (e.g., streaming.yourdomain.com)
                        </p>
                      </div>

                      {formData.custom_domain && (
                        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                          <p className="text-sm font-medium">DNS Configuration Required:</p>
                          <div className="space-y-2 text-xs font-mono bg-background p-3 rounded border">
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground w-16">Type:</span>
                              <span>CNAME</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground w-16">Name:</span>
                              <span>{formData.custom_domain}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground w-16">Value:</span>
                              <span>your-platform-domain.com</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Add this CNAME record to your DNS provider to point your domain to our platform.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/business")}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save All Settings
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}