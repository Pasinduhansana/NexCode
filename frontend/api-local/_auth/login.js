import { signToken } from "../_lib/auth.js";
import { getUserByCredentials, isSuperAdmin, ensureDefaultUsers } from "../_lib/users.js";
import { logActivity } from "../_lib/activity.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await ensureDefaultUsers().catch(() => {});

  const { accessKey } = req.body || {};

  const user = await getUserByCredentials(accessKey);
  if (!user) {
    return res.status(401).json({ error: "Invalid access key" });
  }

  const token = signToken({
    uid: user._id,
    name: user.name,
    superAdmin: user.superAdmin,
    access: user.access,
  });

  await logActivity(
    { uid: user._id, name: user.name },
    { action: "login", targetType: "auth", target: "Admin panel", details: {} }
  ).catch(() => {});

  return res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      superAdmin: user.superAdmin,
      access: user.access,
    },
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}
