# Use an official Node runtime as a parent image
FROM node:22.4-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install system dependencies for node-canvas & as a replacement for dockerode-compose
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    librsvg-dev \
    docker-cli

# Copy package.json and pnpm-lock.yaml for installing dependencies
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install project dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build database client
RUN pnpm run db:generate

# Build the server-side code
RUN pnpm run build-server

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["pnpm", "run", "start"]
