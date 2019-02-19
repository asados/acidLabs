# Dockerfile
FROM node:10
WORKDIR '/var/www/app'
COPY package*.json ./
COPY . .
EXPOSE 8090
CMD [ "npm", "start" ]
