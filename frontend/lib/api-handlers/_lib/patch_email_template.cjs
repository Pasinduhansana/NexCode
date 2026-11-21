const fs = require("fs");
const path = require("path");
const dir = __dirname;
const target = path.join(dir, "reminders.js");
const src = fs.readFileSync(target, "utf8");
const newFn = fs.readFileSync(path.join(dir, "new_template.txt"), "utf8").trim();

const re = /function buildEmailContent\(\{ payload \}\) \{[\s\S]*?return \{ subject, text, html \};\s*\}/;
if (!re.test(src)) {
  console.error("PATTERN_NOT_FOUND");
  process.exit(1);
}
const out = src.replace(re, newFn);
fs.writeFileSync(target, out, "utf8");
console.log("PATCHED");
fs.unlinkSync(path.join(dir, "new_template.txt"));
fs.unlinkSync(__filename);
