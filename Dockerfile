FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install

COPY . .

EXPOSE 4000

CMD ["pnpm", "run", "dev"]