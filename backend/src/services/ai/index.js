const express = require("express");

const { getClient, getModel } = require("./groqClient");
const { cleanJsonOutput } = require("./helpers");
const buildSafeProductQuery = require("./queryBuilder");
const scoreProduct = require("./relevanceScorer");
const sanitizeMongoFilter = require("./sanitizers");

const generatePrompt = require("../../prompts/generatePromptV1");
const generateChatPrompt = require("../../prompts/generateChatPrompt");

const Products = require("../../models/productsModel");
const Category = require("../../models/categoryModel");

const router = express.Router();

// ======================================
// OLD ENDPOINT — SEARCH AI
// ======================================
//
// Lets the LLM generate raw MongoDB
// filters. Kept for backward compat.
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
      model: getModel(),
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
//
// Flow:
//   1. Validate user message
//   2. Fetch categories from DB
//   3. Generate structured intent via LLM
//   4. Build safe MongoDB query from intent
//   5. Query products
//   6. Score relevance (when no explicit sort)
//   7. Return ranked results
// ======================================

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // --------------------------------------
    // 1. Validate user message
    // --------------------------------------

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const userMessage = message.trim().slice(0, 1000);

    // --------------------------------------
    // 2. Get Groq client
    // --------------------------------------

    const groq = getClient();

    if (!groq) {
      return res.status(503).json({
        success: false,
        message: "AI service not configured. Set GROQ_API_KEY in .env",
      });
    }

    // --------------------------------------
    // 3. Fetch categories
    // --------------------------------------

    const categories = await Category.find().select("_id name").lean();

    // --------------------------------------
    // 4. Generate AI intent
    // --------------------------------------

    const prompt = generateChatPrompt(userMessage, categories);

    const response = await groq.chat.completions.create({
      model: getModel(),
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

    // --------------------------------------
    // 5. Parse AI JSON
    // --------------------------------------

    const intent = cleanJsonOutput(rawOutput);

    if (!intent) {
      console.error("Invalid AI output:", rawOutput);

      return res.status(500).json({
        success: false,
        message: "Could not understand the request. Please try again.",
      });
    }

    console.log("AI Intent:", JSON.stringify(intent, null, 2));

    // --------------------------------------
    // 6. Build MongoDB query
    // --------------------------------------

    const { filter, sort, limit, keywords } = await buildSafeProductQuery(
      intent,
      categories
    );

    console.log("Mongo Filter:", JSON.stringify(filter, null, 2));

    // --------------------------------------
    // 7. Query products
    // --------------------------------------

    let query = Products.find(filter).populate("category");

    if (sort) {
      query = query.sort(sort);
    }

    let products = await query.lean();

    // --------------------------------------
    // 8. Relevance scoring (no explicit sort)
    // --------------------------------------

    const safeLimit =
      Number.isInteger(limit) && limit > 0 ? Math.min(limit, 20) : 20;

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

    // --------------------------------------
    // 9. Friendly reply
    // --------------------------------------

    let reply;

    if (products.length === 0) {
      reply =
        "I couldn't find any products matching your request. Try adjusting your preferences, category, or price range.";
    } else if (products.length === 1) {
      reply = "I found 1 product for you:";
    } else {
      reply = `I found ${products.length} products that match your request:`;
    }

    // --------------------------------------
    // 10. Response
    // --------------------------------------

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

module.exports = router;
