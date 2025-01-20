# Deno LLM API with Next.js Frontend

A modern web application combining Deno backend with Next.js frontend, featuring dynamic function execution and Groq transcription capabilities.

## Features

- 🦕 Deno-powered backend with Oak framework
- ⚛️ Next.js frontend with TypeScript
- 🚀 Dynamic function execution system
- 🎙️ Groq transcription functionality
- 🐳 Dockerized deployment
- 🔒 Secure CORS configuration
- 📦 Built-in environment variable support

## Installation

### Prerequisites
- Deno 1.40+
- Node.js 20+ (for frontend development)
- Docker (optional, for containerized deployment)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/deno-llm-api.git
   cd deno-llm-api
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Start development servers:
   ```bash
   # In one terminal (backend)
   deno run --allow-net --allow-env --allow-read index.ts

   # In another terminal (frontend)
   cd frontend
   npm run dev
   ```

## Configuration

Environment variables (`.env`):

```env
PORT=8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Backend Development
- Place new functions in `functions/` directory
- Functions are automatically loaded via `/api/functions/:functionName` route
- Use TypeScript for type safety

### Frontend Development
- Next.js app located in `frontend/` directory
- Uses Tailwind CSS for styling
- API calls should be made to `/api` endpoints

## Deployment

### Docker Deployment
```bash
docker build -t deno-llm-api -f Dockerfile.deno .
docker run -p 8000:8000 deno-llm-api
```

### Production Environment
Use the provided `compose.prod.yml` for production deployment:
```bash
docker-compose -f compose.prod.yml up -d
```

## API Documentation

### Base URL
`http://localhost:8000/api`

### Endpoints
- `GET /api` - Basic API status check
- `ALL /api/functions/:functionName` - Dynamic function execution

### Example Function
Create a new TypeScript file in `functions/` directory:
```typescript
export default async function(context: Context) {
  context.response.body = { message: "Hello from custom function!" };
}
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - See [LICENSE](LICENSE) for more information