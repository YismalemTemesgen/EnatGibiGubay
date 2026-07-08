import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/lib/use-auth";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Paperclip, Pencil, X, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/notices")({
  head: () => ({ meta: [{ title: "ማስታወቂያ — ግቢ ጉባዬ" }] }),
  component: NoticesPage,
});

const schema = z.object({
  title: z.string().trim().min(2).max(160),
  body: z.string().trim().min(2).max(4000),
  category: z.string().trim().max(60).optional().or(z.literal("")),
});

type Notice = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
};

function NoticesPage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Notice[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // Pre-sign attachment URLs
    (async () => {
      const next: Record<string, string> = {};
      for (const n of items) {
        if (n.attachment_url) {
          const { data } = await supabase.storage
            .from("notices")
            .createSignedUrl(n.attachment_url, 3600);
          if (data?.signedUrl) next[n.id] = data.signedUrl;
        }
      }
      setSignedUrls(next);
    })();
  }, [items]);

  function resetForm() {
    setTitle("");
    setBody("");
    setCategory("");
    setFile(null);
    setEditingId(null);
  }

  function startEdit(n: Notice) {
    setEditingId(n.id);
    setTitle(n.title);
    setBody(n.body);
    setCategory(n.category ?? "");
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ title, body, category });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      let attachment_url: string | null = null;
      let attachment_type: string | null = null;
      if (file) {
        if (file.size > 20 * 1024 * 1024) throw new Error("File must be under 20MB");
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("notices")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        attachment_url = path;
        attachment_type = file.type;
      }

      if (editingId) {
        const update = {
          title: parsed.data.title,
          body: parsed.data.body,
          category: parsed.data.category || null,
          ...(attachment_url ? { attachment_url, attachment_type } : {}),
        };
        const { error } = await supabase.from("notices").update(update).eq("id", editingId);
        if (error) throw error;
        toast.success("ማስታወቂያ ተስተካክሏል");
      } else {
        const { error } = await supabase.from("notices").insert({
          author_id: user.id,
          title: parsed.data.title,
          body: parsed.data.body,
          category: parsed.data.category || null,
          attachment_url,
          attachment_type,
        });
        if (error) throw error;
        toast.success("ማስታወቂያ ተለጥፏል");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(n: Notice) {
    if (!confirm("ይህን ማስታወቂያ ይሰረዝ?")) return;
    const { error } = await supabase.from("notices").delete().eq("id", n.id);
    if (error) return toast.error(error.message);
    if (n.attachment_url) {
      await supabase.storage.from("notices").remove([n.attachment_url]);
    }
    toast.success("ተሰርዟል");
    load();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> ተመለስ
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-primary sm:text-3xl">ማስታወቂያ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ማስታወቂያ ካሎት እዚህ ያስገቡ
        </p>

        <form
          onSubmit={submit}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {editingId ? "ማስታወቂያ አስተካክል" : "አዲስ ማስታወቂያ ለጥፍ"}
            </h2>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" /> ሰርዝ
              </Button>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">አርዕስት</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">ምድብ (አማራጭ)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="ለምሳሌ: ስብሰባ፣ ትምህርት፣ መርሐ ግብር"
              maxLength={60}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">ይዘት</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} required rows={5} maxLength={4000} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file">ፋይል (አማራጭ) — PDF, ምስል, ቪዲዮ</Label>
            <Input
              id="file"
              type="file"
              accept="image/*,application/pdf,video/*,audio/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "በመላክ ላይ..." : editingId ? "አዘምን" : "ለጥፍ"}
          </Button>
        </form>

        <section className="mt-8 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">በመጫን ላይ...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">እስካሁን ማስታወቂያ የለም።</p>
          ) : (
            items.map((n) => {
              const canEdit = user?.id === n.author_id || isAdmin;
              return (
                <article
                  key={n.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{n.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <time>{new Date(n.created_at).toLocaleString()}</time>
                        {n.category && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                            {n.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => startEdit(n)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(n)}
                          aria-label="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{n.body}</p>
                  {n.attachment_url && signedUrls[n.id] && (
                    <a
                      href={signedUrls[n.id]}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Paperclip className="h-4 w-4" /> ተያያዥ ፋይል ይክፈቱ
                    </a>
                  )}
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
