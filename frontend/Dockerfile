# syntax=docker/dockerfile:1
# Imagen de produccion del frontend: compila la SPA con Vite y la sirve con Nginx.
#
#   docker build --build-arg VITE_API_URL=https://apibalancefood.frubilarz.cl/api/v1 -t balancefood-frontend .
#   docker run -d -p 4103:80 --name balancefood-frontend balancefood-frontend
#
# VITE_API_URL se fija en tiempo de build (Vite la incrusta en el bundle), por eso es un ARG
# y no una variable de entorno del contenedor.

ARG NODE_VERSION=22
ARG NGINX_VERSION=1.27

# --- Etapa de build ---------------------------------------------------------
FROM docker.io/library/node:${NODE_VERSION}-alpine AS build

WORKDIR /app

# Primero solo los manifiestos para cachear `npm ci` mientras no cambie el lockfile.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG VITE_API_URL=https://apibalancefood.frubilarz.cl/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# --- Imagen final -----------------------------------------------------------
FROM docker.io/library/nginx:${NGINX_VERSION}-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health >/dev/null || exit 1
