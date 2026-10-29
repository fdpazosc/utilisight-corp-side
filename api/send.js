const { Resend } = require("resend");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // CAPA 1: Verificación de Origen (CORS) - Dinámico para Vercel
  const origin = req.headers.origin || req.headers.referer || "";
  // Acepta tu dominio, los subdominios de Vercel y localhost para pruebas
  const isAllowed = origin.includes("utilisight.ca") || origin.includes("utilisight-intelligent-inspections") || origin.includes("localhost");
  
  if (!isAllowed) {
    return res.status(403).json({ error: "Forbidden: Invalid Origin" });
  }

  // Protección contra body indefinido
  const { name, company, email, type, size, window, notes, website } = req.body || {};

  // CAPA 2: Trampa para Bots (Honeypot)
  if (website) {
    return res.status(200).json({ success: true, data: { id: "bot_trapped" } });
  }

  // CAPA 3: Validación estricta de datos
  if (!name || !company || !email || !type) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Obtener los correos de las variables de entorno
  const rawEmails = process.env.CONTACT_EMAILS || "";
  const toEmails = rawEmails.split(",").map((e) => e.trim()).filter(Boolean);

  if (toEmails.length === 0) {
    return res.status(500).json({ error: "No recipient emails configured" });
  }

  // INICIALIZACIÓN DE RESEND (Esto faltaba)
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Utilisight Web <noreply@utilisight.ca>",
      to: toEmails,
      reply_to: email,
      subject: `New Inspection Request from ${name} - ${company}`,
      html: `
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
                  <!-- Tarjeta principal -->
                  <table class="email-card" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; max-width:600px; width:100%;">
                    
                    <!-- Encabezado -->
                    <tr>
                      <td class="email-header" style="background-color:#1d2645; padding:30px; text-align:center;">
                        <span style="font-size:24px; font-weight:800; color:#ffffff; letter-spacing:0.12em;">
                          <span style="color:#0e508a;">UTILI</span><span style="color:#E27D1D;">SIGHT</span>
                        </span>
                        <p style="margin:10px 0 0 0; color:#c3cad6; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; font-weight:700;">New Inspection Request</p>
                      </td>
                    </tr>

                    <!-- Cuerpo -->
                    <tr>
                      <td class="email-card" style="padding:30px 40px;">
                        <h2 class="email-title" style="color:#1d2645; margin-top:0; font-size:22px;">Hello Utilisight Team,</h2>
                        <p class="email-text" style="color:#4a5462; font-size:16px; line-height:1.6;">You have received a new request from the website. Here are the details:</p>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                          <tr>
                            <td class="email-divider" style="padding-bottom:15px; border-bottom: 1px solid #e4e8ee;">
                              <p class="email-label" style="margin:0 0 4px 0; color:#979ea8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">Name</p>
                              <p class="email-value" style="margin:0; color:#1d2645; font-size:16px; font-weight:600;">${name}</p>
                            </td>
                          </tr>
                          <tr>
                            <td class="email-divider" style="padding:15px 0; border-bottom: 1px solid #e4e8ee;">
                              <p class="email-label" style="margin:0 0 4px 0; color:#979ea8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">Company</p>
                              <p class="email-value" style="margin:0; color:#1d2645; font-size:16px; font-weight:600;">${company}</p>
                            </td>
                          </tr>
                          <tr>
                            <td class="email-divider" style="padding:15px 0; border-bottom: 1px solid #e4e8ee;">
                              <p class="email-label" style="margin:0 0 4px 0; color:#979ea8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">Email</p>
                              <p class="email-value" style="margin:0; color:#0e508a; font-size:16px; font-weight:600;">${email}</p>
                            </td>
                          </tr>
                          <tr>
                            <td class="email-divider" style="padding:15px 0; border-bottom: 1px solid #e4e8ee;">
                              <p class="email-label" style="margin:0 0 4px 0; color:#979ea8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">Asset Type</p>
                              <p class="email-value" style="margin:0; color:#1d2645; font-size:16px; font-weight:600;">${type}</p>
                            </td>
                          </tr>
                          ${size ? `<tr><td class="email-divider" style="padding:15px 0; border-bottom: 1px solid #e4e8ee;"><p class="email-label" style="margin:0 0 4px 0; color:#979ea8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">Asset Size</p><p class="email-value" style="margin:0; color:#1d2645; font-size:16px; font-weight:600;">${size}</p></td></tr>` : ""}
                          ${window ? `<tr><td class="email-divider" style="padding:15px 0; border-bottom: 1px solid #e4e8ee;"><p class="email-label" style="margin:0 0 4px 0; color:#979ea8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">Target Window</p><p class="email-value" style="margin:0; color:#1d2645; font-size:16px; font-weight:600;">${window}</p></td></tr>` : ""}
                        </table>

                        ${
                          notes
                            ? `
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                          <tr>
                            <td class="email-note-box" style="background-color:#fef3e6; border-left:4px solid #E27D1D; padding:15px; border-radius:8px;">
                              <p class="email-label" style="margin:0 0 4px 0; color:#979ea8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">Scope Notes</p>
                              <p class="email-note-text" style="margin:0; color:#1d2645; font-size:15px; line-height:1.5;">${notes}</p>
                            </td>
                          </tr>
                        </table>`
                            : ""
                        }

                        <!-- Botón Responder -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
                          <tr>
                            <td align="center">
                              <a href="mailto:${email}" style="background-color:#E27D1D; color:#ffffff; text-decoration:none; padding:14px 30px; border-radius:5px; font-weight:600; display:inline-block;">Reply to ${name}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Pie de página -->
                    <tr>
                      <td class="email-footer" style="background-color:#f6f8fa; padding:20px 40px; text-align:center;">
                        <p style="margin:0; color:#979ea8; font-size:12px;">© ${new Date().getFullYear()} Utilisight Corp · Ontario-wide operations</p>
                        <p style="margin:5px 0 0 0; color:#979ea8; font-size:11px;">This email was sent from the Utilisight website contact form.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
      `,
    });

    if (error) {
      console.error("RESEND RECHAZÓ EL CORREO:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (e) {
    console.error("Error del servidor:", e);
    res.status(500).json({ error: e.message || "Server error" });
  }
};