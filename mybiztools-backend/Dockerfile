# Use Node.js LTS
FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install ALL dependencies (need devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

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
