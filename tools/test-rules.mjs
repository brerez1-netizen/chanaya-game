// בדיקות למנוע הכללים של פרק 26. הרצה: node tools/test-rules.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("../js/rules.js");
const R = globalThis.ParkingRules;

let fail = 0;
const eq = (got, exp, msg) => {
  const ok = Math.abs(got - exp) < 1e-6;
  console.log((ok ? "  ok   " : "  FAIL ") + msg + "   got=" + got + " exp=" + exp);
  if (!ok) fail++;
};
const is = (got, exp, msg) => {
  const ok = got === exp;
  console.log((ok ? "  ok   " : "  FAIL ") + msg + "   got=" + got);
  if (!ok) fail++;
};

console.log("\n== בחירת שורת הטבלה לפי רוחב המעבר ==");
eq(R.rowForAisle(1, 6.20)[0], 6.20, "מעבר 6.20 ברמה 1");
eq(R.rowForAisle(1, 5.60)[0], 5.50, "מעבר 5.60 נופל לשורת 5.50, המחמירה יותר");
eq(R.rowForAisle(1, 4.50)[0], 4.50, "4.50 הוא המעבר הצר ביותר שברמה 1");
is(R.rowForAisle(1, 4.40), null, "מעבר 4.40 צר מכל הטבלה ברמה 1, הסידור פסול");
eq(R.rowForAisle(3, 4.40)[0], 4.40, "אותו 4.40 חוקי ברמה 3");
eq(R.rowForAisle(3, 5.50)[0], 5.20, "מעבר רחב מכל הטבלה נופל לשורה הרחבה ביותר");

console.log("\n== הרוחב הנדרש למפרץ ==");
eq(R.requiredWidth(1, 6.00, "between", 3).width, 8.00, "רמה 1, מעבר 6.00, שלושה תאים בין עמודים");
eq(R.requiredWidth(1, 5.50, "between", 3).width, 8.60, "רמה 1, מעבר 5.50, שלושה תאים");
eq(R.requiredWidth(1, 5.50, "between", 2).width, 6.00, "רמה 1, מעבר 5.50, שני תאים");
eq(R.requiredWidth(1, 5.50, "between", 1).width, 3.40, "רמה 1, מעבר 5.50, תא בודד בין עמודים");
eq(R.requiredWidth(1, 5.50, "beside", 1).width, 3.00, "אותו מקרה ליד עמוד או קיר");
eq(R.requiredWidth(1, 5.50, "open", 1).width, 2.60, "אותו מקרה בשטח פנוי");
eq(R.requiredWidth(1, 5.50, "open", 4).width, 10.40, "ארבעה תאים בשטח פנוי, מכפלה פשוטה");
is(R.requiredWidth(1, 5.50, "between", 4).ok, false, "ארבעה תאים בין עמודים אינם מופיעים בספר");

console.log("\n== ההפרש בין הקצה לאמצע, וזה מה שהמשחק מלמד ==");
const openW = R.requiredWidth(1, 5.50, "open", 1).width;
const betweenW = R.requiredWidth(1, 5.50, "between", 1).width;
eq(betweenW - openW, 0.80, "תא שנתקע בין שני עמודים דורש 80 ס\"מ יותר מתא בשטח פנוי");

console.log("\n== פסיקה על מפרץ ==");
is(R.checkBay({ level: 1, aisle: 5.50, kind: "between", n: 3, clearSpan: 8.00 }).legal, false,
   "8.00 מ' לא מספיק לשלושה תאים ברמה 1 עם מעבר 5.50");
is(R.checkBay({ level: 1, aisle: 6.00, kind: "between", n: 3, clearSpan: 8.00 }).legal, true,
   "אותו מפרץ חוקי אם מרחיבים את המעבר ל-6.00");
is(R.checkBay({ level: 3, aisle: 5.50, kind: "between", n: 3, clearSpan: 8.00 }).legal, true,
   "וגם חוקי ברמת שרות 3");
is(R.checkBay({ level: 1, aisle: 5.50, kind: "between", n: 2, clearSpan: 6.00 }).legal, true,
   "מפרץ של 6.00 בדיוק, שני תאים, עובר על הגבול");
is(R.checkBay({ level: 1, aisle: 5.50, kind: "between", n: 0, clearSpan: 8.00 }).legal, true,
   "מפרץ ריק תמיד חוקי");
is(R.checkBay({ level: 1, aisle: 4.20, kind: "open", n: 1, clearSpan: 9.00 }).code, "aisle-too-narrow",
   "מעבר צר מדי נפסל עוד לפני שבודקים את המפרץ");

console.log("\n== עומק מול רוחב המעבר ==");
eq(R.aisleFromDepth(16.00), 6.00, "עומק 16.00 בין שני קירות עם שתי שורות תאים");
eq(R.aisleFromDepth(15.50), 5.50, "עומק 15.50");
eq(R.aisleFromDepth(11.00, 1), 6.00, "עומק 11.00 עם שורת תאים אחת");

console.log("\n== עיגול כלפי מעלה, סעיף ג' ==");
eq(R.roundUpStalls(12.1), 13, "12.1 מתעגל ל-13");
eq(R.roundUpStalls(12.0), 12, "12.0 נשאר 12");
eq(R.roundUpStalls(0.2), 1, "0.2 מתעגל ל-1");

console.log("\n== רמפה, ב.5 ו-ב.6 ==");
is(R.checkRamp({ length: 22, slope: 0.15, oneWay: true, stallCount: 38 }).legal, true,
   "רמפה קצרה בשיפוע 15%, חד סטרית, 38 מקומות");
is(R.checkRamp({ length: 22, slope: 0.17, oneWay: false, stallCount: 38 }).legal, false,
   "שיפוע 17% נפסל");
is(R.checkRamp({ length: 30, slope: 0.12, oneWay: true, stallCount: 38 }).legal, false,
   "רמפה חד סטרית באורך 30 מ' נפסלת, היא כבר ארוכה");
is(R.checkRamp({ length: 22, slope: 0.12, oneWay: true, stallCount: 60 }).legal, false,
   "רמפה חד סטרית בחניון של 60 מקומות נפסלת");
eq(R.checkRamp({ length: 30, slope: 0.12, oneWay: false, stallCount: 60 }).minLaneWidth, 3.00,
   "רמפה ארוכה, רוחב נתיב מינימלי 3.00");
eq(R.checkRamp({ length: 20, slope: 0.12, oneWay: false, stallCount: 60 }).minLaneWidth, 2.75,
   "רמפה קצרה, רוחב נתיב מינימלי 2.75");

console.log("\n== מפרץ מעורב, והאם המודל משחזר את הספר ==");
const mb = (stalls, span) => R.checkMixedBay({ level: 1, aisle: 6.20, stalls, clearSpan: span });
eq(mb(["regular", "regular", "regular"], 7.80).need, 7.80,
   "שלושה רגילים: 2.70+2.40+2.70, וזה בדיוק ה-7.80 שבספר");
eq(mb(["regular", "regular"], 7.80).need, 5.40,
   "שניים רגילים: 2.70+2.70, וזה בדיוק ה-5.40 שבספר");
eq(mb(["regular"], 7.80).need, 3.00,
   "תא בודד במפרץ הוא בין שני עמודים, וזה בדיוק ה-3.00 שבספר");

console.log("\n== שלוש העמודות של הספר משוחזרות במלואן ==");
[[1, 3.00, "תא יחיד בין עמודים/קירות"],
 [2, 5.40, "משטח ל-2 תאים"],
 [3, 7.80, "משטח ל-3 תאים"]].forEach(([n, exp, label]) => {
  eq(mb(Array(n).fill("regular"), 12).need, exp, label);
});
eq(mb(["accessible", "regular"], 7.80).need, 6.20, "נגיש 3.50 ועוד רגיל 2.70");
is(mb(["accessible", "regular"], 7.80).legal, true, "נגיש ועוד רגיל נכנסים במפרץ 7.80");
eq(mb(["accessible", "regular", "regular"], 7.80).need, 8.60, "נגיש ועוד שניים: 3.50+2.40+2.70");
is(mb(["accessible", "regular", "regular"], 7.80).legal, false,
   "כלומר תא נגיש עולה תא רגיל, וזו החידה של המשחק");
eq(mb(["accessibleTall", "regular"], 7.80).need, 7.30, "נגיש לרכב גבוה 4.60 ועוד רגיל");
is(mb(["accessibleTall", "regular"], 7.80).legal, true, "ונכנס, בקושי");
is(mb([], 7.80).legal, true, "מפרץ ריק חוקי");
is(mb(["regular", "regular", "regular", "regular"], 7.80).legal, false, "ארבעה רגילים לא נכנסים");

console.log("\n== בדיקת התכנון כשהסטודנט בוחר את הרוחב ==");
const D = (stalls, span) => R.checkDesign({ level: 1, aisle: 6.20, stalls, clearSpan: span });
const reg = (w) => ({ kind: "regular", w });
is(D([reg(2.70), reg(2.40), reg(2.70)], 7.80).legal, true, "הסידור הנכון: 2.70 / 2.40 / 2.70");
is(D([reg(2.40), reg(2.40), reg(2.70)], 7.80).legal, false,
   "תא קצה ברוחב 2.40 נפסל, הוא ליד עמוד וצריך 2.70");
eq(D([reg(2.40), reg(2.40), reg(2.70)], 7.80).parts[0].min, 2.70, "המינימום שמוצג לתא הקצה");
is(D([reg(2.70), reg(2.70), reg(2.70)], 8.30).legal, true,
   "רוחב גדול מהמינימום מותר כל עוד הסכום נכנס");
is(D([reg(3.00), reg(3.00), reg(2.70)], 7.80).legal, false, "סכום שעולה על המרווח נפסל");
eq(D([reg(3.00), reg(3.00), reg(2.70)], 7.80).sum, 8.70, "והסכום מוצג");
is(D([reg(2.70)], 4.50).legal, false, "תא בודד ברוחב 2.70 נפסל, בין עמודים צריך 3.00");
is(D([reg(3.00)], 4.50).legal, true, "ובשלושה מטר הוא עובר");
is(D([{ kind: "accessible", w: 3.50 }], 4.50).legal, true, "תא נגיש 3.50 נכנס במרווח 4.50");
is(D([{ kind: "accessible", w: 3.00 }], 4.50).legal, false, "תא נגיש ברוחב 3.00 נפסל");
is(D([], 7.80).legal, true, "מפרץ ריק חוקי");

console.log("\n==========================");
console.log(fail ? `נכשלו ${fail} בדיקות` : "כל הבדיקות עברו");
process.exit(fail ? 1 : 0);
