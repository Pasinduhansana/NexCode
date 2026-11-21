export default async function health(req, res) {
  // Simple health‑check endpoint – returns OK status.
  res.status(200).json({ ok: true, timestamp: Date.now() });
}