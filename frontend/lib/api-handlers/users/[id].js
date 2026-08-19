import { requireAuth } from "../_lib/auth.js";
import { getUserById, updateUser, deleteUser, isSuperAdmin } from "../_lib/users.js";

export default requireAuth(async (req, res) => {
  const { id } = req.query;
  const callerId = req.user?.uid;

  if (!id) {
    return res.status(400).json({ error: "User id is required" });
  }

  if (req.method === "GET") {
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ user });
  }

  if (req.method === "PUT") {
    if (!isSuperAdmin(callerId) && callerId !== id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { name, access } = req.body || {};
    const updates = {};
    if (name) updates.name = name;
    if (access && isSuperAdmin(callerId)) updates.access = access;

    const user = await updateUser(id, updates);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ user });
  }

  if (req.method === "DELETE") {
    if (!isSuperAdmin(callerId)) {
      return res.status(403).json({ error: "Only super admins can delete users" });
    }
    if (isSuperAdmin(id)) {
      return res.status(400).json({ error: "Cannot delete super admin" });
    }

    await deleteUser(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
