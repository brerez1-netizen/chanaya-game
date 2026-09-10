# משטח את ה-DXF: פותח את כל ה-INSERT רקורסיבית ומחזיר ישויות בקואורדינטות עולם.
# הקובץ הזה יוצא מ-Revit, וכל תוכן החניון יושב בתוך בלוקים מקוננים, אז בלי
# השטחה לא רואים כלום.
import math
import ezdxf

MAX_DEPTH = 6


def flatten(layout, depth=0):
    for e in layout:
        t = e.dxftype()
        if t == "INSERT":
            if depth >= MAX_DEPTH:
                continue
            try:
                yield from flatten(e.virtual_entities(), depth + 1)
            except Exception:
                continue
        else:
            yield e


def bbox_of(e):
    """מחזיר (minx, miny, maxx, maxy) או None."""
    t = e.dxftype()
    try:
        if t == "LINE":
            a, b = e.dxf.start, e.dxf.end
            return (min(a.x, b.x), min(a.y, b.y), max(a.x, b.x), max(a.y, b.y))
        if t == "LWPOLYLINE":
            pts = [(p[0], p[1]) for p in e.get_points("xy")]
            if not pts:
                return None
            xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
            return (min(xs), min(ys), max(xs), max(ys))
        if t == "POLYLINE":
            pts = [(v.dxf.location.x, v.dxf.location.y) for v in e.vertices]
            if not pts:
                return None
            xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
            return (min(xs), min(ys), max(xs), max(ys))
        if t == "CIRCLE":
            c, r = e.dxf.center, e.dxf.radius
            return (c.x - r, c.y - r, c.x + r, c.y + r)
        if t == "ARC":
            c, r = e.dxf.center, e.dxf.radius
            return (c.x - r, c.y - r, c.x + r, c.y + r)
    except Exception:
        return None
    return None


def polyline_points(e):
    t = e.dxftype()
    if t == "LWPOLYLINE":
        return [(round(p[0], 1), round(p[1], 1)) for p in e.get_points("xy")]
    if t == "POLYLINE":
        return [(round(v.dxf.location.x, 1), round(v.dxf.location.y, 1)) for v in e.vertices]
    return []


def is_rect(pts, tol=2.0):
    """האם הפוליגון הוא מלבן מיושר לצירים (בערך)."""
    p = pts[:]
    if len(p) >= 2 and abs(p[0][0] - p[-1][0]) < tol and abs(p[0][1] - p[-1][1]) < tol:
        p = p[:-1]
    if len(p) != 4:
        return False
    for i in range(4):
        x1, y1 = p[i]
        x2, y2 = p[(i + 1) % 4]
        if abs(x1 - x2) > tol and abs(y1 - y2) > tol:
            return False
    return True


def load(path):
    doc = ezdxf.readfile(path)
    return doc, list(flatten(doc.modelspace()))
