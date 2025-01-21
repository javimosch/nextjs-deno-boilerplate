/// <reference types="https://deno.land/x/types@v0.1.1/deno.d.ts" />

import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";

// Get environment variables
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_BASE_URL = Deno.env.get("GROQ_BASE_URL");
const GROQ_COMPLETION_URL = Deno.env.get("GROQ_COMPLETION_URL") || GROQ_BASE_URL;
const GROQ_COMPLETION_MODEL = Deno.env.get("GROQ_COMPLETION_MODEL") || "llama-3.3-70b-versatile";

if (!GROQ_API_KEY || !GROQ_COMPLETION_URL) {
  throw new Error("Missing required environment variables");
}

export default async function(context: Context) {
  try {
    const body = await context.request.body.json();
    const { systemPrompt, prompt } = body;

    if (!prompt) {
      context.response.status = 400;
      context.response.body = { error: "Prompt is required" };
      return;
    }

    const completionResponse = await fetch(`${GROQ_COMPLETION_URL}/openai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_COMPLETION_MODEL,
        messages: [
          { role: "system", content: systemPrompt || "" },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!completionResponse.ok) {
      throw new Error(`Groq API error: ${completionResponse.statusText}`);
    }

    const result = await completionResponse.json();
    context.response.body = result.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    context.response.status = 500;
    context.response.body = { error: "Internal Server Error" };
  }
}