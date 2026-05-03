/**
 * Abundance Elegance — Google Apps Script Web App
 *
 * Receives form submissions from the landing page, appends them to the
 * active Google Sheet, emails the meditation link to the lead, and sends
 * a notification to the owner.
 *
 * Setup (see HANDOFF.md for the full walkthrough):
 *  1. Attach this script to a Google Sheet (Extensions → Apps Script).
 *  2. Replace the two placeholders below.
 *  3. Deploy → New deployment → Web app → Execute as: Me, Access: Anyone.
 *  4. Copy the /exec URL into scripts/main.js (WEBHOOK_URL).
 */

const OWNER_EMAIL     = '<!-- YUVAL_EMAIL -->';
const MEDITATION_LINK = '<!-- MEDITATION_LINK -->';

function doPost(e) {
  const params = (e && e.parameter) || {};
  const name      = (params.name      || '').toString().trim();
  const phone     = (params.phone     || '').toString().trim();
  const email     = (params.email     || '').toString().trim();
  const source    = (params.source    || '').toString();
  const form      = (params.form      || '').toString();
  const timestamp = params.timestamp ? new Date(params.timestamp) : new Date();

  // 1. Append row to the active sheet
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([timestamp, name, phone, email, source, form]);
  } catch (err) {
    console.error('appendRow failed:', err);
  }

  // 2. Email meditation link to the lead
  if (email && !MEDITATION_LINK.includes('MEDITATION_LINK')) {
    try {
      MailApp.sendEmail({
        to: email,
        subject: 'המדיטציה שלך מחכה לך ❤️',
        htmlBody: wrapHtml(buildUserEmail(name)),
        name: 'מדיטציית הכסף'
      });
    } catch (err) {
      console.error('user email failed:', err);
    }
  }

  // 3. Notify owner
  if (!OWNER_EMAIL.includes('YUVAL_EMAIL')) {
    try {
      MailApp.sendEmail({
        to: OWNER_EMAIL,
        subject: 'ליד חדש! ' + (name || '(ללא שם)'),
        htmlBody: wrapHtml(
          '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;direction:rtl;text-align:right">' +
          '<p><strong>שם:</strong> ' + escapeHtml(name) + '</p>' +
          '<p><strong>טלפון:</strong> ' + escapeHtml(phone) + '</p>' +
          '<p><strong>אימייל:</strong> ' + escapeHtml(email) + '</p>' +
          '<p><strong>מקור:</strong> ' + escapeHtml(source) + '</p>' +
          '<p><strong>טופס:</strong> ' + escapeHtml(form) + '</p>' +
          '<p><strong>זמן:</strong> ' + timestamp + '</p>' +
          '</div>'
        )
      });
    } catch (err) {
      console.error('owner email failed:', err);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildUserEmail(name) {
  const greeting = name ? 'היי ' + escapeHtml(name) + ',' : 'היי,';
  const tipTitleStyle = 'font-weight:700;font-size:17px;margin:24px 0 8px;color:#2A1F1A';
  const tipBodyStyle  = 'margin:0 0 16px';
  return (
    '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.7;color:#2A1F1A;direction:rtl;text-align:right;max-width:560px;margin:0 auto;padding:24px">' +
      '<p style="font-size:18px">' + greeting + '</p>' +

      '<p>איזה כיף שהצטרפת! אני ממש מתרגשת לחלוק איתך את המדיטציה הזו. היא שינתה לי את כל האנרגיה מול כסף בחיים, ואני יודעת כמה כוח יש לה כשעושים אותה נכון.</p>' +

      '<p>כדי שתפיקו ממנה את המקסימום, ריכזתי לכם את הדגשים הכי חשובים שאמרתי בסרטון:</p>' +

      '<p style="' + tipTitleStyle + '">1. התמדה היא שם המשחק ✨</p>' +
      '<p style="' + tipBodyStyle  + '">כדי לראות שינוי אמיתי, חשוב לעשות את המדיטציה בכל בוקר לפני שמתחילים את היום, למשך חודש לפחות. אני אישית עושה אותה עד היום – זה הכוח של הרגל שבונה מציאות.</p>' +

      '<p style="' + tipTitleStyle + '">2. למה אנחנו חוזרים לסכום הראשוני? (החלק המקצועי)</p>' +
      '<p style="' + tipBodyStyle  + '">בסוף המדיטציה אנחנו חוזרים לסכום המקורי שאנחנו מרוויחים היום. זה לא מקרי: אנחנו עושים את זה כדי לחווט ולתכנת את הגוף שלנו להיות בקלילות. המטרה היא להרגיל את המערכת שלנו להרגיש בנוח גם באנרגיה של "כסף גדול" וגם באנרגיה של הכסף שאנחנו מרוויחים היום, בלי מתח ובלי פחד.</p>' +

      '<p style="' + tipTitleStyle + '">3. אנרגיה לפני היגיון ⚡</p>' +
      '<p style="' + tipBodyStyle  + '">זה בסדר גמור אם בהתחלה לא תבינו בדיוק מה אתם עושים או למה אומרים דברים מסוימים. אנחנו עובדים כאן עם אנרגיה, לא עם היגיון. פשוט תנו לעצמכם "להחליק" לתוך התהליך.</p>' +

      '<p style="' + tipTitleStyle + '">4. לשחרר את ה"איך" וה"מתי" 🕰️</p>' +
      '<p style="' + tipBodyStyle  + '">אל תבזבזו אנרגיה על מחשבות של "איך זה יקרה?". פשוט שחררו את תודעת החוסר והתחברו לשפע. התמקדו בחיבור לבריאה ובמה שיש כרגע.</p>' +

      '<p style="' + tipTitleStyle + '">5. הסוד הגדול: שחרור ציפיות 🎈</p>' +
      '<p style="' + tipBodyStyle  + '">זה הדגש הכי חשוב שלי אליכם: שחררו כל ציפייה. ציפייה היא הרבה פעמים פתח לאכזבה. פשוט תהיו בנוכחות, תהנו מהשקט, ותנו לחיבור הזה לעשות את שלו.</p>' +

      '<p style="margin-top:24px">מוכנים? מצאו לכם פינה שקטה, קחו נשימה עמוקה... ובואו נתחיל.</p>' +

      '<p style="margin:28px 0;text-align:center">' +
        '<a href="' + MEDITATION_LINK + '" ' +
           'style="display:inline-block;padding:14px 28px;background:#D4AF37;color:#2A1F1A;text-decoration:none;border-radius:10px;font-weight:500;font-size:16px">' +
          'לחצי כאן למדיטציה' +
        '</a>' +
      '</p>' +

      '<p style="color:#6B5D54;font-size:14px;margin-top:32px">באהבה,<br>מדיטציית הכסף</p>' +
    '</div>'
  );
}

function escapeHtml(s) {
  return (s || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapHtml(inner) {
  return (
    '<!DOCTYPE html><html lang="he" dir="rtl"><head>' +
    '<meta charset="UTF-8">' +
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
    '</head><body>' + inner + '</body></html>'
  );
}

function doGet() {
  return ContentService.createTextOutput('OK');
}
