import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/lib/use-auth";
import { SiteHeader } from "@/components/site-header";
import { BackToHome } from "@/components/back-to-home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, HandCoins, Pencil, Trash2, X, XCircle, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/donate")({
  head: () => ({ meta: [{ title: "መዋጮ — ግቢ ጉባዬ" }] }),
  component: DonatePage,
});

type Status = "pending" | "approved" | "rejected";

type Donation = {
  id: string;
  donor_id: string;
  donor_name: string;
  amount: number;
  currency: string;
  method: string;
  reference: string | null;
  purpose: string | null;
  note: string | null;
  proof_path: string | null;
  status: Status;
  reviewed_at: string | null;
  created_at: string;
};

const METHODS = ["Telebirr", "CBE", "Awash Bank", "Dashen Bank", "Cash", "Other"];
const PURPOSES = ["ግቢ ጉባዬ ድጋፍ", "ለቤተክርስቲያን ግንባታ", "ለመጻሕፍት እና ቁሳቁስ", "ለተማሪዎች እርዳታ", "ሌላ"];

const schema = z.object({
  donor_name: z.string().trim().min(2).max(120),
  amount: z.coerce.number().positive().max(10_000_000),
  currency: z.string().trim().min(2).max(8),
  method: z.string().trim().min(2).max(40),
  reference: z.string().trim().max(80).optional().or(z.literal("")),
  purpose: z.string().trim().max(120).optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

function fmtAmount(n: number, c: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(n);
  } catch {
    return `${n.toFixed(2)} ${c}`;
  }
}

function DonatePage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);

  const [rows, setRows] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"mine" | "pending" | "approved" | "all">("mine");

  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETB");
  const [method, setMethod] = useState("Telebirr");
  const [reference, setReference] = useState("");
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [note, setNote] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Donation[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    (async () => {
      const next: Record<string, string> = {};
      for (const r of rows) {
        if (r.proof_path) {
          const { data } = await supabase.storage
            .from("donations")
            .createSignedUrl(r.proof_path, 3600);
          if (data?.signedUrl) next[r.id] = data.signedUrl;
        }
      }
      setSignedUrls(next);
    })();
  }, [rows]);

  function resetForm() {
    setDonorName("");
    setAmount("");
    setCurrency("ETB");
    setMethod("Telebirr");
    setReference("");
    setPurpose(PURPOSES[0]);
    setNote("");
    setProof(null);
    setEditingId(null);
  }

  function startEdit(r: Donation) {
    setEditingId(r.id);
    setDonorName(r.donor_name);
    setAmount(String(r.amount));
    setCurrency(r.currency);
    setMethod(r.method);
    setReference(r.reference ?? "");
    setPurpose(r.purpose ?? PURPOSES[0]);
    setNote(r.note ?? "");
    setProof(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      donor_name: donorName,
      amount,
      currency,
      method,
      reference,
      purpose,
      note,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      let proof_path: string | null = null;
      if (proof) {
        if (proof.size > 10 * 1024 * 1024) throw new Error("File must be under 10MB");
        if (!proof.type.startsWith("image/") && proof.type !== "application/pdf") {
          throw new Error("Only image or PDF receipts");
        }
        const ext = proof.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("donations")
          .upload(path, proof, { contentType: proof.type });
        if (upErr) throw upErr;
        proof_path = path;
      }

      if (editingId) {
        const update = {
          donor_name: parsed.data.donor_name,
          amount: parsed.data.amount,
          currency: parsed.data.currency,
          method: parsed.data.method,
          reference: parsed.data.reference || null,
          purpose: parsed.data.purpose || null,
          note: parsed.data.note || null,
          ...(proof_path ? { proof_path } : {}),
        };
        const { error } = await supabase.from("donations").update(update).eq("id", editingId);
        if (error) throw error;
        toast.success("ተስተካክሏል");
      } else {
        const { error } = await supabase.from("donations").insert({
          donor_id: user.id,
          donor_name: parsed.data.donor_name,
          amount: parsed.data.amount,
          currency: parsed.data.currency,
          method: parsed.data.method,
          reference: parsed.data.reference || null,
          purpose: parsed.data.purpose || null,
          note: parsed.data.note || null,
          proof_path,
        });
        if (error) throw error;
        toast.success("እናመሰግናለን — መዋጮዎ ለማጽደቅ በመጠባበቅ ላይ ነው");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function review(r: Donation, status: Status) {
    const { error } = await supabase
      .from("donations")
      .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "ጸድቋል" : "ተቀባይነት አላገኘም");
    load();
  }

  async function remove(r: Donation) {
    if (!confirm("ይህን መዋጮ ይሰረዝ?")) return;
    const { error } = await supabase.from("donations").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    if (r.proof_path) await supabase.storage.from("donations").remove([r.proof_path]);
    toast.success("ተሰርዟል");
    load();
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (tab === "mine") return r.donor_id === user?.id;
      if (tab === "pending") return r.status === "pending";
      if (tab === "approved") return r.status === "approved";
      return true;
    });
  }, [rows, tab, user?.id]);

  const approvedTotal = useMemo(() => {
    const byCcy: Record<string, number> = {};
    for (const r of rows) {
      if (r.status !== "approved") continue;
      byCcy[r.currency] = (byCcy[r.currency] ?? 0) + Number(r.amount);
    }
    return byCcy;
  }, [rows]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <BackToHome className="mb-4" />
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <HandCoins className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-primary sm:text-3xl">
              መዋጮ ወይም እርዳታ
            </h1>
            <p className="text-sm text-muted-foreground">
              ለግቢ ጉባዬአችን አገልግሎት ድጋፍዎን ያቅርቡ። መዋጮዎ በአስተዳዳሪ ከመጸደቁ በፊት «በመጠባበቅ» ላይ ይሆናል።
            </p>
          </div>
        </div>

        {Object.keys(approvedTotal).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(approvedTotal).map(([c, n]) => (
              <span
                key={c}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                ጠቅላላ የጸደቀ: {fmtAmount(n, c)}
              </span>
            ))}
          </div>
        )}

        <form
          onSubmit={submit}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {editingId ? "መዋጮ አስተካክል" : "አዲስ መዋጮ ያቅርቡ"}
            </h2>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" /> ሰርዝ
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="donor_name">ሙሉ ስም</Label>
              <Input
                id="donor_name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">መጠን</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">ምንዛሬ</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETB">ETB (ብር)</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method">የክፍያ መንገድ</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reference">የግብይት ቁጥር (አማራጭ)</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transaction / Receipt #"
                maxLength={80}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">ዓላማ</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger id="purpose"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PURPOSES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">ማስታወሻ (አማራጭ)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="proof">የክፍያ ማረጋገጫ (ምስል ወይም PDF, እስከ 10MB)</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />
            {proof && <p className="text-xs text-muted-foreground">{proof.name}</p>}
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "በመላክ ላይ..." : editingId ? "አዘምን" : "አቅርብ"}
          </Button>
        </form>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-8">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="mine">የእኔ</TabsTrigger>
            {isAdmin && <TabsTrigger value="pending">በመጠባበቅ</TabsTrigger>}
            {isAdmin && <TabsTrigger value="approved">የጸደቀ</TabsTrigger>}
            {isAdmin && <TabsTrigger value="all">ሁሉም</TabsTrigger>}
          </TabsList>

          <TabsContent value={tab} className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">በመጫን ላይ...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">መዋጮ የለም።</p>
            ) : (
              filtered.map((r) => {
                const canEdit = (r.donor_id === user?.id && r.status === "pending") || isAdmin;
                const url = signedUrls[r.id];
                return (
                  <article
                    key={r.id}
                    className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <HandCoins className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            {fmtAmount(Number(r.amount), r.currency)}
                          </h3>
                          <span className="text-sm text-muted-foreground">— {r.donor_name}</span>
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-xs " +
                              (r.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : r.status === "rejected"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-400")
                            }
                          >
                            {r.status === "approved" ? "ጸድቋል" : r.status === "rejected" ? "ተቀባይነት አላገኘም" : "በመጠባበቅ"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {r.method}
                          {r.reference ? ` · ${r.reference}` : ""}
                          {r.purpose ? ` · ${r.purpose}` : ""}
                        </p>
                        {r.note && <p className="mt-1 text-sm">{r.note}</p>}
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" /> ማረጋገጫ ይመልከቱ
                          </a>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                        {isAdmin && r.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => review(r, "approved")}
                              aria-label="Approve"
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => review(r, "rejected")}
                              aria-label="Reject"
                              className="text-destructive hover:text-destructive"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(r)}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(r)}
                            aria-label="Delete"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
