FROM node:20-buster-slim as base
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install --location=global npm

FROM base as dev
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM base as production
ENV NODE_ENV=production
RUN npm install --production
COPY . .
CMD ["npm", "start"]

