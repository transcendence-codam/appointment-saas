FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY srcs/backend/package.json srcs/backend/
COPY srcs/frontend/package.json srcs/frontend/

# Install dependencies
RUN npm ci

# Shared is consumed as built output (needs rebuild when changed)
COPY packages/shared packages/shared
RUN npm run build -w @appointment-saas/shared

# Copy source code
COPY srcs/backend srcs/backend

WORKDIR /app/srcs/backend

CMD ["npm", "run", "start:dev"]
