FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Jalankan Nginx untuk menyajikan file statis
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Ganti konfigurasi default Nginx Docker agar mendukung React/Vite Router (Mencegah 404 saat di-refresh)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]