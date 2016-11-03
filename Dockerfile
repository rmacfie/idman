FROM mhart/alpine-node:6.9.1
MAINTAINER Robert Macfie <robert@macfie.se>

WORKDIR /app
COPY . /app

ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
CMD ["node", "src/server.js"]
