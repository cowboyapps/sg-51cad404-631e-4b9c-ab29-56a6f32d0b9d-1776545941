import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { domainService } from "@/services/domainService";
import { Settings, Globe, ArrowLeft, Save, ExternalLink, Mail, Search, ShoppingCart, CheckCircle, XCircle, Loader2, Calendar, CreditCard } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

interface DomainSearchResult {
  domain: string;
  available: boolean;
  price: number;
  premium: boolean;
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
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Domain marketplace state
  const [domainSearch, setDomainSearch] = useState("");
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/login");
      return;
    }
    loadBusiness();
  };

  const loadBusiness = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", (await authService.getCurrentSession())?.user.id)
        .single();

      if (!profile?.business_id) {
        setError("No business found");
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
      }
    } catch (err) {
      setError("Failed to load business");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDomain = async () => {
    if (!domainSearch.trim()) return;
    
    setSearching(true);
    setError("");
    try {
      const results = await domainService.searchDomain(domainSearch);
      setSearchResults(results);
    } catch (err) {
      setError("Failed to search domains");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handlePurchaseDomain = async (domain: string) => {
    if (!business) return;

    setSelectedDomain(domain);
    setPurchasing(true);
    setError("");
    setSuccess("");

    try {
      // In production, this would integrate with Stripe for payment
      const result = await domainService.purchaseDomain(business.id, domain, {
        firstName: "Business",
        lastName: "Owner",
        email: (await authService.getCurrentSession())?.user.email || "",
        phone: "+1-555-0100",
        address: "123 Business St",
        city: "City",
        state: "ST",
        zip: "12345",
        country: "US",
      });

      if (result.success) {
        setSuccess(`Domain ${domain} purchased successfully! DNS configured automatically.`);
        await loadBusiness(); // Refresh business data
        setSearchResults([]);
        setDomainSearch("");
      } else {
        setError(result.error || "Purchase failed");
      }
    } catch (err) {
      setError("Failed to purchase domain");
      console.error(err);
    } finally {
      setPurchasing(false);
      setSelectedDomain("");
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", business.id);

      if (updateError) throw updateError;

      setSuccess("Settings saved successfully!");
      await loadBusiness();
    } catch (err) {
      setError("Failed to save settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!business) return;
    
    const newValue = !business.domain_auto_renew;
    await domainService.setAutoRenew(business.id, newValue);
    await loadBusiness();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const daysUntilExpiration = (dateString: string | null) => {
    if (!dateString) return null;
    const expiration = new Date(dateString);
    const today = new Date();
    const diff = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load business</p>
          <Button className="mt-4" onClick={() => router.push("/business")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={`${business.name} - Settings`} />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/business")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-accent" />
                <h1 className="text-xl font-heading font-semibold">Business Settings</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg">
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your business details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Business Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My IPTV Service"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">URL Slug</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    placeholder="my-iptv-service"
                  />
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your public signup page: {window.location.origin}/sites/{formData.slug}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief description of your IPTV service"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Domain Management */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Domain & Email Configuration
                  </CardTitle>
                  <CardDescription>Use your own domain or purchase one through our platform</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={business.domain_managed_by_platform ? "managed" : "manual"}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy">Buy New Domain</TabsTrigger>
                  <TabsTrigger value="manual">Use Existing Domain</TabsTrigger>
                </TabsList>

                {/* Buy Domain Tab */}
                <TabsContent value="buy" className="space-y-4">
                  {business.domain_managed_by_platform && business.custom_domain ? (
                    <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-5 w-5 text-accent" />
                            <p className="font-heading font-semibold text-lg">{business.custom_domain}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">Platform-managed domain</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Expires</p>
                            <p className="text-sm text-muted-foreground">{formatDate(business.domain_registration_expires)}</p>
                            {daysUntilExpiration(business.domain_registration_expires) !== null && (
                              <p className="text-xs text-accent mt-1">
                                {daysUntilExpiration(business.domain_registration_expires)! > 0
                                  ? `${daysUntilExpiration(business.domain_registration_expires)} days remaining`
                                  : "Expired"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Auto-Renewal</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={business.domain_auto_renew ? "default" : "outline"}>
                                {business.domain_auto_renew ? "Enabled" : "Disabled"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleToggleAutoRenew}
                              >
                                Toggle
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-background p-4 rounded border mt-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Mail className="h-4 w-4 text-accent mt-0.5" />
                          <p className="text-sm font-medium">Email Domain: {business.email_domain}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <p className="text-xs text-muted-foreground">DNS automatically configured and verified</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-accent/5 border border-accent/20 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="bg-accent/10 p-2 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium mb-1">Purchase & Auto-Configure</p>
                            <p className="text-sm text-muted-foreground">
                              Domains purchased through our platform are automatically configured with DNS records. 
                              Your site will be live within minutes with zero manual setup required.
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Instant DNS setup</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Email verified</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Auto-renewal</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            value={domainSearch}
                            onChange={(e) => setDomainSearch(e.target.value)}
                            placeholder="Search for a domain (e.g., myiptv)"
                            onKeyDown={(e) => e.key === "Enter" && handleSearchDomain()}
                          />
                        </div>
                        <Button onClick={handleSearchDomain} disabled={searching || !domainSearch.trim()}>
                          {searching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {searchResults.length > 0 && (
                        <div className="space-y-2">
                          {searchResults.map((result) => (
                            <div
                              key={result.domain}
                              className="flex items-center justify-between p-4 bg-card border rounded-lg hover:border-accent/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {result.available ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div>
                                  <p className="font-medium">{result.domain}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {result.available ? "Available" : "Taken"}
                                  </p>
                                </div>
                              </div>
                              {result.available && (
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-heading font-bold text-lg">${result.price}</p>
                                    <p className="text-xs text-muted-foreground">/year</p>
                                  </div>
                                  <Button
                                    onClick={() => handlePurchaseDomain(result.domain)}
                                    disabled={purchasing}
                                  >
                                    {purchasing && selectedDomain === result.domain ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Purchase"
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                {/* Manual Domain Tab */}
                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Custom Domain</label>
                    <Input
                      value={formData.custom_domain}
                      onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value.toLowerCase() })}
                      placeholder="streaming.example.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use your own domain for your customer-facing website
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
                          <span>@</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground w-16">Value:</span>
                          <span>cname.vercel-dns.com</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Sending Domain</label>
                    <Input
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
                          <p className="text-sm font-medium">Email DNS Configuration:</p>
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
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}