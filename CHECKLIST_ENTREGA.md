# Checklist de entrega — Utilisight Corp

## 1. Cuentas y accesos que pasan a la clienta

| Servicio | Qué debe quedar a nombre de la clienta |
|---|---|
| GitHub | Repositorio del proyecto (privado) |
| Vercel | Proyecto desplegado, con el dominio asignado |
| Resend | Cuenta con el dominio verificado y la API Key |
| Registrador / DNS de `utilisight.ca` | Acceso para agregar registros |

Recomendado: que la clienta cree las cuentas con su correo y añada al desarrollador como colaborador, no al revés.

## 2. Antes de entregar el código

- [ ] Revocar la API Key de Resend usada en pruebas y crear una nueva en la cuenta de la clienta.
- [ ] Confirmar que `.env`, `.env.*`, `.vercel` y `node_modules` están en `.gitignore`.
- [ ] Confirmar que no hay claves en el historial de Git (si el `.env` se subió alguna vez, rotar la clave).
- [ ] Crear `.vercelignore` con `.env`, `.env.*`, `node_modules`, `documentation`.
- [ ] Verificar que `https://utilisight.ca/.env` devuelve 404.
- [ ] Borrar archivos sobrantes: `blog/index_old.html`, `blog/js/`, carpetas `technology/` y `process/`.
- [ ] Decidir si `css/styles_alt.css` se conserva (no se usa).
- [ ] Quitar de `allowedOrigins` en `api/send.js` la URL de pruebas `*.vercel.app` (mantener `utilisight.ca`, `www.utilisight.ca` y localhost si se desea).
- [ ] Confirmar `[hidden] { display: none !important; }` al final de `css/styles.css` (evita que el panel "Request received" se vea antes de enviar).

## 3. Contenido por confirmar con la clienta

- [ ] Nivel del termógrafo: el mockup dice "Level I"; el resto del sitio dice "Level II".
- [ ] Plazo de respuesta: "1 business day" (How it works) vs "24 hours" (resto del sitio).
- [ ] Plazo de informes: 48 h en techos y 48–72 h en otros servicios (FAQ y blog dicen 48–72 h).
- [ ] Precisión de la cámara: ±3 °C o ±3 % según el mockup (antes decía ±1,5 °C).
- [ ] Fotos reales en pares RGB + térmica para Services; hoy se reutiliza `termo.webp`.
- [ ] Foto del EVO II 640T y una página real de reporte para How it works.
- [ ] Blog: los enlaces a `ai-drone-inspections` y `transport-canada-regulations` no tienen página creada; crearlas o quitar las tarjetas. Fechas y tiempos de lectura de cada artículo.
- [ ] Correcciones de Home del documento "Correcciones_Website_Oct_23" (revisar que estén aplicadas).

## 4. Correo (pendiente)

- [ ] Cuenta de Resend de la clienta.
- [ ] Agregar `utilisight.ca` (o `send.utilisight.ca`) en Resend y registrar los DNS indicados.
- [ ] Cambiar `from` en `api/send.js` a una dirección del dominio verificado.
- [ ] Cargar `RESEND_API_KEY` y `CONTACT_EMAIL` en Vercel y volver a desplegar.
- [ ] Probar un envío real a una dirección distinta de la del dueño de la cuenta.
- [ ] Mejora recomendada: escapar el HTML de los campos del formulario en el cuerpo del correo.

## 5. SEO y compartir

- [ ] Crear `images/og-utilisight.webp` (1200×630, menos de 300 KB).
- [ ] Añadir/actualizar `og:*`, `twitter:*` y `canonical` en las 8 páginas (URLs con barra final).
- [ ] Corregir `og:url` del artículo del blog (termina en `.html`).
- [ ] Actualizar `sitemap.xml`: quitar `/technology` y `/process`, añadir `/how-it-works/`, usar barra final en todas.
- [ ] Enviar el sitemap a Google Search Console.
- [ ] Probar un enlace en WhatsApp y en el Sharing Debugger de Facebook.

## 6. Pruebas antes de publicar (en el dominio final)

- [ ] Todas las páginas cargan con estilos e imágenes; sin 404 en la pestaña Network.
- [ ] Menú de escritorio y móvil: 6 enlaces (Home, Services, How it works, FAQ, Blog, Contact) en cabecera, menú móvil y pie.
- [ ] `/technology/` y `/process/` redirigen a `/how-it-works/`.
- [ ] `/blog` redirige a `/blog/` y los artículos abren.
- [ ] Formulario: validación de campos, envío correcto, correo recibido, mensaje de éxito.
- [ ] Revisión en móvil (menú, tarjetas del blog, acordeón).
- [ ] Lighthouse: rendimiento y accesibilidad (las imágenes de `hero_bg.webp` y fotos grandes conviene optimizarlas).

## 7. Entrega

- [ ] Transferir o crear el repositorio en la cuenta de GitHub de la clienta.
- [ ] Importar ese repositorio en su Vercel, cargar variables y asignar `utilisight.ca`.
- [ ] Apuntar el DNS del dominio a Vercel (según indique Vercel en Settings → Domains).
- [ ] Eliminar el proyecto de pruebas y los tokens de acceso personales.
- [ ] Entregar `README.md` y esta lista; explicar cómo publicar un artículo y cómo cambiar el menú.