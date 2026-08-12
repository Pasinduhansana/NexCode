import { verifyToken, getToken } from "../_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ valid: false, error: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    return res.status(200).json({
      valid: true,
      user: { id: payload.uid, name: payload.name },
      role: payload.role,
    });
  } catch (err) {
    return res.status(401).json({ valid: false, error: "Invalid or expired token" });
  }
}
