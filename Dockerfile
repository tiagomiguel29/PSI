# Use the official Ubuntu base image
FROM ubuntu:latest

# Set environment variables
ENV NODE_VERSION 16
ENV PORT 3000

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm1 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    ca-certificates \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
RUN apt-get install -y nodejs

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm ci
RUN npx puppeteer browsers install chrome

# Copy app source code
COPY . .

# Expose the specified port
EXPOSE $PORT

# Start the application
CMD [ "npm", "start" ]
