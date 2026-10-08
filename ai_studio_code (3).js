/**
 * שלב 7: חישוב תאריך עברי (רץ מוקדם כדי להכין משתנים)
 */
function חשב_תאריך_עברי(הודעה, דוח) {
  let משתנים = { שנה: "", פרשה: "" };
  
  try {
    const גוף_ההודעה = הודעה.getPlainBody();
    
    // חיפוש תאריך לועזי בפורמט DD/MM/YYYY או DD.MM.YYYY או DD-MM-YYYY
    const תבנית_תאריך = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
    const התאמה = גוף_ההודעה.match(תבנית_תאריך);
    
    let תאריך_בסיס = new Date(); // ברירת מחדל: היום
    
    if (התאמה) {
      let יום = parseInt(התאמה[1], 10);
      let חודש = parseInt(התאמה[2], 10) - 1; // חודשים ב-JS מתחילים מ-0
      let שנה = parseInt(התאמה[3], 10);
      if (שנה < 100) שנה += 2000;
      תאריך_בסיס = new Date(שנה, חודש, יום);
    }
    
    // הוספת יום 1 לתאריך (כפי שהתבקש)
    תאריך_בסיס.setDate(תאריך_בסיס.getDate() + 1);
    
    const gy = תאריך_בסיס.getFullYear();
    const gm = תאריך_בסיס.getMonth() + 1;
    const gd = תאריך_בסיס.getDate();
    
    // קריאה ל-Hebcal API. פרמטר lg=h מבקש תוצאות בעברית
    const url = `https://www.hebcal.com/converter?cfg=json&gy=${gy}&gm=${gm}&gd=${gd}&g2h=1&lg=h`;
    const תגובה = UrlFetchApp.fetch(url);
    const נתונים = JSON.parse(תגובה.getContentText());
    
    // חילוץ השנה (מגיע כטקסט עברי בשדה hebrew)
    if (נתונים.hebrew) {
      // פילטר פשוט: פיצול הטקסט "יח אלול תשפד" ולקיחת המילה האחרונה
      const חלקים = נתונים.hebrew.split(" ");
      משתנים.שנה = חלקים[חלקים.length - 1];
    }
    
    // חילוץ הפרשה
    if (נתונים.events && נתונים.events.length > 0) {
      for (let i = 0; i < נתונים.events.length; i++) {
        if (נתונים.events[i].includes("פרשת")) {
          משתנים.פרשה = נתונים.events[i];
          break;
        }
      }
    }
    
    דוח.push("שלב 7 (תאריך עברי): בוצע בהצלחה. שנה: " + משתנים.שנה + ", פרשה: " + משתנים.פרשה);
  } catch (שגיאה) {
    דוח.push("שגיאה בשלב 7 (תאריך עברי): " + שגיאה.message);
  }
  
  return משתנים;
}