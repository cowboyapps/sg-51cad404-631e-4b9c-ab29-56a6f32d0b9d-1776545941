import { useEffect, useRef } from "react";
import "grapesjs/dist/css/grapes.min.css";

interface GrapesJSEditorProps {
  initialConfig?: any;
  onEditorReady?: (editor: any) => void;
  previewMode?: boolean;
}

export default function GrapesJSEditor({ initialConfig, onEditorReady, previewMode }: GrapesJSEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const initEditor = async () => {
      const grapesjs = (await import("grapesjs")).default;
      const gjsPresetWebpage = (await import("grapesjs-preset-webpage")).default;
      const gjsBlocksBasic = (await import("grapesjs-blocks-basic")).default;

      const editor = grapesjs.init({
        container: containerRef.current!,
        height: "100%",
        width: "100%",
        storageManager: false,
        plugins: [gjsPresetWebpage, gjsBlocksBasic],
        pluginsOpts: {
          "grapesjs-preset-webpage": {
            blocks: ["column1", "column2", "column3", "text", "link", "image", "video"],
            modalImportTitle: "Import Template",
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
            modalImportContent: (editor: any) => editor.getHtml() + "<style>" + editor.getCss() + "</style>",
          },
        },
        canvas: {
          styles: [
            "https://cdn.jsdelivr.net/npm/tailwindcss@3.4/dist/tailwind.min.css",
          ],
        },
        blockManager: {
          appendTo: "#blocks",
        },
        styleManager: {
          appendTo: "#styles-container",
        },
        layerManager: {
          appendTo: "#layers-container",
        },
        traitManager: {
          appendTo: "#trait-container",
        },
        selectorManager: {
          appendTo: "#styles-container",
        },
      });

      // Add custom IPTV-specific blocks
      editor.BlockManager.add("hero-section", {
        label: "Hero Section",
        category: "IPTV Templates",
        content: `
          <section class="bg-gradient-to-r from-primary/10 to-accent/10 py-20 px-4">
            <div class="max-w-4xl mx-auto text-center">
              <h1 class="text-5xl font-bold mb-6">Welcome to Premium IPTV</h1>
              <p class="text-xl text-muted-foreground mb-8">Stream thousands of channels in stunning quality</p>
              <button class="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90">Get Started</button>
            </div>
          </section>
        `,
      });

      editor.BlockManager.add("pricing-card", {
        label: "Pricing Card",
        category: "IPTV Templates",
        content: `
          <div class="bg-card border rounded-lg p-6 hover:border-primary transition-colors">
            <h3 class="text-2xl font-bold mb-2">Basic Plan</h3>
            <div class="text-4xl font-bold mb-4">$19<span class="text-lg font-normal text-muted-foreground">/month</span></div>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center gap-2">✓ 500+ Channels</li>
              <li class="flex items-center gap-2">✓ HD Quality</li>
              <li class="flex items-center gap-2">✓ 1 Device</li>
            </ul>
            <button class="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90">Subscribe</button>
          </div>
        `,
      });

      editor.BlockManager.add("feature-grid", {
        label: "Feature Grid",
        category: "IPTV Templates",
        content: `
          <section class="py-16 px-4">
            <div class="max-w-6xl mx-auto">
              <h2 class="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
              <div class="grid md:grid-cols-3 gap-8">
                <div class="text-center">
                  <div class="text-4xl mb-4">📺</div>
                  <h3 class="text-xl font-semibold mb-2">1000+ Channels</h3>
                  <p class="text-muted-foreground">Access to premium content worldwide</p>
                </div>
                <div class="text-center">
                  <div class="text-4xl mb-4">⚡</div>
                  <h3 class="text-xl font-semibold mb-2">Ultra HD Quality</h3>
                  <p class="text-muted-foreground">Crystal clear 4K streaming</p>
                </div>
                <div class="text-center">
                  <div class="text-4xl mb-4">🔒</div>
                  <h3 class="text-xl font-semibold mb-2">Secure & Reliable</h3>
                  <p class="text-muted-foreground">99.9% uptime guarantee</p>
                </div>
              </div>
            </div>
          </section>
        `,
      });

      // Load initial config if provided
      if (initialConfig) {
        if (initialConfig.html && initialConfig.css) {
          editor.setComponents(initialConfig.html);
          editor.setStyle(initialConfig.css);
        }
      } else {
        // Set default template
        editor.setComponents(`
          <section class="bg-gradient-to-r from-primary/10 to-accent/10 py-20 px-4">
            <div class="max-w-4xl mx-auto text-center">
              <h1 class="text-5xl font-bold mb-6">Welcome to Your IPTV Service</h1>
              <p class="text-xl text-muted-foreground mb-8">Start customizing your page using the blocks on the right</p>
              <button class="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90">Get Started</button>
            </div>
          </section>
        `);
      }

      editorRef.current = editor;
      if (onEditorReady) {
        onEditorReady(editor);
      }
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const canvas = editor.Canvas;
      
      if (previewMode) {
        canvas.getBody().style.pointerEvents = "none";
        editor.stopCommand("sw-visibility");
      } else {
        canvas.getBody().style.pointerEvents = "auto";
      }
    }
  }, [previewMode]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}