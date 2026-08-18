import { requireAuth } from "../../_lib/auth.js";
import { changePassword, isSuperAdmin } from "../../_lib/users.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const callerId = req.user?.uid;
  const { newPassword } = req.body || {};

  if (!id || !newPassword) {
    return res.status(400).json({ error: "id and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  if (!isSuperAdmin(callerId) && callerId !== id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  await changePassword(id, newPassword);
  return res.status(200).json({ ok: true });
});
