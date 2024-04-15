# Use the official Ubuntu base image
FROM ubuntu:latest

# Set environment variables
ENV NODE_VERSION 16
ENV PORT 3000

# Install dependencies
RUN apt-get update && apt-get install -y curl

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
RUN apt-get install -y nodejs

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
