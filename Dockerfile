# Use the official Ubuntu base image
FROM ghcr.io/puppeteer/puppeteer:21.3.6

# Set environment variables
ENV NODE_VERSION 16
ENV PORT 3000

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Copy app source code
COPY . .

# Expose the specified port
EXPOSE $PORT

# Start the application
CMD [ "npm", "start" ]
