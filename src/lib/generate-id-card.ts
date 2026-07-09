import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import logoAsset from "@/assets/logo.png.asset.json";

export type IdCardData = {
  id: string;
  full_name: string;
  department?: string | null;
  academic_year?: string | null;
  baptism_name?: string | null;
  phone?: string | null;
};

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

async function buildCardEl(data: IdCardData, qrDataUrl: string): Promise<HTMLDivElement> {
  const wrap = document.createElement("div");
  wrap.style.position = "fixed";
  wrap.style.left = "-10000px";
  wrap.style.top = "0";
  wrap.style.width = "720px";
  wrap.style.zIndex = "-1";
  wrap.style.fontFamily =
    "'Noto Sans Ethiopic', 'Noto Serif Ethiopic', system-ui, -apple-system, sans-serif";

  const dept = [data.department, data.academic_year].filter(Boolean).join(" • ") || "—";

  wrap.innerHTML = `
    <div style="width:720px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15);border:1px solid #e5e7eb;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0b1c3a 0%,#14315f 100%);padding:22px 28px;display:flex;align-items:center;gap:16px;color:#fff;">
        <img src="${logoAsset.url}" alt="logo" crossorigin="anonymous"
          style="height:64px;width:64px;border-radius:50%;border:2px solid #d4af37;background:#fff;object-fit:cover;" />
        <div style="flex:1;">
          <div style="font-size:20px;font-weight:700;line-height:1.2;">የወልቂጤ ዩኒቨርሲቲ</div>
          <div style="font-size:16px;font-weight:600;color:#d4af37;letter-spacing:2px;margin-top:2px;">GIBI GUBAYE</div>
        </div>
        <img src="${logoAsset.url}" alt="logo" crossorigin="anonymous"
          style="height:64px;width:64px;border-radius:50%;border:2px solid #d4af37;background:#fff;object-fit:cover;" />
      </div>

      <!-- Ethiopia stripe -->
      <div style="height:6px;background:linear-gradient(to right,#078930 33.33%,#fcdd09 33.33%,#fcdd09 66.66%,#da121a 66.66%);"></div>

      <!-- Body -->
      <div style="padding:32px 28px 20px;text-align:center;">
        <div style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;">Member Identification</div>
        <div style="font-size:30px;font-weight:800;color:#0b1c3a;margin-top:8px;line-height:1.2;">${esc(
          data.full_name,
        )}</div>
        ${
          data.baptism_name
            ? `<div style="font-size:15px;color:#6b7280;margin-top:4px;">የክርስትና ስም: ${esc(data.baptism_name)}</div>`
            : ""
        }
        <div style="font-size:17px;color:#14315f;font-weight:600;margin-top:12px;">${esc(dept)}</div>

        <div style="margin:24px auto 8px;display:inline-block;padding:16px;background:#fff;border:2px solid #0b1c3a;border-radius:16px;">
          <img src="${qrDataUrl}" alt="QR" style="display:block;width:220px;height:220px;" />
        </div>
        <div style="font-size:13px;color:#0b1c3a;font-weight:700;letter-spacing:2px;margin-top:8px;">
          SHOW THIS CODE AT EVERY GUBA'E
        </div>
        <div style="font-size:11px;color:#9ca3af;margin-top:6px;font-family:monospace;">ID: ${esc(data.id)}</div>
      </div>

      <!-- Footer -->
      <div style="background:#0b1c3a;color:#fff;padding:18px 28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;">
          <div style="font-size:13px;line-height:1.6;">
            <div>✉ wkugibigubaye@gmail.com</div>
            <div>🤖 @wkugg_bot &nbsp; · &nbsp; 📣 @wku_gg_media</div>
          </div>
          <div style="display:flex;gap:8px;">
            ${["TG", "YT", "IG", "TT"]
              .map(
                (s) =>
                  `<div style="width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:10px;color:#d4af37;font-weight:700;">${s}</div>`,
              )
              .join("")}
          </div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.15);margin-top:12px;padding-top:10px;text-align:center;font-size:11px;color:rgba(255,255,255,.75);">
          © 2026 WKU Gibi Gubaye • Orthodox Christian Student Union
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  return wrap;
}

export async function generateIdCardPdf(data: IdCardData): Promise<void> {
  const payload = JSON.stringify({
    id: data.id,
    name: data.full_name,
    dept: data.department ?? "",
    year: data.academic_year ?? "",
    org: "WKU-GG",
  });
  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#0b1c3a", light: "#ffffff" },
  });

  const el = await buildCardEl(data, qrDataUrl);
  // Wait a tick for fonts/images
  await new Promise((r) => setTimeout(r, 150));
  try {
    const canvas = await html2canvas(el.firstElementChild as HTMLElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 36;
    const maxW = pageW - margin * 2;
    const ratio = canvas.height / canvas.width;
    const w = maxW;
    const h = Math.min(w * ratio, pageH - margin * 2);
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;
    pdf.addImage(imgData, "PNG", x, y, w, h, undefined, "FAST");
    const safeName = data.full_name.replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 40) || "member";
    pdf.save(`gibi-gubaye-id-${safeName}.pdf`);
  } finally {
    el.remove();
  }
}
