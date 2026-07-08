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
import { CheckCircle2, Music, Pencil, Trash2, Video, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mezmur")({
  head: () => ({ meta: [{ title: "መዝሙራት — ግቢ ጉባዬ" }] }),
  component: MezmurPage,
});

type Kind = "audio" | "video";
type Status = "pending" | "approved";

type Item = {
  id: string;
  uploader_id: string;
  title: string;
  description: string | null;
  kind: Kind;
  category: string | null;
  file_path: string | null;
  external_url: string | null;
  status: Status;
  created_at: string;
};

const schema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  kind: z.enum(["audio", "video"]),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  external_url: z.string().trim().url().max(500).optional().or(z.literal("")),
});

function MezmurPage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "audio" | "video" | "mine" | "pending">("all");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<Kind>("audio");
  const [category, setCategory] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("mezmur_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Item[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    (async () => {
      const next: Record<string, string> = {};
      for (const it of items) {
        if (it.file_path) {
          const { data } = await supabase.storage
            .from("mezmur")
            .createSignedUrl(it.file_path, 3600);
          if (data?.signedUrl) next[it.id] = data.signedUrl;
        }
      }
      setSignedUrls(next);
    })();
  }, [items]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setKind("audio");
    setCategory("");
    setExternalUrl("");
    setFile(null);
    setEditingId(null);
  }

  function startEdit(it: Item) {
    setEditingId(it.id);
    setTitle(it.title);
    setDescription(it.description ?? "");
    setKind(it.kind);
    setCategory(it.category ?? "");
    setExternalUrl(it.external_url ?? "");
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ title, description, kind, category, external_url: externalUrl });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    if (!editingId && !file && !externalUrl) {
      toast.error("ፋይል ስቀል ወይም URL አስገባ");
      return;
    }
    setSubmitting(true);
    try {
      let file_path: string | null = null;
      if (file) {
        if (file.size > 50 * 1024 * 1024) throw new Error("File must be under 50MB");
        const okAudio = kind === "audio" && file.type.startsWith("audio/");
        const okVideo = kind === "video" && file.type.startsWith("video/");
        if (!okAudio && !okVideo) throw new Error("ፋይል ከተመረጠው አይነት ጋር መመሳሰል አለበት");
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("mezmur")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        file_path = path;
      }

      if (editingId) {
        const update = {
          title: parsed.data.title,
          description: parsed.data.description || null,
          kind: parsed.data.kind,
          category: parsed.data.category || null,
          external_url: parsed.data.external_url || null,
          ...(file_path ? { file_path } : {}),
        };
        const { error } = await supabase.from("mezmur_items").update(update).eq("id", editingId);
        if (error) throw error;
        toast.success("ተስተካክሏል");
      } else {
        const { error } = await supabase.from("mezmur_items").insert({
          uploader_id: user.id,
          title: parsed.data.title,
          description: parsed.data.description || null,
          kind: parsed.data.kind,
          category: parsed.data.category || null,
          external_url: parsed.data.external_url || null,
          file_path,
        });
        if (error) throw error;
        toast.success(isAdmin ? "ተጨምሯል" : "ተልኳል — ለማጽደቅ በመጠባበቅ ላይ");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function approve(it: Item) {
    const { error } = await supabase
      .from("mezmur_items")
      .update({ status: "approved" })
      .eq("id", it.id);
    if (error) return toast.error(error.message);
    toast.success("ጸድቋል");
    load();
  }

  async function remove(it: Item) {
    if (!confirm("ይህን መዝሙር ይሰረዝ?")) return;
    const { error } = await supabase.from("mezmur_items").delete().eq("id", it.id);
    if (error) return toast.error(error.message);
    if (it.file_path) await supabase.storage.from("mezmur").remove([it.file_path]);
    toast.success("ተሰርዟል");
    load();
  }

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (tab === "audio") return i.kind === "audio" && i.status === "approved";
      if (tab === "video") return i.kind === "video" && i.status === "approved";
      if (tab === "mine") return i.uploader_id === user?.id;
      if (tab === "pending") return i.status === "pending";
      return i.status === "approved";
    });
  }, [items, tab, user?.id]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <BackToHome className="mb-4" />
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-primary sm:text-3xl">
              መዝሙራት እና ያሬዳዊ ወረቦች
            </h1>
            <p className="text-sm text-muted-foreground">
              የድምጽ እና የቪዲዮ መዝሙራት። ማንኛውም የተመዘገበ ሰው ሊያስቀምጥ ይችላል፤ ይዘቱ ከመታየቱ በፊት በአስተዳዳሪ ይጸድቃል።
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {editingId ? "መዝሙር አስተካክል" : "አዲስ መዝሙር ስቀል"}
            </h2>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" /> ሰርዝ
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">አርዕስት</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kind">አይነት</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audio">ድምጽ</SelectItem>
                  <SelectItem value="video">ቪዲዮ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">ምድብ (አማራጭ)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ለምሳሌ: ያሬዳዊ፣ ዘመናዊ፣ ወረብ"
                maxLength={60}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="external_url">የውጭ URL (አማራጭ — YouTube ወዘተ)</Label>
              <Input
                id="external_url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
                maxLength={500}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">መግለጫ (አማራጭ)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file">ፋይል {kind === "audio" ? "(ድምጽ)" : "(ቪዲዮ)"} — እስከ 50MB</Label>
            <Input
              id="file"
              type="file"
              accept={kind === "audio" ? "audio/*" : "video/*"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "በመላክ ላይ..." : editingId ? "አዘምን" : "ስቀል"}
          </Button>
        </form>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-8">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">ሁሉም</TabsTrigger>
            <TabsTrigger value="audio">ድምጽ</TabsTrigger>
            <TabsTrigger value="video">ቪዲዮ</TabsTrigger>
            <TabsTrigger value="mine">የእኔ</TabsTrigger>
            {isAdmin && <TabsTrigger value="pending">በመጠባበቅ</TabsTrigger>}
          </TabsList>

          <TabsContent value={tab} className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">በመጫን ላይ...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">መዝሙር የለም።</p>
            ) : (
              filtered.map((it) => {
                const canEdit = it.uploader_id === user?.id || isAdmin;
                const Icon = it.kind === "audio" ? Music : Video;
                const url = signedUrls[it.id] ?? null;
                return (
                  <article
                    key={it.id}
                    className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            {it.title}
                          </h3>
                          {it.status === "pending" && (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                              በመጠባበቅ
                            </span>
                          )}
                          {it.category && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                              {it.category}
                            </span>
                          )}
                        </div>
                        {it.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{it.description}</p>
                        )}
                        {url && it.kind === "audio" && (
                          <audio controls preload="none" src={url} className="mt-2 w-full" />
                        )}
                        {url && it.kind === "video" && (
                          <video controls preload="none" src={url} className="mt-2 w-full rounded-lg" />
                        )}
                        {!url && it.external_url && (
                          <a
                            href={it.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            ክፈት
                          </a>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                        {isAdmin && it.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approve(it)}
                            aria-label="Approve"
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(it)}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(it)}
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
