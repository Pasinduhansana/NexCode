import jwt from "jsonwebtoken";
import { startTimer, endTimer, logPerf, roundMs } from "./perf.js";

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
    const apiStart = startTimer();
    const label = `${req.method} ${req.url}`;
    logPerf("API_START", label);
    const authStart = startTimer();
    const token = getToken(req);
    if (!token) {
      logPerf("API_AUTH", label, roundMs(endTimer(authStart)));
      logPerf("API_RESPONSE", label, "401", roundMs(endTimer(apiStart)));
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      req.user = verifyToken(token);
    } catch (err) {
      logPerf("API_AUTH", label, roundMs(endTimer(authStart)));
      logPerf("API_RESPONSE", label, "401", roundMs(endTimer(apiStart)));
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    logPerf("API_AUTH", label, roundMs(endTimer(authStart)));

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      logPerf("API_RESPONSE", label, String(res.statusCode), roundMs(endTimer(apiStart)));
      return originalJson(body);
    };

    try {
      logPerf("BUSINESS_LOGIC_START", label);
      return await handler(req, res);
    } finally {
      logPerf("BUSINESS_LOGIC_END", label);
      logPerf("API_TOTAL", label, roundMs(endTimer(apiStart)));
    }
  };
}

export function hasPageAccess(user, pageId) {
  if (!user) return false;
  if (user.superAdmin === true) return true;
  const pages = Array.isArray(user?.access?.pages) ? user.access.pages : [];
  return pages.includes(pageId);
}

export function requireDesignerAccess(handler) {
  return requireAuth(async (req, res) => {
    if (!hasPageAccess(req.user, "designer")) {
      return res.status(403).json({ error: "Access denied" });
    }
    return handler(req, res);
  });
}

export function requireReportingAccess(handler) {
  return requireAuth(async (req, res) => {
    if (!hasPageAccess(req.user, "reporting")) {
      return res.status(403).json({ error: "Access denied" });
    }
    return handler(req, res);
  });
}
