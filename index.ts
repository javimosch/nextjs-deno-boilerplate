import { Application, Router, Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

interface AppContext extends Context {
  params: Record<string, string>;
}

const app = new Application();
const router = new Router();

// Serve static files from Next.js build
const staticFiles = async (context: Context) => {
  try {
    // Try serving from .next/static first
    const staticPath = join(Deno.cwd(), "frontend-dist");
    if (await exists(staticPath)) {
      await context.send({
        root: staticPath,
        index: "index.html",
      });
      return;
    }
    
    context.response.status = 404;
    context.response.body = "Not Found";
  } catch (error) {
    console.error("Error serving static files:", error);
    context.response.status = 500;
    context.response.body = "Internal Server Error";
  }
};

// API route
router.get("/api", (context) => {
  context.response.body = "Hello from Deno API";
});

// Dynamic function route - supports all HTTP methods
router.all("/api/functions/:functionName", async (context) => {
  const functionName = context.params.functionName;
  
  // Validate function name to prevent directory traversal
  if (!/^[a-zA-Z0-9_-]+$/.test(functionName)) {
    context.response.status = 400;
    context.response.body = "Invalid function name";
    return;
  }

  const functionPath = join(Deno.cwd(), "functions", `${functionName}.ts`);
  
  if (!await exists(functionPath)) {
    context.response.status = 404;
    context.response.body = "Function not found";
    return;
  }

  // Add CORS headers
  context.response.headers.set("Access-Control-Allow-Origin", "*");
  context.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  context.response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS preflight
  if (context.request.method === "OPTIONS") {
    context.response.status = 204;
    return;
  }

  try {
    const { default: fn } = await import(`file://${functionPath}`);
    console.log(`Executing function ${functionName}`);
    await fn(context);
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    context.response.status = 500;
    context.response.body = { error: "Internal server error" };
  }
});

// Serve static files for all other routes
router.get("/(.*)", staticFiles);

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = Deno.env.get("PORT");
if (!PORT) {
  console.error("PORT environment variable is not set");
  Deno.exit(1);
}
console.log(`Server running on http://localhost:${PORT}`);
await app.listen({ port: parseInt(PORT) });