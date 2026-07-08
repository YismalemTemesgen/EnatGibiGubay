import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/logo.png.asset.json";
import { LogOut, Settings, Shield } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function SiteHeader() {
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="ethiopia-stripe h-1 w-full" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="ግቢ ጉባዬ" className="h-10 w-10 rounded-full ring-2 ring-primary/30" />
          <div className="leading-tight">
            <div className="font-display text-sm font-bold text-primary sm:text-base">
              ወልቂጤ ዩኒቨርሲቲ
            </div>
            <div className="text-[11px] text-muted-foreground sm:text-xs">ግቢ ጉባዬ መተገበሪያ</div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          {isAdmin && (
            <span className="hidden items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-xs font-medium text-foreground sm:inline-flex">
              <Shield className="h-3 w-3" /> Admin
            </span>
          )}
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">ቅንብር</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">ውጣ</span>
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">ግባ</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
