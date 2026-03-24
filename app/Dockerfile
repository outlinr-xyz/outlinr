# Stage 1: Build the Vite React application
FROM node:20-alpine AS builder

# Enable Corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy dependency files and install
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Pass in Vite Env Vars at build time
ARG VITE_APP_URL
ENV VITE_APP_URL=$VITE_APP_URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy the rest of the code and build
COPY . .
RUN pnpm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
