import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Layers } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { DEPARTMENTS } from "./departments";

export const Route = createFileRoute("/_authenticated/departments/")({
  head: () => ({ meta: [{ title: "ክፍላትና አገልግሎቶች" }] }),
  component: DepartmentsIndex,
});

function DepartmentsIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> ወደ መግቢያ
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">ክፍላትና አገልግሎቶች</h1>
                <p className="mt-2 text-sm text-primary-foreground/90">
                  እባክዎ የሚፈልጉትን ክፍል ይምረጡ።
                </p>
              </div>
            </div>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {DEPARTMENTS.map((d, i) => (
            <li key={d.slug}>
              <Link
                to="/departments/$slug"
                params={{ slug: d.slug }}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow font-display text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 font-medium text-foreground">{d.name}</div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}