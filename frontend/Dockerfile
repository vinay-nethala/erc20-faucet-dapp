# Multi-stage build for production-ready Docker image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build arguments for environment variables
ARG VITE_RPC_URL
ARG VITE_TOKEN_ADDRESS
ARG VITE_FAUCET_ADDRESS

# Set environment variables for build
ENV VITE_RPC_URL=$VITE_RPC_URL
ENV VITE_TOKEN_ADDRESS=$VITE_TOKEN_ADDRESS
ENV VITE_FAUCET_ADDRESS=$VITE_FAUCET_ADDRESS

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install serve globally
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create a simple health check server script
RUN echo 'const http = require("http"); \
const fs = require("fs"); \
const path = require("path"); \
const PORT = 3000; \
const server = http.createServer((req, res) => { \
  if (req.url === "/health") { \
    res.writeHead(200, { "Content-Type": "text/plain" }); \
    res.end("OK"); \
    return; \
  } \
  let filePath = path.join(__dirname, "dist", req.url === "/" ? "index.html" : req.url); \
  const extname = path.extname(filePath); \
  const contentTypes = { \
    ".html": "text/html", \
    ".js": "text/javascript", \
    ".css": "text/css", \
    ".json": "application/json", \
    ".png": "image/png", \
    ".jpg": "image/jpg", \
    ".svg": "image/svg+xml" \
  }; \
  const contentType = contentTypes[extname] || "application/octet-stream"; \
  fs.readFile(filePath, (error, content) => { \
    if (error) { \
      if (error.code === "ENOENT") { \
        fs.readFile(path.join(__dirname, "dist", "index.html"), (err, data) => { \
          res.writeHead(200, { "Content-Type": "text/html" }); \
          res.end(data, "utf-8"); \
        }); \
      } else { \
        res.writeHead(500); \
        res.end("Server Error: " + error.code); \
      } \
    } else { \
      res.writeHead(200, { "Content-Type": contentType }); \
      res.end(content, "utf-8"); \
    } \
  }); \
}); \
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));' > server.js

# Install wget for health checks
RUN apk add --no-cache wget

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]