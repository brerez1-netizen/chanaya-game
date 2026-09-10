# הופך את shell.json ללוח משחק מנורמל.
#
# העיקרון: הסטודנט לא מקבל את המפרצים מוכנים. הוא מקבל **קווי עמודים**, והמרווח
# הפנוי בין שני עמודים סמוכים הוא המפרץ שבו הוא מחליט כמה תאים להכניס.
# זו בדיוק ההחלטה שהטבלה בעמוד 294 מכריעה.
import json

d = json.load(open("shell.json", encoding="utf-8"))

x0 = min(min(b["x0"] for r in d["rows"] for b in r["bays"]),
         min(min(w[0], w[2]) for w in d["walls"]))
lower, upper = d["rows"][0], d["rows"][1]

# גבול תחתון: הקצה האחורי של שורת החניה התחתונה (גב אל גב עם השורה הבאה)
y_bottom = lower["y0"]
y_top = max(max(w[1], w[3]) for w in d["walls"])

SHIFT_X, SHIFT_Y = -x0, -y_bottom
mx = lambda v: round(v + SHIFT_X, 2)
my = lambda v: round(v + SHIFT_Y, 2)

# ---- עמודים, מקובצים לפי שורה
cols_by_row = {"lower": [], "upper": []}
mid_aisle = (d["aisle"]["y0"] + d["aisle"]["y1"]) / 2
for c in d["columns"]:
    side = "upper" if (c["y0"] + c["y1"]) / 2 > mid_aisle else "lower"
    cols_by_row[side].append(c)
for k in cols_by_row:
    cols_by_row[k].sort(key=lambda c: c["x0"])

# ---- מרווחים פנויים בין עמודים סמוכים = המפרצים לתכנון
def spans(cols):
    out = []
    for i in range(len(cols) - 1):
        a, b = cols[i], cols[i + 1]
        clear = round(b["x0"] - a["x1"], 2)
        if clear < 2.0:
            continue
        out.append({"x0": mx(a["x1"]), "x1": mx(b["x0"]), "clear": clear})
    return out

board = {
    "units": "m",
    "source": "קליפה מתוכנית חניון תת קרקעי מבוצע. סימוני החניה, המידות והזיהוי הוסרו.",
    "width": round(mx(max(max(w[0], w[2]) for w in d["walls"])), 2),
    "height": round(my(y_top), 2),
    "stallLength": 5.00,
    "aisle": {"y0": my(d["aisle"]["y0"]), "y1": my(d["aisle"]["y1"]), "width": d["aisle"]["width"]},
    "rows": [
        {"side": "lower", "y0": my(lower["y0"]), "y1": my(lower["y1"]),
         "facing": "up", "spans": spans(cols_by_row["lower"])},
        {"side": "upper", "y0": my(upper["y0"]), "y1": my(upper["y1"]),
         "facing": "down", "spans": spans(cols_by_row["upper"])},
    ],
    "columns": [{"x0": mx(c["x0"]), "y0": my(c["y0"]), "w": round(c["x1"] - c["x0"], 2),
                 "h": round(c["y1"] - c["y0"], 2)} for c in d["columns"]],
    "walls": [[mx(w[0]), my(w[1]), mx(w[2]), my(w[3])] for w in d["walls"]],
}

json.dump(board, open("board.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("board %.2f x %.2f m" % (board["width"], board["height"]))
for r in board["rows"]:
    cl = [s["clear"] for s in r["spans"]]
    print("  %-6s y %.2f..%.2f   %d מרווחים: %s" % (r["side"], r["y0"], r["y1"], len(cl), cl))
print("  aisle %.2f  columns %d  walls %d" % (board["aisle"]["width"], len(board["columns"]), len(board["walls"])))
