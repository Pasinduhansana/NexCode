function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmptyValue(value) {
  return value === undefined || value === null || value === "";
}

function checkType(expectedType, key, value, errors) {
  switch (expectedType) {
    case "STRING":
      if (typeof value !== "string") errors.push(`${key} must be a string`);
      break;
    case "INTEGER":
      if (!Number.isInteger(value)) errors.push(`${key} must be an integer`);
      break;
    case "NUMBER":
      if (typeof value !== "number" || Number.isNaN(value)) errors.push(`${key} must be a number`);
      break;
    case "BOOLEAN":
      if (typeof value !== "boolean") errors.push(`${key} must be a boolean`);
      break;
    case "ARRAY":
      if (!Array.isArray(value)) errors.push(`${key} must be an array`);
      break;
    case "OBJECT":
      if (!isPlainObject(value)) errors.push(`${key} must be an object`);
      break;
    default:
      break;
  }
}

export function validateArgs(schema, args) {
  const errors = [];
  const properties = schema?.properties || {};
  const required = schema?.required || [];

  if (args === undefined || args === null) {
    if (required.length === 0) return { ok: true, errors: [] };
    return { ok: false, errors: required.map((key) => `Missing required argument: ${key}`) };
  }

  if (!isPlainObject(args)) {
    return { ok: false, errors: ["Arguments must be a JSON object"] };
  }

  for (const key of required) {
    if (isEmptyValue(args[key])) {
      errors.push(`Missing required argument: ${key}`);
    }
  }

  for (const [key, value] of Object.entries(args)) {
    if (isEmptyValue(value)) continue;
    const prop = properties[key];
    if (!prop) {
      errors.push(`Unknown argument: ${key}`);
      continue;
    }
    if (Array.isArray(prop.enum) && !prop.enum.includes(value)) {
      errors.push(`Invalid value for ${key}: ${JSON.stringify(value)}`);
      continue;
    }
    checkType(prop.type, key, value, errors);
  }

  return { ok: errors.length === 0, errors };
}
