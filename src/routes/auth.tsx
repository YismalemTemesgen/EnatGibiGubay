import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ግባ ወይም ይመዝገቡ — ግቢ ጉባዬ" },
      { name: "description", content: "Sign in or register for Wolkite University Gibi Gubaye." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("ትክክለኛ ኢሜይል ያስገቡ").max(255);
const passwordSchema = z.string().min(8, "የይለፍ ቃል ቢያንስ 8 ፊደላት ይኑረው").max(72);
const nameSchema = z.string().trim().min(2, "ስም ያስገቡ").max(100);

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const email = emailSchema.parse(loginEmail);
      const password = passwordSchema.parse(loginPassword);
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("እንኳን ደህና መጡ!");
      navigate({ to: "/", replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "መግባት አልተሳካም");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      const full_name = nameSchema.parse(signupName);
      const email = emailSchema.parse(signupEmail);
      const password = passwordSchema.parse(signupPassword);
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name },
        },
      });
      if (error) throw error;
      toast.success("በተሳካ ሁኔታ ተመዝግበዋል");
      navigate({ to: "/", replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "መመዝገብ አልተሳካም");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google መግባት አልተሳካም");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky/20 via-background to-background px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-6 flex flex-col items-center gap-2">
          <img src={logoAsset.url} alt="logo" className="h-20 w-20 rounded-full ring-4 ring-primary/30" />
          <h1 className="text-center font-display text-xl font-bold text-primary">
            ወልቂጤ ዩኒቨርሲቲ ግቢ ጉባዬ
          </h1>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">ግባ</TabsTrigger>
              <TabsTrigger value="signup">ይመዝገቡ</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="le">ኢሜይል</Label>
                  <Input id="le" type="email" autoComplete="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="lp">የይለፍ ቃል</Label>
                  <Input id="lp" type="password" autoComplete="current-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "..." : "ግባ"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="sn">ሙሉ ስም</Label>
                  <Input id="sn" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="se">ኢሜይል</Label>
                  <Input id="se" type="email" autoComplete="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="sp">የይለፍ ቃል (ቢያንስ 8 ፊደላት)</Label>
                  <Input id="sp" type="password" autoComplete="new-password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "..." : "ይመዝገቡ"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>ወይም</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.59 6.59 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            በ Google ይግቡ
          </Button>
        </div>
      </div>
    </div>
  );
}
