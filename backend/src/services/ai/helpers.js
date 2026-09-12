// ======================================
// REGEX ESCAPE
// ======================================

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ======================================
// JSON CLEANER
// ======================================
//
// Strips markdown fences, extracts first
// JSON object from messy LLM output.
// ======================================

function cleanJsonOutput(output) {
  if (!output || typeof output !== "string") {
    return null;
  }

  let cleaned = output.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Extract first JSON object if wrapped in text
  if (!cleaned.startsWith("{")) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
}

// ======================================
// NUMBER NORMALIZER
// ======================================
//
// Returns null for null/undefined/""/NaN.
// Returns the number otherwise.
//
//   normalizeNumber(null)      → null
//   normalizeNumber(undefined) → null
//   normalizeNumber("")        → null
//   normalizeNumber(50000)     → 50000
//   normalizeNumber("50000")   → 50000
//   normalizeNumber(NaN)       → null
//   normalizeNumber(Infinity)  → null
// ======================================

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

module.exports = {
  escapeRegex,
  cleanJsonOutput,
  normalizeNumber,
};
