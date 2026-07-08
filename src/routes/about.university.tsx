import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { BackToHome } from "@/components/back-to-home";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/about/university")({
  head: () => ({ meta: [{ title: "ስለ ወልቂጤ ዩኒቨርሲቲ" }] }),
  component: UniversityPage,
});

function UniversityPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <BackToHome className="mb-4" />
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">ስለ ወልቂጤ ዩኒቨርሲቲ</h1>
                <p className="mt-2 text-sm text-primary-foreground/90">About Wolkite University</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6 text-sm leading-relaxed text-foreground">
            <p>
              ወልቂጤ ዩኒቨርሲቲ በደቡብ ኢትዮጵያ በጉራጌ ዞን በወልቂጤ ከተማ የሚገኝ የመንግስት ከፍተኛ የትምህርት ተቋም ነው።
              ዩኒቨርሲቲው በተለያዩ የትምህርት ዘርፎች ዲግሪ እና ድህረ ምረቃ ፕሮግራሞችን ይሰጣል።
            </p>
            <p className="text-muted-foreground">(ተጨማሪ ዝርዝር መረጃ በቅርቡ ይታከላል።)</p>
          </div>
        </div>
      </main>
    </div>
  );
}