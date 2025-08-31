# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.18.0

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . . 
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS production

# Use production node environment.
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source files into the image.
COPY --from=build /usr/src/app/dist ./dist

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 4000

# Run the application.
CMD ["node", "dist/index.js"]

FROM node:${NODE_VERSION}-alpine AS development

# Use development node environment.
ENV NODE_ENV=development

WORKDIR /usr/src/app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 4000

# Run the application.
CMD [ "npm", "run", "dev" ]
