# Use an official Node runtime as a parent image
FROM node:22.4-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install system dependencies for node-canvas & as a replacement for dockerode-compose
RUN apk add --no-cache \
    build-base \
    docker-cli \
    curl \
    android-tools

# Install docker-compsoe plugin for deployment
RUN mkdir -p /usr/local/lib/docker/cli-plugins && \
    ARCH=$(uname -m) && \
    case ${ARCH} in \
        x86_64) COMPOSE_ARCH="x86_64" ;; \
        aarch64) COMPOSE_ARCH="aarch64" ;; \
        armv7l) COMPOSE_ARCH="armv7" ;; \
        *) echo "Unsupported architecture: ${ARCH}"; exit 1 ;; \
    esac && \
    curl -SL "https://github.com/docker/compose/releases/download/v2.28.0/docker-compose-linux-${COMPOSE_ARCH}" -o /usr/local/lib/docker/cli-plugins/docker-compose && \
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

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
RUN pnpm run server:build

# Build static workers
RUN pnpm run workers:build

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["pnpm", "run", "start"]
