# Gallardo Camp

Web del evento construida con Next.js, TypeScript y Tailwind CSS.

## Desarrollo

Requiere Node.js 20 y pnpm 10.

```bash
pnpm install
pnpm dev
```

La aplicación estará disponible en <http://localhost:3000>.

## Comprobaciones

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm check:all
```

Para la primera ejecución de Playwright:

```bash
pnpm exec playwright install chromium
```

## Docker

```bash
docker build -t gallardo-camp .
docker run --rm -p 3000:3000 gallardo-camp
docker buildx build --platform linux/amd64 -t crgallardoglobalshared.azurecr.io/camp:v0.0.1 --push .
```
