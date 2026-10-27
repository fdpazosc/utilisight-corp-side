# Utilisight Corp — Sitio web

Sitio corporativo de Utilisight Corp (inspecciones térmicas con dron en Ontario).
Producción: <https://utilisight.ca>

## Tecnología

| Parte | Detalle |
|---|---|
| Frontend | HTML, CSS y JavaScript estáticos (sin framework ni paso de build) |
| Formulario de contacto | Función serverless de Vercel (`api/send.js`, Node.js) |
| Envío de correo | [Resend](https://resend.com) |
| Hosting | [Vercel](https://vercel.com) |
| Fuentes | Locales, en `fonts/` (Inter y Acumin) |

## Estructura del proyecto

```
/
├── api/send.js              Función que recibe el formulario y envía el correo
├── css/
│   ├── styles.css           Estilos base y sistema de marca (variables en :root)
│   ├── services.css         Estilos de Services y How it works
│   ├── blog.css             Estilos del listado del blog
│   └── styles_alt.css       Versión alternativa oscura (NO se usa)
├── js/script.js             Menú móvil, acordeón, animaciones y envío del formulario
├── images/  fonts/          Recursos
├── index.html               Home
├── services/ how-it-works/ faq/ blog/ contact/    Una carpeta por página (index.html)
├── blog/<articulo>/index.html                     Un artículo por carpeta
├── robots.txt  sitemap.xml
├── vercel.json              trailingSlash y redirecciones
├── package.json             Dependencia: resend
└── .env                     Variables locales (NUNCA se sube al repositorio)
```

## Ejecutar en local

**Solo para ver el diseño:** cualquier servidor estático (XAMPP, Live Server, etc.).
El formulario no funciona así, porque un servidor estático no ejecuta `api/`.

**Para probar también el formulario:**
```bash
npm install
npm i -g vercel
vercel login
vercel link          # vincula la carpeta con el proyecto de Vercel
vercel env pull .env.local
vercel dev           # abre http://localhost:3000
```

## Variables de entorno

Se configuran en Vercel (Settings → Environment Variables, para Production y Preview).
Después de cambiarlas hay que volver a desplegar.

| Variable | Uso |
|---|---|
| `RESEND_API_KEY` | Clave de la API de Resend |
| `CONTACT_EMAIL` | Dirección que recibe las solicitudes del formulario |

El archivo `.env` es solo para uso local. Vercel no lo lee en producción.
Debe estar en `.gitignore` y en `.vercelignore`.

## Despliegue

1. Subir el código a GitHub.
2. En Vercel: Add New → Project → Import del repositorio. Framework: *Other* (sin build).
3. Cargar las variables de entorno y desplegar.
4. Asignar el dominio `utilisight.ca` en Settings → Domains.

Cada `git push` a la rama principal despliega a producción automáticamente.

### URLs con barra final

`vercel.json` define `"trailingSlash": true`, de modo que `/blog` redirige a `/blog/`.
Los enlaces relativos de las páginas (`../css/...`, `../contact`) dependen de eso.
Por la misma razón, `sitemap.xml`, `canonical` y `og:url` deben llevar barra final.

### Redirecciones

`/technology/` y `/process/` redirigen (301) a `/how-it-works/`.
Las carpetas `technology/` y `process/` ya no deben existir en el proyecto.

## Formulario de contacto

Flujo: `contact/index.html` → `js/script.js` (`fetch('/api/send')`) → `api/send.js` → Resend → correo a `CONTACT_EMAIL`.

Protecciones en `api/send.js`:
1. **Origen:** solo acepta peticiones de los dominios de `allowedOrigins`.
2. **Honeypot:** campo oculto `website`; si viene con texto, se descarta en silencio.
3. **Validación:** nombre, empresa, correo y tipo de activo son obligatorios; el correo se valida con una expresión regular.

### Pendiente: dominio verificado en Resend

Mientras el remitente sea `noreply@resend.dev`, Resend solo entrega al correo dueño de la cuenta.
Para enviar a cualquier destinatario hay que verificar el dominio:
1. Resend → Domains → Add Domain (`utilisight.ca` o un subdominio como `send.utilisight.ca`).
2. Agregar en el DNS los registros que indica Resend (SPF, DKIM, MX) y pulsar Verify.
3. Cambiar `from` en `api/send.js` por una dirección de ese dominio, por ejemplo `Utilisight Web <noreply@send.utilisight.ca>`.
4. Crear una API Key en esa cuenta y cargarla en `RESEND_API_KEY`.

## SEO y vista previa al compartir

Cada página debe tener en su `<head>`: `title`, `description`, `canonical`, etiquetas Open Graph
(`og:title`, `og:description`, `og:url`, `og:image`, `og:image:width/height`) y `twitter:*`.
- Imagen para compartir: JPG o PNG de **1200×630 px**, menos de ~300 KB, con URL absoluta. No se admite SVG.
- Los datos estructurados (JSON-LD) están en cada página; si cambian los servicios, actualizarlos.
- Si cambia la imagen y WhatsApp muestra la anterior, renombrar el archivo o limpiar la caché con el Sharing Debugger de Facebook.

## Tareas frecuentes

**Cambiar el menú o el pie de página:** no hay componente compartido; hay que editar el bloque en cada
`index.html` (header, `#mnav` móvil y `.fnav` del pie). Las rutas llevan `./`, `../` o `../../` según la profundidad.

**Publicar un artículo del blog:**
1. Duplicar `blog/thermographic-inspections-solar/` con el nuevo nombre.
2. Editar título, descripción, `og:*`, JSON-LD (`datePublished`), imagen y contenido.
3. Añadir una tarjeta en `blog/index.html` (clases de color `c-navy`, `c-light` o `c-orange`).
4. Añadir la URL a `sitemap.xml`.

**Cambiar colores de la marca:** variables al inicio de `css/styles.css`
(navy `#1d2645`, azul `#0e508a`, gris `#979ea8`, naranja `#e27d1d`).

## Pendientes conocidos

Ver `documentation/CHECKLIST_ENTREGA.md`.