const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // serve static files (optional)

const TO_EMAIL = 'disablednewsnetwork@gmail.com';

// Configure SMTP via environment variables:
// SMTP_HOST, SMTP_PORT (number), SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

// health
app.get('/ping', (req, res) => res.send('ok'));

app.post('/subscribe', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email required' });
  }

  const infoText = `New signup for launch notifications\n\nEmail: ${email}\nTime: ${new Date().toISOString()}\nIP: ${req.ip}\nUser-Agent: ${req.get('User-Agent')}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL || (process.env.SMTP_USER || 'no-reply@example.com'),
    to: TO_EMAIL,
    subject: `New launch signup: ${email}`,
    text: infoText,
    html: `<pre style="font-family:inherit">${infoText}</pre>`
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ ok: true });
  } catch (err) {
    console.error('SendMail error:', err);
    return res.status(500).json({ error: 'Failed to send notification email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Subscribe server listening on http://localhost:${PORT}`));