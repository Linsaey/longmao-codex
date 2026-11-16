# -*- coding: utf-8 -*-
"""龙猫放置 · 图鉴数据构建 v2
- 图标压缩（怪物合成深色底 JPEG，物品 WEBP）
- 掉落按 groupId 存一份，怪物/物品用紧凑数组引用（避免重复膨胀）
"""
import json, io, os, collections
from PIL import Image

SRC_DATA = r"C:\Temp\g4data"
SRC_IMG = r"C:\Temp\imgcache"
IDX = r"C:\Temp\imgindex.json"
OUT = r"E:\Software Development\Software Development\longmao-codex"
IMGDIR = os.path.join(OUT, "img")

L = lambda n: json.load(io.open(os.path.join(SRC_DATA, n + ".json"), encoding="utf-8"))
os.makedirs(IMGDIR, exist_ok=True)

# ---------- 1. 图片 ----------
idx = json.load(io.open(IDX, encoding="utf-8"))
fm = idx["fnmap"]
path2file = {}
img_bytes = 0
fail = 0
BG = (14, 22, 16)
for path, fn in fm.items():
    src = os.path.join(SRC_IMG, fn)
    if not os.path.exists(src):
        continue
    base = os.path.splitext(fn)[0]
    try:
        im = Image.open(src)
        if "/monsters/" in path:
            im = im.convert("RGBA")
            im.thumbnail((96, 96), Image.LANCZOS)
            bg = Image.new("RGB", im.size, BG)
            bg.paste(im, mask=im.split()[-1])
            out = os.path.join(IMGDIR, base + ".jpg")
            bg.save(out, "JPEG", quality=76, optimize=True, progressive=True)
            path2file[path] = "img/" + base + ".jpg"
        else:
            im = im.convert("RGBA")
            im.thumbnail((56, 56), Image.LANCZOS)
            out = os.path.join(IMGDIR, base + ".webp")
            im.save(out, "WEBP", quality=72, method=4)
            path2file[path] = "img/" + base + ".webp"
        img_bytes += os.path.getsize(out)
    except Exception:
        fail += 1

# ---------- 2. 表 ----------
monsters, items, skills = L("monsters"), L("items"), L("skills")
maps, regions, setbonus, drops = L("maps"), L("regions"), L("set_bonus"), L("drops")
region_by_id = {r["id"]: r for r in regions}
item_by_id = {i["id"]: i for i in items}
mon_by_map = collections.defaultdict(list)
for m in monsters:
    area = m.get("area")
    if isinstance(area, list):
        aids = area
    elif isinstance(area, str):
        aids = [x for x in area.split(",") if x]
    else:
        aids = []
    for aid in aids:
        mon_by_map[aid].append(m["id"])

# ---------- 3. 掉落：按 groupId 存一份 ----------
# 客户端 Nv() 语义：
#   independent   → 逐条独立判定，p = chance
#   group_pick_1  → 按 pool 分组，整池概率 = 池内 seq 最小那行的 chance，
#                   命中后池内等概率随机取一条 → 单件真实概率 = 池概率 / 池内件数
rows_by_group = collections.defaultdict(list)
for d in drops:
    rows_by_group[d.get("groupId")].append(d)
for g in rows_by_group.values():
    g.sort(key=lambda x: (x.get("seq") or 0))

MINP = 0.0005        # 单件真实概率低于 0.05% 的不单列，只在池汇总里体现
GROUP = {}
POOLSUM = {}
item_src = collections.defaultdict(list)
for gid, rows in rows_by_group.items():
    ind, pools = [], collections.OrderedDict()
    for r in rows:
        if r.get("rollMode") == "group_pick_1":
            pools.setdefault(r.get("pool") or "equip", []).append(r)
        else:
            ind.append(r)
    POOLSUM[gid] = [[name, (pr[0].get("chance") or 0), len(pr)] for name, pr in pools.items()]
    out_rows = []
    # 独立掉落
    for r in ind:
        iid = r.get("itemId")
        p = r.get("chance") if r.get("chance") is not None else 1
        sell = item_by_id.get(iid, {}).get("sellPrice")
        out_rows.append([iid, p, r.get("min"), r.get("max"), sell, None, None, None])
    # 池掉落
    for pname, pr in pools.items():
        poolp = pr[0].get("chance") or 0
        n = len(pr)
        peff = poolp / n if n else 0
        for r in pr:
            iid = r.get("itemId")
            sell = item_by_id.get(iid, {}).get("sellPrice")
            if peff < MINP:
                continue
            out_rows.append([iid, peff, r.get("min"), r.get("max"), sell, pname, poolp, n])
    out_rows.sort(key=lambda x: -(x[1] or 0))
    GROUP[gid] = out_rows

# 物品 → 掉落来源
for m in monsters:
    gid = m.get("dropGroupId")
    if not gid or gid not in GROUP:
        continue
    for row in GROUP[gid]:
        if row[0] == "gold":
            continue
        item_src[row[0]].append([m["id"], row[1], row[2], row[3], row[5]])

# ---------- 4. 怪物 ----------
MONS = []
for m in monsters:
    MONS.append({
        "id": m["id"], "n": m.get("name"), "area": m.get("area"),
        "lv": m.get("level"), "hp": m.get("hp"), "mp": m.get("mp"),
        "a1": m.get("minAttack"), "a2": m.get("maxAttack"),
        "m1": m.get("minMagicAttack"), "m2": m.get("maxMagicAttack"),
        "dc": m.get("damageCategory"),
        "cr": m.get("critRate"), "cd": m.get("critDamage"),
        "hit": m.get("hitRate"), "dg": m.get("dodgeRate"),
        "def": m.get("defense"), "mres": m.get("magicResist"),
        "pr": m.get("physicalReduction"), "mr": m.get("magicReduction"),
        "as": m.get("attackSpeed"), "dv": m.get("damageVariance"),
        "tar": m.get("attackTargets"), "w": m.get("spawnWeight"),
        "exp": m.get("exp"), "img": path2file.get(m.get("image")),
        "g": m.get("dropGroupId"),
    })

# ---------- 5. 地图 / 区服 ----------
MAPS = []
for m in maps:
    r = region_by_id.get(m.get("regionId"), {})
    MAPS.append({"id": m["id"], "n": m.get("name"), "r": m.get("regionId"),
                 "rn": r.get("name"), "rk": r.get("kind"),
                 "lo": m.get("levelMin"), "hi": m.get("levelMax"),
                 "smin": m.get("spawnMin"), "smax": m.get("spawnMax"),
                 "mons": mon_by_map.get(m["id"], [])})

# ---------- 6. 物品 ----------
ITEMS = []
for i in items:
    o = {"id": i["id"], "n": i.get("name"), "t": i.get("type"), "st": i.get("subtype"),
         "img": path2file.get(i.get("image")),
         "sell": i.get("sellPrice"), "cash": i.get("sellCash"),
         "stats": i.get("stats"), "eff": i.get("effects"), "d": i.get("description"),
         "slot": i.get("equipSlot"), "wt": i.get("weaponType"),
         "cls": i.get("allowedClasses"), "req": i.get("requirements"),
         "set": i.get("setId"), "rare": 1 if i.get("rare") else 0,
         "mx": i.get("maxStack"), "cd": i.get("cooldown"), "pt": i.get("potionType"),
         "pz": i.get("puzzleStat"), "pzl": i.get("puzzleLevel"),
         "bk": i.get("blockStat"), "craft": 1 if i.get("craftOnly") else 0}
    src = item_src.get(i["id"])
    if src:
        o["src"] = src[:12]
        if len(src) > 12:
            o["srcn"] = len(src)
    ITEMS.append(o)

# ---------- 7. 技能 ----------
SKILLS = []
for s in skills:
    SKILLS.append({
        "id": s["id"], "n": s.get("name"), "cat": s.get("category"), "t": s.get("type"),
        "slot": s.get("slot"), "cls": s.get("classIds"), "wl": s.get("weaponLimit"),
        "img": path2file.get(s.get("icon")), "mx": s.get("maxLevel"),
        "lv": [[x.get("level"), x.get("reqLevel"), x.get("reqPoints"), x.get("targetType"),
                x.get("targetCount"), x.get("damageMultipliers"), x.get("damageType"),
                x.get("cooldown"), x.get("mpCost"), x.get("description")]
               for x in (s.get("levels") or [])]})

# ---------- 8. 套装 ----------
SETS = []
for s in setbonus:
    SETS.append({"id": s["id"], "n": s.get("name"),
                 "tiers": [[t.get("pieces"), t.get("stats")] for t in (s.get("tiers") or [])],
                 "items": [i["id"] for i in items if i.get("setId") == s["id"]]})

# ---------- 9. BUFF ----------
BUFFS = []
for i in items:
    if i.get("potionType") != "buff":
        continue
    st = mode = val = dur = None
    for e in (i.get("effects") or []):
        if e.get("type") == "buff":
            st, mode, val, dur = e.get("stats"), e.get("mode"), e.get("value"), e.get("duration")
    BUFFS.append({"id": i["id"], "n": i.get("name"), "d": i.get("description"),
                  "s": st, "m": mode, "v": val, "t": dur,
                  "img": path2file.get(i.get("image")), "sell": i.get("sellPrice")})

DATA = {
    "meta": {"builtAt": "2026-11-16", "src": "43.142.100.84:8080",
             "n": {"m": len(MONS), "i": len(ITEMS), "s": len(SKILLS),
                   "set": len(SETS), "map": len(MAPS), "b": len(BUFFS)}},
    "regions": [{"id": r["id"], "n": r.get("name"), "k": r.get("kind")} for r in regions],
    "maps": MAPS, "mons": MONS, "items": ITEMS, "skills": SKILLS, "sets": SETS,
    "buffs": BUFFS, "groups": GROUP, "gpool": POOLSUM,
}

js = "window.CODEX=" + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";\n"
io.open(os.path.join(OUT, "data.js"), "w", encoding="utf-8", newline="\n").write(js)

print("图片", len(path2file), "张", round(img_bytes / 1048576.0, 2), "MB 失败", fail)
print("data.js", round(os.path.getsize(os.path.join(OUT, "data.js")) / 1024.0, 0), "KB")
print("怪物", len(MONS), "物品", len(ITEMS), "技能", len(SKILLS), "套装", len(SETS), "地图", len(MAPS), "BUFF", len(BUFFS))
print("有掉落来源的物品", sum(1 for i in ITEMS if i.get("src")), "/ 掉落组", len(GROUP))
