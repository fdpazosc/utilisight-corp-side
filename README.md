# Utilisight Corp — Sitio web

Sitio corporativo de Utilisight Corp (inspecciones térmicas con dron certificado por Transport Canada, Ontario).
Producción: <https://utilisight.ca>

## Contenido

1. [Tecnología](#tecnología)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Flujo de trabajo y despliegue](#flujo-de-trabajo-y-despliegue)
4. [Configuración de Vercel](#configuración-de-vercel)
5. [Dominio y DNS](#dominio-y-dns)
6. [Ejecutar en local](#ejecutar-en-local)
7. [Variables de entorno](#variables-de-entorno)
8. [Formulario de contacto](#formulario-de-contacto)
9. [Seguridad y cabeceras (`vercel.json`)](#seguridad-y-cabeceras-verceljson)
10. [Analítica y buscadores](#analítica-y-buscadores)
11. [SEO y vista previa al compartir](#seo-y-vista-previa-al-compartir)
12. [Páginas de error y páginas legales](#páginas-de-error-y-páginas-legales)
13. [Tareas frecuentes](#tareas-frecuentes)
14. [Solución de problemas](#solución-de-problemas)

## Tecnología

| Parte                  | Detalle                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| Frontend               | HTML5, CSS3 (variables en `:root`) y JavaScript ES6 sin framework ni paso de build |
| Formulario de contacto | Función serverless de Vercel (`api/send.js`, Node.js)                   |
| Envío de correo        | [Resend](https://resend.com)                                            |
| Hosting                | [Vercel](https://vercel.com) (plan Hobby)                               |
| Código                 | GitHub, repositorio privado de la clienta                               |
| Dominio y DNS          | Hostinger                                                               |
| Fuentes                | Locales, en `fonts/` (Inter y Acumin). No se carga nada de Google Fonts |
| Analítica              | Google Analytics 4, Search Console y Bing Webmaster Tools               |

Decisiones de diseño:

- **Sitio estático** y una sola función serverless: sin servidor PHP, sin base de datos y sin costos fijos de infraestructura.
- **Fuentes locales** para que el sitio sea autónomo y la CSP pueda ser estricta.
- **Sin componentes compartidos:** el menú y el pie se repiten en cada `index.html`.

## Estructura del proyecto

```
/
├── api/send.js              Función que recibe el formulario y envía el correo
├── css/
│   ├── styles.css           Estilos base y sistema de marca (variables en :root)
│   ├── services.css         Estilos de Services y How it works
│   ├── blog.css             Estilos del listado del blog
│   └── legal.css            Estilos de las páginas legales
├── js/
│   ├── script.js            GA4, menú móvil, acordeón, animaciones y envío del formulario
│   ├── faq.js               Panel interactivo de la página FAQ
│   └── timer.js             Muestra el artículo programado del blog a partir de su fecha
├── images/  fonts/          Recursos publicados (imágenes en WebP, logo en SVG)
├── images-src/              JPG originales (NO se publican, ver .vercelignore)
├── index.html               Home
├── 404.html  500.html       Páginas de error (rutas absolutas)
├── services/ how-it-works/ faq/ blog/ contact/     Una carpeta por página (index.html)
├── privacy-policy/ terms-and-conditions/ disclaimer/   Páginas legales
├── blog/<articulo>/index.html                      Un artículo por carpeta
├── robots.txt  sitemap.xml
├── vercel.json              trailingSlash, redirecciones, cabeceras de seguridad y caché
├── .vercelignore            Archivos que NO se suben a Vercel con `vercel --prod`
├── example.env              Plantilla de variables (sin valores reales)
├── package.json             Dependencia: resend
└── .env / .env.local        Variables locales (NUNCA se suben al repositorio)
```

Paleta de marca (variables al inicio de `css/styles.css`): navy `#1d2645` / `#141b33`, azul `#0e508a` / `#0b406f`, naranja `#e27d1d`, gris `#979ea8`.

## Flujo de trabajo y despliegue

### Ramas y repositorios

| Rama          | Uso                                                         |
| ------------- | ----------------------------------------------------------- |
| `main`        | Producción. Cada commit que llega aquí se publica en Vercel |
| `development` | Rama de trabajo del desarrollador                           |

- **El repositorio oficial** es el de la clienta (`Ralvarezgarcia02/utilisight-corp-side`). Es la **fuente de verdad**.
- El desarrollador puede mantener un repositorio personal de respaldo como segundo remote. Ese respaldo puede ir por delante del oficial; no es referencia de producción.
- **Nadie hace push directo a `main`.** Solo se llega a `main` mediante un Pull Request aprobado por la clienta.

### Cómo se publica un cambio

1. El desarrollador trabaja en `development` y prueba en local.
2. Sube la rama al repositorio oficial:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push oficial-utilisight-corp-side development
   ```
   (Si el remote aún no existe: `git remote add oficial-utilisight-corp-side https://github.com/Ralvarezgarcia02/utilisight-corp-side.git`.)
3. Abre un Pull Request de `development` hacia `main` (GitHub muestra el enlace tras el push, o se usa `.../compare/main...development`).
4. Envía el enlace a la clienta.
5. La clienta abre el enlace, pulsa **Merge pull request** (método **merge commit**) y **Confirm merge**.
6. Vercel detecta el commit en `main`, compila y publica en 1 o 2 minutos.
7. Se verifica en Vercel → Deployments (estado *Ready*, entorno *Production*) y en el sitio (recargar con Ctrl + F5).

Para evitar errores, en GitHub → Settings → General → Pull Requests conviene dejar habilitado solo **Allow merge commits**.

### Por qué el merge lo hace la clienta

El plan **Hobby** de Vercel solo despliega commits cuyo autor es el dueño de la cuenta y no admite colaboradores en repositorios privados. Un commit del desarrollador provoca un despliegue *Blocked*. Como el merge lo crea la clienta, el commit resultante en `main` queda a su nombre y Vercel lo acepta.

Si el merge se hiciera con *Squash* o *Rebase*, el autor podría ser el desarrollador y el despliegue podría bloquearse.

Alternativas sin esta limitación: repositorio público, o plan Pro con el desarrollador como miembro del equipo.

### Dejar el repositorio como estaba antes de un cambio

Se hace con otro Pull Request que revierte el anterior (botón **Revert** en el PR ya fusionado) y que la clienta aprueba igual que cualquier otro. No se reescribe el historial de `main`.

## Configuración de Vercel

Proyecto: `utilisight-intelligent-inspections` (cuenta de la clienta, plan Hobby). Framework: *Other*, sin build ni directorio de salida.

Ajustes especiales para que el bot de Vercel no genere bloqueos ni correos de error en `development`:

- **Settings → Build and Deployment → Ignored Build Step → "Only build production"**:
  ```bash
  if [ "$VERCEL_ENV" = "production" ]; then exit 1; else exit 0; fi
  ```
  En un Ignored Build Step, `exit 1` significa **compilar** y `exit 0` significa **omitir**. Resultado: solo se compila cuando el commit llega a `main`.
- **Settings → Git → Pull Request Comments: desactivado**, para que el bot no comente en cada PR.

Consecuencias:

- **No hay vistas previas en línea.** Las pruebas se hacen en local (ver más abajo).
- Si alguien quita el Ignored Build Step, vuelven los bloqueos y los correos de error en la rama `development`.
- Un *Redeploy* manual desde Vercel sigue disponible para producción.

Dominios en el proyecto: `utilisight.ca` (principal, *Production*) y `www.utilisight.ca` (redirección permanente 308 hacia `utilisight.ca`). La URL `utilisight-intelligent-inspections.vercel.app` sigue activa.

## Dominio y DNS

El dominio es de la clienta y está en Hostinger, con los registros apuntando a Vercel. No se debe borrar ninguno sin consultar.

| Tipo           | Nombre            | Para qué sirve                                              |
| -------------- | ----------------- | ----------------------------------------------------------- |
| A              | `@`               | Apunta el dominio a Vercel (usar el valor que indique Vercel) |
| CNAME          | `www`             | Redirección hacia `utilisight.ca` (valor que indique Vercel)  |
| TXT            | `_vercel`         | Verificación de propiedad en Vercel (uno por dominio)       |
| TXT / CNAME / MX | según Resend    | DKIM y SPF del envío de correo del formulario               |
| TXT            | `@`               | Verificación de Google Search Console (`google-site-verification=…`) |
| CNAME          | según Bing        | Verificación de Bing, si no se importó desde Google         |
| TXT            | `_dmarc`          | Protección anti-suplantación (`v=DMARC1; p=none;`)          |
| MX y TXT (SPF, DKIM) | `@`         | Correo corporativo `@utilisight.ca`. **No tocar**           |

Notas:

- En el campo *Nombre* de Hostinger se escribe solo `@`, `www`, `_vercel`, etc., sin el dominio completo.
- Pueden coexistir varios TXT en `@`; no borrar el SPF existente.
- Para cambios de DNS conviene TTL bajo (300) hasta comprobar que todo funciona.

## Ejecutar en local

**Solo para ver el diseño:** cualquier servidor estático (XAMPP, Live Server, etc.).
El formulario no funciona así, porque un servidor estático no ejecuta `api/`. Además, GA4 no se carga en `localhost`.

**Para probar también el formulario:**

```bash
npm install
npm i -g vercel
vercel login
vercel link          # vincula la carpeta con el proyecto de Vercel
vercel env pull .env.local
vercel dev           # abre http://localhost:3000
```

Como no hay vistas previas en línea, las pruebas visuales y del formulario se hacen aquí antes de subir a `development`.

## Variables de entorno

Se configuran en Vercel (Settings → Environment Variables). Después de cambiarlas hay que hacer **Redeploy**; no se aplican solas.

| Variable         | Uso                                                                        |
| ---------------- | -------------------------------------------------------------------------- |
| `RESEND_API_KEY` | Clave de la API de Resend (creada en la cuenta de la clienta)              |
| `CONTACT_EMAILS` | Direcciones que reciben las solicitudes del formulario, separadas por coma |

`VERCEL_ENV` la define Vercel automáticamente; no se crea. En local, `example.env` la trae como `development`.

- El archivo `.env` es solo para uso local. Vercel no lo lee en producción.
- `.env`, `.env.*`, `.vercel` y `node_modules` deben estar en `.gitignore` y en `.vercelignore`.
- `example.env` es una plantilla: nunca debe contener valores reales.
- **No compartir la carpeta del proyecto en un ZIP** sin excluir `.env` y `.env.local`.
- Si una clave se expone, se revoca en Resend y se crea otra; borrarla del código no basta si estuvo en el historial.

## Formulario de contacto

Flujo: `contact/index.html` → `js/script.js` (`fetch('/api/send')`) → `api/send.js` → Resend → correo a `CONTACT_EMAILS`.
El servidor genera la referencia (`UT-AAAA-NNNN`), la pone en el asunto del correo y la devuelve a la página, que la muestra al visitante.

Protecciones en `api/send.js`:

1. **Origen:** comparación exacta contra una lista blanca (`PROD_ORIGINS`: `utilisight.ca`, `www.utilisight.ca` y la URL `vercel.app` del proyecto). Localhost y las previews de Vercel solo se aceptan fuera de producción.
2. **Content-Type:** solo `application/json`.
3. **Honeypot:** campo oculto `website`; si viene con texto, se descarta en silencio (la respuesta simula éxito).
4. **Validación:** tipos, longitud máxima por campo, correo con formato estricto y tipo de activo dentro de la lista permitida.
5. **Escape de HTML** de todos los campos antes de armar el correo.
6. **Errores genéricos** hacia el visitante; el detalle queda en los logs de Vercel.

El correo es HTML con tablas y estilos en línea, colores de marca y soporte de modo oscuro (`prefers-color-scheme`).

Si cambia el nombre del proyecto en Vercel o el dominio principal, **hay que actualizar `PROD_ORIGINS`**; de lo contrario el formulario devuelve 403. El patrón `PREVIEW_RE` depende del nombre del equipo de Vercel.

### Resend y dominio verificado

El remitente es `Utilisight Web <noreply@utilisight.ca>`. Eso exige que el dominio esté **verificado en Resend** (estado *Verified*); si no, el envío falla con 502.

1. Resend → Domains → Add Domain (`utilisight.ca`).
2. Agregar en Hostinger los registros que indica Resend (DKIM, SPF y MX del subdominio `send`) y pulsar Verify.
3. Crear una API Key con permiso *Sending access* y cargarla en `RESEND_API_KEY` en Vercel.

## Seguridad y cabeceras (`vercel.json`)

- `trailingSlash: true`: `/blog` redirige a `/blog/`.
- Redirecciones 301 de `/technology/` y `/process/` hacia `/how-it-works/`.
- Cabeceras de seguridad: `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`.
- Caché largo para `/fonts/` e `/images/`.
- Límite de 10 s para `api/send.js`.

**Regla importante:** en `vercel.json` los valores de `source` empiezan con `/` (por ejemplo `/technology/`, `/(.*)`, `/fonts/(.*)`). Si empiezan con `./`, la regla no se aplica y las redirecciones y cabeceras dejan de funcionar. Para comprobarlo:

```bash
curl -I https://utilisight.ca/technology/     # debe redirigir a /how-it-works/
curl -I https://utilisight.ca/                # debe incluir Content-Security-Policy
```

### Content-Security-Policy y Google Analytics

La CSP restringe scripts, conexiones e imágenes al propio sitio. Para que GA4 funcione hay que permitir los dominios de Google; sin eso Analytics queda bloqueado en silencio. Valor configurado:

```
default-src 'self'; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; script-src 'self' https://www.googletagmanager.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
```

Si algún día se añade otro servicio externo (captcha, mapas, etc.), su dominio debe agregarse a la directiva correspondiente. Si en la consola del navegador aparece un error de *Content Security Policy*, falta un dominio.

## Analítica y buscadores

Google Search Console, Google Analytics 4 y Bing Webmaster Tools están configurados con la **cuenta de Google de la clienta**, que es la titular de las tres propiedades (con verificación en dos pasos activa). El desarrollador tiene acceso delegado y revocable.

### Google Analytics 4

- Se inyecta al inicio de `js/script.js`. El Measurement ID (`G-XXXXXXXXXX`) **no es un secreto**: va en el código y es visible en el navegador por diseño.
- Solo se carga en producción, para no medir `localhost` ni la URL `vercel.app`:
  ```js
  const PROD_HOSTS = ["utilisight.ca", "www.utilisight.ca"];
  if (!PROD_HOSTS.includes(location.hostname)) return;
  ```
- Evento de conversión: tras un envío correcto del formulario se dispara `generate_lead` (`if (window.gtag) gtag("event", "generate_lead");`), marcado como evento clave en GA4.
- El tráfico interno del equipo se excluye en GA4 → Admin → Data streams → Define internal traffic.
- Para comprobar que mide: abrir el sitio desde un celular y ver la visita en Informes → Tiempo real. Los bloqueadores de anuncios impiden la carga de `gtag.js`.

### Google Search Console

- Propiedad de tipo **Dominio** (`utilisight.ca`), verificada con un registro TXT en Hostinger.
- Sitemap enviado: `https://utilisight.ca/sitemap.xml`.
- Tras publicar una página o artículo nuevo: Inspección de URL → *Solicitar indexación*.

### Bing Webmaster Tools

- Sitio importado desde Search Console con la misma cuenta de Google, junto con el sitemap.

### Privacidad

La política de privacidad (`/privacy-policy/`) menciona analítica, cookies, PIPEDA y CASL.

## SEO y vista previa al compartir

Cada página debe tener en su `<head>`: `title`, `description`, `canonical`, etiquetas Open Graph (`og:title`, `og:description`, `og:url`, `og:image`, `og:image:width/height`) y `twitter:*`.

- **URLs canónicas con barra final** (`https://utilisight.ca/services/`). Los enlaces internos, `sitemap.xml`, `canonical` y `og:url` deben coincidir. El dominio principal es `utilisight.ca` (sin `www`).
- Imagen para compartir: JPG o PNG de **1200×630 px**, menos de ~300 KB, con URL absoluta. No se admite SVG.
- Datos estructurados (JSON-LD) en cada página: `ProfessionalService`, `Service`, `HowTo`, `FAQPage`, `BlogPosting`, `Blog` y `ContactPage`. Si cambian los servicios, actualizarlos.
- `robots.txt`: permite el rastreo, bloquea `/api/`, permite los rastreadores de IA (GPTBot, OAI-SearchBot, ChatGPT-User, anthropic-ai, Claude-Web, Google-Extended) y declara el sitemap.
- Si cambia la imagen y WhatsApp muestra la anterior, renombrar el archivo o limpiar la caché con el Sharing Debugger de Facebook.

### URLs con barra final y rutas absolutas

Todos los enlaces y recursos usan rutas **absolutas** desde la raíz (`/css/styles.css`, `/contact/`), así que no dependen de la profundidad de la página ni de la barra final.

## Páginas de error y páginas legales

- `404.html` y `500.html` están en la raíz y usan rutas absolutas (`/css/styles.css`, `/js/script.js`) para verse bien aunque se sirvan en URLs profundas. Vercel muestra `404.html` automáticamente; **`500.html` no se muestra solo** (los errores de `/api/send` devuelven JSON).
- Páginas legales: `privacy-policy/`, `terms-and-conditions/` y `disclaimer/`, con estilos en `css/legal.css`. Están enlazadas desde el pie.

## Tareas frecuentes

**Cambiar el menú o el pie de página:** no hay componente compartido; hay que editar el bloque en cada `index.html` (header, `#mnav` móvil y `.fnav` del pie). Las rutas son absolutas (`/services/`), iguales en todas las páginas. El menú de escritorio se oculta por debajo de ~1050 px y aparece el botón hamburguesa (`#burger`, que abre `#mnav`).

**Publicar un artículo del blog:**

1. Duplicar `blog/thermographic-inspections-solar/` con el nuevo nombre.
2. Editar título, descripción, `canonical`, `og:*`, JSON-LD (`datePublished`), imagen y contenido.
3. Añadir una tarjeta en `blog/index.html` (clases de color `c-navy`, `c-light` o `c-orange`).
4. Añadir la URL (con barra final) y `lastmod` a `sitemap.xml`.
5. Tras publicar: solicitar indexación en Search Console.

**Artículo programado:** `js/timer.js` muestra un artículo a partir de su fecha. El mismo día hay que **descomentar su entrada en `sitemap.xml`** y actualizar `lastmod` (el sitemap actual lo indica en un comentario).

**Cambiar quién recibe las solicitudes del formulario:** Vercel → Settings → Environment Variables → `CONTACT_EMAILS` (separados por coma) → Redeploy.

**Rotar la clave de Resend:** crear una nueva en Resend, reemplazar `RESEND_API_KEY` en Vercel, hacer Redeploy y revocar la anterior.

**Cambiar colores de la marca:** variables al inicio de `css/styles.css`.

**Imágenes:** exportar en WebP a un máximo de ~1200 px de ancho (objetivo 60–150 KB). Guardar el JPG original en `images-src/` (no se publica). En cada `<img>` incluir `width`, `height`, `alt` y `loading="lazy"` (el hero lleva `fetchpriority="high"`). Antes de usar una imagen, confirmar que se tiene licencia o permiso, y anotar su origen. Lo mismo aplica a las fuentes tipográficas.

**Cambiar el dominio principal o el nombre del proyecto en Vercel:** actualizar `PROD_ORIGINS` en `api/send.js`, y `canonical`, `og:url`, JSON-LD, `sitemap.xml` y `robots.txt`.

## Solución de problemas

| Síntoma                                           | Causa probable y qué hacer                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Despliegue *Blocked* ("commit author did not have contributing access") | El commit lo creó el desarrollador y no la clienta. El merge debe hacerlo la clienta con *merge commit* |
| Un push a `development` no genera despliegue     | Es lo esperado (Ignored Build Step)                                                                                |
| Hice merge y el cambio no se ve                   | Esperar 1 o 2 minutos, recargar con Ctrl + F5, revisar Vercel → Deployments (*Ready* / *Error*)                    |
| Formulario devuelve **403**                       | El origen no está en `PROD_ORIGINS` (dominio o nombre de proyecto distinto, falta `www`)                           |
| Formulario devuelve **415**                       | La petición no es JSON                                                                                             |
| Formulario devuelve **400**                       | Validación: campos obligatorios, correo inválido o tipo de activo fuera de la lista                                |
| Formulario devuelve **500**                       | Faltan `CONTACT_EMAILS` o `RESEND_API_KEY` en Vercel, o falta Redeploy                                             |
| Formulario devuelve **502**                       | Resend rechazó el correo: dominio no verificado o clave incorrecta (ver Vercel → Logs)                             |
| No aparecen visitas en GA4                        | CSP sin los dominios de Google, bloqueador de anuncios, ID mal escrito o deploy aún no publicado                   |
| Las redirecciones o cabeceras no se aplican       | Revisar que los `source` de `vercel.json` empiecen con `/`                                                         |
| `www` y sin `www` dan resultados distintos        | Revisar Vercel → Domains: `www` debe redirigir (308) a `utilisight.ca`                                             |
| La página 404 se ve sin estilos                   | La página debe usar rutas absolutas (`/css/styles.css`)                                                            |