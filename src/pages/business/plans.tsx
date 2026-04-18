import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Edit2, Trash2, Check } from "lucide-react";
import { authService } from "@/services/authService";
import { planService } from "@/services/planService";
import type { Database } from "@/integrations/supabase/types";

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];

export default function PlansPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    billing_cycle: "monthly" as Database["public"]["Enums"]["billing_cycle"],
    features: "",
    is_active: true,
  });

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

    setBusinessId(profile.business_id);
    await loadPlans(profile.business_id);
  };

  const loadPlans = async (bizId: string) => {
    try {
      const data = await planService.getBusinessPlans(bizId);
      setPlans(data);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    try {
      const planData = {
        business_id: businessId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        billing_cycle: formData.billing_cycle,
        features: formData.features.split("\n").filter(f => f.trim()),
        is_active: formData.is_active,
      };

      if (editingPlan) {
        await planService.updatePlan(editingPlan.id, planData);
      } else {
        await planService.createPlan(planData);
      }

      await loadPlans(businessId);
      resetForm();
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save plan");
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      billing_cycle: plan.billing_cycle,
      features: plan.features.join("\n"),
      is_active: plan.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      await planService.deletePlan(id);
      if (businessId) await loadPlans(businessId);
    } catch (error: any) {
      alert(error.message || "Failed to delete plan");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await planService.togglePlanStatus(id, !isActive);
      if (businessId) await loadPlans(businessId);
    } catch (error) {
      console.error("Error toggling plan status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      billing_cycle: "monthly",
      features: "",
      is_active: true,
    });
    setEditingPlan(null);
    setShowForm(false);
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
        title="Subscription Plans - Business Dashboard"
        description="Configure your IPTV subscription plans and pricing"
      />
      
      <div className="min-h-screen bg-muted/30">
        <header className="bg-card border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/business")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-semibold">Subscription Plans</h1>
                <p className="text-sm text-muted-foreground">Configure pricing packages for your customers</p>
              </div>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Plan
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</CardTitle>
                <CardDescription>Define your subscription package details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        placeholder="Basic, Premium, Enterprise..."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="9.99"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing_cycle">Billing Cycle</Label>
                    <select
                      id="billing_cycle"
                      value={formData.billing_cycle}
                      onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this plan..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Features (one per line)</Label>
                    <Textarea
                      id="features"
                      placeholder="HD streaming&#10;5 simultaneous devices&#10;24/7 support"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active (visible to customers)</Label>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <Button type="submit">
                      {editingPlan ? "Update Plan" : "Create Plan"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              {plans.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No subscription plans yet</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Create your first plan to start accepting customers
                    </p>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <Card key={plan.id} className={!plan.is_active ? "opacity-60" : ""}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <div className="flex items-baseline gap-1 mt-2">
                              <span className="text-3xl font-heading font-bold">${plan.price}</span>
                              <span className="text-sm text-muted-foreground">/{plan.billing_cycle}</span>
                            </div>
                          </div>
                          <Badge variant={plan.is_active ? "default" : "outline"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {plan.description && (
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        )}
                        <div className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="flex-1"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(plan.id, plan.is_active)}
                          >
                            {plan.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(plan.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}