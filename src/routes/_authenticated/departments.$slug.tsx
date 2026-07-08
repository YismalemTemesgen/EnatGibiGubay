import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Layers } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { DEPARTMENTS } from "./departments";

export const Route = createFileRoute("/_authenticated/departments/$slug")({
  head: ({ params }) => {
    const dep = DEPARTMENTS.find((d) => d.slug === params?.slug);
    return { meta: [{ title: dep ? `${dep.name} — ክፍላትና አገልግሎቶች` : "ክፍል አልተገኘም" }] };
  },
  component: DepartmentDetail,
  notFoundComponent: DepartmentNotFound,
  loader: ({ params }) => {
    const dep = DEPARTMENTS.find((d) => d.slug === params.slug);
    if (!dep) throw notFound();
    return dep;
  },
});

function DepartmentDetail() {
  const dep = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/departments"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> ወደ ክፍላት ዝርዝር
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">{dep.name}</h1>
                <p className="mt-2 text-sm text-primary-foreground/90">
                  ስለዚህ ክፍል ዝርዝር መረጃ በቅርቡ ይታከላል።
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              እዚህ ላይ ስለ <span className="font-medium text-foreground">{dep.name}</span> ዓላማ፣
              ኃላፊነቶች፣ አገልግሎቶች እና የክፍሉ አባላት መረጃ ይቀርባል። ይዘቱ በቅርቡ ይሞላል።
            </p>

            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              ተጨማሪ ይዘት በአስተዳዳሪው ሲታከል በዚህ ገጽ ላይ ይታያል።
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/departments">
              <ArrowLeft className="h-4 w-4" /> ተመለስ
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function DepartmentNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">ክፍል አልተገኘም</h1>
        <p className="mt-2 text-muted-foreground">የፈለጉት ክፍል በዝርዝሩ ውስጥ የለም።</p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/departments">
              <ArrowLeft className="h-4 w-4" /> ወደ ክፍላት ዝርዝር
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}