const { escapeRegex } = require("./helpers");

// ======================================
// LEGACY MONGODB FILTER SANITIZER
// ======================================
//
// Used only by /search-ai which lets the
// LLM generate raw MongoDB queries.
//
// /chat does NOT use this — it uses
// buildSafeProductQuery() instead.
// ======================================

function sanitizeMongoFilter(filter) {
  if (!filter || typeof filter !== "object" || Array.isArray(filter)) {
    return {};
  }

  const allowedFields = [
    "title",
    "description",
    "price",
    "category",
    "subcategory",
    "discount",
    "stock",
    "features",
  ];

  const allowedOperators = [
    "$lte",
    "$gte",
    "$lt",
    "$gt",
    "$eq",
    "$ne",
    "$in",
    "$nin",
    "$regex",
    "$options",
  ];

  const sanitized = {};

  for (const [key, value] of Object.entries(filter)) {
    if (allowedFields.includes(key)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const safeValue = {};

        for (const [operator, operatorValue] of Object.entries(value)) {
          if (!allowedOperators.includes(operator)) {
            continue;
          }

          // Regex
          if (operator === "$regex") {
            if (
              typeof operatorValue !== "string" ||
              operatorValue.length > 100
            ) {
              continue;
            }

            safeValue.$regex = escapeRegex(operatorValue);

            continue;
          }

          // Regex options
          if (operator === "$options") {
            if (
              typeof operatorValue === "string" &&
              /^[imsx]*$/.test(operatorValue)
            ) {
              safeValue.$options = operatorValue;
            }

            continue;
          }

          // Arrays ($in, $nin)
          if (["$in", "$nin"].includes(operator)) {
            if (Array.isArray(operatorValue)) {
              safeValue[operator] = operatorValue.slice(0, 50);
            }

            continue;
          }

          safeValue[operator] = operatorValue;
        }

        if (Object.keys(safeValue).length > 0) {
          sanitized[key] = safeValue;
        }
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

module.exports = sanitizeMongoFilter;
