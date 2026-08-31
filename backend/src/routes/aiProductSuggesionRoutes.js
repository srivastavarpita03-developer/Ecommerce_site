const express = require("express");
const OpenAI = require("openai");
const generatePrompt = require("../prompts/generatePromptV1");
const Products = require("../models/productsModel");


const router = express.Router();

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

router.post("/search-ai", async (req, res) => {
    const { userQuery } = req.body;
    const prompt = generatePrompt(userQuery);
    const response = await client.responses.create({
        model: "openai/gpt-oss-20b",
        input: prompt,
    });
    console.log(response.output_text);
    console.log(userQuery);
    const filterLogic = JSON.parse(response.output_text)
    console.log(filterLogic);
    const productsData = await Products.find(filterLogic);
    console.log(productsData)
    res.send({ success: true, message: "Success", data: productsData })
})

module.exports = router;