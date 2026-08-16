import { requireAuth } from "../_lib/auth.js";
import { getAllUsers, isSuperAdmin } from "../_lib/users.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const callerId = req.user?.uid;
  const users = await getAllUsers();

  if (!isSuperAdmin(callerId)) {
    const safe = users.map(({ _id, name, superAdmin, access }) => ({
      id: _id,
      name,
      superAdmin,
      access,
    }));
    return res.status(200).json({ users: safe });
  }

  const full = users.map(({ _id, name, superAdmin, access, createdAt }) => ({
    id: _id,
    name,
    superAdmin,
    access,
    createdAt,
  }));
  return res.status(200).json({ users: full });
});
