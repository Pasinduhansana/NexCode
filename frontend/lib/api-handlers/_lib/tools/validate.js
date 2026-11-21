const MAX_ARGS = 25;
const DEFAULT_MAX_STRING_LENGTH = 5000;
const DEFAULT_MAX_ITEMS = 50;

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

function checkLimits(prop, key, value, errors) {
  if (prop.type === "STRING" && typeof value === "string") {
    const maxLength = Number.isInteger(prop.maxLength) ? prop.maxLength : DEFAULT_MAX_STRING_LENGTH;
    if (value.length > maxLength) {
      errors.push(`${key} must be at most ${maxLength} characters`);
    }
  }

  if (prop.type === "ARRAY" && Array.isArray(value)) {
    const maxItems = Number.isInteger(prop.maxItems) ? prop.maxItems : DEFAULT_MAX_ITEMS;
    if (value.length > maxItems) {
      errors.push(`${key} must contain at most ${maxItems} items`);
    }
  }

  if ((prop.type === "NUMBER" || prop.type === "INTEGER") && typeof value === "number") {
    if (Number.isFinite(prop.min) && value < prop.min) errors.push(`${key} must be at least ${prop.min}`);
    if (Number.isFinite(prop.max) && value > prop.max) errors.push(`${key} must be at most ${prop.max}`);
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

  const keys = Object.keys(args);
  if (keys.length > MAX_ARGS) {
    errors.push(`Too many arguments (max ${MAX_ARGS})`);
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
    checkLimits(prop, key, value, errors);
  }

  return { ok: errors.length === 0, errors };
}
