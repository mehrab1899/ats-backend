# Base image
FROM node:20-alpine

# Install system deps for Prisma
RUN apk add --no-cache openssl

# Set working dir
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Install deps
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest
COPY . .

# Expose port
EXPOSE 4000

# Start the dev server
CMD ["npm", "run", "dev"]
