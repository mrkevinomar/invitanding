# Contexto del proyecto Invitanding (handoff)

Documento para **pasar contexto a otro chat, agente o repositorio**. Resume decisiones, estructura y problemas conocidos hasta abril 2026.

---

## Qué es este proyecto

Sitio web **estático** de la marca **Invitanding** (invitaciones digitales, SnapCards, demos). El contenido publicable vive bajo **`site/`** (HTML, CSS, JS, imágenes).

- **Raíz del repo** (`/Users/kevin/StudioProjects/invitanding`): Git, `.gitignore`, este archivo.
- **Sitio**: `site/index.html` como entrada principal; subpáginas (`contact.html`, `historia.html`, demos, snapcards).

---

## Stack y convenciones

- HTML5, CSS en **`site/assets/css/main.css`** (incluye estilos de marketing + prefijo **`.demo-*`** para páginas de invitación demo).
- JS ligero: **`site/assets/js/scroll-reveal.js`** (revelado al scroll; clases `reveal-section`, `reveal-item` en demos).
- Fuentes: **Cormorant Garamond** + **Poppins** (Google Fonts), enlazadas en el `<head>` de las páginas demo y según corresponda.
- Imágenes: **`site/assets/img/`** (hero, ceremonia, recepción, historia, floral banner, logo, favicon, etc.).

---

## Páginas demo de invitación

| Archivo | Rol |
|--------|-----|
| `site/demo-classic.html` | Demo **completa**; referencia visual y de estructura (hero claro, ceremonia/recepción, historia tríptico, RSVP gris, regalos, banner floral, footer `site-footer sqs-animate`). |
| `site/demo-signature.html` | Misma base que Classic; añade bloque **Dress code + Playlist** (dos columnas texto, clase `.demo-cols--text-pair`). Pareja de ejemplo: Lucía y Tomás. |
| `site/demo-premium.html` | Misma base; añade **cuenta regresiva estática** (`.demo-countdown`, `.demo-countdown__grid`, etc.) y sección **Información adicional** (hospedajes / notas). Pareja de ejemplo: Valentina y Mateo; tercera foto del tríptico puede usar `couple-circle.jpg`. |

**Problema histórico resuelto:** Signature y Premium antes eran **stubs** (solo un `<section class="stub">`); “no salían” en el sentido de no mostrar una invitación real. Ahora replican la estructura de Classic con diferencias de contenido/paquete.

**CSS añadido en `main.css` (además del existente para demos):**

- `.demo-cols--text-pair` — dos columnas solo texto en desktop.
- `.demo-countdown`, `.demo-countdown__grid`, `.demo-countdown__unit`, `.demo-countdown__num`, `.demo-countdown__label`, `.demo-countdown__note` (esta última con selector más específico para ganar a `.demo-section p.large`).

---

## Otras páginas HTML en `site/`

- `index.html` — Home (hero, paquetes, CTAs, etc.).
- `contact.html`, `historia.html`
- `snapcard-basica.html`, `snapcard-interactiva.html`

El menú del header enlaza a demos y snapcards; conviene mantener rutas relativas (`assets/...`, `demo-classic.html`, etc.).

---

## Git y GitHub

- El remoto **`origin`** llegó a apuntar a  
  `https://github.com/link-org/invitanding.git`  
  que suele ser un **placeholder** de tutoriales (`link-org` no es tu usuario real).

**Síntoma:** `git push -u origin main` → `remote: Repository not found`.

**Qué hacer:**

1. Crear el repo vacío en GitHub bajo **tu usuario u organización real**.
2. `git remote set-url origin https://github.com/TU_USUARIO/invitanding.git`
3. Autenticación HTTPS con **token** o usar **SSH**.
4. `git push -u origin main`

Si aparece `remote origin already exists`, no hace falta `remote add` otra vez; solo `set-url`.

---

## `.gitignore` (resumen)

- `*.mov` — evita pushes que GitHub rechace por tamaño.
- `.DS_Store`, `.cursor/`, `.idea/`, swap.

---

## Cómo seguir en otro proyecto / otro agente

1. Abrir este archivo o copiarlo al nuevo repo.
2. Trabajar siempre desde **`site/`** para el sitio estático.
3. Para nuevas secciones en demos, copiar patrón de **`demo-classic.html`** y reutilizar clases `.demo-*`.
4. Tras cambios visuales amplios, revisar **`main.css`** buscando `--demo-` y `.demo-`.
5. Antes de push: comprobar `git remote -v` y que el repo exista en GitHub.

---

## Ruta absoluta local (referencia)

`/Users/kevin/StudioProjects/invitanding`

Ajustar si el clon vive en otra carpeta.

---

*Generado para handoff entre sesiones/proyectos. Actualizar este archivo si cambia la arquitectura o las URLs del remoto.*
