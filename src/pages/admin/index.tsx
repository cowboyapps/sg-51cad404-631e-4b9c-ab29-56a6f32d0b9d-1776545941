import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { authService } from "@/services/authService";
import type { Database } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, DollarSign, Users, TrendingUp, LogOut,
  ArrowLeft, Eye, Trash2, Edit, Plus, Save, X,
  CheckCircle, XCircle, DollarSign as PricingIcon
} from "lucide-react";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    trial: 0,
    suspended: 0,
  });
  const [pricingTiers, setPricingTiers] = useState<any[]>([]);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [showPricingForm, setShowPricingForm] = useState(false);

  useEffect(() => {
    checkAuth();
    loadData();
    loadPricingTiers();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
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

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const businessList = data || [];
      setBusinesses(businessList);

      const counts = {
        total: businessList.length,
        active: businessList.filter(b => b.status === "active").length,
        trial: businessList.filter(b => b.status === "trial").length,
        suspended: businessList.filter(b => b.status === "suspended").length,
      };
      setMetrics(counts);
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPricingTiers = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_pricing")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      setPricingTiers(data || []);
    } catch (error) {
      console.error("Error loading pricing tiers:", error);
    }
  };

  const savePricingTier = async () => {
    if (!editingTier) return;

    try {
      const tierData = {
        tier_name: editingTier.tier_name,
        display_name: editingTier.display_name,
        description: editingTier.description,
        monthly_price: parseFloat(editingTier.monthly_price),
        yearly_price: parseFloat(editingTier.yearly_price),
        features: editingTier.features,
        is_active: editingTier.is_active ?? true,
        sort_order: editingTier.sort_order ?? 0,
        updated_at: new Date().toISOString(),
      };

      if (editingTier.id) {
        const { error } = await supabase
          .from("platform_pricing")
          .update(tierData)
          .eq("id", editingTier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("platform_pricing")
          .insert([tierData]);
        if (error) throw error;
      }

      await loadPricingTiers();
      setEditingTier(null);
      setShowPricingForm(false);
    } catch (error) {
      console.error("Error saving pricing tier:", error);
      alert("Failed to save pricing tier");
    }
  };

  const deletePricingTier = async (id: string) => {
    if (!confirm("Delete this pricing tier?")) return;

    try {
      const { error } = await supabase
        .from("platform_pricing")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadPricingTiers();
    } catch (error) {
      console.error("Error deleting tier:", error);
      alert("Failed to delete pricing tier");
    }
  };

  const toggleTierActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("platform_pricing")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      await loadPricingTiers();
    } catch (error) {
      console.error("Error toggling tier status:", error);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
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
      <SEO 
        title="Master Admin - IPTV Business Platform"
        description="Manage all IPTV businesses and platform operations"
      />
      
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary" />
              <div>
                <h1 className="text-lg font-heading font-semibold">Master Admin</h1>
                <p className="text-sm text-muted-foreground">Platform Management</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Businesses"
              value={metrics.total}
              icon={Building2}
              trend={{ value: 12, label: "vs last month" }}
            />
            <MetricCard
              title="Active"
              value={metrics.active}
              icon={TrendingUp}
              className="text-green-600"
            />
            <MetricCard
              title="Trial"
              value={metrics.trial}
              icon={Users}
              className="text-blue-600"
            />
            <MetricCard
              title="Suspended"
              value={metrics.suspended}
              icon={DollarSign}
              className="text-amber-600"
            />
          </div>

          {/* Pricing Management Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PricingIcon className="h-5 w-5" />
                    Platform Pricing Tiers
                  </CardTitle>
                  <CardDescription>Manage subscription plans for IPTV businesses</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingTier({
                    tier_name: "",
                    display_name: "",
                    description: "",
                    monthly_price: "0",
                    yearly_price: "0",
                    features: [],
                    is_active: true,
                    sort_order: pricingTiers.length + 1
                  });
                  setShowPricingForm(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showPricingForm && editingTier ? (
                <Card className="mb-6 border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingTier.id ? "Edit" : "Create"} Pricing Tier
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Tier Name (ID)</label>
                        <Input
                          value={editingTier.tier_name}
                          onChange={(e) => setEditingTier({...editingTier, tier_name: e.target.value})}
                          placeholder="starter"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Display Name</label>
                        <Input
                          value={editingTier.display_name}
                          onChange={(e) => setEditingTier({...editingTier, display_name: e.target.value})}
                          placeholder="Starter"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        value={editingTier.description}
                        onChange={(e) => setEditingTier({...editingTier, description: e.target.value})}
                        placeholder="Perfect for getting started"
                        rows={2}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Monthly Price ($)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingTier.monthly_price}
                          onChange={(e) => setEditingTier({...editingTier, monthly_price: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Yearly Price ($)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingTier.yearly_price}
                          onChange={(e) => setEditingTier({...editingTier, yearly_price: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Sort Order</label>
                        <Input
                          type="number"
                          value={editingTier.sort_order}
                          onChange={(e) => setEditingTier({...editingTier, sort_order: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Features (one per line)
                      </label>
                      <Textarea
                        value={Array.isArray(editingTier.features) ? editingTier.features.join("\n") : ""}
                        onChange={(e) => setEditingTier({
                          ...editingTier, 
                          features: e.target.value.split("\n").filter(f => f.trim())
                        })}
                        placeholder="Up to 100 customers&#10;Custom domain support&#10;Email branding"
                        rows={5}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button variant="outline" onClick={() => {
                        setEditingTier(null);
                        setShowPricingForm(false);
                      }}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={savePricingTier}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Tier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <div className="space-y-4">
                {pricingTiers.map((tier) => (
                  <Card key={tier.id} className={!tier.is_active ? "opacity-60" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{tier.display_name}</h3>
                            <Badge variant={tier.is_active ? "default" : "secondary"}>
                              {tier.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{tier.description}</p>
                          
                          <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Pricing</p>
                              <div className="text-2xl font-bold">
                                ${Number(tier.monthly_price).toFixed(2)}/mo
                                <span className="text-base font-normal text-muted-foreground ml-2">
                                  or ${Number(tier.yearly_price).toFixed(2)}/yr
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Features</p>
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(tier.features) && tier.features.slice(0, 3).map((feature: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                                {Array.isArray(tier.features) && tier.features.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{tier.features.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTierActive(tier.id, tier.is_active)}
                          >
                            {tier.is_active ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTier(tier);
                              setShowPricingForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePricingTier(tier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Businesses Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>IPTV Businesses</CardTitle>
                  <CardDescription>Manage all registered businesses</CardDescription>
                </div>
                <Button onClick={() => router.push("/admin/businesses/new")}>
                  Add Business
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Business</th>
                      <th className="pb-3 font-medium">Slug</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {businesses.map((business) => (
                      <tr key={business.id} className="hover:bg-muted/50">
                        <td className="py-4">
                          <div className="font-medium">{business.name}</div>
                        </td>
                        <td className="py-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            /{business.slug}
                          </code>
                        </td>
                        <td className="py-4">
                          <StatusBadge status={business.status} type="business" />
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {new Date(business.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/businesses/${business.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {businesses.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No businesses yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}