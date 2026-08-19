import { requireAuth } from "../_lib/auth.js";
import { getAllUsers, createUser, isSuperAdmin } from "../_lib/users.js";

export default requireAuth(async (req, res) => {
  const callerId = req.user?.uid;

  if (req.method === "GET") {
    const users = await getAllUsers();
    return res.status(200).json({ users });
  }

  if (req.method === "POST") {
    if (!isSuperAdmin(callerId)) {
      return res.status(403).json({ error: "Only super admins can create users" });
    }

    const { id, name, accessKey, access } = req.body || {};
    if (!id || !name || !accessKey) {
      return res.status(400).json({ error: "id, name, and accessKey are required" });
    }
    if (!/^[a-z0-9_]+$/.test(id)) {
      return res.status(400).json({ error: "id must be lowercase alphanumeric with underscores" });
    }

    try {
      const user = await createUser({ id, name, accessKey, access });
      return res.status(201).json({ user });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: "User already exists" });
      }
      throw err;
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
