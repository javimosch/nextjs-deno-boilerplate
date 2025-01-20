/// <reference types="https://deno.land/x/types@v0.1.1/deno.d.ts" />

import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";

// Get environment variables
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_BASE_URL = Deno.env.get("GROQ_BASE_URL");

console.log("GROQ_API_KEY:", GROQ_API_KEY);
console.log("GROQ_BASE_URL:", GROQ_BASE_URL);

if (!GROQ_API_KEY || !GROQ_BASE_URL) {
  throw new Error("Missing required environment variables");
}

export default async function(context: Context) {
  try {
    console.log("Request method:", context.request.method);
    console.log("Content type:", context.request.headers.get("content-type"));

    // Determine body type
    const bodyType = context.request.body.type();
    console.log("Body type:", bodyType);

    if (bodyType !== "form-data") {
      context.response.status = 400;
      context.response.body = { error: "Expected multipart/form-data" };
      return;
    }

    try {
      const formData = await context.request.body.formData();
      console.log("Form data received");
      
      const audioFile = formData.get("file");
      console.log("Audio file type:", audioFile instanceof File);

      if (!audioFile || !(audioFile instanceof File)) {
        context.response.status = 400;
        context.response.body = { error: "No valid file provided" };
        return;
      }

      // Prepare form data for Groq API
      const groqFormData = new FormData();
      groqFormData.append("model", "whisper-large-v3-turbo");
      groqFormData.append("file", audioFile);
      groqFormData.append("response_format", "verbose_json");

      console.log("Making request to Groq API");
      
      // Make request to Groq API
      const response = await fetch(`${GROQ_BASE_URL}/openai/v1/audio/transcriptions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: groqFormData,
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const result = await response.json();
      context.response.body = result;
    } catch (error) {
      console.error("Error parsing request body:", error);
      context.response.status = 400;
      context.response.body = { error: "Invalid request body" };
    }
  } catch (error) {
    console.error("Error:", error);
    context.response.status = 500;
    context.response.body = { error: "Internal Server Error" };
  }
}