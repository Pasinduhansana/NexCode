// Email delivery abstraction for calendar reminders.
//
// The calendar/reminder system depends ONLY on this module, never on a
// concrete provider, so the provider can be swapped via environment variables:
//
//   EMAIL_PROVIDER = "resend" | "brevo" | "gmail" | "smtp" | "log" | (empty → "log")
//   EMAIL_API_KEY  = provider API key (Resend/Brevo only; server-side ONLY)
//   EMAIL_FROM     = sender address, e.g. "NexCode <norecode@nexcode.dev>"
//                    (For Gmail this must equal the Gmail address.)
//
// --- Gmail / generic SMTP (free, no API key) -------------------------------
//   EMAIL_SMTP_USER = your full Gmail address (e.g. you@gmail.com)
//   EMAIL_SMTP_PASS = a Gmail "App Password" (16 chars) - NOT your login
//                     password. Generate at: Google Account > Security >
//                     2-Step Verification > App passwords (2SV must be ON).
//   EMAIL_SMTP_HOST = default "smtp.gmail.com"
//   EMAIL_SMTP_PORT = default 465 (SSL); use 587 for STARTTLS.
//
// No credentials ever leave the server. The frontend never sees them.
//
// No credentials ever leave the server. The frontend never sees them.

function getProvider() {
  const provider = (process.env.EMAIL_PROVIDER || "log").trim().toLowerCase();
  return provider;
}

function getFrom() {
  return process.env.EMAIL_FROM || "NexCode Calendar <noreply@nexcode.dev>";
}

function mask(value) {
  if (!value) return "(none)";
  if (value.length <= 6) return "******";
  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

function log(level, payload) {
  const line = `[email:${level}] ${JSON.stringify(payload)}`;
  if (level === "error") console.error(line);
  else console.log(line);
}

async function sendWithResend({ to, subject, text, html }) {
  const apiKey = process.env.EMAIL_API_KEY;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFrom(),
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html: html || text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend responded ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.status;
}

async function sendWithBrevo({ to, subject, text, html }) {
  const apiKey = process.env.EMAIL_API_KEY;
  const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: getFrom().replace(/^.*<(.*)>$/, "$1") },
      to: recipients,
      subject,
      textContent: text,
      htmlContent: html || text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo responded ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.status;
}

async function sendWithSmtp({ to, subject, text, html }) {
  const fromAddress = getFrom();
  const user = process.env.EMAIL_SMTP_USER || fromAddress.replace(/^.*<(.*)>$/, "$1");
  const pass = process.env.EMAIL_SMTP_PASS;
  const host = process.env.EMAIL_SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_SMTP_PORT || 465);
  const secure = port === 465;

  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: true },
  });
  await transporter.sendMail({
    from: fromAddress,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html: html || text,
  });
  return 200;
}

async function sendWithLog({ to, subject }) {
  log("send", {
    provider: "log",
    to: Array.isArray(to) ? to : [to],
    from: getFrom(),
    subject,
    note: "EMAIL_API_KEY not configured — logging only (no real email sent)",
  });
  return 200;
}

export async function sendCalendarReminder({ to, subject, text, html, meta = {} }) {
  if (!to) {
    log("skip", { reason: "no recipient", meta });
    return { ok: false, skipped: true, reason: "no_recipient" };
  }

  const provider = getProvider();
  const startedAt = Date.now();

  try {
    let status = 200;
    if (provider === "resend") {
      if (!process.env.EMAIL_API_KEY) return await logFallback({ to, subject, text, html });
      status = await sendWithResend({ to, subject, text, html });
    } else if (provider === "brevo") {
      if (!process.env.EMAIL_API_KEY) return await logFallback({ to, subject, text, html });
      status = await sendWithBrevo({ to, subject, text, html });
    } else if (provider === "gmail" || provider === "smtp") {
      if (!process.env.EMAIL_SMTP_PASS) return await logFallback({ to, subject, text, html });
      status = await sendWithSmtp({ to, subject, text, html });
    } else {
      status = await sendWithLog({ to, subject });
    }

    log("sent", {
      provider,
      to: Array.isArray(to) ? to : [to],
      subject,
      status,
      meta,
      durationMs: Date.now() - startedAt,
    });
    return { ok: true, provider, status };
  } catch (err) {
    log("error", {
      provider,
      to: Array.isArray(to) ? to : [to],
      subject,
      error: err.message,
      apiKeyPresent: Boolean(process.env.EMAIL_API_KEY),
      durationMs: Date.now() - startedAt,
    });
    return { ok: false, provider, error: err.message };
  }
}

async function logFallback({ to, subject, text, html }) {
  return sendWithLog({ to, subject, text, html });
}

// Resolves the recipient address for a user (used by the reminder scheduler).
// Falls back to a configured default. Never returns a credential.
export function getUserEmailSafe(user) {
  if (user && user.email && String(user.email).includes("@")) return String(user.email).trim();
  if (process.env.DEFAULT_REMINDER_EMAIL && process.env.DEFAULT_REMINDER_EMAIL.includes("@")) {
    return process.env.DEFAULT_REMINDER_EMAIL;
  }
  return null;
}

export { getProvider, getFrom, mask };
