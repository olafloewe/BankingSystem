// Small helpers so each model constructor stays short.

function requireInteger(value, name) {
  if (!Number.isInteger(value)) throw new TypeError(`${name} must be an integer`);
}

function requireNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) throw new TypeError(`${name} must be a non-negative integer`);
}

function requirePositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) throw new TypeError(`${name} must be a positive integer`);
}

function requireNonNegativeNumber(value, name) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative number`);
  }
}

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}

function requireDate(value, name) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TypeError(`${name} must be a valid Date`);
  }
}

function requireOneOf(value, allowed, name) {
  if (!allowed.includes(value)) {
    throw new TypeError(`${name} must be one of: ${allowed.join(', ')}`);
  }
}

function requireArrayOf(value, Class, name) {
  if (!Array.isArray(value) || !value.every((item) => item instanceof Class)) {
    throw new TypeError(`${name} must be an array of ${Class.name} objects`);
  }
}

module.exports = {
  requireInteger,
  requireNonNegativeInteger,
  requirePositiveInteger,
  requireNonNegativeNumber,
  requireString,
  requireDate,
  requireOneOf,
  requireArrayOf,
};