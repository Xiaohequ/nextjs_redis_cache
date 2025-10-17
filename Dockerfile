FROM guergeiro/pnpm:current-latest-slim
COPY . .
RUN pnpm install
CMD ["pnpm", "start"]