import { config } from "./config.js";

export async function sendEmail({ to, subject, text, replyTo = config.replyTo }) {
  if (!to) return;
  if (!config.resendApiKey) {
    console.log(`[email] (not sent, RESEND_API_KEY unset) to=${to} subject=${subject}\n${text}`);
    return;
  }
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: config.emailFrom, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!resp.ok) {
    console.error(`[email] failed (${resp.status}):`, await resp.text());
  }
}
