/* 龙猫放置 · 图鉴 —— 纯前端，无依赖 */
(function () {
  'use strict';
  var D = window.CODEX;
  var $ = function (id) { return document.getElementById(id); };

  var CLS = { zhanshi: '战士', dunwei: '盾卫', fashi: '法师', youxia: '游侠' };
  var SLOT = {
    weapon: '武器', offhand: '副手', head: '头部', chest: '上装', hands: '手套',
    legs: '下装', feet: '鞋子', ring: '戒指', earrings: '耳环',
    'spirit-stone': '灵石', socks: '袜子', eyes: '眼部', face: '脸部'
  };
  var TYPE = {
    equipment: '装备', puzzle: '拼图', consumable: '消耗品', material: '材料',
    puzzleBlock: '拼图块', special: '特殊', puzzleTicket: '拼图券'
  };
  var STAT = {
    strength: '力量', magic: '魔力', vitality: '体力', luck: '幸运',
    hp: '生命', mp: '魔法值', minAttack: '最小攻击', maxAttack: '最大攻击',
    minMagicAttack: '最小魔法攻击', maxMagicAttack: '最大魔法攻击',
    defense: '防御', magicResist: '魔法抗性',
    physicalReduction: '物理减伤', magicReduction: '魔法减伤',
    critRate: '暴击率', critDamage: '暴击伤害', hitRate: '命中率', dodgeRate: '闪避率',
    attackSpeed: '攻速', moveSpeed: '移速', goldRate: '金币加成', expMultiplier: '经验倍率',
    damageBonus: '伤害加成', damageMultiplier: '伤害倍率', physicalDamage: '物理伤害',
    magicDamage: '魔法伤害', hpRegen: '生命回复', mpRegen: '魔法回复',
    hpMax: '最大生命', mpMax: '最大魔法', attackRange: '攻击基数', attack: '攻击',
    magicAttack: '魔法攻击'
  };
  var PCT = {
    critRate: 1, critDamage: 1, hitRate: 1, dodgeRate: 1, goldRate: 1, expMultiplier: 1,
    damageBonus: 1, moveSpeed: 1, attackSpeed: 1, physicalDamage: 1, magicDamage: 1,
    damageMultiplier: 1, luckPercent: 1, percent: 1
  };
  var RK = { field: '野外', boss: '领主', dungeon: '副本' };
  var POOL = {
    equip: '装备', potion: '药剂', puzzle13: '拼图', '随机方块': '随机方块',
    jinzita_armor: '金字塔·护甲', jinzita_weapon: '金字塔·武器',
    kamiao_armor: '卡喵·护甲', shelong_armor: '蛇龙·护甲', shelong_weapon: '蛇龙·武器',
    xuanwu_armor: '玄武·护甲', xuanwu_weapon: '玄武·武器'
  };
  function poolName(p) { return (POOL[p] || p) + '池'; }
  function slots(o) {
    if (!o || !o.slot) return [];
    return Array.isArray(o.slot) ? o.slot : [o.slot];
  }
  function slotNames(o) { return slots(o).map(function (s) { return SLOT[s] || s; }).join(' / '); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function num(v) { return typeof v === 'number' ? v : Number(v); }
  function statName(k) {
    var base = String(k).replace(/percent$/i, '');
    return (STAT[base] || base) + (/percent$/i.test(k) ? '%' : '');
  }
  function statVal(k, v) {
    var isPct = PCT[k] || /percent$/i.test(k);
    if (isPct) {
      var p = num(v) * 100;
      return (p > 0 ? '+' : '') + p.toFixed(2).replace(/\.?0+$/, '') + '%';
    }
    var n = num(v);
    return (n > 0 ? '+' : '') + (Number.isInteger(n) ? n : n.toFixed(2));
  }
  function prob(p) {
    if (!isFinite(p) || p <= 0) return '—';
    var v = p * 100;
    if (v >= 1) return v.toFixed(1) + '%';
    if (v >= 0.01) return v.toFixed(3) + '%';
    if (v >= 0.0001) return v.toFixed(4) + '%';
    return v.toExponential(2) + '%';
  }
  function num2(n) {
    if (n == null || n === '') return '—';
    var v = num(n);
    if (isNaN(v)) return esc(n);
    return Math.abs(v) >= 1000 ? v.toLocaleString('en-US') : String(v);
  }

  // ---------- 索引 ----------
  var mapById = {}, monById = {}, itemById = {}, skillById = {}, setById = {}, buffById = {};
  D.maps.forEach(function (x) { mapById[x.id] = x; });
  D.mons.forEach(function (x) { monById[x.id] = x; });
  D.items.forEach(function (x) { itemById[x.id] = x; });
  D.skills.forEach(function (x) { skillById[x.id] = x; });
  D.sets.forEach(function (x) { setById[x.id] = x; });
  D.buffs.forEach(function (x) { buffById[x.id] = x; });
  var groups = D.groups || {}, gpool = D.gpool || {};

  // 怪物 → 地图（area 可能是逗号分隔的字符串，也可能是数组）
  function areasOf(m) {
    if (!m.area) return [];
    var a = Array.isArray(m.area) ? m.area : String(m.area).split(',');
    return a.map(function (x) { return String(x).trim(); }).filter(function (x) { return mapById[x]; });
  }
  var MONS_OF = {};
  D.mons.forEach(function (m) {
    areasOf(m).forEach(function (aid) {
      (MONS_OF[aid] = MONS_OF[aid] || []).push(m.id);
    });
  });

  // ---------- 分类 ----------
  var TABS = [
    { k: 'mon', n: '怪物', c: D.mons.length, f: 'region' },
    { k: 'equip', n: '装备', c: D.items.filter(function (i) { return i.t === 'equipment'; }).length, f: 'slot' },
    { k: 'item', n: '道具', c: D.items.filter(function (i) { return i.t !== 'equipment' && i.pt !== 'buff'; }).length, f: 'itype' },
    { k: 'skill', n: '技能', c: D.skills.length, f: 'sclass' },
    { k: 'set', n: '套装', c: D.sets.length, f: '' },
    { k: 'map', n: '地图', c: D.maps.length, f: '' },
    { k: 'buff', n: '药水BUFF', c: D.buffs.length, f: '' }
  ];
  var tab = 'mon', kw = '', fv = '';

  function tabConf(k) {
    for (var i = 0; i < TABS.length; i++) { if (TABS[i].k === k) return TABS[i]; }
    return TABS[0];
  }

  function filterOptions(k) {
    if (k === 'region') {
      var arr = [['', '全部区服']];
      D.regions.forEach(function (r) { arr.push([r.id, r.n]); });
      return arr;
    }
    if (k === 'slot') {
      return [['', '全部槽位'], ['weapon', '武器'], ['offhand', '副手'], ['armor', '防具'], ['acc', '饰品']];
    }
    if (k === 'itype') {
      return [['', '全部类型'], ['consumable', '消耗品'], ['material', '材料'],
        ['puzzle', '拼图'], ['puzzleBlock', '拼图块'], ['special', '特殊'], ['puzzleTicket', '拼图券']];
    }
    if (k === 'sclass') {
      return [['', '全部职业'], ['zhanshi', '战士'], ['dunwei', '盾卫'], ['fashi', '法师'], ['youxia', '游侠']];
    }
    return [];
  }

  function inSlot(it, v) {
    if (!v) return true;
    var ss = slots(it);
    if (v === 'weapon') return ss.indexOf('weapon') >= 0;
    if (v === 'offhand') return ss.indexOf('offhand') >= 0;
    if (v === 'armor') return ss.some(function (s) { return ['head', 'chest', 'hands', 'legs', 'feet'].indexOf(s) >= 0; });
    if (v === 'acc') return ss.some(function (s) { return ['ring', 'earrings', 'spirit-stone', 'socks', 'eyes', 'face'].indexOf(s) >= 0; });
    return true;
  }

  function match(s) {
    if (!kw) return true;
    var q = kw.toLowerCase();
    return String(s).toLowerCase().indexOf(q) >= 0;
  }

  function rowsFor(k) {
    if (k === 'mon') {
      return D.mons.filter(function (m) {
        if (fv) {
          var hit = areasOf(m).some(function (aid) { return mapById[aid].r === fv; });
          if (!hit) return false;
        }
        return match(m.n) || match(m.id);
      }).sort(function (a, b) { return (a.lv || 0) - (b.lv || 0) || (a.id < b.id ? -1 : 1); });
    }
    if (k === 'equip') {
      return D.items.filter(function (i) {
        return i.t === 'equipment' && inSlot(i, fv) && (match(i.n) || match(i.id));
      }).sort(function (a, b) {
        var la = (a.req && a.req.level) || 0, lb = (b.req && b.req.level) || 0;
        return la - lb || (a.rare ? -1 : 0) - (b.rare ? -1 : 0) || (a.id < b.id ? -1 : 1);
      });
    }
    if (k === 'item') {
      return D.items.filter(function (i) {
        return i.t !== 'equipment' && i.pt !== 'buff' && (!fv || i.t === fv) && (match(i.n) || match(i.id));
      }).sort(function (a, b) { return a.t < b.t ? -1 : a.t > b.t ? 1 : (a.id < b.id ? -1 : 1); });
    }
    if (k === 'skill') {
      return D.skills.filter(function (s) {
        if (fv && (s.cls || []).indexOf(fv) < 0) return false;
        return match(s.n) || match(s.id);
      }).sort(function (a, b) {
        var ca = (a.cls || [])[0] || 'zz', cb = (b.cls || [])[0] || 'zz';
        return ca < cb ? -1 : ca > cb ? 1 : ((a.lv[0] || [])[1] || 0) - ((b.lv[0] || [])[1] || 0);
      });
    }
    if (k === 'set') {
      return D.sets.filter(function (s) { return match(s.n) || match(s.id); })
        .sort(function (a, b) { return a.n < b.n ? -1 : 1; });
    }
    if (k === 'map') {
      return D.maps.filter(function (m) { return match(m.n) || match(m.id) || match(m.rn); })
        .sort(function (a, b) { return (a.lo || 0) - (b.lo || 0); });
    }
    return D.buffs.filter(function (b) { return match(b.n) || match(b.id); })
      .sort(function (a, b) { return a.n < b.n ? -1 : 1; });
  }

  // ---------- 卡片 ----------
  function ico(src, ph) {
    if (!src) return '<div class="ico ph">' + (ph || '无图') + '</div>';
    return '<img class="ico" src="' + esc(src) + '" loading="lazy" decoding="async" alt="">';
  }

  function card(kind, o) {
    var h = '', nm = esc(o.n || o.id), sub = '', tags = '';
    if (kind === 'mon') {
      var mp = mapById[areasOf(o)[0]];
      var anames = areasOf(o).map(function (aid) { return mapById[aid].n; });
      h = ico(o.img);
      tags = '<span class="tag">Lv' + (o.lv || '?') + '</span>';
      sub = (anames.length ? anames.slice(0, 1).join('') + (anames.length > 1 ? ' +' + (anames.length - 1) : '') : '未挂图') +
        ' · 经验 ' + num2(o.exp);
    } else if (kind === 'equip' || kind === 'item') {
      h = ico(o.img);
      if (o.rare) tags += '<span class="tag rare">稀</span>';
      if (o.set) tags += '<span class="tag set">套</span>';
      if (o.t === 'equipment') {
        sub = (slotNames(o) || TYPE[o.t] || '') + (o.req && o.req.level ? ' · Lv' + o.req.level : '') +
          (o.sell ? ' · ' + num2(o.sell) + '金' : '');
      } else {
        tags = '<span class="tag">' + (TYPE[o.t] || o.t) + '</span>';
        sub = (o.d ? String(o.d).slice(0, 22) : (o.sell ? '卖价 ' + num2(o.sell) : TYPE[o.t] || ''));
      }
    } else if (kind === 'skill') {
      h = ico(o.img);
      tags = (o.cls || []).map(function (c) { return '<span class="tag">' + (CLS[c] || c) + '</span>'; }).join('');
      var lastLv = o.lv[o.lv.length - 1] || [];
      var dm = lastLv[5];
      var dmt = Array.isArray(dm) ? dm.join('/') : (dm == null ? '' : dm);
      sub = (o.lv[0] ? 'Lv' + o.lv[0][1] : '') + (dmt ? ' · ' + dmt + '×' : '') +
        (o.wl && o.wl.length ? ' · ' + o.wl.join('/') : '');
    } else if (kind === 'set') {
      h = ico((itemById[o.items[0]] || {}).img);
      tags = '<span class="tag set">' + o.items.length + ' 件</span>';
      sub = o.tiers.map(function (t) { return t[0] + '件'; }).join(' / ') + ' 效果';
    } else if (kind === 'map') {
      h = ico('', '地');
      tags = '<span class="tag">' + (o.rn || '') + '</span>';
      sub = 'Lv ' + (o.lo || '?') + '~' + (o.hi || '?') + ' · ' + (MONS_OF[o.id] || []).length + ' 种怪';
    } else {
      h = ico(o.img);
      sub = (o.d || '') .slice(0, 24);
      if (o.t) tags = '<span class="tag">' + Math.round((o.t || 0) / 60) + ' 分钟</span>';
    }
    return '<button class="card" data-k="' + kind + '" data-id="' + esc(o.id) + '">' + h +
      '<div class="c1"><div class="nm">' + tags + nm + '</div><div class="sub">' + esc(sub) + '</div></div></button>';
  }

  function render() {
    var conf = tabConf(tab);
    // tabs
    $('tabs').innerHTML = TABS.map(function (t) {
      return '<button class="tab' + (t.k === tab ? ' on' : '') + '" data-tab="' + t.k + '">' +
        t.n + '<span style="opacity:.6;font-size:11px"> ' + t.c + '</span></button>';
    }).join('');
    // filters
    var fo = filterOptions(conf.f);
    $('filters').innerHTML = fo.map(function (o) {
      return '<button class="chip' + (fv === o[0] ? ' on' : '') + '" data-f="' + esc(o[0]) + '">' + esc(o[1]) + '</button>';
    }).join('');
    $('filters').style.display = fo.length ? 'flex' : 'none';

    var rows = rowsFor(tab);
    $('count').textContent = '共 ' + rows.length + ' 条' + (kw ? '（搜索：' + kw + '）' : '') +
      (fv ? '（筛选：' + (fo.filter(function (o) { return o[0] === fv; })[0] || ['', ''])[1] + '）' : '');
    var kindMap = { mon: 'mon', equip: 'equip', item: 'item', skill: 'skill', set: 'set', map: 'map', buff: 'buff' };
    $('grid').innerHTML = rows.length
      ? rows.map(function (o) { return card(kindMap[tab], o); }).join('')
      : '<div class="empty">没有匹配的条目</div>';
    window.scrollTo({ top: 0 });
  }

  // ---------- 详情 ----------
  function kv(pairs) {
    return '<div class="kv">' + pairs.filter(function (p) { return p[1] != null && p[1] !== ''; })
      .map(function (p) { return '<span><i>' + esc(p[0]) + '</i><b>' + p[1] + '</b></span>'; }).join('') + '</div>';
  }
  function sec(title, body) {
    return body ? '<div class="sec"><h3>' + title + '</h3>' + body + '</div>' : '';
  }
  function statBox(stats) {
    if (!stats) return '';
    return kv(Object.keys(stats).map(function (k) { return [statName(k), statVal(k, stats[k])]; }));
  }
  function linkRow(kind, id, name, right, img) {
    return '<div class="rowlink" data-k="' + kind + '" data-id="' + esc(id) + '">' +
      (img ? '<img src="' + esc(img) + '" loading="lazy" alt="">' : '') +
      '<span>' + esc(name) + '</span><span class="g">' + (right || '') + '</span></div>';
  }

  function dropSection(gid, monName) {
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
      var meta = ps ? ('整池 ' + prob(ps[1]) + '，池内 ' + ps[2] + ' 件随机 1 件') : '';
      html += '<div class="pool">' + esc(poolName(pname)) + ' · ' + meta + '</div><table><tbody>' +
        byPool[pname].map(function (r) {
          var nm = (itemById[r[0]] || {}).n || r[0];
          return '<tr><td>' + esc(nm) + '</td><td class="src-prob">' + prob(r[1]) +
            '</td><td class="n">' + (r[4] ? num2(r[4]) + '金' : '—') + '</td></tr>';
        }).join('') + '</tbody></table>';
    });
    // 未单列的池
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

  function pct(v) { return v == null ? '—' : (num(v) * 100).toFixed(0) + '%'; }
  function effLine(e) {
    if (!e) return '';
    if (e.desc) return e.desc;
    var c = e.chance != null ? '（' + pct(e.chance) + '）' : '';
    if (e.type === 'learnCollectSkill') return '学会对应技能，成功率 ' + pct(e.chance);
    if (e.type === 'buff') {
      return (e.label || '作用') + '：' + (e.stats || []).map(statName).join('、') + ' ' +
        (e.mode === 'percent' ? '+' + (num(e.value) * 100).toFixed(0) + '%' : '+' + num(e.value)) +
        (e.duration ? '，持续 ' + Math.round(num(e.duration) / 60) + ' 分钟' : '');
    }
    return (e.name || e.type || '效果') + c;
  }
  function effSection(eff) {
    if (!eff || !eff.length) return '';
    return sec('特殊效果', eff.map(function (e) {
      return '<div class="desc" style="margin-bottom:6px">▸ ' + esc(effLine(e)) + '</div>';
    }).join(''));
  }

  function detail(kind, id) {
    var o, ico2 = '', name = '', sub = '', body = '';
    if (kind === 'mon') {
      o = monById[id]; if (!o) return;
      ico2 = o.img; name = o.n;
      var areas = areasOf(o).map(function (aid) { return mapById[aid]; });
      sub = (areas.length ? areas.map(function (mp) { return mp.n; }).join(' / ') : '未挂图') + ' · Lv' + (o.lv || '?');
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
        (areas.length ? sec('出现地图', areas.map(function (mp) {
          return linkRow('map', mp.id, mp.n, 'Lv' + (mp.lo || '?') + '~' + (mp.hi || '?'));
        }).join('')) : '') +
        dropSection(o.g, o.n);
    } else if (kind === 'equip' || kind === 'item') {
      o = itemById[id]; if (!o) return;
      ico2 = o.img; name = o.n;
      sub = (TYPE[o.t] || '') + (slots(o).length ? ' · ' + slotNames(o) : '') +
        (o.rare ? ' · 稀有' : '') + (o.set ? ' · 套装' : '');
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
        srcSection(o.src);
    } else if (kind === 'skill') {
      o = skillById[id]; if (!o) return;
      ico2 = o.img; name = o.n;
      sub = (o.cls || []).map(function (c) { return CLS[c] || c; }).join('/') + ' · ' + (o.cat || '') +
        (o.wl && o.wl.length ? ' · ' + o.wl.join('/') : '');
      var rows = o.lv.map(function (x) {
        var dm = Array.isArray(x[5]) ? x[5].join('/') : x[5];
        return '<tr><td class="n">' + x[0] + '</td><td class="n">' + (x[1] || '—') + '</td><td class="n">' +
          (dm == null ? '—' : dm) + '</td><td class="n">' + (x[7] == null ? '—' : x[7] + 's') +
          '</td><td class="n">' + (x[8] == null ? '—' : x[8]) + '</td></tr>';
      }).join('');
      body = sec('基础', kv([['职业', (o.cls || []).map(function (c) { return CLS[c] || c; }).join('/')],
      ['分类', o.cat], ['槽位', o.slot], ['武器限制', (o.wl || []).join('/')],
      ['最高等级', o.mx], ['伤害类型', (o.lv[0] || [])[6] === 'magic' ? '魔法' : '物理']])) +
        sec('各级数据', '<table><thead><tr><th>等级</th><th>需等级</th><th>倍率</th><th>冷却</th><th>耗魔</th></tr></thead><tbody>' + rows + '</tbody></table>') +
        sec('说明', '<div class="desc">' + esc((o.lv[0] || [])[9] || '') + '</div>');
    } else if (kind === 'set') {
      o = setById[id]; if (!o) return;
      ico2 = (itemById[o.items[0]] || {}).img; name = o.n; sub = o.items.length + ' 件';
      body = sec('套装效果', o.tiers.map(function (t) {
        return '<div class="pool">' + t[0] + ' 件</div>' + statBox(t[1]);
      }).join('')) +
        sec('套装物品', o.items.map(function (iid) {
          var it = itemById[iid] || {};
          return linkRow('equip', iid, it.n || iid, (slotNames(it) || '') + (it.req && it.req.level ? ' Lv' + it.req.level : ''), it.img);
        }).join(''));
    } else if (kind === 'map') {
      o = mapById[id]; if (!o) return;
      name = o.n; sub = (o.rn || '') + (o.rk ? ' · ' + (RK[o.rk] || o.rk) : '');
      body = sec('基础', kv([['区服', o.rn], ['区域类型', RK[o.rk] || o.rk], ['等级段', (o.lo || '?') + '~' + (o.hi || '?')],
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

    $('shIco').src = ico2 || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    $('shIco').style.visibility = ico2 ? 'visible' : 'hidden';
    $('shName').textContent = name;
    $('shSub').textContent = sub;
    $('shBody').innerHTML = body || '<div class="desc">暂无数据</div>';
    $('shBody').scrollTop = 0;
    $('mask').classList.add('on');
    $('sheet').classList.add('on');
  }

  function closeSheet() {
    $('mask').classList.remove('on');
    $('sheet').classList.remove('on');
  }

  // ---------- 事件 ----------
  $('tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]');
    if (!b) return;
    tab = b.getAttribute('data-tab'); fv = '';
    render();
  });
  $('filters').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]');
    if (!b) return;
    fv = b.getAttribute('data-f');
    render();
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
    t = setTimeout(function () { kw = v.trim(); render(); }, 160);
  });
  $('clrq').addEventListener('click', function () {
    $('q').value = ''; kw = ''; this.style.display = 'none'; render();
  });

  // ---------- 启动 ----------
  var n = D.meta && D.meta.n ? D.meta.n : {};
  $('meta').innerHTML = '怪物 ' + (n.m || 0) + ' · 物品 ' + (n.i || 0) + ' · 技能 ' + (n.s || 0) +
    '<br>套装 ' + (n.set || 0) + ' · 地图 ' + (n.map || 0) + ' · BUFF ' + (n.b || 0);
  render();
})();
