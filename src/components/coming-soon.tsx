import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { ArrowLeft, Construction } from "lucide-react";

export function ComingSoon({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> ወደ መግቢያ
        </Link>
        <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <Construction className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-primary">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        <p className="mt-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          ይህ ክፍል በቅርብ ጊዜ ይዘጋጃል። እባክዎ ይጠብቁ።
        </p>
      </main>
    </div>
  );
}
