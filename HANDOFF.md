# מסמך מסירה — דף נחיתה מדיטציית הכסף

מסמך עבודה לפני השקה. לעבור שלב אחר שלב.

---

## 1. Placeholders למילוי

כל המקומות המסומנים ב-`<!-- NAME -->` צריכים להתחלף לפני פרסום.

| Placeholder | קובץ | דוגמה |
|---|---|---|
| `<!-- BRAND_NAME -->` | `index.html` (×4), `thank-you.html` (אם תוסיפי) | `שרה כהן · שפע בתנועה` |
| `<!-- TESTIMONIAL_1_NAME -->` | `index.html` | `רונית מ.` |
| `<!-- TESTIMONIAL_1_TEXT -->` | `index.html` | `"תוך שבוע שלחתי הצעת מחיר שסגרה עסקה של 12,000 ₪."` |
| `<!-- TESTIMONIAL_2_NAME -->` / `_TEXT` | `index.html` | כנ"ל |
| `<!-- TESTIMONIAL_3_NAME -->` / `_TEXT` | `index.html` | כנ"ל |
| `<!-- OG_IMAGE -->` | `index.html` (×2) | `https://yourdomain.com/assets/og.jpg` (1200×630) |
| `<!-- GOOGLE_SHEETS_WEBHOOK -->` | `scripts/main.js` שורה 7 | `https://script.google.com/macros/s/AKfycb.../exec` |
| `<!-- YUVAL_EMAIL -->` | `google-apps-script.js` שורה 15 | `'yuval@example.com'` |
| `<!-- MEDITATION_LINK -->` | `google-apps-script.js` שורה 16 | `'https://drive.google.com/file/d/XXXX/view'` |
| `VIDEO_EMBED` (הערה) | `index.html` | החליפי את ה-`<div class="video-placeholder">` ב-iframe של YouTube (ראי README) |

---

## 2. הגדרת Google Sheets + Apps Script

- [ ] **1.** נכנסת ל-[sheets.google.com](https://sheets.google.com), גיליון חדש `Leads - Meditation`
- [ ] **2.** שורה ראשונה: `timestamp | name | phone | email | source | form`
- [ ] **3.** `הרחבות → Apps Script`
- [ ] **4.** מוחקים את הקוד ברירת המחדל, מדביקים את כל `google-apps-script.js`
- [ ] **5.** בקוד: מחליפים `<!-- YUVAL_EMAIL -->` (שורה 15) ו-`<!-- MEDITATION_LINK -->` (שורה 16) בערכים אמיתיים — שניהם בגרשיים
- [ ] **6.** שמירה (Cmd+S), שם פרויקט `Meditation Leads`
- [ ] **7.** `Deploy → New deployment → Type: Web app`
- [ ] **8.** `Execute as: Me`, `Who has access: Anyone`
- [ ] **9.** `Deploy` → אישור הרשאות (יתכן מסך "Unsafe — Advanced — Go to project")
- [ ] **10.** מעתיקים את ה-Web app URL (נגמר ב-`/exec`)
- [ ] **11.** ב-`scripts/main.js` שורה 7: מחליפים את `<!-- GOOGLE_SHEETS_WEBHOOK -->` ב-URL
- [ ] **12.** שומרים

---

## 3. בדיקה שהטופס עובד

**סקריפט:**
1. פתחי את הדף (`index.html?debug=1` אם את רוצה לוגים)
2. מלאי את טופס ה-Hero:
   - שם: `בדיקה`
   - טלפון: `0501234567`
   - אימייל: המייל שלך
3. לחצי "קבלי את המדיטציה עכשיו"

**מה אמור לקרות:**
- ספינר על הכפתור
- "מעולה! מעבירה אותך..."
- מעבר ל-`thank-you.html`

**איפה לוודא:**
- ✅ **Google Sheets:** נוספה שורה חדשה עם כל 6 השדות
- ✅ **מייל למשתמשת:** הגיעה הודעה לכתובת שהזנת עם הנושא "המדיטציה שלך מחכה לך ❤️" וקישור למדיטציה
- ✅ **מייל לבעלים (YUVAL_EMAIL):** הודעה עם הנושא "ליד חדש! בדיקה" + כל הפרטים
- חזרי על הבדיקה עם הטופס התחתון (`data-form="final-cta"`)

**Debug:**
- `?debug=1` בכתובת → DevTools → Console מציג: כל השדות שנשלחים, ה-webhook URL, שגיאות fetch מלאות

**תקלות נפוצות:**
- שורה לא נוספת ב-Sheets → בדקי שה-Deploy הוא `Anyone` ולא `Only myself`
- מייל לא מגיע למשתמשת → בדקי ש-`MEDITATION_LINK` מוגדר (לא placeholder) + עברת אישור הרשאות MailApp ב-Apps Script
- הרצה ראשונה דורשת אישור הרשאות — זה נורמלי

---

## 4. פריסה

| פלטפורמה | מהירות | יתרונות |
|---|---|---|
| **Netlify drag-drop** ← מומלץ | 2 דק' | גוררים תיקייה, URL מיידי, HTTPS אוטומטי |
| Vercel | 3 דק' | דומה, דורש הרשמה |
| GitHub Pages | 10 דק' | חינם, דורש git |

**Netlify:**
1. [app.netlify.com/drop](https://app.netlify.com/drop)
2. גוררים את כל תיקיית הפרויקט (לא קבצים בנפרד)
3. מקבלים URL תוך שניות
4. Domain → ניתן לחבר דומיין מותאם

---

## 5. צ'ק-ליסט אחרון

- [ ] כל ה-placeholders מולאו (אין יותר `<!-- XXX -->` ב-HTML/JS)
- [ ] Webhook נבדק: ליד בדיקה הגיע ל-Sheets + למייל המשתמשת + למייל הבעלים
- [ ] `MEDITATION_LINK` בתוך Apps Script פותח את ההקלטה (הרשאה "anyone with link")
- [ ] וידאו — או הוחלף ב-iframe של YouTube, או נשאר placeholder מכוון
- [ ] נבדק על iPhone אמיתי ו-Chrome דסקטופ
- [ ] הוסרו `?debug=1` מה-URLs שמפורסמים
