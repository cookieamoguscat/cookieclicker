(() => {
  "use strict";
  !(function (e, t, r, a) {
    function n(e) {
      var t,
        r = e.length,
        n = this,
        o = 0,
        i = (n.i = n.j = 0),
        s = (n.S = []);
      for (r || (e = [r++]); a > o;) s[o] = o++;
      for (o = 0; a > o; o++)
        ((s[o] = s[(i = u & (i + e[o % r] + (t = s[o])))]), (s[i] = t));
      (n.g = function (e) {
        for (var t, r = 0, o = n.i, i = n.j, s = n.S; e--;)
          ((t = s[(o = u & (o + 1))]),
            (r = r * a + s[u & ((s[o] = s[(i = u & (i + t))]) + (s[i] = t))]));
        return ((n.i = o), (n.j = i), r);
      })(a);
    }
    function o(e, t) {
      var r,
        a = [],
        n = (typeof e)[0];
      if (t && "o" == n)
        for (r in e)
          try {
            a.push(o(e[r], t - 1));
          } catch (e) {}
      return a.length ? a : "s" == n ? e : e + "\0";
    }
    function i(e, t) {
      for (var r, a = e + "", n = 0; a.length > n;)
        t[u & n] = u & ((r ^= 19 * t[u & n]) + a.charCodeAt(n++));
      return d(t);
    }
    function s(r) {
      try {
        return (e.crypto.getRandomValues((r = new Uint8Array(a))), d(r));
      } catch (r) {
        return [+new Date(), e, e.navigator.plugins, e.screen, d(t)];
      }
    }
    function d(e) {
      return String.fromCharCode.apply(0, e);
    }
    var c = r.pow(a, 6),
      m = r.pow(2, 52),
      l = 2 * m,
      u = 255;
    ((r.seedrandom = function (e, u) {
      var f = [],
        h = i(o(u ? [e, d(t)] : 0 in arguments ? e : s(), 3), f),
        w = new n(f);
      return (
        i(d(w.S), t),
        (r.random = function () {
          for (var e = w.g(6), t = c, r = 0; m > e;)
            ((e = (e + r) * a), (t *= a), (r = w.g(1)));
          for (; e >= l;) ((e /= 2), (t /= 2), (r >>>= 1));
          return (e + r) / t;
        }),
        h
      );
    }),
      i(r.random(), t));
  })(window, [], Math, 256);
  const e = [
      [25, 825, 45, 325],
      [19, 819, 39, 219],
      [11, 811, 31, 221],
      [7, 807, 27, 217],
      [2, 812, 22, 302],
      [1, 801, 18, 201],
      [1, 801, 13, 201],
      [1, 801, 7, 301],
      [1, 801, 3, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],


    ],
    t = [7, 2],
    r = [0, 1, 4, 5],
    a = {
      init: () => {
        const a = l("grimoireContent"),
          n = document.createElement("div");
        ((n.id = "GFDSSBlock"),
          (n.style.marginTop = "10px"),
          (n.style.display = "flex"),
          (n.style.justifyContent = "center"),
          (n.style.gap = "5px"),
          (n.style.color = "rgba(255,255,255,0.75)"),
          (n.style.fontSize = "11px"),
          a?.appendChild(n),
          Game.registerHook("draw", () => {
            Game.drawT % 15 == 0 &&
              (() => {
                const a = l("GFDSSBlock");
                if (!a) return;
                const n = Game.Objects["Wizard tower"].minigame.spellsCastTotal;
                Math.seedrandom(Game.seed + "/" + n);
                const o = Math.random(),
                  i = ((e) => {
                    const t = Game.Objects["Wizard tower"].minigame.spells,
                      r = [];
                    for (var a in t)
                      "gambler's fever dream" != a && r.push(t[a]);
                    Math.seedrandom(Game.seed + "/" + e);
                    var n = choose(r);
                    return (
                      Math.seedrandom(Game.seed + "/" + (e + 1)),
                      { id: n.id, name: n.name, backfire: Math.random() >= 0.5 }
                    );
                  })(n),
                  s = ((a, n) => {
                    const o = Game.Objects["Wizard tower"].level,
                      i = e[o - 1];
                    if (t.includes(a.id)) return `cast with ${i[0]} towers`;
                    if (r.includes(a.id)) return `cast with ${i[1]} towers`;
                    if (8 === a.id)
                      return "cast GFD, immediatly ctrl+s and then reload the game";
                    if (3 === a.id) {
                      if (!a.backfire)
                        return `cast with ${i[0]} towers and fast rebuy towers to 400+`;
                      Math.seedrandom(Game.seed + "/" + n);
                      const e = Math.random();
                      if (e >= 0.375 && e < 0.42857)
                        return `cast with ${i[2]} towers`;
                      Math.seedrandom(Game.seed + "/" + (n + 1));
                      const t = Math.random();
                      return t >= 0.6 && t < 0.71428
                        ? `cast with ${i[0]} towers, fast buy to ${i[3]} towers, then cast again`
                        : t >= 0.71428 && t < 0.85714
                          ? `cast with ${i[0]} towers twice`
                          : "cast GFD, immediatly ctrl+s and then reload the game";
                    }
                    return "cast GFD, immediatly ctrl+s and then reload the game";
                  })(i, n);
                a.innerHTML = `| RS: ${o.toFixed(5)} | Next: <div class="${i.backfire ? "red" : "green"}">${i.name}</div>`;
              })();
          }));
      },
    };
  "undefined" != typeof Steam
    ? setTimeout(function () {
        Game.registerMod("GFDSSHelper", a);
      }, 2e3)
    : Game.registerMod("GFDSSHelper", a);
})();
