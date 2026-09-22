# Mi Tienda

Tienda online propia (estilo Shopify) para vender productos y servicios, con panel de administración, cuentas de cliente, reservas/citas para servicios y pagos reales con Mercado Pago.

## Stack técnico

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**
- **PostgreSQL** con **Drizzle ORM** (pensado para usar una base de datos gratuita en la nube, como Neon)
- Autenticación propia con **cookies httpOnly + JWT**
- Server Actions de React para formularios (registro, login, reservas, checkout, panel admin)
- **Mercado Pago (Checkout Pro)** para cobrar productos online

## Requisitos

- Node.js 20.9 o superior
- npm
- Una base de datos PostgreSQL (para desarrollo local puedes usar una instalada en tu computador, o ya usar directamente una gratuita en la nube como [Neon](https://neon.tech) — ver más abajo)

## Primeros pasos

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Edita el archivo `.env`:
   - `DATABASE_URL`: cadena de conexión a tu base de datos Postgres (ver sección "Publicar tu tienda en internet" más abajo si aún no tienes una)
   - `AUTH_SECRET`: clave para firmar las sesiones (cámbiala si vas a producción)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: credenciales del usuario administrador que crea el script de datos de ejemplo

3. Crea las tablas y carga datos de ejemplo (categorías, productos, servicios y el usuario admin):

   ```bash
   npm run db:setup
   ```

   Esto ejecuta `db:push` (crea las tablas según `src/db/schema.ts`) y `db:seed` (inserta datos de ejemplo).

4. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Acceso al panel de administración

Ve a `http://localhost:3000/admin/login` e ingresa con las credenciales definidas en `.env`:

- Correo: `admin@tienda.cl`
- Contraseña: `Admin1234`

**Importante:** cambia esta contraseña antes de usar el sitio en producción (puedes crear un nuevo usuario admin directamente en la base de datos, o ajustar el script `src/db/seed.ts`).

Desde el panel puedes:

- Crear, editar y eliminar **productos** (nombre, precio, stock, categoría, imagen)
- Crear, editar y eliminar **servicios** (nombre, precio, duración)
- Ver y actualizar el estado de los **pedidos**
- Ver y actualizar el estado de las **reservas**

## Funcionalidades de la tienda

- Catálogo de productos con carrito de compras (persistido en el navegador) y checkout
- Catálogo de servicios con formulario de reserva/cita
- Cuentas de cliente (registro, login, historial de pedidos y reservas)
- Panel de administración protegido (solo usuarios con rol `admin`)
- Pago real de productos con **Mercado Pago** (Checkout Pro) — ver sección siguiente

## 💳 Activar pagos reales con Mercado Pago

La tienda viene integrada con **Mercado Pago (Checkout Pro)**: mientras no configures credenciales, sigue funcionando en **modo demo** (los pedidos quedan "pendientes" y no se cobra nada). Cuando agregues tus credenciales, el botón de pago redirige al cliente a Mercado Pago, y una vez que paga, Mercado Pago le avisa a tu tienda automáticamente (webhook) para marcar el pedido como pagado y descontar el stock.

### 1. Crea tu cuenta de Mercado Pago (sin necesidad de empresa formalizada)

Puedes abrir una cuenta como **persona natural**, solo con tu cédula y RUT, en [mercadopago.cl](https://www.mercadopago.cl/). El dinero de tus ventas se acumula en tu cuenta de Mercado Pago y desde ahí puedes transferirlo a tu cuenta bancaria personal.

> **Nota legal/tributaria:** para vender de forma completamente formal en Chile (emitir boletas), en algún momento vas a necesitar hacer "Inicio de Actividades" en el SII (gratis, 100% online, no requiere crear una empresa — lo puedes hacer como persona natural). No soy asesor legal ni tributario; si tienes dudas sobre tu caso, conviene confirmar con un contador o directamente en sii.cl.

### 2. Obtén tus credenciales

1. Entra a [Tus integraciones](https://www.mercadopago.cl/developers/panel/app) dentro del panel de desarrolladores de Mercado Pago (con tu misma cuenta).
2. Crea una aplicación (te van a pedir el nombre de tu tienda y para qué la vas a usar — elige "Pagos online" / Checkout Pro).
3. En la sección **Credenciales de producción**, copia el **Access Token** (empieza con `APP_USR-...`). Mientras estés probando, también puedes usar las **credenciales de prueba** (empiezan con `TEST-...`).
4. En la sección de **Notificaciones / Webhooks** de la misma aplicación, configura la URL `https://tu-sitio.vercel.app/api/mercadopago/webhook` (usa la URL real que te dé Vercel, ver más abajo) y copia la **clave secreta** que te genera.

### 3. Variables de entorno

```bash
APP_URL="https://tu-sitio.vercel.app"     # la URL pública de tu tienda, con https
MP_ACCESS_TOKEN="APP_USR-..."             # tu access token de producción (o TEST-... para pruebas)
MP_WEBHOOK_SECRET="..."                   # la clave secreta de la sección de Notificaciones
```

### 4. Importante sobre el webhook en desarrollo local

Mercado Pago necesita poder llamar a tu `notification_url` desde internet, así que **no puede alcanzar `http://localhost:3000`**. Para probar el flujo completo en tu computador (incluyendo la confirmación automática del pago) puedes usar una herramienta de túnel como [ngrok](https://ngrok.com/) apuntando a tu `localhost:3000`. Una vez que publiques la tienda (siguiente sección), esto deja de ser un problema porque ya tendrás una URL pública real.

Si el webhook no llega a ejecutarse por algún motivo, el pedido queda como "pendiente" aunque el cliente haya pagado; siempre puedes marcarlo manualmente como "pagado" desde `/admin/pedidos`.

### 5. Ir a producción

Cuando pases de credenciales `TEST-...` a las de **producción** (`APP_USR-...`), Mercado Pago empezará a procesar pagos reales y el dinero se depositará en tu cuenta de Mercado Pago según sus tiempos de liquidación habituales.

## 🌐 Publicar tu tienda en internet (gratis, sin comprar un dominio)

Esta guía usa **Vercel** (para alojar la tienda) + **Neon** (base de datos Postgres gratis en la nube). Ambos tienen plan gratuito para siempre, sin pedir tarjeta de crédito, y Vercel te da una dirección propia gratis del tipo `mi-tienda.vercel.app` — no necesitas comprar un dominio para empezar a vender.

### Paso 1: Crea tu base de datos gratis en Neon

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta gratis (con Google o GitHub es más rápido).
2. Crea un proyecto nuevo (cualquier nombre y región te sirve; elige una región cercana a Chile si aparece, como São Paulo).
3. En el panel del proyecto, copia el **Connection string** (cadena de conexión). Se ve algo así:
   ```
   postgresql://usuario:contraseña@ep-xxxxx.región.aws.neon.tech/neondb?sslmode=require
   ```

### Paso 2: Crea las tablas en tu base de datos de Neon

En tu computador, dentro de la carpeta del proyecto:

1. Reemplaza `DATABASE_URL` en tu `.env` por la cadena de conexión de Neon que copiaste.
2. Ejecuta:
   ```bash
   npm run db:setup
   ```
   Esto crea todas las tablas en Neon y carga los datos de ejemplo (incluyendo tu usuario admin).

### Paso 3: Crea tu cuenta en Vercel y publica la tienda

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratis (con GitHub es lo más simple).
2. **Opción fácil (sin usar GitHub):** instala la herramienta de Vercel y publica directo desde tu computador:
   ```bash
   npx vercel login
   npx vercel
   ```
   Sigue las instrucciones en pantalla (acepta las opciones por defecto). Al terminar, Vercel te va a dar una URL como `https://mi-tienda-xxxx.vercel.app`.
3. **Opción con GitHub (recomendada a futuro):** sube este proyecto a un repositorio de GitHub y luego, en vercel.com, elige "Add New… → Project" e impórtalo desde ahí. Así cada vez que subas un cambio a GitHub, Vercel actualiza tu tienda automáticamente.

### Paso 4: Configura las variables de entorno en Vercel

En el panel de tu proyecto en Vercel, ve a **Settings → Environment Variables** y agrega las mismas variables que tienes en tu `.env` local:

- `DATABASE_URL` (la cadena de conexión de Neon)
- `AUTH_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `APP_URL` (pon aquí la URL que te dio Vercel, ej: `https://mi-tienda-xxxx.vercel.app`)
- `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` (cuando actives Mercado Pago)

Después de agregar las variables, vuelve a publicar (`npx vercel --prod`, o simplemente vuelve a subir un cambio si usas GitHub) para que los cambios tomen efecto.

### Paso 5: Actualiza el webhook de Mercado Pago con tu URL real

Vuelve al panel de Mercado Pago (sección Notificaciones de tu aplicación) y cambia la URL del webhook a:

```
https://mi-tienda-xxxx.vercel.app/api/mercadopago/webhook
```

(usando tu URL real de Vercel).

### ¿Y si más adelante quiero mi propio dominio (mitienda.cl)?

Cuando compres un dominio (en NIC Chile u otro proveedor), en Vercel vas a **Settings → Domains**, lo agregas, y sigues las instrucciones para apuntar el dominio hacia Vercel. No necesitas volver a publicar nada ni cambiar código — solo actualiza `APP_URL` con el nuevo dominio y avísale a Mercado Pago la nueva URL del webhook.

## Notas importantes

- La base de datos es PostgreSQL; en desarrollo puedes usar una instancia local o, más simple, conectarte directo a tu base de Neon desde el principio.
- Las imágenes de productos/servicios son opcionales (se puede indicar una URL); si no se define, se muestra un ícono de reemplazo.
- Las reservas de servicios no se cobran online por ahora (quedan "pendientes" hasta que las confirmes manualmente); solo el pago de productos pasa por Mercado Pago.

## Scripts disponibles

| Comando            | Descripción                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Levanta el servidor de desarrollo                     |
| `npm run build`     | Compila la aplicación para producción                 |
| `npm run start`     | Sirve la build de producción                          |
| `npm run db:push`   | Sincroniza el esquema de Drizzle con la base de datos |
| `npm run db:seed`   | Carga datos de ejemplo (y el usuario admin)           |
| `npm run db:setup`  | Ejecuta `db:push` y `db:seed` en un solo paso         |
| `npm run lint`      | Corre ESLint                                          |

## Próximos pasos sugeridos

- Comprar un dominio propio (opcional) y conectarlo en Vercel
- Subir imágenes de productos/servicios (actualmente solo se admite una URL)
- Agregar notificaciones por correo al confirmar pedidos/reservas
- Cobrar también las reservas de servicios con Mercado Pago (hoy solo se cobran los productos)
