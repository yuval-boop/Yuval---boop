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

    const ownerEmail = resend.emails.send({
      from: 'יובל אלקובי <amit@amitweb.com>',
      to: ['Yuval144.888@gmail.com'],
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

    const userEmail = resend.emails.send({
      from: 'יובל אלקובי <amit@amitweb.com>',
      to: [email],
      subject: `היי ${name}, המדיטציה שלך מוכנה ✨`,
      html: `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E8D9A8;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#B8860B 0%,#D4AF37 50%,#B8860B 100%);padding:36px 32px;text-align:center;">
            <p style="margin:0 0 6px;color:#FFFFFF;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;">מדיטציית השפע והכסף</p>
            <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:800;">היי ${name} ✨</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <p style="color:#3D2B0A;font-size:16px;line-height:1.8;margin:0 0 20px;">
              איזה כיף שהצטרפת! אני ממש מתרגשת לחלוק איתך את המדיטציה הזו. היא שינתה לי את כל האנרגיה מול כסף בחיים, ואני יודעת כמה כוח יש לה כשעושים אותה נכון.
            </p>
            <p style="color:#3D2B0A;font-size:16px;line-height:1.8;margin:0 0 28px;">
              כדי שתפיקי ממנה את המקסימום, ריכזתי לך את הדגשים הכי חשובים שאמרתי בסרטון:
            </p>

            <!-- Tip 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
              <tr><td style="background:#FFFDF5;border:1px solid #D4AF37;border-right:4px solid #D4AF37;border-radius:12px;padding:18px 20px;">
                <p style="margin:0 0 6px;color:#8B6914;font-size:15px;font-weight:800;">1. התמדה היא שם המשחק ✨</p>
                <p style="margin:0;color:#4A3510;font-size:14px;line-height:1.8;">כדי לראות שינוי אמיתי, חשוב לעשות את המדיטציה בכל בוקר לפני שמתחילים את היום, למשך חודש לפחות. אני אישית עושה אותה עד היום &#8211; זה הכוח של הרגל שבונה מציאות.</p>
              </td></tr>
            </table>

            <!-- Tip 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
              <tr><td style="background:#FFFDF5;border:1px solid #D4AF37;border-right:4px solid #D4AF37;border-radius:12px;padding:18px 20px;">
                <p style="margin:0 0 6px;color:#8B6914;font-size:15px;font-weight:800;">2. למה אנחנו חוזרים לסכום הראשוני? (החלק המקצועי)</p>
                <p style="margin:0;color:#4A3510;font-size:14px;line-height:1.8;">בסוף המדיטציה אנחנו חוזרים לסכום המקורי שאנחנו מרוויחים היום. זה לא מקרי: אנחנו עושים את זה כדי לחווט ולתכנת את הגוף שלנו להיות בקלילות. המטרה היא להרגיל את המערכת שלנו להרגיש בנוח גם באנרגיה של &ldquo;כסף גדול&rdquo; וגם באנרגיה של הכסף שאנחנו מרוויחים היום, בלי מתח ובלי פחד.</p>
              </td></tr>
            </table>

            <!-- Tip 3 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
              <tr><td style="background:#FFFDF5;border:1px solid #D4AF37;border-right:4px solid #D4AF37;border-radius:12px;padding:18px 20px;">
                <p style="margin:0 0 6px;color:#8B6914;font-size:15px;font-weight:800;">3. אנרגיה לפני היגיון &#x26A1;</p>
                <p style="margin:0;color:#4A3510;font-size:14px;line-height:1.8;">זה בסדר גמור אם בהתחלה לא תבינו בדיוק מה אתם עושים או למה אומרים דברים מסוימים. אנחנו עובדים כאן עם אנרגיה, לא עם היגיון. פשוט תנו לעצמכם &ldquo;להחליק&rdquo; לתוך התהליך.</p>
              </td></tr>
            </table>

            <!-- Tip 4 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
              <tr><td style="background:#FFFDF5;border:1px solid #D4AF37;border-right:4px solid #D4AF37;border-radius:12px;padding:18px 20px;">
                <p style="margin:0 0 6px;color:#8B6914;font-size:15px;font-weight:800;">4. לשחרר את ה&ldquo;איך&rdquo; וה&ldquo;מתי&rdquo; &#x1F570;&#xFE0F;</p>
                <p style="margin:0;color:#4A3510;font-size:14px;line-height:1.8;">אל תבזבזי אנרגיה על מחשבות של &ldquo;איך זה יקרה?&rdquo;. פשוט שחררי את תודעת החוסר והתחברי לשפע. התמקדי בחיבור לבריאה ובמה שיש כרגע.</p>
              </td></tr>
            </table>

            <!-- Tip 5 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr><td style="background:#FFFDF5;border:1px solid #D4AF37;border-right:4px solid #D4AF37;border-radius:12px;padding:18px 20px;">
                <p style="margin:0 0 6px;color:#8B6914;font-size:15px;font-weight:800;">5. הסוד הגדול: שחרור ציפיות &#x1F388;</p>
                <p style="margin:0;color:#4A3510;font-size:14px;line-height:1.8;">זה הדגש הכי חשוב שלי אליך: שחררי כל ציפייה. ציפייה היא הרבה פעמים פתח לאכזבה. פשוט תהיי בנוכחות, תהני מהשקט, ותני לחיבור הזה לעשות את שלו.</p>
              </td></tr>
            </table>

            <p style="color:#3D2B0A;font-size:16px;line-height:1.8;margin:0 0 32px;">מוכנה? מצאי לך פינה שקטה, קחי נשימה עמוקה... ובואי נתחיל.</p>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
              <tr><td align="center">
                <a href="https://player.mediadelivery.net/play/653264/3e02b941-7307-4e4d-b627-a71b6fd02620"
                   style="display:inline-block;background:linear-gradient(135deg,#B8860B 0%,#D4AF37 50%,#B8860B 100%);color:#FFFFFF;font-weight:800;font-size:17px;padding:18px 48px;border-radius:14px;text-decoration:none;">
                  &#x1F3A7; לחצי כאן למדיטציה
                </a>
              </td></tr>
            </table>

            <p style="color:#3D2B0A;font-size:15px;line-height:1.8;margin:0;">באהבה,<br><strong style="color:#8B6914;">יובל</strong></p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F7F3EC;padding:20px 32px;text-align:center;border-top:1px solid #E8D9A8;">
            <p style="margin:0;color:#9B8A6A;font-size:12px;">קיבלת מייל זה כי נרשמת למדיטציית השפע והכסף באתר yuval-alkobi.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
    });

    await Promise.all([ownerEmail, userEmail]);

    return json(200, { ok: true });
  } catch (error) {
    return json(400, { error: error.message || 'Unknown error' });
  }
};
