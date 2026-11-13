const { Resend } = require("resend");
const crypto = require("crypto");

/* ------------------------------------------------------------------
   Configuración
------------------------------------------------------------------ */
// Orígenes permitidos (comparación EXACTA, no "contiene")
const PROD_ORIGINS = new Set([
  "https://utilisight.ca",
  "https://www.utilisight.ca",
  "https://utilisight-intelligent-inspections.vercel.app",
]);
// Solo fuera de producción (previews de Vercel y pruebas locales)
const DEV_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
]);
const PREVIEW_RE =
  /^https:\/\/utilisight-intelligent-inspections(-[a-z0-9-]+)?-utilisight\.vercel\.app$/;

const ASSET_TYPES = new Set([
  "Solar PV farm",
  "Distribution network",
  "Commercial rooftop",
  "Other infrastructure",
]);

const LIMITS = {
  name: 120,
  company: 160,
  email: 254,
  type: 60,
  size: 120,
  window: 120,
  notes: 2000,
};
const EMAIL_RE =
  /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

/* ------------------------------------------------------------------
   Utilidades
------------------------------------------------------------------ */
// Escapa HTML para que nada del formulario pueda inyectar etiquetas en el correo
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// Campo de una línea: quita caracteres de control y saltos de línea, recorta longitud
const oneLine = (v, max) =>
  String(v)
    .replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

// Campo multilínea: permite saltos de línea, quita el resto de caracteres de control
const multiLine = (v, max) =>
  String(v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, max);

const makeRef = () =>
  `UT-${new Date().getFullYear()}-${String(crypto.randomInt(0, 10000)).padStart(4, "0")}`;

function getOrigin(req) {
  const raw = req.headers.origin || req.headers.referer || "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

function originAllowed(origin) {
  if (PROD_ORIGINS.has(origin)) return true;
  if (process.env.VERCEL_ENV !== "production") {
    return DEV_ORIGINS.has(origin) || PREVIEW_RE.test(origin);
  }
  return false;
}

// Una fila del correo (mismo diseño que antes, con soporte de modo oscuro)
const row = (label, value, first, color = "#1d2645") => `
                          <tr>
                            <td class="email-divider" style="padding:${first ? "0 0 15px 0" : "15px 0"}; border-bottom: 1px solid #e4e8ee;">
                              <p class="email-label" style="margin:0 0 4px 0; color:#979ea8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">${label}</p>
                              <p class="email-value" style="margin:0; color:${color}; font-size:16px; font-weight:600;">${value}</p>
                            </td>
                          </tr>`;

function buildHtml(d, ref) {
  const notesHtml = d.notes ? esc(d.notes).replace(/\n/g, "<br>") : "";
  return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              /* Soporte para Modo Oscuro en correos */
              @media (prefers-color-scheme: dark) {
                .email-bg { background-color: #080d18 !important; }
                .email-card { background-color: #141b33 !important; }
                .email-header { background-color: #1d2645 !important; }
                .email-title { color: #ffffff !important; }
                .email-text { color: #c3cad6 !important; }
                .email-label { color: #979ea8 !important; }
                .email-value { color: #ffffff !important; }
                .email-footer { background-color: #0f1421 !important; color: #6b7382 !important; }
                .email-divider { border-color: #2a3550 !important; }
                .email-note-box { background-color: #1a2240 !important; border-color: #E27D1D !important; }
                .email-note-text { color: #e6ebf2 !important; }
              }
            </style>
          </head>
          <body class="email-bg" style="margin:0; padding:20px; background-color:#f6f8fa; font-family: 'Inter', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <table class="email-card" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; max-width:600px; width:100%;">
                    <tr>
                      <td class="email-header" style="background-color:#1d2645; padding:30px; text-align:center;">
                        <span style="font-size:24px; font-weight:800; color:#ffffff; letter-spacing:0.12em;">
                          <span style="color:#0e508a;">UTILI</span><span style="color:#E27D1D;">SIGHT</span>
                        </span>
                        <p style="margin:10px 0 0 0; color:#c3cad6; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; font-weight:700;">New Inspection Request · ${esc(ref)}</p>
                      </td>
                    </tr>
                    <tr>
                      <td class="email-card" style="padding:30px 40px;">
                        <h2 class="email-title" style="color:#1d2645; margin-top:0; font-size:22px;">Hello Utilisight Team,</h2>
                        <p class="email-text" style="color:#4a5462; font-size:16px; line-height:1.6;">You have received a new request from the website. Here are the details:</p>
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                          ${row("Name", esc(d.name), true)}
                          ${row("Company", esc(d.company))}
                          ${row("Email", esc(d.email), false, "#0e508a")}
                          ${row("Asset Type", esc(d.type))}
                          ${d.size ? row("Asset Size", esc(d.size)) : ""}
                          ${d.window ? row("Target Window", esc(d.window)) : ""}
                        </table>
                        ${
                          notesHtml
                            ? `
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                          <tr>
                            <td class="email-note-box" style="background-color:#fef3e6; border-left:4px solid #E27D1D; padding:15px; border-radius:8px;">
                              <p class="email-label" style="margin:0 0 4px 0; color:#979ea8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">Scope Notes</p>
                              <p class="email-note-text" style="margin:0; color:#1d2645; font-size:15px; line-height:1.5;">${notesHtml}</p>
                            </td>
                          </tr>
                        </table>`
                            : ""
                        }
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
                          <tr>
                            <td align="center">
                              <a href="mailto:${esc(d.email)}" style="background-color:#E27D1D; color:#ffffff; text-decoration:none; padding:14px 30px; border-radius:5px; font-weight:600; display:inline-block;">Reply to ${esc(d.name)}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td class="email-footer" style="background-color:#f6f8fa; padding:20px 40px; text-align:center;">
                        <p style="margin:0; color:#979ea8; font-size:12px;">© ${new Date().getFullYear()} Utilisight Corp · Southern Ontario - GTA operations</p>
                        <p style="margin:5px 0 0 0; color:#979ea8; font-size:11px;">This email was sent from the Utilisight website contact form.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
      `;
}

/* ------------------------------------------------------------------
   Handler
------------------------------------------------------------------ */
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // CAPA 1: origen exacto (lista blanca)
  if (!originAllowed(getOrigin(req))) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // CAPA 2: solo JSON
  if (
    !String(req.headers["content-type"] || "")
      .toLowerCase()
      .includes("application/json")
  ) {
    return res.status(415).json({ error: "Unsupported Media Type" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  // CAPA 3: honeypot. Si el campo "website" trae texto es un bot: fingimos éxito.
  if (body.website) {
    return res.status(200).json({ success: true, ref: makeRef() });
  }

  // CAPA 4: validación estricta (tipos, longitudes, formato, lista de tipos de activo)
  for (const k of Object.keys(LIMITS)) {
    if (
      body[k] !== undefined &&
      body[k] !== null &&
      typeof body[k] !== "string"
    ) {
      return res.status(400).json({ error: "Invalid data" });
    }
  }
  const d = {
    name: oneLine(body.name ?? "", LIMITS.name),
    company: oneLine(body.company ?? "", LIMITS.company),
    email: oneLine(body.email ?? "", LIMITS.email),
    type: oneLine(body.type ?? "", LIMITS.type),
    size: oneLine(body.size ?? "", LIMITS.size),
    window: oneLine(body.window ?? "", LIMITS.window),
    notes: multiLine(body.notes ?? "", LIMITS.notes),
  };

  if (!d.name || !d.company || !d.email || !d.type) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!EMAIL_RE.test(d.email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (!ASSET_TYPES.has(d.type)) {
    return res.status(400).json({ error: "Invalid asset type" });
  }

  // Destinatarios desde variables de entorno
  const toEmails = (process.env.CONTACT_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (toEmails.length === 0 || !process.env.RESEND_API_KEY) {
    console.error(
      "Configuración incompleta: faltan CONTACT_EMAILS o RESEND_API_KEY",
    );
    return res.status(500).json({ error: "Server error" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const ref = makeRef();

  try {
    const { data, error } = await resend.emails.send({
      from: "Utilisight Web <noreply@utilisight.ca>",
      to: toEmails,
      reply_to: d.email,
      subject:
        `[${ref}] New Inspection Request from ${d.name} - ${d.company}`.slice(
          0,
          200,
        ),
      html: buildHtml(d, ref),
    });

    if (error) {
      // El detalle se queda en los logs de Vercel; al visitante solo un mensaje genérico
      console.error("RESEND RECHAZÓ EL CORREO:", error);
      return res.status(502).json({ error: "Email could not be sent" });
    }

    return res.status(200).json({ success: true, ref, id: data && data.id });
  } catch (e) {
    console.error("Error del servidor:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
