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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Pencil, X, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/feedback")({
  head: () => ({ meta: [{ title: "ጥያቄ እና አስተያየት — ግቢ ጉባዬ" }] }),
  component: FeedbackPage,
});

type Category = "other_religion" | "tewahedo" | "about_gbi" | "suggestion";
type Status = "open" | "answered" | "closed";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "other_religion", label: "1. ከሌላ ሃይማኖት የመጡ ጥያቄዎች" },
  { value: "tewahedo", label: "2. ስለ ቤተክርስቲያናችን እና ስለ ተዋህዶ እምነታችን" },
  { value: "about_gbi", label: "3. ስለ ግቢ ጉባየአችን" },
  { value: "suggestion", label: "4. አስተያየት እና መልክት" },
];

const CAT_LABEL: Record<Category, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
) as Record<Category, string>;

const STATUS_LABEL: Record<Status, string> = {
  open: "ክፍት",
  answered: "ተመልሷል",
  closed: "ተዘግቷል",
};

const schema = z.object({
  category: z.enum(["other_religion", "tewahedo", "about_gbi", "suggestion"]),
  subject: z.string().trim().min(2, "ርዕስ ያስፈልጋል").max(200),
  body: z.string().trim().min(2, "መልክት ያስፈልጋል").max(4000),
  contact: z.string().trim().max(200).optional().or(z.literal("")),
  is_anonymous: z.boolean(),
});

type Item = {
  id: string;
  user_id: string;
  category: Category;
  subject: string;
  body: string;
  is_anonymous: boolean;
  contact: string | null;
  status: Status;
  admin_reply: string | null;
  replied_by: string | null;
  replied_at: string | null;
  created_at: string;
};

function FeedbackPage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"mine" | "all" | Category>("mine");

  const [editing, setEditing] = useState<Item | null>(null);
  const [category, setCategory] = useState<Category>("about_gbi");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [contact, setContact] = useState("");
  const [anon, setAnon] = useState(false);
  const [saving, setSaving] = useState(false);

  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("feedback_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Item[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setCategory("about_gbi");
    setSubject("");
    setBody("");
    setContact("");
    setAnon(false);
  };

  const startEdit = (it: Item) => {
    setEditing(it);
    setCategory(it.category);
    setSubject(it.subject);
    setBody(it.body);
    setContact(it.contact ?? "");
    setAnon(it.is_anonymous);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!user) return;
    const parsed = schema.safeParse({ category, subject, body, contact, is_anonymous: anon });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSaving(true);
    const payload = {
      category: parsed.data.category,
      subject: parsed.data.subject,
      body: parsed.data.body,
      contact: parsed.data.contact || null,
      is_anonymous: parsed.data.is_anonymous,
    };
    const { error } = editing
      ? await supabase.from("feedback_items").update(payload).eq("id", editing.id)
      : await supabase.from("feedback_items").insert({ ...payload, user_id: user.id });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "ተስተካክሏል" : "ተልኳል");
    resetForm();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("ይህን መልክት ይሰረዝ?")) return;
    const { error } = await supabase.from("feedback_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("ተሰርዟል");
      load();
    }
  };

  const sendReply = async (it: Item) => {
    if (!user) return;
    const reply = (replyDraft[it.id] ?? it.admin_reply ?? "").trim();
    if (!reply) {
      toast.error("መልስ ባዶ ሊሆን አይችልም");
      return;
    }
    const { error } = await supabase
      .from("feedback_items")
      .update({
        admin_reply: reply,
        replied_by: user.id,
        replied_at: new Date().toISOString(),
        status: "answered",
      })
      .eq("id", it.id);
    if (error) toast.error(error.message);
    else {
      toast.success("መልስ ተልኳል");
      setReplyDraft((d) => {
        const n = { ...d };
        delete n[it.id];
        return n;
      });
      load();
    }
  };

  const setStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("feedback_items").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const visible = useMemo(() => {
    let list = items;
    if (tab === "mine") list = list.filter((i) => i.user_id === user?.id);
    else if (tab !== "all") list = list.filter((i) => i.category === tab);
    return list;
  }, [items, tab, user?.id]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <BackToHome className="mb-4" />
        <header>
          <h1 className="font-display text-3xl font-bold text-primary">
            ጥያቄ እና አስተያየት
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ጥያቄዎችን፣ አስተያየቶችን እና መልክቶችን ለግቢ ጉባዬ አስተዳዳሪዎች ይላኩ።
          </p>
        </header>

        {/* Form */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {editing ? "መልክት ማስተካከያ" : "አዲስ መልክት"}
            </h2>
            {editing && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="mr-1 h-4 w-4" /> ሰርዝ
              </Button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>ምድብ</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>ርዕስ</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                placeholder="የመልክት ርዕስ"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>መልክት</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={4000}
                rows={6}
                placeholder="ጥያቄዎን ወይም አስተያየትዎን በዝርዝር ይጻፉ..."
              />
            </div>
            <div>
              <Label>አድራሻ (አማራጭ)</Label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={200}
                placeholder="ስልክ ወይም ኢሜል"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={anon}
                  onCheckedChange={(v) => setAnon(Boolean(v))}
                />
                ስም ሳልገልጽ ላክ
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={submit} disabled={saving}>
              <Send className="mr-1 h-4 w-4" />
              {saving ? "በመላክ ላይ..." : editing ? "አስቀምጥ" : "ላክ"}
            </Button>
          </div>
        </section>

        {/* List */}
        <section>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="flex flex-wrap h-auto">
              <TabsTrigger value="mine">የእኔ</TabsTrigger>
              {isAdmin && <TabsTrigger value="all">ሁሉም</TabsTrigger>}
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>
                  {c.label.split(".")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={tab} className="mt-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">በመጫን ላይ...</p>
              ) : visible.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  ምንም መልክት የለም
                </div>
              ) : (
                <ul className="space-y-3">
                  {visible.map((it) => {
                    const mine = it.user_id === user?.id;
                    const canEdit = (mine && it.status === "open") || isAdmin;
                    return (
                      <li
                        key={it.id}
                        className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">{CAT_LABEL[it.category]}</Badge>
                              <Badge
                                variant={
                                  it.status === "answered"
                                    ? "default"
                                    : it.status === "closed"
                                      ? "outline"
                                      : "secondary"
                                }
                              >
                                {STATUS_LABEL[it.status]}
                              </Badge>
                              {it.is_anonymous && <Badge variant="outline">ስም አልባ</Badge>}
                              {mine && <Badge variant="outline">የእኔ</Badge>}
                            </div>
                            <h3 className="mt-2 font-semibold">{it.subject}</h3>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
                              {it.body}
                            </p>
                            {it.contact && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                አድራሻ: {it.contact}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(it.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEdit(it)}
                                title="አስተካክል"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(it.id)}
                                title="ሰርዝ"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {it.admin_reply && (
                          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                            <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                              <CheckCircle2 className="h-3 w-3" /> የአስተዳዳሪ መልስ
                            </div>
                            <p className="mt-1 whitespace-pre-wrap text-sm">
                              {it.admin_reply}
                            </p>
                            {it.replied_at && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {new Date(it.replied_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        {isAdmin && (
                          <div className="mt-3 space-y-2 border-t border-border pt-3">
                            <Textarea
                              rows={2}
                              placeholder="መልስ ይጻፉ..."
                              value={replyDraft[it.id] ?? it.admin_reply ?? ""}
                              onChange={(e) =>
                                setReplyDraft((d) => ({ ...d, [it.id]: e.target.value }))
                              }
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" onClick={() => sendReply(it)}>
                                <Send className="mr-1 h-3 w-3" /> መልስ ላክ
                              </Button>
                              <Select
                                value={it.status}
                                onValueChange={(v) => setStatus(it.id, v as Status)}
                              >
                                <SelectTrigger className="h-9 w-[160px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">ክፍት</SelectItem>
                                  <SelectItem value="answered">ተመልሷል</SelectItem>
                                  <SelectItem value="closed">ተዘግቷል</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
