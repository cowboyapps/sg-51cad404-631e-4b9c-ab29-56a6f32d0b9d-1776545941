import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import GrapesJS to avoid SSR issues
const GrapesJSEditor = dynamic(() => import("@/components/GrapesJSEditor"), { 
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
});

export default function PageBuilder() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [pageConfig, setPageConfig] = useState<any>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", session.user.id)
      .single();

    if (!business) {
      router.push("/");
      return;
    }

    setBusinessId(business.id);
    await loadPageConfig(business.id);
  };

  const loadPageConfig = async (bizId: string) => {
    try {
      const { data, error } = await supabase
        .from("page_builder_configs")
        .select("*")
        .eq("business_id", bizId)
        .eq("page_name", "home")
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      setPageConfig(data);
    } catch (error) {
      console.error("Error loading page config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!businessId || !editorRef.current) return;

    setSaving(true);
    try {
      const editor = editorRef.current;
      const pageStructure = {
        html: editor.getHtml(),
        css: editor.getCss(),
        components: editor.getComponents(),
        styles: editor.getStyle(),
      };

      const saveData = {
        business_id: businessId,
        page_name: "home",
        page_structure: pageStructure,
        updated_at: new Date().toISOString(),
      };

      if (pageConfig?.id) {
        const { error } = await supabase
          .from("page_builder_configs")
          .update(saveData)
          .eq("id", pageConfig.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("page_builder_configs")
          .insert([saveData]);

        if (error) throw error;
      }

      await loadPageConfig(businessId);
      alert("Page saved successfully!");
    } catch (error) {
      console.error("Error saving page:", error);
      alert("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!pageConfig?.id) {
      alert("Please save the page first");
      return;
    }

    try {
      const { error } = await supabase
        .from("page_builder_configs")
        .update({ 
          published: true,
          last_published_at: new Date().toISOString()
        })
        .eq("id", pageConfig.id);

      if (error) throw error;

      await loadPageConfig(businessId);
      alert("Page published successfully!");
    } catch (error) {
      console.error("Error publishing page:", error);
      alert("Failed to publish page");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Page Builder | Business Dashboard" />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/business")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-heading font-semibold">Visual Page Builder</h1>
                <p className="text-xs text-muted-foreground">Customize your customer-facing website</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {pageConfig?.published && (
                <Badge variant="default">Published</Badge>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPreview(!preview)}
              >
                {preview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {preview ? "Edit" : "Preview"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              <Button 
                size="sm"
                onClick={handlePublish}
                disabled={!pageConfig}
              >
                Publish Live
              </Button>
            </div>
          </div>
        </header>

        {/* Editor */}
        <div className="h-[calc(100vh-65px)]">
          <GrapesJSEditor 
            initialConfig={pageConfig?.page_structure}
            onEditorReady={(editor: any) => {
              editorRef.current = editor;
            }}
            previewMode={preview}
          />
        </div>
      </div>
    </>
  );
}