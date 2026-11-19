/* 龙猫放置 · 图鉴 —— 纯前端，无依赖 */
(function () {
  'use strict';
  var D = window.CODEX;
  var $ = function (id) { return document.getElementById(id); };

  var CLS = { zhanshi: '战士', dunwei: '盾卫', fashi: '法师', youxia: '游侠' };
  var SLOT = {
    weapon: '武器', offhand: '副手', head: '头部', chest: '上装', hands: '手套',
    legs: '下装', feet: '鞋', ring: '戒指', earrings: '耳环',
    'spirit-stone': '灵石', socks: '袜子', eyes: '眼部', face: '脸部'
  };
  var TYPE = {
    equipment: '装备', puzzle: '拼图', consumable: '消耗品', material: '材料',
    puzzleBlock: '拼图块', special: '特殊', puzzleTicket: '拼图券'
  };
  var SKTYPE = { main: '主动', passive: '被动', state: '状态' };
  var STAT = {
    strength: '力量', magic: '魔力', vitality: '体力', luck: '幸运',
    hp: '生命', mp: '魔法值', minAttack: '最小攻击', maxAttack: '最大攻击',
    minMagicAttack: '最小魔法攻击', maxMagicAttack: '最大魔法攻击',
    defense: '防御', magicResist: '魔法抗性',
    physicalReduction: '物理减伤', magicReduction: '魔法减伤',
    critRate: '暴击率', critDamage: '暴击伤害', hitRate: '命中率', dodgeRate: '闪避率',
    attackSpeed: '攻速', moveSpeed: '移速', goldRate: '金币加成', expMultiplier: '经验倍率',
    dropRate: '掉宝率',
    skillDamageBonus: '技能伤害', cooldownHaste: '技能极速', defenseIgnore: '无视防御',
    damageBonus: '伤害加成', damageMultiplier: '伤害倍率', physicalDamage: '物理伤害',
    magicDamage: '魔法伤害', hpRegen: '生命回复', mpRegen: '魔法回复',
    hpMax: '最大生命', mpMax: '最大魔法', attackRange: '攻击基数', attack: '攻击',
    magicAttack: '魔法攻击'
  };
  var PCT = {
    critRate: 1, critDamage: 1, hitRate: 1, dodgeRate: 1, goldRate: 1, expMultiplier: 1,
    damageBonus: 1, moveSpeed: 1, attackSpeed: 1, physicalDamage: 1, magicDamage: 1,
    damageMultiplier: 1, luckPercent: 1, percent: 1, skillDamageBonus: 1, cooldownHaste: 1, dropRate: 1
  };
  var RK = { field: '野外', boss: '领主', dungeon: '副本' };
  var POOL = {
    equip: '装备', potion: '药剂', puzzle13: '拼图', '随机方块': '随机方块',
    jinzita_armor: '金字塔·护甲', jinzita_weapon: '金字塔·武器',
    kamiao_armor: '卡喵·护甲', shelong_armor: '蛇龙·护甲', shelong_weapon: '蛇龙·武器',
    xuanwu_armor: '玄武·护甲', xuanwu_weapon: '玄武·武器'
  };
  var BANDS = [['1-20', 1, 20], ['21-40', 21, 40], ['41-60', 41, 60], ['61-80', 61, 80], ['81-100', 81, 100]];
  var ARMOR = ['head', 'chest', 'hands', 'legs', 'feet'];
  var ACC = ['ring', 'earrings', 'spirit-stone', 'socks', 'eyes', 'face'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function num(v) { return typeof v === 'number' ? v : Number(v); }
  function nf(v, d) {
    var n = num(v);
    if (!isFinite(n)) return '—';
    return n.toFixed(d == null ? 2 : d).replace(/\.?0+$/, '');
  }
  function num2(n) {
    if (n == null || n === '') return '—';
    var v = num(n);
    if (isNaN(v)) return esc(n);
    return Math.abs(v) >= 1000 ? v.toLocaleString('en-US') : String(v);
  }
  function statName(k) {
    var base = String(k).replace(/percent$/i, '');
    return (STAT[base] || base) + (/percent$/i.test(k) ? '%' : '');
  }
  function statVal(k, v) {
    if (PCT[k] || /percent$/i.test(k)) {
      var p = num(v) * 100;
      return (p > 0 ? '+' : '') + nf(p) + '%';
    }
    var n = num(v);
    return (n > 0 ? '+' : '') + (Number.isInteger(n) ? n : nf(n, 2));
  }
  function prob(p) {
    if (!isFinite(p) || p <= 0) return '—';
    var v = p * 100;
    if (v >= 1) return v.toFixed(1) + '%';
    if (v >= 0.01) return v.toFixed(3) + '%';
    if (v >= 0.0001) return v.toFixed(4) + '%';
    return v.toExponential(2) + '%';
  }
  function prob2(p) {
    if (!isFinite(p) || p <= 0) return '—';
    var v = p * 100;
    if (v >= 1) return nf(v, 2) + '%';
    if (v >= 0.01) return v.toFixed(3) + '%';
    if (v >= 0.0001) return v.toFixed(4) + '%';
    return v.toExponential(2) + '%';
  }
  function pct(v) { return v == null ? '—' : (num(v) * 100).toFixed(0) + '%'; }
  function poolName(p) { return (POOL[p] || p) + '池'; }
  function slots(o) {
    if (!o || !o.slot) return [];
    return Array.isArray(o.slot) ? o.slot : [o.slot];
  }
  function slotNames(o) { return slots(o).map(function (s) { return SLOT[s] || s; }).join(' / '); }
  function baseName(o) { return String((o && o.n) || '').replace(/\+\d+$/, ''); }

  // ---------- 索引 ----------
  var mapById = {}, monById = {}, itemById = {}, skillById = {}, setById = {}, buffById = {};
  D.maps.forEach(function (x) { mapById[x.id] = x; });
  D.mons.forEach(function (x) { monById[x.id] = x; });
  D.items.forEach(function (x) { itemById[x.id] = x; });
  D.skills.forEach(function (x) { skillById[x.id] = x; });
  D.sets.forEach(function (x) { setById[x.id] = x; });
  D.buffs.forEach(function (x) { buffById[x.id] = x; });
  var groups = D.groups || {}, gpool = D.gpool || {};

  function areasOf(m) {
    if (!m.area) return [];
    var a = Array.isArray(m.area) ? m.area : String(m.area).split(',');
    return a.map(function (x) { return String(x).trim(); }).filter(function (x) { return mapById[x]; });
  }
  var MONS_OF = {};
  D.mons.forEach(function (m) {
    areasOf(m).forEach(function (aid) { (MONS_OF[aid] = MONS_OF[aid] || []).push(m.id); });
  });

  // ---------- 印章（拓印）基础 ----------
  var IM = D.imprints || null;
  var SEAL_PROP_IDS = ['yinzhang1', 'yinzhang2', 'yinzhang3', 'yinzhang4', 'yinzhang5',
    'yinzhang_xiangrui', 'yinzhang_xiongsha', 'yinzhang_qiankun'];
  var SEAL_TIER = { yinzhang1: 1, yinzhang2: 2, yinzhang3: 3, yinzhang4: 4, yinzhang5: 5 };
  var SEAL_ROLE = {
    yinzhang1: '一阶印章 · 普通词条', yinzhang2: '二阶印章 · 普通词条',
    yinzhang3: '三阶印章 · 可出特殊词条', yinzhang4: '四阶印章 · 可出特殊词条',
    yinzhang5: '五阶印章 · 可出特殊词条',
    yinzhang_xiangrui: '特殊印章 · 圣兽权重 ×1.5',
    yinzhang_xiongsha: '特殊印章 · 凶兽权重 ×1.5',
    yinzhang_qiankun: '特殊印章 · 必出圣兽 / 凶兽'
  };
  var sealProbCache = null;

  // 按客户端 Vp() 逻辑还原各阶权重与出现率
  function sealProb() {
    if (sealProbCache) return sealProbCache;
    var res = {}, wp = (IM && IM.wp) || 1.5;
    [1, 2, 3, 4, 5].forEach(function (tier) {
      var nw = 0, sw = { shengshou: 0, xiongshou: 0 };
      if (IM) {
        IM.n.forEach(function (e) {
          var has = (e.p || []).some(function (r) { return r[0] === tier; }) ||
            (e.f || []).some(function (r) { return r[0] === tier; });
          if (has) nw += (e.w || 100);
        });
        IM.s.forEach(function (e) {
          var w = 0;
          (e.rows || []).forEach(function (r) { if (r[0] === tier) w = r[1]; });
          if (w) sw[e.gt] = (sw[e.gt] || 0) + w;
        });
      }
      var m = {};
      ['none', 'xiangrui', 'xiongsha', 'qiankun'].forEach(function (mode) {
        var nh = mode === 'qiankun' ? 0 : nw;
        var sh = sw.shengshou * (mode === 'xiangrui' ? wp : 1) +
          sw.xiongshou * (mode === 'xiongsha' ? wp : 1);
        var total = nh + sh;
        m[mode] = { nh: nh, sh: sh, total: total, special: total > 0 ? sh / total : 0 };
      });
      res[tier] = { nw: nw, sw: sw, m: m };
    });
    sealProbCache = res;
    return res;
  }
  function sealTotal(tier, mode) { return sealProb()[tier].m[mode].total; }
  function normalOdds(tier, w, mode) {
    if (mode === 'qiankun') return 0;
    var t = sealTotal(tier, mode);
    return t > 0 ? (w || 100) / t : 0;
  }
  function specialOdds(tier, w, gt, mode) {
    var t = sealTotal(tier, mode);
    if (!t || !w) return 0;
    var w2 = (mode === 'xiangrui' && gt === 'shengshou') || (mode === 'xiongsha' && gt === 'xiongshou')
      ? ((IM && IM.wp) || 1.5) : 1;
    return (w * w2) / t;
  }
  function tRow(rows, tier) {
    for (var i = 0; i < (rows || []).length; i++) { if (rows[i][0] === tier) return rows[i]; }
    return null;
  }
  function rgN(a, b) { return a === b ? nf(a) : nf(a) + '~' + nf(b); }
  function flatTxt(f) { return f ? (f[1] === f[2] ? '+' + nf(f[1]) : '+' + nf(f[1]) + '~' + nf(f[2])) : ''; }
  function pctTxt(p) { return p ? (p[1] === p[2] ? nf(p[1]) + '%' : nf(p[1]) + '~' + nf(p[2]) + '%') : ''; }
  function normTxt(e, tier) {
    var four = tRow(e.f, tier), np = tRow(e.p, tier);
    return [flatTxt(four), pctTxt(np)].filter(Boolean).join(' / ') || '—';
  }
  function specValTxt(e, r) {
    if (!r) return '—';
    var v = pctTxt([0, r[3], r[4]]), c = r[2] == null ? null : nf(r[2]) + '%';
    if (e.tp === 'zhuque') return '触发 ' + c + ' · 每秒 ' + v + ' · ' + (r[5] || 3) + ' 秒';
    if (e.tp === 'shieldOnAttack') return '触发 ' + c + ' · 护盾 ' + v;
    if (e.tp === 'highHpDamageBonus') return '血量 > ' + nf(r[6]) + '% · +' + v;
    return '+' + v;
  }
  function sealSource() {
    if (!IM) return [];
    var out = [];
    SEAL_PROP_IDS.forEach(function (pid) {
      var it = itemById[pid];
      if (!it) return;
      out.push({ id: pid, n: it.n, sk: 'prop', img: it.img, item: it });
    });
    (IM.n || []).forEach(function (e) {
      out.push({ id: 'n:' + e.k, n: e.n, sk: 'normal', s: e.s, w: e.w, f: e.f, p: e.p });
    });
    (IM.s || []).forEach(function (e) {
      out.push({ id: 's:' + e.k, n: e.n, sk: 'special', gn: e.gn, gt: e.gt, tp: e.tp, d: e.d, rows: e.rows });
    });
    return out;
  }

  // ---------- 分类 ----------
  var TABS = [
    { k: 'mon', n: '怪物', c: D.mons.length },
    { k: 'equip', n: '装备', c: D.items.filter(function (i) { return i.t === 'equipment'; }).length },
    { k: 'item', n: '道具', c: D.items.filter(function (i) { return i.t !== 'equipment' && i.pt !== 'buff'; }).length },
    { k: 'skill', n: '技能', c: D.skills.length },
    { k: 'set', n: '套装', c: D.sets.length },
    { k: 'map', n: '地图', c: D.maps.length },
    { k: 'buff', n: '药水BUFF', c: D.buffs.length },
    {
      k: 'seal', n: '印章',
      c: D.imprints ? (SEAL_PROP_IDS.filter(function (x) { return itemById[x]; }).length +
        D.imprints.n.length + D.imprints.s.length) : 0
    }
  ];
  var S = { tab: 'mon', kw: '', g1: '', g2: '', lv: '', sort: '', merge: true };

  // ---------- 筛选配置 ----------
  function wtCount(condition) {
    var m = {}, order = [];
    D.items.forEach(function (i) {
      if (i.t !== 'equipment' || !i.wt || !condition(i)) return;
      if (!m[i.wt]) { m[i.wt] = 0; order.push(i.wt); }
      m[i.wt]++;
    });
    order.sort(function (a, b) { return m[b] - m[a]; });
    return order.map(function (w) { return [w, w]; });
  }
  function slotCount(list) {
    var m = {}, order = [];
    D.items.forEach(function (i) {
      if (i.t !== 'equipment') return;
      slots(i).forEach(function (s) {
        if (list.indexOf(s) < 0) return;
        if (!m[s]) { m[s] = 0; order.push(s); }
        m[s]++;
      });
    });
    order.sort(function (a, b) { return m[b] - m[a]; });
    return order.map(function (s) { return [s, SLOT[s] || s]; });
  }

  var F1 = {
    mon: [{ id: '', label: '全部区服' }].concat(D.regions.map(function (r) { return { id: r.id, label: r.n }; })),
    equip: [
      { id: '', label: '全部' }, { id: 'weapon', label: '武器' }, { id: 'offhand', label: '副手' },
      { id: 'armor', label: '防具' }, { id: 'acc', label: '饰品' }
    ],
    item: [{ id: '', label: '全部类型' },
      { id: 'consumable', label: '消耗品' }, { id: 'material', label: '材料' },
      { id: 'puzzle', label: '拼图' }, { id: 'puzzleBlock', label: '拼图块' },
      { id: 'special', label: '特殊' }, { id: 'puzzleTicket', label: '拼图券' }],
    skill: [{ id: '', label: '全部职业' }].concat(Object.keys(CLS).map(function (c) { return { id: c, label: CLS[c] }; })),
    map: [{ id: '', label: '全部区域' }, { id: 'field', label: '野外' },
      { id: 'boss', label: '领主' }, { id: 'dungeon', label: '副本' }],
    set: [], buff: [],
    seal: [{ id: '', label: '全部' }, { id: 'prop', label: '印章道具' },
      { id: 'normal', label: '普通词条' }, { id: 'special', label: '特殊词条' }]
  };

  function f2Options() {
    if (S.tab === 'equip') {
      if (S.g1 === 'weapon') return [{ id: '', label: '全部武器类型' }].concat(
        wtCount(function (i) { return slots(i).indexOf('weapon') >= 0; }).map(function (x) { return { id: x[0], label: x[1] }; }));
      if (S.g1 === 'offhand') return [{ id: '', label: '全部副手类型' }].concat(
        wtCount(function (i) { return slots(i).indexOf('offhand') >= 0; }).map(function (x) { return { id: x[0], label: x[1] }; }));
      if (S.g1 === 'armor') return [{ id: '', label: '全部部位' }].concat(
        slotCount(ARMOR).map(function (x) { return { id: x[0], label: x[1] }; }));
      if (S.g1 === 'acc') return [{ id: '', label: '全部部位' }].concat(
        slotCount(ACC).map(function (x) { return { id: x[0], label: x[1] }; }));
      return [];
    }
    if (S.tab === 'mon') {
      if (!S.g1) return [];
      var maps = D.maps.filter(function (m) { return m.r === S.g1; });
      return [{ id: '', label: '全部地图' }].concat(
        maps.map(function (m) { return { id: m.id, label: m.n + ' Lv' + (m.lo || '?') }; }));
    }
    if (S.tab === 'item') {
      if (S.g1 === 'consumable') return [{ id: '', label: '全部' }, { id: 'alchemy', label: '炼金产物' }, { id: 'other', label: '普通' }];
      if (S.g1 === 'material') return [{ id: '', label: '全部' }, { id: 'craft', label: '制作材料' }, { id: 'other', label: '普通材料' }];
      return [];
    }
    if (S.tab === 'skill') {
      if (S.g1) return [{ id: '', label: '全部类型' }, { id: 'main', label: '主动' },
        { id: 'passive', label: '被动' }, { id: 'state', label: '状态' }];
      return [{ id: '', label: '全部类型' }, { id: 'main', label: '主动' },
        { id: 'passive', label: '被动' }, { id: 'state', label: '状态' }];
    }
    return [];
  }

  var SORTS = {
    mon: [['lv+', '等级升序'], ['lv-', '等级降序'], ['exp', '经验最多'], ['name', '名称']],
    equip: [['lv+', '等级升序'], ['lv-', '等级降序'], ['name', '名称'], ['sell', '卖价最高']],
    item: [['lv+', '等级升序'], ['lv-', '等级降序'], ['name', '名称'], ['sell', '卖价最高']],
    skill: [['lv+', '等级升序'], ['lv-', '等级降序'], ['name', '名称']],
    set: [['name', '名称']],
    map: [['lv+', '等级升序'], ['lv-', '等级降序'], ['name', '名称']],
    buff: [['name', '名称']],
    seal: [['def', '默认'], ['name', '名称'], ['odds', '出率从高到低']]
  };

  function levelOf(k, o) {
    if (k === 'mon') return o.lv;
    if (k === 'equip' || k === 'item') return (o.req && o.req.level) || null;
    if (k === 'skill') return (o.lv && o.lv[0]) ? o.lv[0][1] : null;
    if (k === 'map') return o.lo;
    return null;
  }
  function passLevel(k, o) {
    if (!S.lv) return true;
    var v = levelOf(k, o);
    if (v == null) return false;
    for (var i = 0; i < BANDS.length; i++) {
      if (BANDS[i][0] === S.lv) return v >= BANDS[i][1] && v <= BANDS[i][2];
    }
    return true;
  }
  function matchKw(o) {
    if (!S.kw) return true;
    var q = S.kw.toLowerCase();
    var txt = String(o.n || '') + ' ' + String(o.id || '') + ' ' +
      String(o.s || '') + ' ' + String(o.gn || '') + ' ' + String(o.d || '') + ' ' + String(o.tp || '');
    return txt.toLowerCase().indexOf(q) >= 0;
  }

  function passRow(k, o) {
    if (!matchKw(o) || !passLevel(k, o)) return false;
    if (k === 'equip') {
      var ss = slots(o);
      if (S.g1 === 'weapon' && ss.indexOf('weapon') < 0) return false;
      if (S.g1 === 'offhand' && ss.indexOf('offhand') < 0) return false;
      if (S.g1 === 'armor' && !ss.some(function (s) { return ARMOR.indexOf(s) >= 0; })) return false;
      if (S.g1 === 'acc' && !ss.some(function (s) { return ACC.indexOf(s) >= 0; })) return false;
      if (S.g2) {
        if (S.g1 === 'weapon' || S.g1 === 'offhand') { if (o.wt !== S.g2) return false; }
        else if (ss.indexOf(S.g2) < 0) return false;
      }
      return true;
    }
    if (k === 'item') {
      if (S.g1 && o.t !== S.g1) return false;
      if (S.g2 === 'alchemy') return o.st === 'alchemy';
      if (S.g2 === 'craft') return o.st === 'craft';
      if (S.g2 === 'other') return o.st !== 'alchemy' && o.st !== 'craft';
      return true;
    }
    if (k === 'mon') {
      var as = areasOf(o);
      if (S.g1 && !as.some(function (aid) { return mapById[aid].r === S.g1; })) return false;
      if (S.g2 && as.indexOf(S.g2) < 0) return false;
      return true;
    }
    if (k === 'skill') {
      if (S.g1 && (o.cls || []).indexOf(S.g1) < 0) return false;
      if (S.g2 && o.t !== S.g2) return false;
      return true;
    }
    if (k === 'map') {
      if (S.g1 && o.rk !== S.g1) return false;
      return true;
    }
    if (k === 'seal') {
      if (S.g1 && o.sk !== S.g1) return false;
      return true;
    }
    return true;
  }

  function sortRows(k, rows) {
    var key = S.sort || SORTS[k][0][0];
    rows.sort(function (a, b) {
      var oa = a.o, ob = b.o;
      if (key === 'lv+' || key === 'lv-') {        var la = levelOf(k, oa), lb = levelOf(k, ob);
        var d = (la == null ? -1 : la) - (lb == null ? -1 : lb);
        return key === 'lv+' ? d : -d;
      }
      if (key === 'name') return String(oa.n || '').localeCompare(String(ob.n || ''), 'zh');
      if (key === 'sell') return (num(ob.sell) || 0) - (num(oa.sell) || 0);
      if (key === 'exp') return (num(ob.exp) || 0) - (num(oa.exp) || 0);
      if (key === 'odds') {
        var pa = sealOddsOf(oa), pb = sealOddsOf(ob);
        return pb - pa;
      }
      return 0;
    });
    return rows;
  }

  function sealOddsOf(o) {
    if (!o || o.sk === 'prop') return 0;
    var top = o.sk === 'normal' ? 5 : (o.rows && o.rows.length ? o.rows[o.rows.length - 1][0] : 3);
    if (o.sk === 'normal') return normalOdds(top, o.w, 'none');
    var r = tRow(o.rows, top);
    return r ? specialOdds(top, r[1], o.gt, 'none') : 0;
  }

  function groupEquip(list) {
    var m = {}, order = [];
    list.forEach(function (o) {
      var key = baseName(o) + '|' + slots(o).join(',');
      if (!m[key]) { m[key] = { o: o, vs: [] }; order.push(key); }
      var g = m[key];
      g.vs.push(o.id);
      var lg = num(g.o.req && g.o.req.level) || 0, lo = num(o.req && o.req.level) || 0;
      if (lo < lg) g.o = o;
    });
    return order.map(function (k) { return m[k]; });
  }

  function rowsFor(k) {
    var src, rows;
    if (k === 'mon') src = D.mons;
    else if (k === 'equip' || k === 'item') {
      src = D.items.filter(function (i) {
        return k === 'equip' ? i.t === 'equipment' : (i.t !== 'equipment' && i.pt !== 'buff');
      });
    } else if (k === 'skill') src = D.skills;
    else if (k === 'set') src = D.sets;
    else if (k === 'map') src = D.maps;
    else if (k === 'seal') src = sealSource();
    else src = D.buffs;

    rows = src.filter(function (o) { return passRow(k, o); })
      .map(function (o) { return { o: o, vs: null }; });

    if (k === 'equip' && S.merge) rows = groupEquip(rows.map(function (r) { return r.o; }));
    sortRows(k, rows);
    if (k === 'seal' && !S.g1 && !S.kw && IM) {
      rows.unshift({ o: { id: 'prob', n: '各阶出率与规则', sk: 'prob' }, vs: null });
    }
    return rows;
  }

  // ---------- 卡片：印章 ----------
  function sealCard(o) {
    var h = '', tags = '', sub = '', nm = esc(o.n);
    if (o.sk === 'prop') {
      h = ico(o.img);
      var tier = SEAL_TIER[o.id];
      var sp = tier ? sealProb()[tier].m.none.special : 0;
      sub = (o.item.sell ? num2(o.item.sell) + '金' : '') + ' · ' +
        (o.id === 'yinzhang_xiangrui' ? '圣兽×1.5'
          : o.id === 'yinzhang_xiongsha' ? '凶兽×1.5'
            : o.id === 'yinzhang_qiankun' ? '必出特殊'
              : (tier <= 2 ? '仅普通词条' : '特殊 ' + prob(sp)));
    } else if (o.sk === 'normal') {
      h = '<div class="ico ph">印</div>';
      tags = '<span class="tag">普通</span>';
      var top5 = tRow(o.f, 5);
      sub = o.s + ' · 五阶 ' + (flatTxt(top5) || pctTxt(tRow(o.p, 5)));
    } else if (o.sk === 'special') {
      h = '<div class="ico ph">印</div>';
      tags = '<span class="tag ' + (o.gt === 'shengshou' ? 'rare' : 'nx') + '">' + esc(o.gn) + '</span>';
      var top = o.rows[o.rows.length - 1];
      sub = 'T' + top[0] + ' ' + specValTxt(o, top);
    } else {
      h = '<div class="ico ph">率</div>';
      var p3 = sealProb()[3].m.none.special, p4 = sealProb()[4].m.none.special;
      sub = 'T3 ' + prob(p3) + ' / T4 ' + prob(p4) + ' / T5 ' + prob(sealProb()[5].m.none.special);
    }
    return '<button class="card" data-k="seal" data-id="' + esc(o.id) + '">' + h +
      '<div class="c1"><div class="nm">' + tags + nm + '</div><div class="sub">' + esc(sub) + '</div></div></button>';
  }

  // ---------- 卡片 ----------
  function ico(src, ph) {
    if (!src) return '<div class="ico ph">' + (ph || '无图') + '</div>';
    return '<img class="ico" src="' + esc(src) + '" loading="lazy" decoding="async" alt="">';
  }
  function card(kind, row) {
    if (kind === 'seal') return sealCard(row.o);
    var o = row.o, vs = row.vs && row.vs.length > 1 ? row.vs.length : 0;
    var h = '', sub = '', tags = '', nm = esc(o.n || o.id);
    if (kind === 'mon') {
      var as = areasOf(o).map(function (aid) { return mapById[aid].n; });
      h = ico(o.img);
      tags = '<span class="tag">Lv' + (o.lv || '?') + '</span>';
      sub = (as.length ? as[0] + (as.length > 1 ? ' +' + (as.length - 1) : '') : '未挂图') + ' · 经验 ' + num2(o.exp);
    } else if (kind === 'equip' || kind === 'item') {
      h = ico(o.img);
      if (o.rare) tags += '<span class="tag rare">稀</span>';
      if (o.set) tags += '<span class="tag set">套</span>';
      if (o.t === 'equipment') {
        sub = (o.wt || slotNames(o) || '') + (o.req && o.req.level ? ' · Lv' + o.req.level : '') +
          (vs ? ' · ×' + vs : '') + (o.sell ? ' · ' + num2(o.sell) + '金' : '');
      } else {
        if (S.tab !== 'item' || S.g1 !== o.t) tags = '<span class="tag">' + (TYPE[o.t] || o.t) + '</span>' + (vs ? '<span class="tag nx">×' + vs + '</span>' : '') + tags;
        sub = (o.pz ? statName(o.pz) + ' Lv' + (o.pzl || '') + ' 词条' : '') ||
          (o.sell ? '卖价 ' + num2(o.sell) : '') || (o.d ? String(o.d).slice(0, 22) : TYPE[o.t] || '');
      }
    } else if (kind === 'skill') {
      h = ico(o.img);
      var clsTags = (S.tab === 'skill' && S.g1) ? '' : (o.cls || []).map(function (c) {
        return '<span class="tag">' + (CLS[c] || c) + '</span>';
      }).join('');
      var typTag = (S.tab === 'skill' && S.g2) ? '' : '<span class="tag">' + (SKTYPE[o.t] || o.t || '') + '</span>';
      tags = clsTags + typTag;
      var lastLv = o.lv[o.lv.length - 1] || [], dm = lastLv[5];
      sub = (o.lv[0] ? 'Lv' + o.lv[0][1] : '') + (dm ? ' · ' + (Array.isArray(dm) ? dm.join('/') : dm) + '×' : '') +
        (o.wl && o.wl.length ? ' · ' + o.wl.join('/') : '');
    } else if (kind === 'set') {
      h = ico((itemById[o.items[0]] || {}).img);
      tags = '<span class="tag set">' + o.items.length + ' 件</span>';
      sub = o.tiers.map(function (t) {
        var txt = Object.keys(t[1] || {}).map(function (k) { return statName(k) + statVal(k, t[1][k]); }).join('、');
        return t[0] + '件 ' + (txt || '—');
      }).join(' · ');
    } else if (kind === 'map') {
      h = ico('', '地');
      tags = '<span class="tag">' + (RK[o.rk] || o.rk || '') + '</span>' +
        '<span class="tag">' + (o.rn || '') + '</span>';
      sub = 'Lv ' + (o.lo || '?') + '~' + (o.hi || '?') + ' · ' + (MONS_OF[o.id] || []).length + ' 种怪';
    } else {
      h = ico(o.img);
      tags = '<span class="tag">' + Math.round((o.t || 0) / 60) + ' 分钟</span>';
      sub = (o.s || []).map(statName).slice(0, 3).join('、') +
        (o.v != null ? ' ' + (o.m === 'percent' ? '+' + nf(num(o.v) * 100) + '%' : '+' + num(o.v)) : '');
    }
    return '<button class="card" data-k="' + kind + '" data-id="' + esc(o.id) + '">' + h +
      '<div class="c1"><div class="nm">' + tags + nm + '</div><div class="sub' +
      (kind === 'set' ? ' set-sub' : '') + '">' + esc(sub) + '</div></div></button>';
  }

  // ---------- 渲染 ----------
  function chips(el, list, cur, attr, cls) {
    el.innerHTML = list.map(function (o) {
      return '<button class="chip ' + (cls || '') + (cur === o.id ? ' on' : '') + '" ' + attr + '="' +
        esc(o.id) + '">' + esc(o.label) + '</button>';
    }).join('');
  }

  function render() {
    // tabs
    $('tabs').innerHTML = TABS.map(function (t) {
      return '<button class="tab' + (t.k === S.tab ? ' on' : '') + '" data-tab="' + t.k + '">' +
        t.n + '<span style="opacity:.6;font-size:11px"> ' + t.c + '</span></button>';
    }).join('');

    // 第一行：大类 + 排序
    var f1 = F1[S.tab] || [];
    var sortList = SORTS[S.tab].map(function (s) { return { id: s[0], label: s[1] }; });
    $('fa').innerHTML =
      (f1.length ? f1.map(function (o) {
        return '<button class="chip' + (S.g1 === o.id ? ' on' : '') + '" data-f1="' + esc(o.id) + '">' + esc(o.label) + '</button>';
      }).join('') + (SORTS[S.tab].length > 1 ? '<span class="sep"></span>' : '') : '') +
      (SORTS[S.tab].length > 1 ? sortList.map(function (o) {
        return '<button class="chip sml' + ((S.sort || SORTS[S.tab][0][0]) === o.id ? ' on' : '') +
          '" data-sort="' + esc(o.id) + '">' + esc(o.label) + '</button>';
      }).join('') + '<span class="sep"></span>' : '');
    if (S.tab === 'equip') {
      $('fa').innerHTML += '<button class="chip sml' + (S.merge ? ' on' : '') + '" data-merge="1">合并同款</button>';
    }
    $('fa').style.display = $('fa').innerHTML ? '' : 'none';

    // 第二行：细分 + 等级段
    var f2 = f2Options();
    var lvList = [{ id: '', label: '全部等级' }].concat(BANDS.map(function (b) { return { id: b[0], label: 'Lv' + b[0] }; }));
    var hasLv = ['mon', 'equip', 'item', 'skill', 'map'].indexOf(S.tab) >= 0;
    if (!f2.length && !hasLv) {
      $('fb').style.display = hasLv ? 'flex' : 'none';
      $('fb').innerHTML = hasLv ? chipsHtml(lvList, S.lv, 'data-lv') : '';
    } else {
      $('fb').style.display = 'flex';
      $('fb').innerHTML = (f2.length ? f2.map(function (o) {
        return '<button class="chip sub' + (S.g2 === o.id ? ' on' : '') + '" data-f2="' + esc(o.id) + '">' + esc(o.label) + '</button>';
      }).join('') + (hasLv ? '<span class="sep"></span>' : '') : '') +
        (hasLv ? chipsHtml(lvList, S.lv, 'data-lv') : '');
    }

    // 列表
    var rows = rowsFor(S.tab);
    var total = rows.reduce(function (a, r) { return a + (r.vs ? r.vs.length : 1); }, 0);
    var head = (S.tab === 'equip' && S.merge)
      ? '共 ' + rows.length + ' 款（' + total + ' 条含强化变体）'
      : '共 ' + rows.length + ' 项';
    $('count').textContent = head + (S.kw ? '（搜索：' + S.kw + '）' : '');
    $('grid').innerHTML = rows.length
      ? rows.map(function (r) { return card(S.tab, r); }).join('')
      : '<div class="empty">没有匹配的条目</div>';
    window.scrollTo({ top: 0 });
  }
  function chipsHtml(list, cur, attr) {
    return list.map(function (o) {
      return '<button class="chip sml' + (cur === o.id ? ' on' : '') + '" ' + attr + '="' + esc(o.id) + '">' +
        esc(o.label) + '</button>';
    }).join('');
  }

  // ---------- 详情 ----------
  function kv(pairs) {
    return '<div class="kv">' + pairs.filter(function (p) { return p[1] != null && p[1] !== ''; })
      .map(function (p) { return '<span><i>' + esc(p[0]) + '</i><b>' + p[1] + '</b></span>'; }).join('') + '</div>';
  }
  function sec(title, body) { return body ? '<div class="sec"><h3>' + title + '</h3>' + body + '</div>' : ''; }
  function statBox(stats) {
    if (!stats) return '';
    return kv(Object.keys(stats).map(function (k) { return [statName(k), statVal(k, stats[k])]; }));
  }
  function linkRow(kind, id, name, right, img) {
    return '<div class="rowlink" data-k="' + kind + '" data-id="' + esc(id) + '">' +
      (img ? '<img src="' + esc(img) + '" loading="lazy" alt="">' : '') +
      '<span>' + esc(name) + '</span><span class="g">' + (right || '') + '</span></div>';
  }
  function effLine(e) {
    if (!e) return '';
    if (e.desc) return e.desc;
    if (e.type === 'learnCollectSkill') return '学会对应技能，成功率 ' + pct(e.chance);
    if (e.type === 'buff') {
      return (e.label || '作用') + '：' + (e.stats || []).map(statName).join('、') + ' ' +
        (e.mode === 'percent' ? '+' + (num(e.value) * 100).toFixed(0) + '%' : '+' + num(e.value)) +
        (e.duration ? '，持续 ' + Math.round(num(e.duration) / 60) + ' 分钟' : '');
    }
    if (e.type === 'skillDamageUp') {
      var sn = (e.skillIds || []).map(function (id) {
        var s = skillById[id]; return s && s.n ? s.n : id;
      }).join(' / ');
      return '技能伤害 +' + pct(e.value) + (sn ? '（限 ' + sn + '）' : '');
    }
    return (e.name || e.type || '效果') + (e.chance != null ? '（' + pct(e.chance) + '）' : '');
  }
  function effSection(eff) {
    if (!eff || !eff.length) return '';
    return sec('特殊效果', eff.map(function (e) {
      return '<div class="desc" style="margin-bottom:6px">▸ ' + esc(effLine(e)) + '</div>';
    }).join(''));
  }
  function dropSection(gid) {
    var rows = groups[gid] || [], pools = gpool[gid] || [];
    if (!rows.length) return '';
    var ind = rows.filter(function (r) { return !r[5]; });
    var byPool = {};
    rows.forEach(function (r) { if (r[5]) (byPool[r[5]] = byPool[r[5]] || []).push(r); });
    var html = '';
    if (ind.length) {
      html += '<div class="pool">独立掉落</div><table><thead><tr><th>物品</th><th>概率</th><th>数量</th><th>卖价</th></tr></thead><tbody>' +
        ind.map(function (r) {
          var nm = r[0] === 'gold' ? '金币' : ((itemById[r[0]] || {}).n || r[0]);
          var q = (r[2] != null && r[3] != null) ? (r[2] === r[3] ? r[2] : r[2] + '~' + r[3]) : '—';
          return '<tr><td>' + esc(nm) + '</td><td class="src-prob">' + prob(r[1]) +
            '</td><td class="n">' + esc(q) + '</td><td class="n">' + (r[4] ? num2(r[4]) : '—') + '</td></tr>';
        }).join('') + '</tbody></table>';
    }
    Object.keys(byPool).forEach(function (pname) {
      var ps = null;
      for (var i = 0; i < pools.length; i++) { if (pools[i][0] === pname) ps = pools[i]; }
      html += '<div class="pool">' + esc(poolName(pname)) + (ps ? ' · 整池 ' + prob(ps[1]) + '，池内 ' + ps[2] + ' 件随机 1 件' : '') +
        '</div><table><tbody>' + byPool[pname].map(function (r) {
          var nm = (itemById[r[0]] || {}).n || r[0];
          return '<tr><td>' + esc(nm) + '</td><td class="src-prob">' + prob(r[1]) +
            '</td><td class="n">' + (r[4] ? num2(r[4]) + '金' : '—') + '</td></tr>';
        }).join('') + '</tbody></table>';
    });
    var shown = Object.keys(byPool);
    var other = pools.filter(function (p) { return shown.indexOf(p[0]) < 0; });
    if (other.length) {
      html += '<div class="pool">其它池（单件概率过低，未逐条列）</div>' +
        other.map(function (p) { return '<span class="pill">' + esc(poolName(p[0])) + '：' + prob(p[1]) + ' / ' + p[2] + ' 件</span>'; }).join('');
    }
    return sec('掉落', html);
  }
  function srcSection(src) {
    if (!src || !src.length) return '';
    return sec('掉落来源', src.map(function (s) {
      var m = monById[s[0]] || {};
      return linkRow('mon', s[0], m.n || s[0], prob(s[1]) + ' · ' + (s[2] === s[3] ? s[2] : s[2] + '~' + s[3]) + '件', m.img);
    }).join(''));
  }

  function detail(kind, id) {
    var o, ico2 = '', name = '', sub = '', body = '';
    if (kind === 'seal') { detailSeal(id); return; }
    if (kind === 'mon') {
      o = monById[id]; if (!o) return;
      ico2 = o.img; name = o.n;
      var areas = areasOf(o).map(function (aid) { return mapById[aid]; });
      sub = (areas.length ? areas.map(function (p) { return p.n; }).join(' / ') : '未挂图') + ' · Lv' + (o.lv || '?');
      body = sec('基础', kv([
        ['等级', o.lv], ['生命', num2(o.hp)], ['魔法', num2(o.mp)],
        ['攻击', o.a1 != null ? num2(o.a1) + '~' + num2(o.a2) : null],
        ['魔法攻击', o.m1 != null ? num2(o.m1) + '~' + num2(o.m2) : null],
        ['伤害类型', o.dc === 'magic' ? '魔法' : '物理'],
        ['防御', num2(o.def)], ['魔法抗性', num2(o.mres)],
        ['物理减伤', num2(o.pr)], ['魔法减伤', num2(o.mr)],
        ['暴击率', prob(o.cr)], ['暴击伤害', o.cd ? (o.cd * 100).toFixed(0) + '%' : null],
        ['命中率', prob(o.hit)], ['闪避率', prob(o.dg)],
        ['攻速', o.as ? (o.as * 100).toFixed(0) + '%' : null],
        ['伤害浮动', o.dv ? '±' + (o.dv * 100).toFixed(0) + '%' : null],
        ['攻击目标数', o.tar], ['刷新权重', o.w], ['经验', num2(o.exp)]
      ])) +
        (areas.length ? sec('出现地图', areas.map(function (p) {
          return linkRow('map', p.id, p.n, 'Lv' + (p.lo || '?') + '~' + (p.hi || '?'));
        }).join('')) : '') +
        dropSection(o.g);
    } else if (kind === 'equip' || kind === 'item') {
      o = itemById[id]; if (!o) return;
      ico2 = o.img; name = o.n;
      sub = (TYPE[o.t] || '') + (o.wt ? ' · ' + o.wt : (slots(o).length ? ' · ' + slotNames(o) : '')) +
        (o.rare ? ' · 稀有' : '') + (o.set ? ' · 套装' : '');
      var same = [];
      if (o.t === 'equipment') {
        same = D.items.filter(function (x) {
          return x.t === 'equipment' && baseName(x) === baseName(o) && slots(x).join(',') === slots(o).join(',');
        }).sort(function (a, b) {
          return (num(a.req && a.req.level) || 0) - (num(b.req && b.req.level) || 0);
        });
      }
      body = sec('基础', kv([
        ['类型', TYPE[o.t] || o.t], ['子类', o.st], ['槽位', slotNames(o) || null],
        ['武器类型', o.wt], ['需求等级', o.req && o.req.level],
        ['职业限制', (o.cls || []).map(function (c) { return CLS[c] || c; }).join('/')],
        ['卖价', o.sell ? num2(o.sell) + ' 金' : null],
        ['堆叠上限', o.mx], ['冷却', o.cd ? o.cd + ' 秒' : null],
        ['仅制作可得', o.craft ? '是' : null]
      ])) +
        (o.d ? sec('说明', '<div class="desc">' + esc(o.d) + '</div>') : '') +
        (o.stats ? sec('属性', statBox(o.stats)) : '') +
        (o.pz ? sec('拼图词条', kv([['词条', statName(o.pz)], ['等级', o.pzl]])) : '') +
        effSection(o.eff) +
        (o.set && setById[o.set] ? sec('所属套装', linkRow('set', o.set, setById[o.set].n, o.set)) : '') +
        (same.length > 1 ? sec('同款强化等级（' + same.length + '）', same.map(function (x) {
          return linkRow('equip', x.id, x.n, (x.req && x.req.level ? 'Lv' + x.req.level : '') +
            (x.sell ? ' · ' + num2(x.sell) + '金' : ''), x.img);
        }).join('')) : '') +
        srcSection(o.src);
    } else if (kind === 'skill') {
      o = skillById[id]; if (!o) return;
      ico2 = o.img; name = o.n;
      sub = (o.cls || []).map(function (c) { return CLS[c] || c; }).join('/') + ' · ' + (SKTYPE[o.t] || '') +
        (o.wl && o.wl.length ? ' · ' + o.wl.join('/') : '');
      var rows2 = o.lv.map(function (x) {
        var dm = Array.isArray(x[5]) ? x[5].join('/') : x[5];
        return '<tr><td class="n">' + x[0] + '</td><td class="n">' + (x[1] || '—') + '</td><td class="n">' +
          (dm == null ? '—' : dm) + '</td><td class="n">' + (x[7] == null ? '—' : x[7] + 's') +
          '</td><td class="n">' + (x[8] == null ? '—' : x[8]) + '</td></tr>';
      }).join('');
      body = sec('基础', kv([['职业', (o.cls || []).map(function (c) { return CLS[c] || c; }).join('/')],
      ['分类', o.cat], ['槽位', o.slot], ['武器限制', (o.wl || []).join('/')],
      ['最高等级', o.mx], ['伤害类型', (o.lv[0] || [])[6] === 'magic' ? '魔法' : '物理']])) +
        sec('各级数据', '<table><thead><tr><th>等级</th><th>需等级</th><th>倍率</th><th>冷却</th><th>耗魔</th></tr></thead><tbody>' + rows2 + '</tbody></table>') +
        sec('说明', '<div class="desc">' + esc((o.lv[0] || [])[9] || '') + '</div>');
    } else if (kind === 'set') {
      o = setById[id]; if (!o) return;
      ico2 = (itemById[o.items[0]] || {}).img; name = o.n; sub = o.items.length + ' 件';
      body = sec('套装效果', '<table><thead><tr><th>件数</th><th>加成</th></tr></thead><tbody>' +
        o.tiers.map(function (t) {
          var txt = Object.keys(t[1] || {}).map(function (k) { return statName(k) + statVal(k, t[1][k]); }).join('、');
          return '<tr><td>' + t[0] + ' 件</td><td>' + esc(txt || '—') + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<div class="desc">集齐对应件数时生效；同档效果按套装表结算。</div>') +
        sec('套装物品', o.items.map(function (iid) {
          var it = itemById[iid] || {};
          return linkRow('equip', iid, it.n || iid, (slotNames(it) || '') + (it.req && it.req.level ? ' Lv' + it.req.level : ''), it.img);
        }).join(''));
    } else if (kind === 'map') {
      o = mapById[id]; if (!o) return;
      name = o.n; sub = (o.rn || '') + (o.rk ? ' · ' + (RK[o.rk] || o.rk) : '');
      body = sec('基础', kv([['区服', o.rn], ['区域类型', RK[o.rk] || o.rk],
      ['等级段', (o.lo || '?') + '~' + (o.hi || '?')],
      ['每波只数', (o.smin || 1) + '~' + (o.smax || 4)], ['怪物种类', (MONS_OF[o.id] || []).length]])) +
        sec('怪物', (MONS_OF[o.id] || []).map(function (mid) {
          var m = monById[mid] || {};
          return linkRow('mon', mid, m.n || mid, 'Lv' + (m.lv || '?') + ' · 经验 ' + num2(m.exp), m.img);
        }).join(''));
    } else {
      o = buffById[id]; if (!o) return;
      ico2 = o.img; name = o.n; sub = '药水 BUFF';
      body = sec('基础', kv([['持续', o.t ? Math.round(o.t / 60) + ' 分钟（' + o.t + ' 秒）' : null],
      ['卖价', o.sell ? num2(o.sell) + ' 金' : null],
      ['加成方式', o.m === 'percent' ? '百分比' : '固定值'],
      ['作用属性', (o.s || []).map(statName).join('、')],
      ['加成值', o.v == null ? null : (o.m === 'percent' ? '+' + (num(o.v) * 100).toFixed(0) + '%' : '+' + num(o.v) + ' 点')]])) +
        (o.d ? sec('说明', '<div class="desc">' + esc(o.d) + '</div>') : '') +
        srcSection((itemById[o.id] || {}).src);
    }

    openSheet(ico2, name, sub, body);
  }
  function openSheet(ico2, name, sub, body) {
    $('shIco').src = ico2 || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    $('shIco').style.visibility = ico2 ? 'visible' : 'hidden';
    $('shName').textContent = name;
    $('shSub').textContent = sub;
    $('shBody').innerHTML = body || '<div class="desc">暂无数据</div>';
    $('shBody').scrollTop = 0;
    $('mask').classList.add('on');
    $('sheet').classList.add('on');
  }

  // ---------- 详情：印章 ----------
  function sealedTable(head, rows) {
    return '<table class="sw"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') +
      '</tr></thead><tbody>' + rows + '</tbody></table>';
  }
  function detailSeal(id) {
    if (!IM) { openSheet('', '印章', '', '<div class="desc">暂无印章数据</div>'); return; }
    if (id === 'prob') {
      var head1 = sealedTable(['阶', '无特殊', '祥瑞', '凶煞', '乾坤'],
        [1, 2, 3, 4, 5].map(function (t) {
          var p = sealProb()[t];
          var qk = (p.sw.shengshou + p.sw.xiongshou) ? '100%' : '—';
          return '<tr><td class="n">T' + t + '</td><td class="n src-prob">' + prob(p.m.none.special) +
            '</td><td class="n">' + prob(p.m.xiangrui.special) +
            '</td><td class="n">' + prob(p.m.xiongsha.special) +
            '</td><td class="n">' + qk + '</td></tr>';
        }).join(''));
      var head2 = sealedTable(['阶', '无特殊', '祥瑞', '凶煞'],
        [1, 2, 3, 4, 5].map(function (t) {
          return '<tr><td class="n">T' + t + '</td><td class="n">' + prob2(normalOdds(t, 100, 'none')) +
            '</td><td class="n">' + prob2(normalOdds(t, 100, 'xiangrui')) +
            '</td><td class="n">' + prob2(normalOdds(t, 100, 'xiongsha')) + '</td></tr>';
        }).join(''));
      openSheet('', '各阶出率与规则', IM.ver || '拓印系统',
        sec('特殊词条出现率（每次拓印）', head1 +
          '<div class="desc" style="margin-top:6px">一、二阶没有特殊词条池，所以乾坤印章在一、二阶实际用不上；' +
          '「乾坤」会把普通词条权重清零，抽到即必为圣兽或凶兽。</div>') +
        sec('普通词条单条出现率', head2) +
        sec('规则', '<div class="desc">' + IM.rule.map(function (r, i) {
          return (i + 1) + '. ' + esc(r);
        }).join('<br>') + '</div>') +
        sec('数据来源', '<div class="desc">权重与区间取自游戏静态表 imprint_normal / imprint_special，' +
          '概率按客户端 Vp() 权重抽取逻辑计算（祥瑞/凶煞为对应组权重 ×1.5）。</div>'));
      return;
    }
    if (id.indexOf('n:') === 0) {
      var key = id.slice(2), e = null;
      IM.n.forEach(function (x) { if (x.k === key) e = x; });
      if (!e) { openSheet('', id, '', '<div class="desc">未找到该词条</div>'); return; }
      var hasFlat = (e.f || []).length > 0;
      var rowsN = [1, 2, 3, 4, 5].map(function (t) {
        var f = tRow(e.f, t), p = tRow(e.p, t);
        return '<tr><td class="n">T' + t + '</td><td class="n">' + (flatTxt(f) || '—') +
          '</td><td class="n">' + (pctTxt(p) || '—') +
          '</td><td class="n src-prob">' + prob2(normalOdds(t, e.w, 'none')) + '</td></tr>';
      }).join('');
      openSheet('', e.n, '普通词条 · ' + e.s + (hasFlat ? ' · 固定值 + 百分比' : ' · 仅百分比'),
        sec('基础', kv([['属性', e.s], ['类型', hasFlat ? '固定值 + 百分比' : '仅百分比'],
        ['权重', e.w], ['可用阶', '一阶 ~ 五阶']])) +
        sec('各阶数值', sealedTable(['阶', '固定值', '百分比', '单条出现率'], rowsN) +
          '<div class="desc" style="margin-top:6px">出现率按无特殊印章计算；带祥瑞/凶煞时普通池被摊薄，' +
          '单条降至 ' + prob2(normalOdds(3, 100, 'xiangrui')) + '（三阶） / ' +
          prob2(normalOdds(4, 100, 'xiangrui')) + '（四阶） / ' +
          prob2(normalOdds(5, 100, 'xiangrui')) + '（五阶）左右。</div>') +
        sec('数值粒度', '<div class="desc">固定值为整数；百分比 0.01% 一跳，在区间内等概率随机。</div>'));
      return;
    }
    if (id.indexOf('s:') === 0) {
      var sk = id.slice(2), se = null;
      IM.s.forEach(function (x) { if (x.k === sk) se = x; });
      if (!se) { openSheet('', id, '', '<div class="desc">未找到该词条</div>'); return; }
      var wsum = se.rows.map(function (r) { return 'T' + r[0] + ' ' + r[1]; }).join(' / ');
      var rowsS = se.rows.map(function (r) {
        var good = se.gt === 'shengshou' ? 'xiangrui' : 'xiongsha';
        return '<tr><td class="n">T' + r[0] + '</td><td class="n">' + r[1] +
          '</td><td>' + esc(specValTxt(se, r)) +
          '</td><td class="n src-prob">' + prob2(specialOdds(r[0], r[1], se.gt, 'none')) +
          '</td><td class="n">' + prob2(specialOdds(r[0], r[1], se.gt, good)) + '</td></tr>';
      }).join('');
      var dTxt = (se.d || '').replace('{v}', pctTxt([0, se.rows[se.rows.length - 1][3], se.rows[se.rows.length - 1][4]]))
        .replace('{chance}', (se.rows[se.rows.length - 1][2] == null ? '—' : nf(se.rows[se.rows.length - 1][2]) + '%'))
        .replace('{th}', se.rows[se.rows.length - 1][6] == null ? '—' : nf(se.rows[se.rows.length - 1][6]) + '%')
        .replace('{dur}', se.rows[se.rows.length - 1][5] || 3);
      openSheet('', se.n, se.gn + ' · 仅三阶及以上',
        sec('基础', kv([['类别', se.gn], ['可用阶', '三阶 ~ 五阶'],
        ['顶阶数值', specValTxt(se, se.rows[se.rows.length - 1])]])) +
        sec('效果说明（五阶数值）', '<div class="desc">' + esc(dTxt) + '</div>') +
        sec('各阶数值与出现率', sealedTable(['阶', '权重', '效果', '无特殊', (se.gt === 'shengshou' ? '祥瑞' : '凶煞')], rowsS)) +
        (se.tp === 'chaos' ? sec('随机项', '<div class="desc">每次拓印在 命中率 / 闪避率 / 暴击率 / 暴击伤害 中随机 1 项的数值。</div>') : ''));
      return;
    }
    var it = itemById[id];
    if (!it) { openSheet('', id, '', '<div class="desc">未找到该印章</div>'); return; }
    var tier = SEAL_TIER[id];
    var extra = '';
    if (tier) {
      var pt = sealProb()[tier];
      extra = sec('该阶出率', kv([
        ['普通词条单条', prob2(normalOdds(tier, 100, 'none'))],
        ['特殊总出现率', tier >= 3 ? prob(pt.m.none.special) : '该阶无特殊词条']
      ]) + (tier >= 3 ? '<div class="desc" style="margin-top:6px">带祥瑞 ' +
        prob(pt.m.xiangrui.special) + '，带凶煞 ' + prob(pt.m.xiongsha.special) + '，带乾坤 100%。</div>' : ''));
    } else {
      extra = sec('作用', '<div class="desc">' + esc(SEAL_ROLE[id] || '') +
        '；三阶及以上装备才能用它抽到特殊词条，概率见「印章 → 各阶出率与规则」。</div>');
    }
    openSheet(it.img, it.n, '印章道具 · ' + (SEAL_ROLE[id] || ''),
      sec('基础', kv([['类型', TYPE[it.t] || it.t], ['卖价', it.sell ? num2(it.sell) + ' 金' : null],
      ['堆叠上限', it.mx], ['来源', '分解装备可得']])) +
      (it.d ? sec('说明', '<div class="desc">' + esc(it.d) + '</div>') : '') +
      extra);
  }
  function closeSheet() {
    $('mask').classList.remove('on');
    $('sheet').classList.remove('on');
  }

  // ---------- 事件 ----------
  $('tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]');
    if (!b) return;
    S.tab = b.getAttribute('data-tab');
    S.g1 = ''; S.g2 = ''; S.lv = ''; S.sort = '';
    render();
  });
  $('fa').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f1]');
    if (b) { S.g1 = b.getAttribute('data-f1'); S.g2 = ''; render(); return; }
    var so = e.target.closest('[data-sort]');
    if (so) { S.sort = so.getAttribute('data-sort'); render(); return; }
    var mg = e.target.closest('[data-merge]');
    if (mg) { S.merge = !S.merge; render(); return; }
  });
  $('fb').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f2]');
    if (b) { S.g2 = b.getAttribute('data-f2'); render(); return; }
    var lv = e.target.closest('[data-lv]');
    if (lv) { S.lv = lv.getAttribute('data-lv'); render(); }
  });
  $('grid').addEventListener('click', function (e) {
    var b = e.target.closest('.card');
    if (!b) return;
    detail(b.getAttribute('data-k'), b.getAttribute('data-id'));
  });
  $('shBody').addEventListener('click', function (e) {
    var b = e.target.closest('.rowlink');
    if (!b) return;
    detail(b.getAttribute('data-k'), b.getAttribute('data-id'));
  });
  $('mask').addEventListener('click', closeSheet);
  $('shX').addEventListener('click', closeSheet);

  var t = null;
  $('q').addEventListener('input', function () {
    var v = this.value;
    $('clrq').style.display = v ? 'block' : 'none';
    clearTimeout(t);
    t = setTimeout(function () { S.kw = v.trim(); render(); }, 160);
  });
  $('clrq').addEventListener('click', function () {
    $('q').value = ''; S.kw = ''; this.style.display = 'none'; render();
  });

  // ---------- 启动 ----------
  var n = (D.meta && D.meta.n) || {};
  $('meta').innerHTML = '怪物 ' + (n.m || 0) + ' · 物品 ' + (n.i || 0) + ' · 技能 ' + (n.s || 0) +
    '<br>套装 ' + (n.set || 0) + ' · 地图 ' + (n.map || 0) + ' · BUFF ' + (n.b || 0) +
    (D.imprints ? ' · 印章词条 ' + (D.imprints.n.length + D.imprints.s.length) : '');
  render();
})();
