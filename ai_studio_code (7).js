/**
 * שלב 5: תמלול
 */
function בצע_שלב_תמלול(הגדרות, שרשור, קובץ_אודיו, משתנים, דוח) {
  if (הגדרות[64] !== 'כן') {
    if (הגדרות[80] === 'כן') הוסף_תווית(שרשור, הגדרות[81]);
    דוח.push("שלב 5 (תמלול): דולג.");
    return;
  }

  try {
    const מפתח_api = הגדרות[66];
    const מודל = הגדרות[65];
    
    if (!מפתח_api) throw new Error("לא סופק מפתח API.");

    // הכנת הבקשה ל-Google Cloud Speech-to-Text
    const תוכן_בייס64 = Utilities.base64Encode(קובץ_אודיו.getBytes());
    const בקשה = {
      "config": {
        "languageCode": "he-IL",
        "model": מודל || "default"
      },
      "audio": {
        "content": תוכן_בייס64
      }
    };

    const url = "https://speech.googleapis.com/v1/speech:recognize?key=" + מפתח_api;
    const תגובה = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(בקשה),
      muteHttpExceptions: true
    });

    const תוצאה_json = JSON.parse(תגובה.getContentText());
    let טקסט_מתומלל = "";

    if (תוצאה_json.results) {
      תוצאה_json.results.forEach(res => {
        טקסט_מתומלל += res.alternatives[0].transcript + "\n";
      });
    } else {
      throw new Error("ה-API לא החזיר תוצאות או שהקובץ גדול מדי לזיהוי סינכרוני.");
    }

    // יצירת קובץ Docx
    let קישור_מסמך_דרייב = "";
    let קובץ_docx_מצורף = null;

    if (הגדרות[68] === 'כן' || הגדרות[76] === 'כן') {
      const מסמך_גוגל = DocumentApp.create("תמלול_אוטומטי");
      מסמך_גוגל.getBody().setText(טקסט_מתומלל);
      מסמך_גוגל.saveAndClose();
      
      const מזהה_מסמך = מסמך_גוגל.getId();
      
      // העברה לתיקייה הרצויה אם הוגדר
      if (הגדרות[68] === 'כן' && הגדרות[69]) {
        const תיקית_יעד = DriveApp.getFolderById(הגדרות[69]);
        const קובץ_דרייב = DriveApp.getFileById(מזהה_מסמך);
        קובץ_דרייב.moveTo(תיקית_יעד);
        קישור_מסמך_דרייב = קובץ_דרייב.getUrl();
      }

      // ייצוא ל-Docx כדי לצרף למייל
      if (הגדרות[76] === 'כן') {
        const url_יצוא = "https://docs.google.com/document/d/" + מזהה_מסמך + "/export?format=docx";
        const אסימון = ScriptApp.getOAuthToken();
        const תגובת_יצוא = UrlFetchApp.fetch(url_יצוא, {
          headers: { 'Authorization': 'Bearer ' + אסימון }
        });
        קובץ_docx_מצורף = תגובת_יצוא.getBlob().setName("תמלול.docx");
      }
    }

    // שליחת מייל
    if (הגדרות[70] === 'כן') {
      const כתובת = הגדרות[71];
      const נושא = החלף_משתנים(הגדרות[73], משתנים);
      let גוף = החלף_משתנים(הגדרות[74], משתנים) + "\n\n";
      
      if (הגדרות[75] === 'כן') גוף += "תוכן התמלול:\n" + טקסט_מתומלל + "\n\n";
      if (הגדרות[77] === 'כן' && קישור_מסמך_דרייב) גוף += "קישור למסמך בדרייב: " + קישור_מסמך_דרייב;

      let קבצים = [];
      if (קובץ_docx_מצורף) קבצים.push(קובץ_docx_מצורף);

      שלח_מייל(כתובת, נושא, גוף, קבצים, הגדרות[72]);
      נקה_מיילים_נכנסים(כתובת, הגדרות[84], הגדרות[85], הגדרות[86]);
    }

    if (הגדרות[78] === 'כן') הוסף_תווית(שרשור, הגדרות[79]);
    דוח.push("שלב 5 (תמלול): בוצע בהצלחה.");

  } catch (שגיאה) {
    if (הגדרות[82] === 'כן') הוסף_תווית(שרשור, הגדרות[83]);
    דוח.push("שגיאה בשלב 5 (תמלול): " + שגיאה.message);
  }
}