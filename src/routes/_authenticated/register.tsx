import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/lib/use-auth";
import { SiteHeader } from "@/components/site-header";
import { BackToHome } from "@/components/back-to-home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Download } from "lucide-react";
import { generateIdCardPdf } from "@/lib/generate-id-card";

export const Route = createFileRoute("/_authenticated/register")({
  head: () => ({ meta: [{ title: "አዲስ ተመዝጋቢ — ግቢ ጉባዬ" }] }),
  component: RegisterPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  sex: z.string().trim().max(10).optional().or(z.literal("")),
  age: z.coerce.number().int().min(10).max(100).optional().or(z.nan()),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  department: z.string().trim().max(120).optional().or(z.literal("")),
  academic_year: z.string().trim().max(30).optional().or(z.literal("")),
  dormitory: z.string().trim().max(60).optional().or(z.literal("")),
  home_place: z.string().trim().max(120).optional().or(z.literal("")),
  baptism_name: z.string().trim().max(120).optional().or(z.literal("")),
  father_confessor: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

type Reg = {
  id: string;
  user_id: string;
  full_name: string;
  sex: string | null;
  age: number | null;
  phone: string | null;
  department: string | null;
  academic_year: string | null;
  dormitory: string | null;
  home_place: string | null;
  baptism_name: string | null;
  father_confessor: string | null;
  notes: string | null;
};

const empty = {
  full_name: "",
  sex: "",
  age: "",
  phone: "",
  department: "",
  academic_year: "",
  dormitory: "",
  home_place: "",
  baptism_name: "",
  father_confessor: "",
  notes: "",
};

function RegisterPage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [all, setAll] = useState<Reg[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("registrations")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setExistingId(data.id);
      setForm({
        full_name: data.full_name ?? "",
        sex: data.sex ?? "",
        age: data.age?.toString() ?? "",
        phone: data.phone ?? "",
        department: data.department ?? "",
        academic_year: data.academic_year ?? "",
        dormitory: data.dormitory ?? "",
        home_place: data.home_place ?? "",
        baptism_name: data.baptism_name ?? "",
        father_confessor: data.father_confessor ?? "",
        notes: data.notes ?? "",
      });
    }
    if (isAdmin) {
      const { data: list } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      setAll((list as Reg[]) ?? []);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAdmin]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      ...form,
      age: form.age ? Number(form.age) : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      full_name: form.full_name.trim(),
      sex: form.sex.trim() || null,
      age: form.age ? Number(form.age) : null,
      phone: form.phone.trim() || null,
      department: form.department.trim() || null,
      academic_year: form.academic_year.trim() || null,
      dormitory: form.dormitory.trim() || null,
      home_place: form.home_place.trim() || null,
      baptism_name: form.baptism_name.trim() || null,
      father_confessor: form.father_confessor.trim() || null,
      notes: form.notes.trim() || null,
    };
    const { error, data } = existingId
      ? await supabase.from("registrations").update(payload).eq("id", existingId).select().single()
      : await supabase.from("registrations").insert(payload).select().single();
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(existingId ? "ተስተካክሏል" : "ተመዝግቧል");
      if (data) setExistingId(data.id);
      load();
      if (data) {
        try {
          await generateIdCardPdf({
            id: data.id,
            full_name: data.full_name,
            department: data.department,
            academic_year: data.academic_year,
            baptism_name: data.baptism_name,
            phone: data.phone,
          });
          toast.success("የመታወቂያ ካርድ PDF ተውርዷል");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "PDF መፍጠር አልተቻለም");
        }
      }
    }
  }

  async function remove(id: string) {
    if (!confirm("እርግጠኛ ነዎት?")) return;
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("ተሰርዟል");
      if (id === existingId) {
        setExistingId(null);
        setForm(empty);
      }
      load();
    }
  }

  const fields: { k: string; label: string; type?: string }[] = [
    { k: "full_name", label: "ሙሉ ስም *" },
    { k: "baptism_name", label: "የክርስትና ስም" },
    { k: "sex", label: "ጾታ" },
    { k: "age", label: "ዕድሜ", type: "number" },
    { k: "phone", label: "ስልክ" },
    { k: "department", label: "የትምህርት ክፍል" },
    { k: "academic_year", label: "አመት" },
    { k: "dormitory", label: "የመኝታ ቤት" },
    { k: "home_place", label: "የትውልድ ቦታ" },
    { k: "father_confessor", label: "የንስሐ አባት" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <BackToHome className="mb-4" />
        <Link to="/" className="text-sm text-primary hover:underline">← መግቢያ</Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-primary">
          {existingId ? "የእርስዎ ምዝገባ" : "አዲስ ምዝገባ"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ለመመዝገብ ወይም ለማስተካከል — ሁሉንም መረጃ በትክክል ያስገቡ።
        </p>

        <form
          onSubmit={save}
          className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:grid-cols-2"
        >
          {fields.map((f) => (
            <div key={f.k}>
              <Label htmlFor={f.k}>{f.label}</Label>
              <Input
                id={f.k}
                type={f.type ?? "text"}
                value={form[f.k]}
                onChange={(e) => set(f.k, e.target.value)}
                maxLength={120}
                required={f.k === "full_name"}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <Label htmlFor="notes">ተጨማሪ መልዕክት</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              maxLength={1000}
              rows={3}
            />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "..." : existingId ? "አስተካክል" : "መዝግብ"}
            </Button>
          </div>
        </form>

        {isAdmin && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-primary">
              ሁሉም ምዝገባዎች ({all.length})
            </h2>
            <div className="mt-4 space-y-3">
              {all.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start justify-between rounded-xl border border-border bg-card p-4"
                >
                  <div className="text-sm">
                    <div className="font-semibold">{r.full_name}</div>
                    <div className="text-muted-foreground">
                      {[r.department, r.academic_year, r.phone].filter(Boolean).join(" • ")}
                    </div>
                    {r.notes && <div className="mt-1 text-muted-foreground">{r.notes}</div>}
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => remove(r.id)}
                    aria-label="ሰርዝ"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              {all.length === 0 && (
                <p className="text-sm text-muted-foreground">ምንም ምዝገባ የለም።</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
