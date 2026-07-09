import { createServerFn } from "@tanstack/react-start";

export type CaseSubmission = {
  full_name: string;
  batch: string;
  department: string;
  section: string;
  dormitory: string;
  phone: string;
  telegram: string;
  case_detail: string;
};

function formatMessage(d: CaseSubmission) {
  return (
    `🚨 አዲስ የኬዝ መመዝገቢያ ፎርም ደርሷል 🚨\n\n` +
    `• ስም: ${d.full_name || "-"}\n` +
    `• Batch: ${d.batch || "-"}\n` +
    `• ትምህርት ክፍል: ${d.department || "-"} - ${d.section || "-"}\n` +
    `• ዶርም: ${d.dormitory || "-"}\n` +
    `• ስልክ ቁጥር: ${d.phone || "-"}\n` +
    `• ቴሌግራም: ${d.telegram || "-"}\n` +
    `• የኬዙ ዝርዝር:\n${d.case_detail || "-"}`
  );
}

export const sendCaseToTelegram = createServerFn({ method: "POST" })
  .inputValidator((data: CaseSubmission) => data)
  .handler(async ({ data }) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error(
        "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured. Please set them in project secrets.",
      );
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatMessage(data),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok || (body && body.ok === false)) {
      throw new Error(
        `Telegram send failed [${res.status}]: ${body?.description ?? "unknown error"}`,
      );
    }
    return { ok: true as const };
  });
