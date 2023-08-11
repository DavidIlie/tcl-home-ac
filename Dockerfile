FROM node:18.16.0-alpine as base

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY src ./src
COPY tsconfig.json ./tsconfig.json

RUN pnpm build

FROM node:18.16.0-alpine

COPY --from=base ./node_modules ./node_modules
COPY --from=base /dist /dist

EXPOSE 3000
CMD ["dist/index.js"]
