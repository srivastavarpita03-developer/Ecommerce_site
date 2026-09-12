const { escapeRegex } = require("./helpers");

// ======================================
// RELEVANCE SCORING
// ======================================
//
// When no explicit sort is requested,
// products are ranked by how well they
// match the search keywords.
//
// Scoring:
//   Title word boundary match  +8
//   Title includes keyword     +5
//   Subcategory match          +4
//   Features match             +3
//   Description match          +1
//   All keywords matched       +10 bonus
// ======================================

function scoreProduct(product, keywords) {
  let score = 0;

  const title = (product.title || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const subcat = (product.subcategory || "").toLowerCase();

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();

    // TITLE — highest weight
    if (title.includes(kw)) {
      score += 5;

      // Exact word boundary match in title
      if (new RegExp(`\\b${escapeRegex(kw)}\\b`, "i").test(title)) {
        score += 3;
      }
    }

    // DESCRIPTION
    if (desc.includes(kw)) {
      score += 1;
    }

    // SUBCATEGORY
    if (subcat.includes(kw)) {
      score += 4;
    }

    // FEATURES
    if (Array.isArray(product.features)) {
      for (const feature of product.features) {
        const fKey = (feature.key || "").toLowerCase();
        const fVal = (feature.value || "").toLowerCase();

        if (fKey.includes(kw) || fVal.includes(kw)) {
          score += 3;
          break;
        }
      }
    }
  }

  // Bonus: ALL keywords matched in at least one field
  const matchCount = keywords.filter((kw) => {
    const regex = new RegExp(escapeRegex(kw), "i");
    return (
      regex.test(title) ||
      regex.test(desc) ||
      regex.test(subcat) ||
      (Array.isArray(product.features) &&
        product.features.some(
          (f) => regex.test(f.key || "") || regex.test(f.value || "")
        ))
    );
  }).length;

  if (matchCount === keywords.length) {
    score += 10;
  }

  return score;
}

module.exports = scoreProduct;
