const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const rateLimitStore = new Map();

function getClientIp(headers = {}) {
  const forwardedFor = headers['x-forwarded-for'] || headers['X-Forwarded-For'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return (
    headers['client-ip'] ||
    headers['Client-Ip'] ||
    headers['x-nf-client-connection-ip'] ||
    headers['X-Nf-Client-Connection-Ip'] ||
    headers['x-real-ip'] ||
    headers['X-Real-Ip'] ||
    'unknown'
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const existing = rateLimitStore.get(ip) || [];
  const recent = existing.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitStore.set(ip, recent);
  return false;
}

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  const ip = getClientIp(event.headers || {});
  if (isRateLimited(ip)) {
    return json(429, { error: 'Too Many Requests' }, { 'Retry-After': '60' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { name, phone, email, source, timestamp, bot_field, website_url } = body;

    if ((bot_field && String(bot_field).trim()) || (website_url && String(website_url).trim())) {
      return json(200, { ok: true });
    }

    if (!name || !phone || !email) {
      return json(400, { error: 'Missing required fields' });
    }

    const data = await resend.emails.send({
      from: 'amit@amitweb.com',
      to: ['Yuvilevlev@gmail.com'],
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
          <p style="color: #666; font-size: 12px;">IP: ${ip}</p>
        </div>
      `
    });

    return json(200, data);
  } catch (error) {
    return json(400, { error: error.message || 'Unknown error' });
  }
};
