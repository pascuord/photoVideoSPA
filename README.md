# Photo/Video SPA — Portfolio

> Una **Single Page App** para mostrar galería de fotos/vídeos con blog, “likes” con animaciones, login por *magic link* (Supabase), y backend Express. Optimizada para portfolio: código limpio, UX moderna y buen rendimiento.

[![Angular](https://img.shields.io/badge/Angular-17+-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4+-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3+-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Demo

- **Live**: <!-- Pega aquí tu URL de Vercel/Netlify/Railway → --> `https://tu-dominio.dev`  
- **Video corto (opcional)**: `https://youtu.be/xxx`

---

## 📸 Capturas

> Arrastra aquí imágenes o GIFs mostrando:
- Home con **Hero Carousel** + **Galería** (tilt, shimmer, blur-up).
- Página **Blog** (listado + detalle, media enlazado).
- **Modal de login** con *magic link* y **pared suave** (soft-wall).
- Flujo **“Like diferido”** (guardado en local y ejecución tras login).
- Animación **confetti** al dar like (Lottie con fallback a canvas-confetti).

```
/docs/screenshots/01-home.png
/docs/screenshots/02-gallery.png
/docs/screenshots/03-blog-list.png
/docs/screenshots/04-blog-detail.png
/docs/screenshots/05-login-modal.png
```

---

## 🧱 Stack & Arquitectura

**Frontend**
- Angular 17+ (standalone components, signals, @defer, SSR friendly).
- Vite + AnalogJS Router (file-based routing).
- TailwindCSS + utilidades (focus-ring, shadows, glass).
- Animaciones: `motion` (micro-bounce), `lottie-web` + fallback `canvas-confetti`.
- Directivas UX: tilt 3D, anti-download, auto-animate.

**Backend**
- Node.js + Express.
- Supabase (Auth, Storage, Postgres).
- Endpoints REST bajo `/api`.

**Estructura (resumen)**
```
frontend/
  src/app/
    pages/
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
    utils/validators.ts
```

---

## 🔐 Autenticación

- **Supabase Auth** con *magic link* (email).
- **Whitelist** de emails: solo correos permitidos reciben el enlace.(Pendiente)
- Soft-wall: si no hay sesión y haces “like”, se abre el **modal**.  
  - Si cierras el modal → **fallback** a `/auth?redirect=...`.  
  - Si envías email → al completar el login, el **like diferido** se ejecuta y vuelves donde estabas.

---

## ❤️ Likes con acción diferida

- Si estás sin sesión y pulsas “like”, se guarda:
  ```json
  { "contentType": "image", "contentId": "...", "ts": 1690000000 }
  ```
  en `localStorage` (servicio `PendingActionService`).
- Tras el login, el **AppComponent** revisa y ejecuta la acción.

---

## 🗄️ Esquema de datos (Postgres/Supabase)

- **media_items**: `id (uuid)`, `slug`, `title`, `type (image|video)`, `storage_path`, `thumbnail_path`, `watermark_text`, `created_at`.
- **blog_posts**: `id (uuid)`, `slug`, `title`, `body`, `cover_image`, `linked_media_id (uuid)`, `linked_media_slug`, `created_at`.
- **likes**: `id`, `user_id`, `content_type`, `content_id`, timestamps.

---

## 🔌 Endpoints principales

- `GET /api/media?type=image|video&limit=20`  
  Devuelve media **con URLs firmadas** y `hasPost: boolean` si existe post enlazado.
- `GET /api/blog` y `GET /api/blog/:slug`  
  Listado y detalle de posts; cada post puede incluir `linkedMedia`.
- `GET /api/stats/:contentType/:contentId`  
  Likes, comments, shares (y `likedByMe` si hay token).
- `POST /api/likes` *(auth requerida)*  
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
SUPABASE_SERVICE_KEY=...     # clave de servicio (server-side)
ALLOWED_EMAILS=ana@dev.com,pedro@dev.com  # whitelist para magic link
```

---

## 🚀 Ejecutar en local

```bash
# 1) Backend
cd backend
pnpm i    # o npm i / yarn
pnpm dev  # levanta Express en :3000

# 2) Frontend
cd ../frontend
pnpm i
pnpm dev  # Vite en :5173 (proxy /backend -> http://localhost:3000/api)
```

> En `vite.config.ts` el proxy reescribe `/backend` → `/api` hacia el puerto 3000.

---

## 📜 Scripts útiles (frontend)

```bash
pnpm dev          # Vite + HMR
pnpm build        # build producción
pnpm preview      # previsualizar build
pnpm test         # unit tests (vitest + jsdom)
```

**Backend**
```bash
pnpm dev          # ts-node-dev
pnpm build        # tsc
pnpm start        # node dist/index.js
```

---

## ✅ Checklist de calidad

- **Accesibilidad**: `aria-*`, foco visible (`focus-ring`), contraste, labels correctos.
- **Rendimiento**: imágenes lazy, `blur-up`, `content-visibility`, *defer chunks*.
- **UX**: feedback en botones (pending), toasts de error, transiciones suaves.
- **SSR-friendly**: `isPlatformBrowser` para APIs de DOM/Storage.
- **Seguridad**: endpoints sensibles requieren token; likes verificados por server.

---

## 🧪 Casos de prueba recomendados

- **Galería**  
  - Render de grid, *skeleton* en carga, manejo de errores.  
  - Imágenes con/ sin `thumbnail_path`.  
  - Card con/ sin post → solo link cuando `hasPost = true`.
- **Blog**  
  - Lista + paginación (opcional).  
  - Detalle por `slug`, media enlazado.  
  - 404 cuando no existe.
- **Auth**  
  - Whitelist: email permitido recibe *magic link*, no permitido → 403.  
  - Redirección `redirect` tras login.  
  - Ejecución de **like diferido** tras login.
- **Likes**  
  - Optimistic UI, rollback en error.  
  - `likedByMe` coherente con backend.
- **Confetti/Animación**  
  - Lottie en navegadores soportados; fallback a `canvas-confetti`.  
  - Respeta `prefers-reduced-motion`.

---

## 🗺️ Roadmap

- [ ] Modo oscuro/claridad automática (si no está ya).
- [ ] Render Markdown/MDX para posts (syntax highlight).
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
