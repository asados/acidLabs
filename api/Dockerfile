# Dockerfile
FROM node:10
WORKDIR '/var/www/app'
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8091
CMD [ "npm", "start" ]
