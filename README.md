# Gallardo Camp

Web del evento construida con Next.js, TypeScript y Tailwind CSS.

## Desarrollo

Requiere Node.js 20 y pnpm 10.

```bash
pnpm install
pnpm dev
```

La aplicación estará disponible en <http://localhost:3000>.

## Administración

Copia `.env.example` a `.env.local` y define la contraseña de administrador:

```bash
ADMIN_PASSWORD=una-password-privada
```

El panel está disponible en <http://localhost:3000/admin>. La parte pública no
requiere autenticación. Al cambiar `ADMIN_PASSWORD` se invalidan las sesiones
de administración existentes.

## Usuarios y Azure Table Storage

Los participantes se registran e inician sesión en `/login`. Configura estas
variables en `.env.local` y como secretos/variables de Azure Container Apps:

```bash
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_USERS_TABLE_NAME=Users
USER_SESSION_SECRET=un-secreto-largo-y-aleatorio
```

La tabla de usuarios se crea automáticamente. Las contraseñas se guardan con
salt y hash; desde `/admin` se pueden sustituir, pero nunca consultar.

Una misma sesión puede mantener varios participantes activos para compartir un
dispositivo. El desplegable de la navegación permite cambiar el perfil activo,
añadir otro usuario o cerrar todas las sesiones. `/perfil` muestra sus puntos y
un QR que codifica el username.

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
