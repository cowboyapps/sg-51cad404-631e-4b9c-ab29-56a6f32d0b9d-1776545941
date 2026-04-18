import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Save, Ban, CheckCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { businessService } from "@/services/businessService";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

export default function BusinessDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "trial" as Database["public"]["Enums"]["business_status"],
  });

  useEffect(() => {
    if (id) {
      checkAuth();
      loadBusiness();
    }
  }, [id]);

  const checkAuth = async () => {
    const session = await authService.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "master_admin") {
      router.push("/");
    }
  };

  const loadBusiness = async () => {
    try {
      const data = await businessService.getBusinessById(id as string);
      if (data) {
        setBusiness(data);
        setFormData({
          name: data.name,
          slug: data.slug,
          status: data.status,
        });
      }
    } catch (error) {
      console.error("Error loading business:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);

    try {
      await businessService.updateBusiness(business.id, {
        name: formData.name,
        slug: formData.slug,
        status: formData.status,
      });

      await loadBusiness();
      alert("Business updated successfully");
    } catch (error) {
      console.error("Error updating business:", error);
      alert("Failed to update business");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: Database["public"]["Enums"]["business_status"]) => {
    if (!business) return;
    setSaving(true);

    try {
      await businessService.updateBusinessStatus(business.id, newStatus);
      await loadBusiness();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
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

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Business not found</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${business.name} - Admin`}
        description="Manage IPTV business details"
      />
      
      <div className="min-h-screen bg-muted/30">
        <header className="bg-card border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-semibold">{business.name}</h1>
                <p className="text-sm text-muted-foreground">Business ID: {business.id}</p>
              </div>
              <StatusBadge status={business.status} type="business" />
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Update business information and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  pattern="[a-z0-9-]+"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <StatusBadge status={formData.status} type="business" />
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage business status and operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => handleStatusChange("active")}
                disabled={business.status === "active" || saving}
                className="w-full justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Activate Business
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange("suspended")}
                disabled={business.status === "suspended" || saving}
                className="w-full justify-start"
              >
                <Ban className="h-4 w-4 mr-2 text-amber-600" />
                Suspend Business
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(business.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(business.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}