# Dockerfile (DEV)
FROM node:24-alpine

WORKDIR /app

# Installer les deps d'abord (cache docker)
COPY package*.json ./
RUN npm ci

# Copier le reste
COPY . .

EXPOSE 5173

# Vite doit écouter sur 0.0.0.0 dans un conteneur
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]



## 1) Build
#FROM node:24-alpine AS build
#WORKDIR /app
#COPY package*.json ./
#RUN npm ci
#COPY . .
#RUN npm run build
#
## 2) Serve (image finale légère)
#FROM nginx:alpine
#COPY --from=build /app/dist /usr/share/nginx/html
#EXPOSE 5173
