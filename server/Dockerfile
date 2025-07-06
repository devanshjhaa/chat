# Base image with Node and npm
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install everything
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (default to 8080)
EXPOSE 8080

# Run the app
CMD ["node", "dist/index.js"]
