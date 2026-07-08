import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/lib/use-auth";
import { SiteHeader } from "@/components/site-header";
import { BackToHome } from "@/components/back-to-home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "ቅንብር — ግቢ ጉባዬ" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, department, academic_year")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setPhone(data.phone ?? "");
          setDepartment(data.department ?? "");
          setYear(data.academic_year ?? "");
        }
      });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName.trim().slice(0, 100),
        phone: phone.trim().slice(0, 30),
        department: department.trim().slice(0, 100),
        academic_year: year.trim().slice(0, 30),
      });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("ተቀምጧል");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <BackToHome className="mb-4" />
        <Link to="/" className="text-sm text-primary hover:underline">← መግቢያ</Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-primary">ቅንብር</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>

        {isAdmin && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm">
            <Shield className="h-4 w-4" /> እርስዎ Administrator ነዎት
          </div>
        )}

        <form onSubmit={save} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div>
            <Label htmlFor="n">ሙሉ ስም</Label>
            <Input id="n" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
          </div>
          <div>
            <Label htmlFor="p">ስልክ</Label>
            <Input id="p" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
          </div>
          <div>
            <Label htmlFor="d">የትምህርት ክፍል</Label>
            <Input id="d" value={department} onChange={(e) => setDepartment(e.target.value)} maxLength={100} />
          </div>
          <div>
            <Label htmlFor="y">አመት</Label>
            <Input id="y" value={year} onChange={(e) => setYear(e.target.value)} maxLength={30} />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "..." : "አስቀምጥ"}</Button>
        </form>
      </main>
    </div>
  );
}
