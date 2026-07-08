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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Pencil, Paperclip, X, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "ታሪክ እና ሪፖርቶች — ግቢ ጉባዬ" }] }),
  component: HistoryPage,
});

type Kind = "history" | "report" | "plan" | "future_plan" | "section_control";

const KIND_LABEL: Record<Kind, string> = {
  history: "ታሪክ",
  report: "ሪፖርት",
  plan: "ዕቅድ",
  future_plan: "የወደፊት ዕቅድ",
  section_control: "የክፍል መቆጣጠሪያ",
};

const TABS: { value: Kind; label: string }[] = [
  { value: "history", label: "1. ታሪክ" },
  { value: "report", label: "2. ሪፖርቶች" },
  { value: "plan", label: "3. ዕቅዶች" },
  { value: "future_plan", label: "4. የወደፊት ዕቅዶች" },
  { value: "section_control", label: "5. የክፍል መቆጣጠሪያ" },
];

const schema = z.object({
  title: z.string().trim().min(2).max(200),
  body: z.string().trim().max(8000).optional().or(z.literal("")),
  year: z.string().trim().max(20).optional().or(z.literal("")),
  section: z.string().trim().max(80).optional().or(z.literal("")),
  external_url: z.string().trim().url().max(500).optional().or(z.literal("")),
});

type Entry = {
  id: string;
  author_id: string;
  kind: Kind;
  title: string;
  body: string | null;
  year: string | null;
  section: string | null;
  file_path: string | null;
  external_url: string | null;
  created_at: string;
};

function HistoryPage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);
  const [tab, setTab] = useState<Kind>("history");
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("history_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    const list = (data ?? []) as Entry[];
    setItems(list);
    // pre-sign attachments
    const urls: Record<string, string> = {};
    await Promise.all(
      list
        .filter((i) => i.file_path)
        .map(async (i) => {
          const { data: s } = await supabase.storage
            .from("history")
            .createSignedUrl(i.file_path as string, 3600);
          if (s?.signedUrl) urls[i.id] = s.signedUrl;
        }),
    );
    setSignedUrls(urls);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setBody("");
    setYear("");
    setSection("");
    setExternalUrl("");
    setFile(null);
  }

  function startEdit(e: Entry) {
    setEditingId(e.id);
    setTitle(e.title);
    setBody(e.body ?? "");
    setYear(e.year ?? "");
    setSection(e.section ?? "");
    setExternalUrl(e.external_url ?? "");
    setFile(null);
    setShowForm(true);
    setTab(e.kind);
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user) return;
    if (!isAdmin) {
      toast.error("Admin only");
      return;
    }
    const parsed = schema.safeParse({ title, body, year, section, external_url: externalUrl });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      let filePath: string | null = null;
      if (file) {
        if (file.size > 50 * 1024 * 1024) throw new Error("Max 50MB");
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("history")
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        filePath = path;
      }

      if (editingId) {
        const patch = {
          title: parsed.data.title,
          body: parsed.data.body || null,
          year: parsed.data.year || null,
          section: parsed.data.section || null,
          external_url: parsed.data.external_url || null,
          ...(filePath ? { file_path: filePath } : {}),
        };
        const { error } = await supabase
          .from("history_entries")
          .update(patch)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("ዘምኗል");
      } else {
        const { error } = await supabase.from("history_entries").insert({
          author_id: user.id,
          kind: tab,
          title: parsed.data.title,
          body: parsed.data.body || null,
          year: parsed.data.year || null,
          section: parsed.data.section || null,
          external_url: parsed.data.external_url || null,
          file_path: filePath,
        });
        if (error) throw error;
        toast.success("ተጨምሯል");
      }
      resetForm();
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(e: Entry) {
    if (!confirm("ይሰረዝ?")) return;
    if (e.file_path) {
      await supabase.storage.from("history").remove([e.file_path]);
    }
    const { error } = await supabase.from("history_entries").delete().eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success("ተሰርዟል");
    await load();
  }

  const filtered = useMemo(() => items.filter((i) => i.kind === tab), [items, tab]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <BackToHome className="mb-4" />
        <header className="space-y-1">
          <h1 className="text-3xl font-bold">ታሪክ እና ሪፖርቶች</h1>
          <p className="text-muted-foreground">
            History, reports, plans, future plans & section controls
          </p>
        </header>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Kind)}>
          <TabsList className="flex flex-wrap h-auto">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="space-y-4 pt-4">
              {isAdmin && (
                <div className="flex justify-end">
                  <Button
                    variant={showForm ? "secondary" : "default"}
                    onClick={() => {
                      if (showForm) {
                        resetForm();
                        setShowForm(false);
                      } else {
                        setShowForm(true);
                      }
                    }}
                  >
                    {showForm ? (
                      <>
                        <X className="mr-2 h-4 w-4" /> ዝጋ
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> አዲስ {KIND_LABEL[t.value]}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {isAdmin && showForm && (
                <form
                  onSubmit={submit}
                  className="rounded-lg border bg-card p-4 space-y-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>ርዕስ *</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>አመት</Label>
                      <Input
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="2017 ዓ.ም"
                      />
                    </div>
                    <div>
                      <Label>ክፍል / Section</Label>
                      <Input
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        placeholder="ለምሳሌ፦ ትምህርት ክፍል"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>ይዘት</Label>
                      <Textarea
                        rows={5}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>ውጫዊ አገናኝ (URL)</Label>
                      <Input
                        type="url"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>ፋይል አያይዝ (PDF/Doc/Image, ≤50MB)</Label>
                      <Input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "በመስቀል ላይ…" : editingId ? "አዘምን" : "አስቀምጥ"}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          resetForm();
                        }}
                      >
                        ሰርዝ
                      </Button>
                    )}
                  </div>
                </form>
              )}

              {loading ? (
                <p className="text-muted-foreground">በመጫን ላይ…</p>
              ) : filtered.length === 0 ? (
                <p className="text-muted-foreground">ምንም መዝገብ የለም።</p>
              ) : (
                <ul className="space-y-3">
                  {filtered.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-lg border bg-card p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{e.title}</h3>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary">{KIND_LABEL[e.kind]}</Badge>
                            {e.year && <Badge variant="outline">{e.year}</Badge>}
                            {e.section && <Badge variant="outline">{e.section}</Badge>}
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEdit(e)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => remove(e)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {e.body && (
                        <p className="text-sm whitespace-pre-wrap">{e.body}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm">
                        {e.external_url && (
                          <a
                            href={e.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            ውጫዊ አገናኝ
                          </a>
                        )}
                        {signedUrls[e.id] && (
                          <a
                            href={signedUrls[e.id]}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary underline"
                          >
                            <Paperclip className="h-3 w-3" /> ፋይል ክፈት
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {!isAdmin && (
          <p className="text-xs text-muted-foreground">
            ይዘት ለመጨመር ወይም ለማርትዕ የአስተዳዳሪ ፍቃድ ያስፈልጋል።
          </p>
        )}
      </main>
    </div>
  );
}
