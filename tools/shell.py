# מחלץ את קליפת החניון מהתוכנית: קירות, עמודים, מעבר ושורות חניה,
# בלי סימוני החניה ובלי שום דבר מזהה.
# יחידות: סנטימטרים בקובץ המקור, ומומרות למטרים בפלט.
import sys, json, math
sys.path.insert(0, ".")
from collections import defaultdict
from flatten import load, bbox_of, polyline_points, is_rect

SRC = "ash_full_martef.dxf"
# חלון החיתוך בסנטימטרים. המודול הכפול: שורה, מעבר, שורה.
CROP = (-5700, -1200, -1600, 1100)

doc, ents = load(SRC)

# ------------------------------------------------------------------ מפרצים
bays = []
for e in ents:
    if e.dxftype() not in ("LWPOLYLINE", "POLYLINE"):
        continue
    pts = polyline_points(e)
    if len(pts) < 4 or not is_rect(pts):
        continue
    b = bbox_of(e)
    w, h = b[2] - b[0], b[3] - b[1]
    lo, hi = min(w, h), max(w, h)
    if 470 <= lo <= 530 and hi > 200:
        bays.append(b)

rows = defaultdict(list)
for b in bays:
    rows[round((b[1] + b[3]) / 2 / 300)].append(b)

# שתי השורות שיוצרות את המודול הכפול
lower = sorted(rows[-2], key=lambda b: b[0])
upper = sorted(rows[2], key=lambda b: b[0])

def in_crop(b):
    return b[2] > CROP[0] and b[0] < CROP[2]

lower = [b for b in lower if in_crop(b)]
upper = [b for b in upper if in_crop(b)]

lower_y = (min(b[1] for b in lower), max(b[3] for b in lower))
upper_y = (min(b[1] for b in upper), max(b[3] for b in upper))
aisle = (lower_y[1], upper_y[0])

# ------------------------------------------------------------- עמודים
# העמוד יושב בפער של כ-30 ס"מ בין שני מפרצים סמוכים, וגם בקצה של כל שורה.
def columns_for(row, y0, y1, depth=30):
    """מחזיר מלבני עמוד. בשורה עליונה העמוד בקצה התחתון, ולהיפך."""
    cols = []
    edges = []
    for i, b in enumerate(row):
        edges.append(b[0])
        edges.append(b[2])
    edges = sorted(set(round(x) for x in edges))
    merged = []
    for x in edges:
        if merged and x - merged[-1] < 10:
            continue
        merged.append(x)
    for i in range(len(merged) - 1):
        gap = merged[i + 1] - merged[i]
        if 15 <= gap <= 70:          # פער בין מפרצים = עמוד
            cols.append((merged[i], merged[i + 1]))
    # קצוות השורה
    if row:
        cols.append((merged[0] - 30, merged[0]))
        cols.append((merged[-1], merged[-1] + 30))
    out = []
    for (x0, x1) in cols:
        if x1 <= CROP[0] or x0 >= CROP[2]:
            continue
        out.append({"x0": x0, "x1": x1, "y0": y0, "y1": y1})
    return out

# העמודים בשורה העליונה יושבים בצד המעבר, ובשורה התחתונה גם כן
COL_D = 40
cols_upper = columns_for(upper, upper_y[0], upper_y[0] + COL_D)
cols_lower = columns_for(lower, lower_y[1] - COL_D, lower_y[1])

# ---------------------------------------------------------------- קירות
walls = []
for e in ents:
    if e.dxftype() != "LINE":
        continue
    lay = (e.dxf.layer or "").upper()
    if "WALL" not in lay:
        continue
    a, b = e.dxf.start, e.dxf.end
    if max(a.x, b.x) < CROP[0] or min(a.x, b.x) > CROP[2]:
        continue
    if max(a.y, b.y) < CROP[1] or min(a.y, b.y) > CROP[3]:
        continue
    if math.hypot(b.x - a.x, b.y - a.y) < 40:
        continue
    ax_, ay_, bx_, by_ = a.x, a.y, b.x, b.y
    if abs(ay_ - by_) < 5:                      # קו אופקי: לחתוך לרוחב החלון
        lo, hi = sorted((ax_, bx_))
        lo = max(lo, CROP[0]); hi = min(hi, CROP[2])
        if hi - lo < 40:
            continue
        ax_, bx_ = lo, hi
    walls.append([round(ax_), round(ay_), round(bx_), round(by_)])

M = lambda v: round(v / 100.0, 2)

data = {
    "units": "m",
    "note": "קליפה מחולצת מתוכנית חניון תת קרקעי אמיתית. כל סימוני החניה, המידות והזיהוי הוסרו.",
    "crop": [M(CROP[0]), M(CROP[1]), M(CROP[2]), M(CROP[3])],
    "aisle": {"y0": M(aisle[0]), "y1": M(aisle[1]), "width": M(aisle[1] - aisle[0])},
    "rows": [
        {"side": "lower", "y0": M(lower_y[0]), "y1": M(lower_y[1]), "depth": M(lower_y[1] - lower_y[0]),
         "bays": [{"x0": M(b[0]), "x1": M(b[2]), "span": M(b[2] - b[0])} for b in lower]},
        {"side": "upper", "y0": M(upper_y[0]), "y1": M(upper_y[1]), "depth": M(upper_y[1] - upper_y[0]),
         "bays": [{"x0": M(b[0]), "x1": M(b[2]), "span": M(b[2] - b[0])} for b in upper]},
    ],
    "columns": [{"x0": M(c["x0"]), "x1": M(c["x1"]), "y0": M(c["y0"]), "y1": M(c["y1"])}
                for c in cols_lower + cols_upper],
    "walls": [[M(w[0]), M(w[1]), M(w[2]), M(w[3])] for w in walls],
}

json.dump(data, open("shell.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("bays lower %d  upper %d" % (len(lower), len(upper)))
print("aisle width %.2f m" % data["aisle"]["width"])
print("columns %d   walls %d" % (len(data["columns"]), len(data["walls"])))
print("row depths: lower %.2f  upper %.2f" % (data["rows"][0]["depth"], data["rows"][1]["depth"]))
print("bay spans lower:", sorted(set(b["span"] for b in data["rows"][0]["bays"])))
print("bay spans upper:", sorted(set(b["span"] for b in data["rows"][1]["bays"])))
