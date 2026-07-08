import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { BackToHome } from "@/components/back-to-home";
import { Church } from "lucide-react";

export const Route = createFileRoute("/about/gibi-gubaye")({
  head: () => ({ meta: [{ title: "ስለ ግቢ ጉባኤያችን" }] }),
  component: GibiGubayePage,
});

function GibiGubayePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <BackToHome className="mb-4" />
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Church className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">ስለ ግቢ ጉባኤያችን በአጭሩ</h1>
                <p className="mt-2 text-sm text-primary-foreground/90">About Our Gibi Gubaye</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6 text-sm leading-relaxed text-foreground">
            <p>
              የወልቂጤ ዩኒቨርሲቲ ግቢ ጉባኤ በኦርቶዶክስ ተዋህዶ ሃይማኖት አማኝ ተማሪዎች የተመሠረተ የግቢ ውስጥ የመንፈሳዊ
              አገልግሎት ማህበር ነው። ትምህርት፣ መዝሙር፣ በጎ አድራጎት እና የአባላት እንክብካቤ ዋና አገልግሎቶቻችን ናቸው።
            </p>
            <p className="text-muted-foreground">(ዝርዝር ታሪክ በ "የግቢ ጉባዬአችን ታሪክ" ክፍል ውስጥ ይገኛል።)</p>
          </div>
        </div>
      </main>
    </div>
  );
}