import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Send, Loader2 } from "lucide-react";
import { sendCaseToTelegram } from "@/lib/telegram.functions";

export const Route = createFileRoute("/_authenticated/cases")({
  head: () => ({ meta: [{ title: "ዕቅበተ እምነት — የኬዝ ዝርዝር መመዝገቢያ ፎርም" }] }),
  component: CasesPage,
});

type FormState = {
  full_name: string;
  batch: string;
  department: string;
  dormitory: string;
  section: string;
  phone: string;
  telegram: string;
  case_detail: string;
};

const EMPTY: FormState = {
  full_name: "",
  batch: "",
  department: "",
  dormitory: "",
  section: "",
  phone: "",
  telegram: "",
  case_detail: "",
};

const BATCH_OPTIONS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year",
  "Other",
];

const CASE_DETAIL_PLACEHOLDER =
  "ስለኬዙ አስፈላጊ ነው ብለው የሚያስቡትን ገለጻ ያስገቡ ወይም ለእርሶ የተነገረዎትን ከሰውም ከሆነ የሰሙትን በሚመችዎት መልኩ ይጻፉልን (ሃይማኖታዊ ነው ወይንስ ሱስ ወይም ጭንቀት፣ መቸገር ምናምን ሃይማኖታዊ ከሆነ ኬዙን ለመቀየር እያሰበ ያለው ወይም የቀረበውን ሰው መጥቀስ እንዳይረሱ) የራሱ እና የ family background, ኮርስ እና አንድነት ጉባኤ ተሳትፎ፣ የጓደኞቹ ሁኔታ...";

function CasesPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const sendToTelegram = useServerFn(sendCaseToTelegram);

  function upd<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.batch || !form.case_detail) {
      toast.error("እባክዎ ስም፣ ባች እና የኬዝ ዝርዝር ይሙሉ።");
      return;
    }
    setSubmitting(true);
    try {
      await sendToTelegram({ data: form });
      setForm(EMPTY);
      toast.success("ኬዝዎ ተልኳል። እናመሰግናለን።");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ኬዙን መላክ አልተቻለም።";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

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
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">
                  የኬዝ ዝርዝር መመዝገቢያ ፎርም
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90">
                  ይህ ፎርም ለ 2017 የኬዝ ዝርዝር መረጃ ለመሰብሰብ የተዘጋጀ ነው። እባክዎ ትክክለኛና የተሟላ ዝርዝሮችን ያስገቡ።
                </p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6"
        >
          <div className="mb-5 border-l-4 border-primary pl-3">
            <h2 className="font-display text-lg font-bold text-primary">
              የኬዝ አስፈላጊ መረጃዎች
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="full_name">ስም *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => upd("full_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Batch *</Label>
              <RadioGroup
                value={form.batch}
                onValueChange={(v) => upd("batch", v)}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {BATCH_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    htmlFor={`batch-${opt}`}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem value={opt} id={`batch-${opt}`} />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => upd("department", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={form.section}
                onChange={(e) => upd("section", e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="dormitory">Dormitory (Campus, Building and Dorm Number)</Label>
              <Input
                id="dormitory"
                value={form.dormitory}
                onChange={(e) => upd("dormitory", e.target.value)}
                placeholder="e.g. Main Campus, Block 5, Room 214"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => upd("phone", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telegram">Telegram Username</Label>
              <Input
                id="telegram"
                value={form.telegram}
                onChange={(e) => upd("telegram", e.target.value)}
                placeholder="@username"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="case_detail">Case Detail *</Label>
              <Textarea
                id="case_detail"
                rows={8}
                value={form.case_detail}
                onChange={(e) => upd("case_detail", e.target.value)}
                placeholder={CASE_DETAIL_PLACEHOLDER}
                required
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="outline" type="button">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" /> ተመለስ
              </Link>
            </Button>
            <Button type="submit" disabled={submitting} size="lg">
              <Send className="h-4 w-4" />
              {submitting ? "እየተመዘገበ..." : "አስገባ"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}