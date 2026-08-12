export function getUsers() {
  const users = [];
  for (const [envKey, value] of Object.entries(process.env)) {
    if (envKey.startsWith("ADMIN_USER_") && envKey.endsWith("_KEY") && value) {
      const id = envKey.slice("ADMIN_USER_".length, -"_KEY".length).toLowerCase();
      const name = process.env[`ADMIN_USER_${id.toUpperCase()}_NAME`];
      if (name) {
        users.push({ id, name, key: value });
      }
    }
  }

  if (users.length === 0 && process.env.ADMIN_ACCESS_KEY) {
    users.push({ id: "admin", name: "Admin", key: process.env.ADMIN_ACCESS_KEY });
  }

  return users;
}

export function findUserByKey(accessKey) {
  if (!accessKey) return null;
  return getUsers().find((u) => u.key === accessKey) || null;
}
