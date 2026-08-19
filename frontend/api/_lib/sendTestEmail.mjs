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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

const target = process.argv[2] || "gallagepasinduhansana@gmail.com";
const { sendCalendarReminder } = await import("./email.js");

console.log("provider:", process.env.EMAIL_PROVIDER || "(none -> log)");
console.log("from:", process.env.EMAIL_FROM || "(default)");
console.log("smtp:", process.env.EMAIL_SMTP_HOST || "smtp.gmail.com", ":", process.env.EMAIL_SMTP_PORT || 465);
console.log("to:", target);
console.log("--- sending ---");

const res = await sendCalendarReminder({
  to: target,
  subject: "NexCode Calendar - Test Reminder",
  text:
    "This is a test email from your NexCode Calendar reminder system.\n\n" +
    "If you received this, your SMTP/email configuration is working correctly.",
  html:
    "<p>This is a <b>test email</b> from your NexCode Calendar reminder system.</p>" +
    "<p>If you received this, your email configuration is working correctly.</p>",
});

console.log("--- result ---");
console.log(JSON.stringify(res, null, 2));
process.exit(res.ok ? 0 : 1);
