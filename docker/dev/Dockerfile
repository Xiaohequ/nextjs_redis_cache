FROM node:20-alpine AS base

# Active Corepack pour pnpm dans une couche unique
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copie des fichiers de lock et package pour cache Docker (utilisez pnpm-lock.yaml !)
COPY pnpm-lock.yaml package.json ./

# Installation des dépendances (toutes, pour dev)
RUN pnpm install --frozen-lockfile

# Copie du reste du code
COPY . .

EXPOSE 3000
EXPOSE 3001

CMD ["pnpm", "run", "dev"]