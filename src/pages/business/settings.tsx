import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Globe, ArrowLeft, Save, ExternalLink, Mail } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

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

    await loadBusiness(profile.business_id);
  };

  const loadBusiness = async (businessId: string) => {
    try {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

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
    } catch (error) {
      console.error("Error loading business:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setSaving(true);
    setSuccess("");
    setError("");

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
      await loadBusiness(business.id);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Business Settings" description="Configure your IPTV business settings" />

      <div className="min-h-screen bg-muted/30">
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-accent" />
              <h1 className="text-lg font-heading font-semibold">Business Settings</h1>
            </div>
            <Button variant="outline" onClick={() => router.push("/business")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your business name and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {success && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Business Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My IPTV Service"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">URL Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    placeholder="my-iptv-service"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your public site: /sites/{formData.slug}
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

            {/* Custom Domain */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Custom Domain
                    </CardTitle>
                    <CardDescription>Use your own domain for customer sign-ups</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Domain Name</label>
                  <Input
                    value={formData.custom_domain}
                    onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value.toLowerCase() })}
                    placeholder="streaming.yourdomain.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to use the default /sites/{formData.slug} URL
                  </p>
                </div>

                {formData.custom_domain && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">DNS Configuration Required:</p>
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
                          <span>cname.vercel-dns.com</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add this CNAME record to your DNS provider. Changes may take up to 48 hours to propagate.
                    </p>
                  </div>
                )}

                {business?.custom_domain && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://${business.custom_domain}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Custom Domain
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}