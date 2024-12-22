FROM oven/bun AS build

WORKDIR /app

# Cache packages installation
COPY package.json package.json
COPY bun.lockb bun.lockb
COPY bun.lockb bun.lockb
COPY .npmrc .npmrc

RUN bun install

COPY ./src ./src

ENV NODE_ENV=production

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	./src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server
COPY ./src/database/mcpdict.db mcpdict.db

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000