const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "src", "index.css");

const css = `

/* ===== Admin shell: professional typography & ink tone ===== */
/* Slightly darker, tighter headings with restrained, professional sizes. */
.admin-shell {
  --admin-ink: #0b0f17;
}
.admin-shell h1,
.admin-shell h2,
.admin-shell h3,
.admin-shell h4 {
  font-weight: 700;
  letter-spacing: -0.015em;
}
.admin-shell h1 {
  font-size: 1.5rem;
  line-height: 2rem;
}
.admin-shell h2 {
  font-size: 1.25rem;
  line-height: 1.75rem;
}
.admin-shell h3 {
  font-size: 1.0625rem;
  line-height: 1.5rem;
}
.admin-shell h4 {
  font-size: 0.95rem;
  line-height: 1.4rem;
}
/* Black-tone ink for headings in the light / primary admin variants. */
[data-theme="light"] .admin-shell h1,
[data-theme="light"] .admin-shell h2,
[data-theme="light"] .admin-shell h3,
[data-theme="primary"] .admin-shell h1,
[data-theme="primary"] .admin-shell h2,
[data-theme="primary"] .admin-shell h3 {
  color: var(--admin-ink);
}
`;

fs.appendFileSync(file, css, "utf8");
console.log("appended admin-shell typography to index.css");
