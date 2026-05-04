import { Resend } from 'resend';

// Make sure to add RESEND_API_KEY to your Vercel / Netlify environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, phone, email, source, timestamp } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Amit <amit@amitweb.com>', // Update this once you verify a domain in Resend
      to: ['amityst12@gmail.com'], // Sent to Yuval (or developer)
      subject: 'ליד חדש נרשם למדיטציית הכסף!',
      html: `
        <div dir="rtl" style="font-family: sans-serif; color: #1f1812;">
          <h2 style="color: #d4af37;">נרשמה חדשה למדיטציה! תגידו מזל טוב 💸</h2>
          <p><strong>שם העוקבת:</strong> ${name}</p>
          <p><strong>טלפון:</strong> ${phone}</p>
          <p><strong>אימייל:</strong> ${email}</p>
          <br/>
          <hr/>
          <p style="color: #666; font-size: 12px;">נתונים טכניים:</p>
          <p style="color: #666; font-size: 12px;">תאריך ההרשמה: ${timestamp}</p>
          <p style="color: #666; font-size: 12px;">מקור: ${source}</p>
        </div>
      `
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
