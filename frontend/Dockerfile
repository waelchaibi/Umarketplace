# Frontend build and static server
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Allow passing VITE_* at build-time
ARG VITE_API_URL
ARG VITE_APP_URL
ARG VITE_IMG_URL
ARG VITE_ROUTE_PREFIX
ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_URL=$VITE_APP_URL \
    VITE_IMG_URL=$VITE_IMG_URL \
    VITE_ROUTE_PREFIX=$VITE_ROUTE_PREFIX

RUN npm run build

FROM nginx:alpine AS nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

