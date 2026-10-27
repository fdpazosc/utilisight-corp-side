const { Resend } = require('resend');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // CAPA 1: Verificación de Origen (CORS)
  const origin = req.headers.origin || req.headers.referer || '';
  const allowedOrigins = ['https://utilisight.ca', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'https://utilisight-intelligent-inspections.vercel.app'];
  if (!allowedOrigins.some(o => origin.startsWith(o))) {
    return res.status(403).json({ error: 'Forbidden: Invalid Origin' });
  }

  const { name, company, email, type, size, window, notes, website } = req.body;

  // CAPA 2: Trampa para Bots (Honeypot)
  // Si el campo "website" tiene texto, es un bot. Fingimos que fue exitoso para que no sepan que los detectamos.
  if (website) {
    return res.status(200).json({ success: true, data: { id: 'bot_trapped' } });
  }

  // CAPA 3: Validación estricta de datos
  if (!name || !company || !email || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const toEmail = process.env.CONTACT_EMAIL;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Utilisight Web <noreply@resend.dev>',
      to: toEmail,
      reply_to: email,
      subject: `New Inspection Request from ${name} - ${company}`,
      html: `
        <h2>New Inspection Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asset Type:</strong> ${type}</p>
        <p><strong>Asset Size:</strong> ${size || 'N/A'}</p>
        <p><strong>Target Window:</strong> ${window || 'N/A'}</p>
        <p><strong>Scope Notes:</strong> ${notes || 'N/A'}</p>
      `
    });

    if (error) {
      console.error('RESEND RECHAZÓ EL CORREO:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (e) {
    console.error('Error del servidor:', e);
    res.status(500).json({ error: 'Server error' });
  }
};