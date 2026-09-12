const OpenAI = require("openai");

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

function getModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

module.exports = { getClient, getModel };
