# Invitanding

Sitio estático reconstruido desde Squarespace: invitaciones digitales, demos y páginas auxiliares.

## Contenido principal

- **`site/`** — HTML, CSS, JS e imágenes listos para **Netlify** (u otro hosting estático).
- Exportaciones HTML de referencia en la raíz (`Demo *`, `index.html`, etc.).
- `Squarespace-Wordpress-Export-04-10-2026.xml` — export XML de Squarespace.

Las grabaciones `.mov` no se versionan (límite de tamaño en GitHub); guárdalas aparte si las necesitas.

## Publicar en Netlify

Despliega la carpeta **`site/`** como directorio de publicación (o la raíz del repo si solo contienes el sitio).

## Subir este proyecto a GitHub (si aún no lo hiciste)

1. Crea un repositorio vacío en [github.com/new](https://github.com/new) (sin README si ya tienes uno aquí).
2. En la carpeta del proyecto:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

Sustituye `TU_USUARIO` y `TU_REPO` por tu usuario y nombre del repo.
