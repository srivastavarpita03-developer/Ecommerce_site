const express = require("express");
const OpenAI = require("openai");

const generatePrompt = require("../prompts/generatePromptV1");
const generateChatPrompt = require("../prompts/generateChatPrompt");

const Products = require("../models/productsModel");
const Category = require("../models/categoryModel");

const router = express.Router();

// ======================================
// LAZY GROQ CLIENT
// ======================================

let client = null;

function getClient() {
  if (
    !client &&
    process.env.GROQ_API_KEY &&
    process.env.GROQ_API_KEY !== "YOUR_GROQ_API_KEY_HERE"
  ) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  return client;
}

// ======================================
// HELPERS
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

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

// ======================================
// RELEVANCE SCORING
// ======================================

function scoreProduct(product, keywords) {
  let score = 0;
  const title = (product.title || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const subcat = (product.subcategory || "").toLowerCase();

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();

    // Title match — highest weight
    if (title.includes(kw)) {
      score += 5;

      // Exact word boundary match in title
      if (
        new RegExp(`\\b${escapeRegex(kw)}\\b`, "i").test(title)
      ) {
        score += 3;
      }
    }

    // Description match
    if (desc.includes(kw)) {
      score += 1;
    }

    // Subcategory match
    if (subcat.includes(kw)) {
      score += 4;
    }

    // Features match
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

  // Bonus: more keywords matched = higher relevance
  const matchCount = keywords.filter((kw) => {
    const regex = new RegExp(escapeRegex(kw), "i");
    return (
      regex.test(title) ||
      regex.test(desc) ||
      regex.test(subcat) ||
      (Array.isArray(product.features) &&
        product.features.some(
          (f) =>
            regex.test(f.key || "") || regex.test(f.value || "")
        ))
    );
  }).length;

  if (matchCount === keywords.length) {
    score += 10;
  }

  return score;
}

// ======================================
// OLD ENDPOINT — SEARCH AI
// ======================================

router.post("/search-ai", async (req, res) => {
  try {
    const { userQuery } = req.body;

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({
        success: false,
        message: "User query is required",
      });
    }

    const groq = getClient();

    if (!groq) {
      return res.status(503).json({
        success: false,
        message: "AI service not configured. Set GROQ_API_KEY in .env",
      });
    }

    const prompt = generatePrompt(userQuery);

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 512,
    });

    const rawOutput = response.choices?.[0]?.message?.content?.trim();

    if (!rawOutput) {
      return res.status(500).json({
        success: false,
        message: "AI could not generate a response",
      });
    }

    const filterLogic = cleanJsonOutput(rawOutput);

    if (!filterLogic) {
      console.error("Invalid AI JSON:", rawOutput);

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid response",
      });
    }

    const safeFilter = sanitizeMongoFilter(filterLogic);

    const productsData = await Products.find(safeFilter)
      .populate("category")
      .limit(20);

    return res.json({
      success: true,
      message: "Success",
      data: productsData,
    });
  } catch (error) {
    console.error("search-ai Error:", error);

    return res.status(500).json({
      success: false,
      message: "AI search failed",
    });
  }
});

// ======================================
// NEW ENDPOINT — AI CHAT ASSISTANT
// ======================================

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const userMessage = message.trim().slice(0, 1000);

    const groq = getClient();

    if (!groq) {
      return res.status(503).json({
        success: false,
        message: "AI service not configured. Set GROQ_API_KEY in .env",
      });
    }

    const categories = await Category.find().select("_id name").lean();

    const prompt = generateChatPrompt(userMessage, categories);

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON. Do not use markdown. Do not include explanations outside JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 512,
    });

    const rawOutput = response.choices?.[0]?.message?.content?.trim();

    if (!rawOutput) {
      return res.status(500).json({
        success: false,
        message: "AI could not generate a response",
      });
    }

    const intent = cleanJsonOutput(rawOutput);

    if (!intent) {
      console.error("Invalid AI output:", rawOutput);

      return res.status(500).json({
        success: false,
        message: "Could not understand the request. Please try again.",
      });
    }

    console.log("AI Intent:", JSON.stringify(intent, null, 2));

    const { filter, sort, limit, keywords } = await buildSafeProductQuery(
      intent,
      categories
    );

    console.log("Mongo Filter:", JSON.stringify(filter, null, 2));

    let query = Products.find(filter).populate("category");

    if (sort) {
      query = query.sort(sort);
    }

    const safeLimit =
      Number.isInteger(limit) && limit > 0 ? Math.min(limit, 20) : 20;

    let products = await query.lean();

    // ======================================
    // RELEVANCE SORT (when no explicit sort)
    // ======================================

    if (keywords.length > 0 && !sort) {
      products = products
        .map((product) => ({
          ...product,
          _relevanceScore: scoreProduct(product, keywords),
        }))
        .sort((a, b) => b._relevanceScore - a._relevanceScore)
        .slice(0, safeLimit)
        .map(({ _relevanceScore, ...rest }) => rest);
    } else {
      products = products.slice(0, safeLimit);
    }

    let reply;

    if (products.length === 0) {
      reply =
        "I couldn't find any products matching your request. Try adjusting your preferences, category, or price range.";
    } else if (products.length === 1) {
      reply = "I found 1 product for you:";
    } else {
      reply = `I found ${products.length} products that match your request:`;
    }

    return res.json({
      success: true,
      reply,
      products,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);

    if (error?.status === 401) {
      return res.status(500).json({
        success: false,
        message: "AI service authentication failed. Please check the API key.",
      });
    }

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI service is temporarily busy. Please try again shortly.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});

// ======================================
// BUILD SAFE PRODUCT QUERY
// ======================================

async function buildSafeProductQuery(intent, categories) {
  if (!intent || typeof intent !== "object" || Array.isArray(intent)) {
    return {
      filter: {},
      sort: null,
      limit: 20,
      keywords: [],
    };
  }

  const filter = {};

  // ======================================
  // CATEGORY
  // ======================================

  if (intent.category && typeof intent.category === "string") {
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

  // ======================================
  // SUBCATEGORY
  // ======================================

  if (intent.subcategory && typeof intent.subcategory === "string") {
    const subcategory = intent.subcategory.trim();

    filter.subcategory = {
      $regex: `^${escapeRegex(subcategory)}$`,
      $options: "i",
    };
  }

  // ======================================
  // PRICE
  // ======================================

  const minPrice = normalizeNumber(intent.minPrice);
  const maxPrice = normalizeNumber(intent.maxPrice);

  if (
    (minPrice !== null && minPrice >= 0) ||
    (maxPrice !== null && maxPrice >= 0)
  ) {
    filter.price = {};

    if (minPrice !== null && minPrice >= 0) {
      filter.price.$gte = minPrice;
    }

    if (maxPrice !== null && maxPrice >= 0) {
      filter.price.$lte = maxPrice;
    }
  }

  // ======================================
  // DISCOUNT
  // ======================================

  const minDiscount = normalizeNumber(intent.minDiscount);
  const maxDiscount = normalizeNumber(intent.maxDiscount);

  if (
    (minDiscount !== null && minDiscount >= 0) ||
    (maxDiscount !== null && maxDiscount >= 0)
  ) {
    filter.discount = {};

    if (minDiscount !== null && minDiscount >= 0) {
      filter.discount.$gte = minDiscount;
    }

    if (maxDiscount !== null && maxDiscount >= 0) {
      filter.discount.$lte = maxDiscount;
    }
  }

  // ======================================
  // STOCK
  // ======================================

  if (intent.inStock === true) {
    filter.stock = {
      $gt: 0,
    };
  }

  // ======================================
  // KEYWORDS — AND logic across fields
  // ======================================

  const keywords = Array.isArray(intent.keywords)
    ? intent.keywords
        .filter((keyword) => typeof keyword === "string" && keyword.trim())
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10)
    : [];

  if (keywords.length > 0) {
    const keywordConditions = [];

    for (const keyword of keywords) {
      const regex = new RegExp(escapeRegex(keyword), "i");

      /*
       * IMPORTANT: Each keyword MUST match in at least
       * one of the searchable fields.
       *
       * keyword "blue" matches if found in:
       *   title OR description OR subcategory OR features
       *
       * All keywords are combined with $and so
       * EVERY keyword must match.
       */

      keywordConditions.push({
        $or: [
          { title: { $regex: regex } },
          { description: { $regex: regex } },
          { subcategory: { $regex: regex } },
          {
            features: {
              $elemMatch: {
                $or: [
                  { key: { $regex: regex } },
                  { value: { $regex: regex } },
                ],
              },
            },
          },
        ],
      });
    }

    filter.$and = keywordConditions;
  }

  // ======================================
  // SORT
  // ======================================

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

  // ======================================
  // LIMIT
  // ======================================

  let limit = Number(intent.limit);

  if (!Number.isInteger(limit)) {
    limit = 20;
  }

  limit = Math.max(1, Math.min(limit, 20));

  return {
    filter,
    sort,
    limit,
    keywords,
  };
}

// ======================================
// LEGACY MONGODB FILTER SANITIZER
// (kept for /search-ai)
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

          if (operator === "$options") {
            if (
              typeof operatorValue === "string" &&
              /^[imsx]*$/.test(operatorValue)
            ) {
              safeValue.$options = operatorValue;
            }

            continue;
          }

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

// ======================================
// EXPORT
// ======================================

module.exports = router;
