FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV HOSTNAME=0.0.0.0
EXPOSE 4317
CMD ["sh", "-c", "next start --hostname 0.0.0.0 --port ${PORT:-4317}"]
