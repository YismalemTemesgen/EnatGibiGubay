import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { BackToHome } from "@/components/back-to-home";
import { Building2, Church, ChevronRight, Info } from "lucide-react";

export const Route = createFileRoute("/about/")({
  head: () => ({ meta: [{ title: "ስለ ግቢ ጉባዬ — ወልቂጤ ዩኒቨርሲቲ" }] }),
  component: AboutHub,
});

const options = [
  {
    to: "/about/university",
    title: "ስለ ወልቂጤ ዩኒቨርሲቲ",
    subtitle: "About Wolkite University",
    icon: Building2,
  },
  {
    to: "/about/gibi-gubaye",
    title: "ስለ ግቢ ጉባኤያችን በአጭሩ",
    subtitle: "About Our Gibi Gubaye",
    icon: Church,
  },
] as const;

function AboutHub() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <BackToHome className="mb-4" />

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">
                  ስለ ወልቂጤ ዩኒቨርሲቲ እና ስለ ግቢ ጉባኤያችን
                </h1>
                <p className="mt-2 text-sm text-primary-foreground/90">
                  እባክዎ ማወቅ የሚፈልጉትን ይምረጡ።
                </p>
              </div>
            </div>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {options.map((o, i) => {
            const Icon = o.icon;
            return (
              <li key={o.to}>
                <Link
                  to={o.to}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-primary">አማራጭ {i + 1}</div>
                    <div className="font-medium text-foreground">{o.title}</div>
                    <div className="text-xs text-muted-foreground">{o.subtitle}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
