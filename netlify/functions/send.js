const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { name, phone, email, source, timestamp } = body;

    if (!name || !phone || !email) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const data = await resend.emails.send({
      from: 'amit@amitweb.com',
      to: ['amityst12@gmail.com'],
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
          <p style="color: #666; font-size: 12px;">תאריך ההרשמה: ${timestamp || ''}</p>
          <p style="color: #666; font-size: 12px;">מקור: ${source || ''}</p>
        </div>
      `
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Unknown error' })
    };
  }
};
