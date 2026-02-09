import { UrlInputForm } from "@/components/scan/url-input-form";
import { Eye, BarChart3, Globe, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-3xl w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Check your brand&apos;s AI visibility
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Is your website visible to{" "}
            <span className="bg-gradient-to-r from-[#10A37F] via-[#4285F4] to-[#D4A574] bg-clip-text text-transparent">
              AI assistants
            </span>
            ?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how often ChatGPT, Claude, Gemini, and Perplexity mention
            and recommend your website. Track citations, keywords, and regional
            visibility across all major AI platforms.
          </p>
          <div className="max-w-xl mx-auto pt-4">
            <UrlInputForm />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t py-16 px-4">
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Multi-Platform Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Check visibility across ChatGPT, Claude, Gemini, and Perplexity simultaneously.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Regional Insights</h3>
            <p className="text-sm text-muted-foreground">
              See how your brand performs across different countries and regions worldwide.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Detailed Scoring</h3>
            <p className="text-sm text-muted-foreground">
              Get a visibility score with keyword-level detail on mentions, citations, and recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
