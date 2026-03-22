FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts
COPY docs ./docs
COPY datasets ./datasets
COPY README.md README_zh.md ROADMAP.md ROADMAP_zh.md ./
COPY LICENSE SECURITY.md CONTRIBUTING.md ./
COPY data/.gitkeep ./data/.gitkeep

EXPOSE 3456

CMD ["node", "src/server.js"]
