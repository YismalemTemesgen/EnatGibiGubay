import { createFileRoute, Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.png.asset.json";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  BookOpen,
  Building2,
  ChevronRight,
  HandHeart,
  History,
  Megaphone,
  MessageSquare,
  Music,
  ShieldCheck,
  UserPlus,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ወልቂጤ ዩኒቨርሲቲ ግቢ ጉባዬ መተገበሪያ" },
      { name: "description", content: "Welcome to Wolkite University Gibi Gubaye Service." },
    ],
  }),
  component: Home,
});

type MenuItem = {
  to: string;
  number: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
};

const menus: MenuItem[] = [
  { to: "/about", number: 1, title: "ስለ ወልቂጤ ዩኒቨርሲቲ እና ስለ ግቢ ጉባኤያችን በአጭሩ", icon: Building2 },
  { to: "/register", number: 2, title: "አዲስ ተመዝጋቢ", icon: UserPlus },
  { to: "/cases", number: 3, title: "ዕቅበተ እምነት (የኬዝ ዝርዝር መመዝገቢያ ፎርም)", icon: ShieldCheck },
  { to: "/departments", number: 4, title: "ክፍላትና አገልግሎቶች", icon: Layers },
  { to: "/notices", number: 5, title: "ማስታወቂያ", icon: Megaphone },
  { to: "/library", number: 6, title: "ትምህርቶች እና መጽሐፍት ለማግኘት", icon: BookOpen },
  { to: "/mezmur", number: 7, title: "መዝሙራት", icon: Music },
  { to: "/donate", number: 8, title: "ግቢ ጉባዬአችን ለመርዳት", icon: HandHeart },
  { to: "/history", number: 9, title: "የግቢ ጉባዬአችን ታሪክ እና አሁን ያለችበት ደረጃ ለማወቅ", icon: History },
  { to: "/feedback", number: 10, title: "ሃሳብ አስተያየት ለመጻፍ", icon: MessageSquare },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[var(--gradient-sky)] opacity-30" />
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8 text-center sm:pt-14">
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary sm:text-4xl">
            WELCOME TO WOLKITE UNIVERSITY GIBI GUBAYE SERVICE
          </h1>

          <div className="mt-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-[var(--gradient-ethiopia)] opacity-40 blur-xl" />
              <img
                src={logoAsset.url}
                alt="ግቢ ጉባዬ"
                className="relative h-44 w-44 rounded-full ring-4 ring-background sm:h-56 sm:w-56"
              />
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-balance font-display text-lg font-semibold text-foreground sm:text-xl">
            እንኳን ወደ ወልቂጤ ዩኒቨርሲቲ ግቢ ጉባዬ መተገበሪያ በደህና መጡ
          </p>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            ምን ይፈልጋሉ ምን እንርዳዎ
          </p>
        </div>
      </section>

      {/* Menu list */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <ul className="space-y-3">
          {menus.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.number}>
                <Link
                  to={m.to}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-primary">ምርጫ {m.number}</div>
                    <div className="font-medium text-foreground">{m.title}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <SiteFooter />
    </div>
  );
}
