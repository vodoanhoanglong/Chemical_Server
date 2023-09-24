
FROM node:16.13.0-alpine3.14 AS builder

ENV folder=events

WORKDIR /usr/src/shared
COPY services/shared/package*.json ./
RUN npm ci
WORKDIR /usr/src/app
COPY services/${folder}/package*.json ./
RUN npm ci

WORKDIR /usr/build/shared
COPY services/shared/package*.json ./
RUN npm ci --production
WORKDIR /usr/build/app
COPY services/${folder}/package*.json ./
RUN npm ci --production

WORKDIR /usr/src/shared
COPY services/shared .
RUN npm run build
WORKDIR /usr/src/app
COPY services/${folder} .
RUN npm run build

FROM node:16.13.0-alpine3.14 AS production

WORKDIR /usr/src/shared
COPY services/shared/package*.json ./
COPY --from=builder /usr/build/shared/node_modules ./node_modules
COPY --from=builder /usr/src/shared/dist ./dist

WORKDIR /usr/src/app
COPY --from=builder /usr/build/app ./
COPY --from=builder /usr/src/app/dist ./dist

CMD ["npm","start"]
