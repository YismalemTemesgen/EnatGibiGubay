import logoAsset from "@/assets/logo.png.asset.json";
import { Mail, Bot, Send, Youtube, Instagram, Music2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#0b1c3a] text-white">
      <div className="ethiopia-stripe h-1 w-full" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        {/* Left: Logo & description */}
        <div className="flex gap-4">
          <img
            src={logoAsset.url}
            alt="ግቢ ጉባዬ"
            className="h-16 w-16 shrink-0 rounded-full ring-2 ring-gold/60"
          />
          <div>
            <h3 className="font-display text-lg font-bold text-gold">የወልቂጤ ዩኒቨርሲቲ</h3>
            <p className="text-sm font-medium text-white/90">ግቢ ጉባኤ</p>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              "እንኳን ደህና መጣችሁ።" የተባረከ ቤት እንዲሆንላችሁ ይመንከሩ።
            </p>
          </div>
        </div>

        {/* Middle: Contact */}
        <div>
          <h3 className="font-display text-lg font-bold text-gold">ግንኙነት</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <a href="mailto:wkugibigubaye@gmail.com" className="hover:text-gold">
                wkugibigubaye@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Bot className="h-4 w-4 shrink-0 text-gold" />
              <a href="https://t.me/wkugg_bot" className="hover:text-gold">
                @wkugg_bot
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Send className="h-4 w-4 shrink-0 text-gold" />
              <a href="https://t.me/wku_gg_media" className="hover:text-gold">
                @wku_gg_media
              </a>
            </li>
          </ul>
        </div>

        {/* Right: Social */}
        <div>
          <h3 className="font-display text-lg font-bold text-gold">ማህበራዊ ሚዲያ</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { icon: Send, href: "https://t.me/wku_gg_media", label: "Telegram" },
              { icon: Bot, href: "https://t.me/wkugg_bot", label: "Bot" },
              { icon: Music2, href: "#", label: "TikTok" },
              { icon: Youtube, href: "#", label: "YouTube" },
              { icon: Instagram, href: "#", label: "Instagram" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:border-gold hover:bg-gold/10 hover:text-gold"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-white/80">
          © 2026 WKU Gibi Gubaye • Orthodox Christian Student Union
        </p>
      </div>
    </footer>
  );
}
