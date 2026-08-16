import { requireAuth } from "./_lib/auth.js";
import { getUsers } from "./_lib/users.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const users = getUsers().map(({ id, name }) => ({ id, name }));
  return res.status(200).json({ users });
});
