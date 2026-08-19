import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const raw of fs.readFileSync(envPath, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    val = val.replace(/\s+#.*$/, "");
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}

const target = process.argv[2] || "gallagepasinduhansana@gmail.com";
const from = process.env.EMAIL_FROM || "info@nexcode.lk";
const user = process.env.EMAIL_SMTP_USER || from.replace(/^.*<(.*)>$/, "$1");
const pass = process.env.EMAIL_SMTP_PASS;
const host = process.env.EMAIL_SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.EMAIL_SMTP_PORT || 465);

console.log("host:", host, "port:", port, "user:", user, "from:", from);
console.log("--- connecting & sending (TLS verification relaxed for test) ---");

const nodemailer = (await import("nodemailer")).default;
const transporter = nodemailer.createTransport({
  host, port, secure: port === 465,
  auth: { user, pass },
  tls: { rejectUnauthorized: false },
});

try {
  const info = await transporter.sendMail({
    from, to: target,
    subject: "NexCode Calendar - Test Reminder",
    text: "Test email from NexCode Calendar reminder system. Your SMTP credentials work.",
    html: "<p>Test email from <b>NexCode Calendar</b> reminder system. Your SMTP credentials work.</p>",
  });
  console.log("--- SENT OK ---");
  console.log("messageId:", info.messageId);
  console.log("accepted:", info.accepted);
  process.exit(0);
} catch (e) {
  console.log("--- FAILED ---");
  console.log("error:", e.message);
  process.exit(1);
}
