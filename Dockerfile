# Stage 1: Build the React frontend
FROM node:20-slim AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run the Node.js backend
FROM node:20-slim
WORKDIR /app

# Copy backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy built frontend from Stage 1
COPY --from=build-frontend /app/dist ./dist

# Copy backend source code
COPY server/ ./server/

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Expose the port
EXPOSE 8080

# Start the server
CMD ["node", "server/index.js"]
