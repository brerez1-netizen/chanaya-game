// לוח המשחק.
//
// המודול הבסיסי (עומק שורת תאים 5.00, מעבר 6.20, עמודים בעובי 30 ס"מ) חולץ
// מתוכנית חניון תת קרקעי מבוצע. כל סימוני החניה, המידות, טבלת השרטוט ושמות
// הפרויקט והמשרד המתכנן הוסרו.
//
// מרווחי העמודים גוונו בכוונה כדי לייצר מגוון מקרים: מרווח שמתאים לשלושה
// תאים, לזוג, ליחיד בלבד, ומרווח רחב שנראה כאילו נכנס בו עוד תא ולא נכנס.
// שני קירות ממ"ד יורדים לתוך הקומה וחוסמים חלק מהמרווח, כמו בחניון אמיתי.
//
// כל המידות במטרים.

console.log("[board] טוען קליפת חניון");

window.parkingBoard = {
  units: "m",
  width: 44.00,
  height: 16.70,
  stallLength: 5.00,
  aisle: { y0: 5.00, y1: 11.20, width: 6.20 },

  // עמודים בעובי 30 ס"מ. הכניסה לרמפה בקצה המערבי.
  columnDepth: 0.40,
  columnWidth: 0.30,

  rows: [
    {
      side: "lower", y0: 0.00, y1: 5.00, facing: "up",
      spans: [
        { x0: 0.60,  x1: 8.40,  clear: 7.80, left: "wall",   right: "column" },
        { x0: 8.70,  x1: 14.10, clear: 5.40, left: "column", right: "column" },
        { x0: 14.40, x1: 17.40, clear: 3.00, left: "column", right: "mamad" },
        { x0: 19.40, x1: 27.20, clear: 7.80, left: "mamad",  right: "column" },
        { x0: 27.50, x1: 33.70, clear: 6.20, left: "column", right: "column" },
        { x0: 34.00, x1: 39.40, clear: 5.40, left: "column", right: "column" },
      ],
    },
    {
      side: "upper", y0: 11.20, y1: 16.20, facing: "down",
      spans: [
        { x0: 2.20,  x1: 10.00, clear: 7.80, left: "column", right: "column" },
        { x0: 10.30, x1: 14.80, clear: 4.50, left: "column", right: "column" },
        { x0: 15.10, x1: 23.40, clear: 8.30, left: "column", right: "column" },
        { x0: 23.70, x1: 29.10, clear: 5.40, left: "column", right: "mamad" },
        { x0: 31.10, x1: 34.30, clear: 3.20, left: "mamad",  right: "column" },
        { x0: 34.60, x1: 42.40, clear: 7.80, left: "column", right: "wall" },
      ],
    },
  ],

  // קירות הממ"ד שיורדים לתוך הקומה. הם חוסמים את המרווח בין שני מפרצים.
  mamads: [
    { x0: 17.40, x1: 19.40, y0: 0.00, y1: 5.00, label: "ממ\"ד" },
    { x0: 29.10, x1: 31.10, y0: 11.20, y1: 16.20, label: "ממ\"ד" },
  ],

  // הרמפה, בקצה המערבי. לא ניתן לתכנן בה תאים.
  ramp: { x0: 0.00, x1: 0.60, y0: 5.00, y1: 11.20, label: "לרמפה" },
};

// עמודים נגזרים מקצות המרווחים, כדי שהשרטוט והחישוב לא ייפרדו לעולם.
(function deriveColumns(B) {
  const cols = [];
  B.rows.forEach((row) => {
    const yc = row.side === "upper" ? row.y0 : row.y1 - B.columnDepth;
    row.spans.forEach((sp) => {
      if (sp.left === "column") cols.push({ x0: sp.x0 - B.columnWidth, y0: yc, w: B.columnWidth, h: B.columnDepth });
      if (sp.right === "column") cols.push({ x0: sp.x1, y0: yc, w: B.columnWidth, h: B.columnDepth });
    });
  });
  // מסירים כפילויות של עמוד משותף לשני מפרצים סמוכים
  const seen = new Set();
  B.columns = cols.filter((c) => {
    const k = c.x0.toFixed(2) + "," + c.y0.toFixed(2);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
})(window.parkingBoard);

console.log("[board] " +
  window.parkingBoard.rows.reduce((n, r) => n + r.spans.length, 0) + " מפרצים, " +
  window.parkingBoard.columns.length + " עמודים");
