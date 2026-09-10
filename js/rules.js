// כללי פרק 26 (מקומות חניה) מתוך "מדריך שימושי לתחיקת הבנייה", גולן אדריכלים,
// הוצאת דקל. כל המספרים הועתקו מעמודים 293 עד 296 ואומתו מול הצילום.
//
// המודול הזה טהור: הוא לא נוגע ב-DOM ולא ב-Firebase, רק מקבל גיאומטריה ומחזיר
// פסיקה. כך אפשר לבדוק אותו בנפרד מהמשחק.
//
// כל המידות במטרים.

(function (root) {
  "use strict";

  // ---------------------------------------------------------------------
  // ב.4 - רוחב המעברים כתלות ברוחב תא החניה, עמודים 294-295
  // כל שורה: [רוחב המעבר, תא בשטח פנוי, תא ליד עמוד/קיר, תא בין עמודים/קירות,
  //           משטח ל-2 תאים בין עמודים/קירות, משטח ל-3 תאים בין עמודים/קירות]
  // הטבלאות ממוינות מהמעבר הרחב לצר, כלומר מהתא הצר לרחב.
  // ---------------------------------------------------------------------
  const AISLE_TABLES = {
    1: [
      [6.20, 2.40, 2.700, 3.00, 5.40, 7.80],
      [6.00, 2.45, 2.775, 3.10, 5.55, 8.00],
      [5.80, 2.50, 2.850, 3.20, 5.70, 8.20],
      [5.65, 2.55, 2.925, 3.30, 5.85, 8.40],
      [5.50, 2.60, 3.000, 3.40, 6.00, 8.60],
      [5.35, 2.65, 3.075, 3.50, 6.15, 8.80],
      [5.20, 2.70, 3.150, 3.60, 6.30, 9.00],
      [5.10, 2.75, 3.225, 3.70, 6.45, 9.20],
      [4.95, 2.80, 3.300, 3.80, 6.60, 9.40],
      [4.85, 2.85, 3.375, 3.90, 6.75, 9.60],
      [4.75, 2.90, 3.450, 4.00, 6.90, 9.80],
      [4.60, 2.95, 3.525, 4.10, 7.05, 10.00],
      [4.50, 3.00, 3.600, 4.20, 7.20, 10.20],
    ],
    2: [
      [5.90, 2.30, 2.550, 2.80, 5.10, 7.40],
      [5.75, 2.35, 2.625, 2.90, 5.25, 7.60],
      [5.55, 2.40, 2.700, 3.00, 5.40, 7.80],
      [5.40, 2.45, 2.775, 3.10, 5.55, 8.00],
      [5.25, 2.50, 2.850, 3.20, 5.70, 8.20],
      [5.10, 2.55, 2.925, 3.30, 5.85, 8.40],
      [4.95, 2.60, 3.000, 3.40, 6.00, 8.60],
      [4.85, 2.65, 3.075, 3.50, 6.15, 8.80],
      [4.70, 2.70, 3.150, 3.60, 6.30, 9.00],
      [4.60, 2.75, 3.225, 3.70, 6.45, 9.20],
      [4.45, 2.80, 3.300, 3.80, 6.60, 9.40],
      [4.35, 2.85, 3.375, 3.90, 6.75, 9.60],
      [4.25, 2.90, 3.450, 4.00, 6.90, 9.80],
      [4.15, 2.95, 3.525, 4.10, 7.05, 10.00],
      [4.05, 3.00, 3.600, 4.20, 7.20, 10.20],
    ],
    3: [
      [5.20, 2.30, 2.550, 2.80, 5.10, 7.40],
      [5.00, 2.35, 2.625, 2.90, 5.25, 7.60],
      [4.85, 2.40, 2.700, 3.00, 5.40, 7.80],
      [4.74, 2.45, 2.775, 3.10, 5.55, 8.00],
      [4.60, 2.50, 2.850, 3.20, 5.70, 8.20],
      [4.50, 2.55, 2.925, 3.30, 5.85, 8.40],
      [4.40, 2.60, 3.000, 3.40, 6.00, 8.60],
      [4.30, 2.65, 3.075, 3.50, 6.15, 8.80],
      [4.20, 2.70, 3.150, 3.60, 6.30, 9.00],
      [4.10, 2.75, 3.225, 3.70, 6.45, 9.20],
      [4.00, 2.80, 3.300, 3.80, 6.60, 9.40],
      [3.90, 2.85, 3.375, 3.90, 6.75, 9.60],
      [3.85, 2.90, 3.450, 4.00, 6.90, 9.80],
      [3.80, 2.95, 3.525, 4.10, 7.05, 10.00],
      [3.75, 3.00, 3.600, 4.20, 7.20, 10.20],
    ],
  };

  // ב.1 עד ב.3, עמוד 293
  const DIMS = {
    stallLength: 5.00,          // אורך תא חניה
    stallDrivable: 4.25,        // מתוכו משטח חניה
    stallCurb: 0.75,            // מתוכו מדרכת עצירה או אבן שפה
    headroomPrimary: 2.40,      // גובה חניון מקורה כשהחניון מטרה עיקרית
    headroomOther: 2.05,        // גובה חניון מקורה אחרת
    accessibleRegular: 3.50,    // תא נגיש, רכב רגיל
    accessibleTall: 4.60,       // תא נגיש, רכב גבוה
  };

  // ב.5 ו-ב.6, עמוד 296
  const RAMP = {
    shortMaxLength: 25.0,
    laneShortStraight: 2.75,    // בתוספת 2 מדרכות של 0.30
    laneLongStraight: 3.00,     // בתוספת מדרכה 0.70 ומדרכה 0.30
    slopeDesired: 0.12,
    slopeMax: 0.15,
    transitionMinLength: 3.0,   // שיפוע הקטע: מחצית משיפוע הרמפה
    oneWayMaxStalls: 40,        // תנאי לרמפה חד סטרית
  };

  const EPS = 0.005;            // חצי סנטימטר סובלנות, כדי ש-8.00 לא ייפסל מול 8.00

  /**
   * מוצא את שורת הטבלה שחלה על רוחב מעבר נתון.
   * ככל שהמעבר צר יותר, התא חייב להיות רחב יותר, ולכן בוחרים את השורה עם
   * המעבר הרחב ביותר שעדיין קטן או שווה למעבר בפועל.
   * מחזיר null אם המעבר צר מכל מה שמופיע בטבלה, כלומר הסידור פסול מיסודו.
   */
  function rowForAisle(level, aisle) {
    const t = AISLE_TABLES[level];
    if (!t) throw new Error("רמת שרות לא מוכרת: " + level);
    let best = null;
    for (const r of t) {
      if (r[0] <= aisle + EPS && (best === null || r[0] > best[0])) best = r;
    }
    return best;
  }

  /** רוחב מינימלי לקבוצה של n תאים בין עמודים/קירות, או ליד אחד מהם. */
  const KIND_COL = { open: 1, beside: 2, between: 3 };

  /**
   * הרוחב המינימלי הנדרש למפרץ.
   * kind: "open" תא בשטח פנוי, "beside" ליד עמוד או קיר, "between" בין שניים.
   * n: מספר התאים במפרץ. לקבוצות בין עמודים/קירות הספר נותן טבלה עד 3 תאים.
   */
  function requiredWidth(level, aisle, kind, n) {
    const row = rowForAisle(level, aisle);
    if (!row) return { ok: false, reason: "aisle-too-narrow" };
    if (n <= 0) return { ok: true, width: 0 };
    if (kind === "between") {
      if (n === 1) return { ok: true, width: row[3] };
      if (n === 2) return { ok: true, width: row[4] };
      if (n === 3) return { ok: true, width: row[5] };
      return { ok: false, reason: "group-too-large" };
    }
    const per = row[KIND_COL[kind]];
    if (per === undefined) throw new Error("סוג תא לא מוכר: " + kind);
    return { ok: true, width: per * n };
  }

  /**
   * בודק מפרץ אחד: מרווח פנוי נתון, מספר תאים שהסטודנט בחר.
   * מחזיר פסיקה עם הרוחב הנדרש, הרוחב הקיים, והנימוק.
   */
  function checkBay(opts) {
    const { level, aisle, kind, n, clearSpan } = opts;
    if (n === 0) return { legal: true, n: 0, need: 0, have: clearSpan, note: "מפרץ ריק" };
    const req = requiredWidth(level, aisle, kind, n);
    if (!req.ok) {
      return {
        legal: false,
        n,
        need: null,
        have: clearSpan,
        code: req.reason,
        note: req.reason === "aisle-too-narrow"
          ? "רוחב המעבר צר מכל מה שמופיע בטבלה ב.4 לרמת שרות " + level
          : "הספר נותן טבלה עד שלושה תאים בין עמודים או קירות",
      };
    }
    const legal = clearSpan + EPS >= req.width;
    return {
      legal,
      n,
      need: req.width,
      have: clearSpan,
      code: legal ? "ok" : "span-too-small",
      note: legal
        ? null
        : "המרווח " + clearSpan.toFixed(2) + " מ' קטן מהנדרש " + req.width.toFixed(2) + " מ'",
    };
  }

  /**
   * מפרץ מעורב: רצף תאים בין שני עמודים, שחלקם נגישים.
   *
   * המודל: במפרץ שתחום בעמודים משני צדדיו, שני התאים החיצוניים נחשבים "ליד
   * עמוד" והפנימיים "בשטח פנוי". המודל הזה **משחזר בדיוק** את הערכים שהספר
   * נותן לקבוצות: ברמה 1 ומעבר 6.20 יוצא 2.70+2.40+2.70=7.80 לשלושה תאים
   * ו-2.70+2.70=5.40 לשניים, וזה בדיוק מה שכתוב בעמוד 294.
   *
   * תא נגיש נמדד לפי ב.3 בערך מוחלט (3.50 לרכב רגיל, 4.60 לרכב גבוה), בלי
   * תוספת על מיקומו ביחס לעמוד.
   *
   * stalls: מערך של "regular" | "accessible" | "accessibleTall"
   */
  function checkMixedBay(opts) {
    const { level, aisle, stalls, clearSpan } = opts;
    const n = stalls.length;
    if (n === 0) return { legal: true, need: 0, have: clearSpan, parts: [], note: "מפרץ ריק" };
    const row = rowForAisle(level, aisle);
    if (!row) {
      return { legal: false, need: null, have: clearSpan, code: "aisle-too-narrow",
               parts: [], note: "רוחב המעבר צר מכל מה שמופיע בטבלה ב.4 לרמת שרות " + level };
    }
    const wOpen = row[KIND_COL.open];
    const wBeside = row[KIND_COL.beside];
    const wBetween = row[KIND_COL.between];
    const parts = stalls.map((kind, i) => {
      if (kind === "accessible") return { kind, w: DIMS.accessibleRegular, why: "תא נגיש, רכב רגיל, ב.3" };
      if (kind === "accessibleTall") return { kind, w: DIMS.accessibleTall, why: "תא נגיש, רכב גבוה, ב.3" };
      // תא בודד במפרץ תחום משני צדדיו הוא "בין עמודים", ולספר יש לזה עמודה משלו.
      if (n === 1) return { kind, w: wBetween, why: "בין שני עמודים" };
      const edge = i === 0 || i === n - 1;
      return { kind, w: edge ? wBeside : wOpen, why: edge ? "ליד עמוד" : "בשטח פנוי" };
    });
    const need = Math.round(parts.reduce((s, p) => s + p.w, 0) * 100) / 100;
    const legal = clearSpan + EPS >= need;
    return {
      legal, need, have: clearSpan, parts,
      code: legal ? "ok" : "span-too-small",
      note: legal ? null
        : "הרוחב הנדרש " + need.toFixed(2) + " מ' עולה על המרווח הפנוי " + clearSpan.toFixed(2) + " מ'",
    };
  }

  /**
   * הרוחב המינימלי לכל תא במפרץ, לפי מיקומו.
   * מחזיר מערך באורך n עם {min, why}.
   */
  function minWidths(level, aisle, kinds) {
    const row = rowForAisle(level, aisle);
    if (!row) return null;
    const n = kinds.length;
    return kinds.map((kind, i) => {
      if (kind === "accessible") return { min: DIMS.accessibleRegular, why: "תא נגיש לרכב רגיל, ב.3" };
      if (kind === "accessibleTall") return { min: DIMS.accessibleTall, why: "תא נגיש לרכב גבוה, ב.3" };
      if (n === 1) return { min: row[KIND_COL.between], why: "תא יחיד בין עמודים או קירות" };
      const edge = i === 0 || i === n - 1;
      return edge ? { min: row[KIND_COL.beside], why: "תא ליד עמוד או קיר" }
                  : { min: row[KIND_COL.open], why: "תא בשטח פנוי" };
    });
  }

  /**
   * בדיקת התכנון של הסטודנט, כשהוא בוחר בעצמו את רוחב כל תא.
   * stalls: [{ kind, w }]. מחזיר פסיקה לכל תא בנפרד וגם למפרץ כולו.
   */
  function checkDesign(opts) {
    const { level, aisle, stalls, clearSpan } = opts;
    if (!stalls.length) {
      return { legal: true, empty: true, parts: [], sum: 0, have: clearSpan, note: "מפרץ ריק" };
    }
    const mins = minWidths(level, aisle, stalls.map((s) => s.kind));
    if (!mins) {
      return { legal: false, parts: [], sum: 0, have: clearSpan, code: "aisle-too-narrow",
               note: "רוחב המעבר צר מכל מה שמופיע בטבלה ב.4 לרמת שרות " + level };
    }
    const parts = stalls.map((s, i) => {
      const m = mins[i];
      const ok = s.w + EPS >= m.min;
      return {
        kind: s.kind, w: s.w, min: m.min, why: m.why, ok,
        note: ok ? null : "סימנת " + s.w.toFixed(2) + " מ', והמינימום ל" + m.why.split(",")[0] + " הוא " + m.min.toFixed(2) + " מ'",
      };
    });
    const sum = Math.round(parts.reduce((a, p) => a + p.w, 0) * 100) / 100;
    const fits = sum <= clearSpan + EPS;
    const allWide = parts.every((p) => p.ok);
    return {
      legal: fits && allWide,
      parts, sum, have: clearSpan,
      code: !allWide ? "stall-too-narrow" : (!fits ? "span-too-small" : "ok"),
      note: !fits
        ? "סך הרוחב " + sum.toFixed(2) + " מ' עולה על המרווח הפנוי " + clearSpan.toFixed(2) + " מ'"
        : (!allWide ? "יש תא צר מהמינימום" : null),
    };
  }

  /** רוחב המעבר שנוצר מעומק כולל בין שני קירות עם שתי שורות תאים גב אל גב. */
  function aisleFromDepth(totalDepth, rows) {
    const r = rows === undefined ? 2 : rows;
    return totalDepth - r * DIMS.stallLength;
  }

  /** ג' - כל מספר מקומות חניה שאינו שלם מתעגל כלפי מעלה. */
  function roundUpStalls(x) {
    return Math.ceil(x - 1e-9);
  }

  /** בדיקת רמפה מול ב.5 ו-ב.6. */
  function checkRamp(opts) {
    const { length, slope, oneWay, stallCount } = opts;
    const issues = [];
    if (slope > RAMP.slopeMax + 1e-9) {
      issues.push("שיפוע " + (slope * 100).toFixed(0) + "% עולה על המרבי המותר של 15%");
    }
    if (oneWay) {
      if (length > RAMP.shortMaxLength + EPS) {
        issues.push("רמפה חד סטרית מותרת רק ברמפה קצרה, כלומר עד 25 מ'");
      }
      if (stallCount > RAMP.oneWayMaxStalls) {
        issues.push("רמפה חד סטרית מותרת רק בחניון של עד 40 מקומות");
      }
    }
    return {
      legal: issues.length === 0,
      isShort: length <= RAMP.shortMaxLength + EPS,
      minLaneWidth: length <= RAMP.shortMaxLength + EPS ? RAMP.laneShortStraight : RAMP.laneLongStraight,
      issues,
    };
  }

  root.ParkingRules = {
    AISLE_TABLES, DIMS, RAMP, EPS,
    rowForAisle, requiredWidth, checkBay, checkMixedBay, minWidths, checkDesign,
    aisleFromDepth, roundUpStalls, checkRamp,
  };
})(typeof window !== "undefined" ? window : globalThis);
