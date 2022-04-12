FROM node:16-alpine as frontend-build

WORKDIR /app

COPY web/package*.json /app/
COPY web/tsconfig.json /app/

RUN npm ci

COPY web/src /app/src
COPY web/public /app/public
COPY web/craco.config.js /app/

RUN npm run build

FROM node:16-alpine as backend-build

WORKDIR /app

COPY server/package*.json /app/
COPY server/tsconfig.json /app/

RUN npm ci

COPY server/src /app/src
COPY server/index.ts /app/index.ts

RUN npm run build

COPY --from=frontend-build /app/build /app/public

CMD ["npm", "start"]