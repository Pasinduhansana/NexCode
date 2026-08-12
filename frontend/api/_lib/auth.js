import jwt from "jsonwebtoken";

export function signToken(payload = {}) {
  return jwt.sign({ role: "admin", ...payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function getToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export function requireAuth(handler) {
  return async (req, res) => {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      req.user = verifyToken(token);
      return await handler(req, res);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
