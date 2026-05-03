# דף נחיתה · מדיטציית הכסף

דף נחיתה מעל הקפל (Above the Fold), Hebrew RTL, mobile-first.
עיצוב "Abundance Elegance" — קרם חם, זהב, אזמרגד. ללא אנימציות.

## מבנה

- `index.html` — דף נחיתה (Hero + וידאו + טופס 3 שדות + המלצות + final CTA)
- `styles/main.css` — עיצוב מלא, `@media (min-width: 768px)` ל-desktop
- `scripts/main.js` — ולידציה + שליחת טופס ל-Google Apps Script
- `thank-you.html` — דף תודה פשוט (המדיטציה נשלחת למייל)
- `google-apps-script.js` — Web App: שורה לגיליון + מייל למשתמשת + התראה לבעלים

## טופס — 3 שדות

- **שם מלא** — מינימום 2 תווים, עברית/אנגלית
- **טלפון** — נורמליזציה ואז `/^05\d{8}$/`
- **אימייל** — `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

## תזרים

1. המשתמשת ממלאת את הטופס (Hero או final CTA)
2. `fetch` ל-Apps Script עם `mode: 'no-cors'`
3. Apps Script:
   - מוסיף שורה לגיליון: `timestamp, name, phone, email, source, form`
   - שולח מייל למשתמשת עם קישור המדיטציה
   - שולח מייל לבעלים עם כל הפרטים
4. הדפדפן מועבר ל-`thank-you.html`

## Placeholders

ראי [HANDOFF.md](HANDOFF.md) לטבלה מלאה. הקצרה:

- `<!-- BRAND_NAME -->` — `index.html`, `thank-you.html`
- `<!-- TESTIMONIAL_1/2/3_NAME -->` + `_TEXT` — `index.html`
- `<!-- OG_IMAGE -->` — `index.html`
- `<!-- GOOGLE_SHEETS_WEBHOOK -->` — `scripts/main.js` שורה 7
- `<!-- YUVAL_EMAIL -->` — `google-apps-script.js` שורה 15
- `<!-- MEDITATION_LINK -->` — `google-apps-script.js` שורה 16

## הוספת וידאו אחרי העלאה

ב-`index.html` יש תגובה:

```html
<!-- VIDEO_EMBED: replace this div with YouTube embed iframe -->
<div class="video-placeholder">...</div>
```

החליפי את ה-`<div class="video-placeholder">...</div>` ב:

```html
<div class="video-placeholder" style="padding:0">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="מדיטציית הכסף"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px">
  </iframe>
</div>
```

## פריסה

[Netlify Drop](https://app.netlify.com/drop) — גוררים את התיקייה, מקבלים URL. ראי HANDOFF.md סעיף 4.

## Debug

`index.html?debug=1` — מדפיס ל-console כל שליחת טופס + ה-webhook + שגיאות fetch.
