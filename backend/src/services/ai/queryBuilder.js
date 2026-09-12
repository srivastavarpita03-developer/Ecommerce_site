const { escapeRegex, normalizeNumber } = require("./helpers");

// ======================================
// BUILD SAFE PRODUCT QUERY
// ======================================
//
// Converts structured AI intent into a
// safe MongoDB query filter.
//
// KEYWORD LOGIC:
//   keywords are AND-ed together.
//   Each keyword is searched across:
//     title OR description OR subcategory OR features
//
//   Example: ["blue", "formal", "shirt"]
//     → { $and: [
//          { $or: [ title/blue, desc/blue, subcat/blue, features/blue ] },
//          { $or: [ title/formal, desc/formal, subcat/formal, features/formal ] },
//          { $or: [ title/shirt, desc/shirt, subcat/shirt, features/shirt ] }
//        ] }
//
// PRICE/DISCOUNT/STOCK are hard filters (always AND-ed).
// ======================================

async function buildSafeProductQuery(intent, categories) {
  const filter = {};

  if (!intent || typeof intent !== "object" || Array.isArray(intent)) {
    return {
      filter: {},
      sort: null,
      limit: 20,
      keywords: [],
    };
  }

  // =====================================================
  // CATEGORY
  // =====================================================

  if (typeof intent.category === "string" && intent.category.trim()) {
    const categoryName = intent.category.trim();

    const category = categories.find(
      (item) =>
        typeof item.name === "string" &&
        item.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (category) {
      filter.category = category._id;
    }
  }

  // =====================================================
  // SUBCATEGORY
  // =====================================================

  if (typeof intent.subcategory === "string" && intent.subcategory.trim()) {
    const subcategory = intent.subcategory.trim();

    filter.subcategory = {
      $regex: `^${escapeRegex(subcategory)}$`,
      $options: "i",
    };
  }

  // =====================================================
  // PRICE
  // =====================================================

  const minPrice = normalizeNumber(intent.minPrice);
  const maxPrice = normalizeNumber(intent.maxPrice);

  if (minPrice !== null || maxPrice !== null) {
    const priceFilter = {};

    if (minPrice !== null && minPrice >= 0) {
      priceFilter.$gte = minPrice;
    }

    if (maxPrice !== null && maxPrice >= 0) {
      priceFilter.$lte = maxPrice;
    }

    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }
  }

  // =====================================================
  // DISCOUNT
  // =====================================================

  const minDiscount = normalizeNumber(intent.minDiscount);
  const maxDiscount = normalizeNumber(intent.maxDiscount);

  if (minDiscount !== null || maxDiscount !== null) {
    const discountFilter = {};

    if (minDiscount !== null && minDiscount >= 0) {
      discountFilter.$gte = minDiscount;
    }

    if (maxDiscount !== null && maxDiscount >= 0) {
      discountFilter.$lte = maxDiscount;
    }

    if (Object.keys(discountFilter).length > 0) {
      filter.discount = discountFilter;
    }
  }

  // =====================================================
  // STOCK
  // =====================================================

  if (intent.inStock === true) {
    filter.stock = {
      $gt: 0,
    };
  }

  // =====================================================
  // KEYWORDS
  // =====================================================

  let keywords = [];

  if (Array.isArray(intent.keywords)) {
    keywords = intent.keywords
      .filter((keyword) => typeof keyword === "string" && keyword.trim())
      .map((keyword) => keyword.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 10);
  }

  // Remove duplicates
  keywords = [...new Set(keywords)];

  // =====================================================
  // KEYWORD SEARCH — AND across keywords,
  //                   OR across fields
  // =====================================================

  if (keywords.length > 0) {
    const keywordConditions = [];

    for (const keyword of keywords) {
      const escapedKeyword = escapeRegex(keyword);

      /*
       * IMPORTANT:
       *
       * Each keyword MUST match in at least one field.
       *
       * keyword "blue" matches if found in:
       *   title OR description OR subcategory OR features
       *
       * All keywords are combined with $and so
       * EVERY keyword must match.
       */

      keywordConditions.push({
        $or: [
          // TITLE
          {
            title: {
              $regex: escapedKeyword,
              $options: "i",
            },
          },

          // DESCRIPTION
          {
            description: {
              $regex: escapedKeyword,
              $options: "i",
            },
          },

          // SUBCATEGORY
          {
            subcategory: {
              $regex: escapedKeyword,
              $options: "i",
            },
          },

          // FEATURES (key or value)
          {
            features: {
              $elemMatch: {
                $or: [
                  {
                    key: {
                      $regex: escapedKeyword,
                      $options: "i",
                    },
                  },
                  {
                    value: {
                      $regex: escapedKeyword,
                      $options: "i",
                    },
                  },
                ],
              },
            },
          },
        ],
      });
    }

    filter.$and = keywordConditions;
  }

  // =====================================================
  // SORT
  // =====================================================

  let sort = null;

  const allowedSortFields = ["price", "discount", "createdAt", "title"];

  if (
    typeof intent.sortBy === "string" &&
    allowedSortFields.includes(intent.sortBy)
  ) {
    sort = {
      [intent.sortBy]: intent.sortOrder === "desc" ? -1 : 1,
    };
  }

  // =====================================================
  // LIMIT
  // =====================================================

  let limit = Number(intent.limit);

  if (!Number.isInteger(limit) || limit <= 0) {
    limit = 20;
  }

  limit = Math.min(limit, 20);

  return {
    filter,
    sort,
    limit,
    keywords,
  };
}

module.exports = buildSafeProductQuery;
