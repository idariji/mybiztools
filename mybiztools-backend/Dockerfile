# Use Node.js LTS
FROM node:20-slim

# Install OpenSSL (Prisma) and system Chromium + fonts (puppeteer PDF rendering).
# Using the apt Chromium pulls in all required shared libraries automatically.
RUN apt-get update -y \
  && apt-get install -y openssl chromium fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

# Use the system Chromium installed above instead of downloading one during npm ci.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install ALL dependencies (need devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 8080

# Set environment variable for Cloud Run
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/server.js"]
