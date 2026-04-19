import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/services/authService";
import { businessService } from "@/services/businessService";
import { supabase } from "@/integrations/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    businessName: "",
    businessSlug: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🚀 Starting signup process...");

      // 1. Sign up user
      console.log("📝 Creating auth user...");
      const { user, error: signUpError } = await authService.signUp(formData.email, formData.password);

      if (signUpError) {
        console.error("❌ Auth signup error:", signUpError);
        throw new Error(signUpError.message || "Failed to create account");
      }

      if (!user) {
        console.error("❌ No user returned from signup");
        throw new Error("User creation failed - no user returned");
      }

      console.log("✅ Auth user created:", user.id);

      // Wait a moment for the profile trigger to fire
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Ensure profile exists and update role to business_owner
      console.log("👤 Creating/updating profile...");
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ 
          id: user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: "business_owner",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: "id"
        });

      if (profileError) {
        console.error("❌ Profile error:", profileError);
        throw new Error(`Profile setup failed: ${profileError.message}`);
      }

      console.log("✅ Profile created/updated");

      // 3. Create business
      console.log("🏢 Creating business...");
      const business = await businessService.createBusiness({
        owner_id: user.id,
        name: formData.businessName,
        slug: formData.businessSlug,
        status: "trial",
      });

      console.log("✅ Business created:", business.id);

      // 4. Link business to profile
      console.log("🔗 Linking business to profile...");
      const { error: linkError } = await supabase
        .from("profiles")
        .update({ business_id: business.id })
        .eq("id", user.id);

      if (linkError) {
        console.error("❌ Link error:", linkError);
        throw new Error(`Failed to link business: ${linkError.message}`);
      }

      console.log("✅ Business linked to profile");
      console.log("🎉 Signup complete! Redirecting to dashboard...");

      // 5. Redirect to business dashboard
      router.push("/business");
    } catch (err: any) {
      console.error("💥 Signup error:", err);
      
      // Show specific error messages
      let errorMessage = "Failed to create account. Please try again.";
      
      if (err.message?.includes("already registered")) {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (err.message?.includes("slug")) {
        errorMessage = "This business URL is already taken. Please choose a different one.";
      } else if (err.message?.includes("Profile")) {
        errorMessage = "Failed to set up your account profile. Please contact support.";
      } else if (err.message?.includes("Business")) {
        errorMessage = "Failed to create your business. Please try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSlugChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, businessName: name, businessSlug: slug });
  };

  return (
    <>
      <SEO 
        title="Sign Up - IPTV Business Platform"
        description="Create your IPTV business account and launch your professional website with integrated billing system."
      />
      
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="h-12 w-12 rounded-lg bg-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Create Your IPTV Business</CardTitle>
            <CardDescription>
              Start your 14-day free trial. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="My IPTV Service"
                  value={formData.businessName}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessSlug">Website URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">yoursite.com/</span>
                  <Input
                    id="businessSlug"
                    type="text"
                    placeholder="my-iptv-service"
                    value={formData.businessSlug}
                    onChange={(e) => setFormData({ ...formData, businessSlug: e.target.value })}
                    required
                    pattern="[a-z0-9-]+"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-accent hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}