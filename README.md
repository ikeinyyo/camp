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
AZURE_STORAGE_SECTIONS_TABLE_NAME=Sections
AZURE_STORAGE_VOUCHERS_TABLE_NAME=Vouchers
AZURE_STORAGE_ACTIVITIES_TABLE_NAME=Activities
AZURE_STORAGE_POINTS_TABLE_NAME=Points
AZURE_STORAGE_TAPAS_TABLE_NAME=Tapas
AZURE_STORAGE_TAPAS_CONTAINER_NAME=tapas
USER_SESSION_SECRET=un-secreto-largo-y-aleatorio
```

Las tablas de usuarios y secciones se crean automáticamente. Las contraseñas se guardan con
salt y hash; desde `/admin` se pueden sustituir, pero nunca consultar.

Una misma sesión puede mantener varios participantes activos para compartir un
dispositivo. El desplegable de la navegación permite cambiar el perfil activo,
añadir otro usuario o cerrar todas las sesiones. `/perfil` muestra sus puntos,
su posición y el historial de recompensas.

Desde `/admin/sections` se puede habilitar o deshabilitar cada sección pública.
Las secciones desactivadas desaparecen de la navegación y redirigen a la home.

## Vales

La sección `/vales` permite a un participante solicitar la validación de una
tarea mediante un QR de un solo uso. Desde `/admin/vouchers` se administra el
catálogo y se aplican vales manualmente. `/admin/activities` administra la
agenda, la participación y los premios de podio. El lector común está en
`/admin/validation`. Cada recompensa se registra en el desglose del perfil.
La cámara requiere
HTTPS en producción (o `localhost` durante el desarrollo).

## Concurso de tapas

La sección `/tapas` muestra el catálogo, la votación o el ranking según el
estado configurado en `/admin/tapas`. Cada participante puede emitir una única
papeleta con 5, 3 y 1 puntos para tapas diferentes. Los empates se resuelven
por votos de 5, después de 3 y finalmente de 1; si persisten, comparten puesto.
Las fotografías cuadradas
se almacenan en un contenedor privado de Azure Blob Storage.

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
