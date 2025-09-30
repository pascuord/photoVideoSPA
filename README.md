# Photo/Video SPA — Portfolio

> Una **Single Page App** para galería de fotos/vídeos con blog, “likes” con animaciones, login por _magic link_ (Supabase) y backend Express. Pensada para portfolio: código limpio, UX moderna y buen rendimiento.

[![Angular](https://img.shields.io/badge/Angular-17+-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4+-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3+-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Demo

- **Live**: `https://photo-video-spa.vercel.app/`

---

## 🧱 Stack & Arquitectura

**Frontend**

- Angular 17+ (standalone components, signals, `@defer`, SSR-friendly).
- Vite + AnalogJS Router (file-based routing).
- TailwindCSS utilitario (focus-ring, shadows, glass).
- Animación micro: `motion` (bounce), `lottie-web` + fallback `canvas-confetti`.
- Directivas UX: tilt 3D, anti-download, auto-animate.

**Backend**

- Node.js + Express.
- Supabase (Auth, Storage, Postgres).
- Endpoints REST bajo `/api`.

**Estructura (resumen)**

```
frontend/
  src/app/
    pages/                      # routing por archivos
      index.page.ts
      blog/
        index.page.ts
        [slug].page.ts
      gallery.page.ts
    shared/
      components/
        like-button.component.ts
        hero-carousel.component.ts
        login-modal.component.ts
      directives/
        tilt.directive.ts
        anti-download.directive.ts
        auto-animate.directive.ts
    core/services/
      interact.service.ts
      pending-action.service.ts
      login-modal.service.ts

backend/
  src/
    index.ts
    routes/
      media.ts
      blog.ts
      stats.ts
      likes.ts
    db/supabase.ts
    middleware/error.ts
    utils/validators.ts
```

---

## 🔐 Autenticación

- **Supabase Auth** con _magic link_ (email).
- **Whitelist** de emails (opcional): solo correos permitidos reciben el enlace.
- **Soft-wall**: si no hay sesión y haces “like”, se abre el modal;
  al completar login, se ejecuta el **like diferido** y vuelves donde estabas.

---

## ❤️ Likes con acción diferida

- Si no hay sesión y pulsas “like”, se guarda en `localStorage`:
  ```json
  { "contentType": "image", "contentId": "...", "ts": 1690000000 }
  ```
  (servicio `PendingActionService`). Tras el login, `AppComponent` revisa y ejecuta.

---

## 🗄️ Esquema de datos (Postgres/Supabase)

- **media_items**: `id (uuid)`, `slug`, `title`, `type (image|video)`, `storage_path`, `thumbnail_path`, `watermark_text`, `created_at`.
- **blog_posts**: `id (uuid)`, `slug`, `title`, `body`, `cover_image`, `linked_media_id (uuid)`, `linked_media_slug`, `created_at`.
- **likes**: `id`, `user_id`, `content_type`, `content_id`, `created_at`.

> Incluye `schema.sql` y `seed.sql` básicos en `backend/src/db/` (o ver ejemplo en este README).

---

## 🔌 Endpoints principales

- `GET /api/media?type=image|video&limit=20`  
  Devuelve media **con URLs firmadas** y `hasPost: boolean` si existe post enlazado.
- `GET /api/blog` y `GET /api/blog/:slug`  
  Listado y detalle de posts; cada post puede incluir `linkedMedia`.
- `GET /api/stats/:contentType/:contentId`  
  Likes, comments, shares y `likedByMe` si hay token válido.
- `POST /api/likes` _(auth requerida)_  
  Alterna like/unlike para el usuario.

---

## ⚙️ Variables de entorno

### Frontend `.env`

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
# Si usas backend externo en prod:
# VITE_API_BASE_URL=https://tu-backend.com
```

### Backend `.env`

```bash
PORT=3000
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...                  # clave de servicio (server-side)
ALLOWED_EMAILS=ana@dev.com,pedro@dev.com  # whitelist para magic link (opcional)
```

---

## 🚀 Ejecutar en local

```bash
# 1) Backend
cd backend
pnpm i            # (o npm i / yarn)
pnpm dev          # Express en :3000

# 2) Frontend
cd ../frontend
pnpm i
pnpm dev          # Vite en :5173 (proxy /backend -> http://localhost:3000/api)
```

> En `vite.config.ts` el proxy reescribe `/backend` → `/api` hacia el puerto 3000.

---

## 📜 Scripts útiles

**Frontend**

```bash
pnpm dev          # Vite + HMR
pnpm build        # Build producción
pnpm preview      # Servir build
pnpm test         # Unit tests (vitest + jsdom)
```

**Backend**

```bash
pnpm dev          # ts-node-dev
pnpm build        # tsc
pnpm start        # node dist/index.js
pnpm test         # (si configuras tests en backend)
```

---

## 🧪 Casos de prueba recomendados

- **Galería**
  - Render de grid, _skeleton_ en carga, manejo de errores.
  - Imágenes con/sin `thumbnail_path`.
  - Card con/sin post → solo link cuando `hasPost = true`.
- **Blog**
  - Lista + paginación (opcional).
  - Detalle por `slug`, media enlazado.
  - 404 cuando no existe.
- **Auth**
  - Whitelist: email permitido recibe _magic link_, no permitido → 403.
  - Redirección `redirect` tras login.
  - Ejecución de **like diferido** tras login.
- **Likes**
  - Optimistic UI, rollback en error.
  - `likedByMe` coherente con backend.
- **Animación**
  - Lottie en navegadores soportados; fallback a `canvas-confetti`.
  - Respeta `prefers-reduced-motion`.

---

## ✅ Checklist de calidad

- **Accesibilidad**: `aria-*`, foco visible (`focus-ring`), contraste, labels correctos.
- **Rendimiento**: lazy images, `blur-up`, `content-visibility`, chunks con `@defer`.
- **UX**: feedback en botones (pending), toasts de error, transiciones suaves.
- **SSR-friendly**: `isPlatformBrowser` para DOM/Storage, guards en datos críticos.
- **Seguridad**: endpoints sensibles con token; verificación de likes en servidor.

---

## 🧰 Supabase — Quickstart (opcional)

1. Crea un proyecto en Supabase y copia **URL** y **Anon Key** (frontend) y **Service Role** (backend).
2. En **Authentication** → activa Email OTP (magic link). (Si quieres whitelist, usa `ALLOWED_EMAILS`).
3. En **Storage** crea un bucket `media` privado.
4. Aplica el esquema:

```sql
-- schema.sql (extracto)
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  type text check (type in ('image','video')) not null,
  storage_path text not null,
  thumbnail_path text,
  watermark_text text,
  created_at timestamptz default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  body text not null,
  cover_image text,
  linked_media_id uuid references public.media_items(id),
  linked_media_slug text,
  created_at timestamptz default now()
);

create table if not exists public.likes (
  id bigserial primary key,
  user_id uuid not null,
  content_type text check (content_type in ('image','video','post')) not null,
  content_id uuid not null,
  created_at timestamptz default now()
);
```

5. **Policies** (RLS) recomendadas:
   - `media_items`, `blog_posts`: `SELECT` público; `INSERT/UPDATE/DELETE` solo admin.
   - `likes`: `SELECT` público; `INSERT/DELETE` solo `auth.uid() = user_id`.

---

## 🚢 Deploy (pista rápida)

- **Frontend**: Vercel/Netlify. Define `VITE_*` en variables de proyecto.
- **Backend**: Railway/Render/Vercel Functions/Nitro. Define `SUPABASE_URL` y `SUPABASE_SERVICE_KEY`.
- **Storage**: usa URLs firmadas desde el backend para archivos privados.

---

## 🛠️ Troubleshooting

- **Supabase CLI**: no instales con `npm i -g supabase`. Usa su instalador oficial o paquete del sistema.
- **DNS en curl**: si `curl ... supabase.com` falla con “Could not resolve host”, revisa la red/DNS o prueba más tarde.
- **Node versions**: Frontend y backend probados con Node 20+. Evita 22.x si ves incompatibilidades en dependencias.

---

## 🗺️ Roadmap

- [ ] Modo oscuro/auto.
- [ ] Markdown/MDX para posts (syntax highlight).
- [ ] Búsqueda y filtrado por tags.
- [ ] Paginación/infinite scroll en galería.
- [ ] Panel admin (crear post/media).
- [ ] Tests E2E (Playwright/Cypress).
- [ ] i18n (ES/EN).

---

## 📝 Licencia

MIT © **pascuord**

---

## 📬 Contacto

- Web/Portfolio: `https://pascualordinanasoler.framer.website/`
- X/Instagram: `@pascuord`
- Email: `pascuord@gmail.com`
