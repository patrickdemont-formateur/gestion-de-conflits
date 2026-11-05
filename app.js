/* ==========================================================================
   app.js - Gérer les conflits
   - sans paramètre dans l'adresse : console de l'animateur (console.js)
   - avec ?s=<situation>&r=<rôle> : page de rôle d'un participant

   JavaScript natif, aucune dépendance, aucune requête réseau.
   Toute saisie est insérée via textContent ou value (jamais innerHTML).
   ========================================================================== */
(function () {
  "use strict";

  var D = window.CONFLITS_DATA;
  var root = document.getElementById("app");
  if (!root) { return; }
  if (!D) {
    root.textContent = "Erreur : le fichier data.js n’a pas pu être chargé.";
    return;
  }

  var NAME_MAX = 20;
  var ROLE_KEYS = ["m", "c1", "c2", "o"];

  /* ------------------------------------------------------------------
     Utilitaires DOM
     ------------------------------------------------------------------ */
  function append(parent, child) {
    if (child === null || child === undefined || child === false) { return; }
    if (Array.isArray(child)) {
      child.forEach(function (c) { append(parent, c); });
      return;
    }
    parent.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
  }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === false || v === null || v === undefined) { return; }
        if (k === "class") { el.className = v; }
        else if (k === "text") { el.textContent = v; }
        else if (k === "value") { el.value = v; }
        else if (k === "checked") { el.checked = true; }
        else if (k.slice(0, 2) === "on" && typeof v === "function") { el.addEventListener(k.slice(2), v); }
        else if (v === true) { el.setAttribute(k, ""); }
        else { el.setAttribute(k, v); }
      });
    }
    kids.forEach(function (c) { append(el, c); });
    return el;
  }

  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  var toastDelay = null;

  function toast(message) {
    if (!toastEl) { return; }
    window.clearTimeout(toastTimer);
    window.clearTimeout(toastDelay);
    toastEl.classList.remove("show");
    toastEl.textContent = "";
    toastDelay = window.setTimeout(function () {
      toastEl.textContent = message;
      toastEl.classList.add("show");
    }, 60);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove("show"); }, 5000);
  }

  function confirmAction(message, okLabel) {
    return new Promise(function (resolve) {
      var dlg = document.getElementById("confirm-dialog");
      if (!dlg || typeof dlg.showModal !== "function") {
        resolve(window.confirm(message));
        return;
      }
      document.getElementById("confirm-message").textContent = message;
      document.getElementById("confirm-ok").textContent = okLabel || "Confirmer";
      var opener = document.activeElement;
      function onClose() {
        dlg.removeEventListener("close", onClose);
        resolve(dlg.returnValue === "ok");
        if (opener && typeof opener.focus === "function" && document.contains(opener)) { opener.focus(); }
      }
      dlg.addEventListener("close", onClose);
      dlg.returnValue = "cancel";
      dlg.showModal();
    });
  }

  function copyText(text) {
    function legacy() {
      var ok = false;
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      try {
        ta.select();
        ta.setSelectionRange(0, text.length);
        ok = document.execCommand("copy");
      } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(); });
    }
    return Promise.resolve(legacy());
  }

  function cleanName(v) {
    return String(v === null || v === undefined ? "" : v)
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, NAME_MAX);
  }

  /* ------------------------------------------------------------------
     Situations, rôles et liens : une seule source de vérité
     ------------------------------------------------------------------ */
  function situationById(id) {
    return D.situations.filter(function (s) { return s.id === id; })[0] || null;
  }

  /* Rôles existant pour une situation : manager, collaborateur(s), observateur */
  function rolesOf(sim) {
    var r = ["m"];
    ["c1", "c2"].forEach(function (k) { if (sim.acteurs[k]) { r.push(k); } });
    r.push("o");
    return r;
  }

  /* Rôles qui doivent être joués par un participant (hors observateur) */
  function requiredRoles(sim) {
    return rolesOf(sim).filter(function (r) { return r !== "o"; });
  }

  /* Situations compatibles avec n participants :
     tous les rôles joués sont affectés, et l'observateur est soit un participant
     (n = rôles joués + 1), soit le formateur (n = rôles joués). */
  function eligible(n) {
    return D.situations.filter(function (s) {
      var k = requiredRoles(s).length;
      return n === k || n === k + 1;
    });
  }

  function detectedBase() {
    return window.location.href.split("#")[0].split("?")[0];
  }

  function buildUrl(base, simId, role, name, table) {
    var u = base + "?s=" + simId + "&r=" + role;
    if (name) { u += "&n=" + encodeURIComponent(name); }
    if (table && table >= 1) { u += "&t=" + table; }
    return u;
  }

  /* Lit et valide un lien (adresse complète ou chaîne de requête) */
  function resolveLink(input) {
    var search = String(input);
    try {
      var qi = search.indexOf("?");
      search = qi >= 0 ? search.slice(qi) : "";
      search = search.split("#")[0];
      var p = new URLSearchParams(search);
      var s = parseInt(p.get("s"), 10);
      var r = (p.get("r") || "").toLowerCase();
      var out = { ok: false, sim: null, role: r, name: cleanName(p.get("n")), table: parseInt(p.get("t"), 10) || 0, error: "" };
      if (!s) { out.error = "La situation n’est pas indiquée dans le lien."; return out; }
      var sim = situationById(s);
      if (!sim) { out.error = "La situation " + s + " n’existe pas."; return out; }
      out.sim = sim;
      if (ROLE_KEYS.indexOf(r) === -1) { out.error = "Le rôle n’est pas indiqué ou n’existe pas."; return out; }
      if (rolesOf(sim).indexOf(r) === -1) {
        out.error = "Le rôle « " + D.roles[r].label + " » n’existe pas pour la situation " + sim.num + " : elle se joue avec un seul collaborateur.";
        return out;
      }
      out.ok = true;
      return out;
    } catch (e) {
      return { ok: false, sim: null, role: "", name: "", table: 0, error: "Le lien est illisible." };
    }
  }

  var LM = {
    D: D, root: root, h: h, append: append, toast: toast, confirmAction: confirmAction, copyText: copyText,
    cleanName: cleanName, NAME_MAX: NAME_MAX, ROLE_KEYS: ROLE_KEYS,
    situationById: situationById, rolesOf: rolesOf, requiredRoles: requiredRoles, eligible: eligible,
    detectedBase: detectedBase, buildUrl: buildUrl, resolveLink: resolveLink
  };

  /* ------------------------------------------------------------------
     Routage : sans paramètre -> console ; sinon page de rôle
     ------------------------------------------------------------------ */
  var hasParams = false;
  try {
    var qp = new URLSearchParams(window.location.search);
    hasParams = qp.has("s") || qp.has("r");
  } catch (e) { hasParams = false; }

  if (!hasParams) {
    if (window.LM_CONSOLE && typeof window.LM_CONSOLE.start === "function") {
      window.LM_CONSOLE.start(LM);
    } else {
      root.textContent = "Erreur : le fichier console.js n’a pas pu être chargé.";
    }
    return;
  }

  /* ==================================================================
     PAGE DE RÔLE
     ================================================================== */
  var link = resolveLink(window.location.search);
  var badge = document.getElementById("participant-badge");

  if (!link.ok) {
    document.title = "Lien invalide - Gérer les conflits";
    root.textContent = "";
    root.appendChild(h("div", { class: "view" },
      h("h1", { text: "Lien invalide" }),
      h("div", { class: "card" },
        h("p", { text: link.error }),
        h("p", { text: "Demandez au formateur de vous renvoyer votre lien, puis ouvrez-le depuis cet appareil." }))));
    return;
  }

  var sim = link.sim;
  var role = link.role;

  if (badge) {
    badge.textContent = (link.name ? link.name + " : " : "") + D.roles[role].label + (link.table ? ", table " + link.table : "");
    badge.hidden = false;
  }
  document.title = "Situation " + sim.num + " - " + D.roles[role].label + " - Gérer les conflits";

  /* ---------- stockage local (observations de l'observateur) ---------- */
  var OBS_KEY = "gestion-conflits-obs-v1:" + sim.id;
  var storageOk = (function () {
    try {
      var k = "__conflits_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();
  var GAUGE_MAX = (D.grille && D.grille.max) || 5;

  function loadObs() {
    var o = { grid: {} };
    D.champsObservateur.forEach(function (c) { o[c.id] = ""; });
    if (!storageOk) { return o; }
    try {
      var raw = JSON.parse(window.localStorage.getItem(OBS_KEY) || "null");
      if (raw && typeof raw === "object") {
        if (raw.grid && typeof raw.grid === "object" && !Array.isArray(raw.grid)) {
          Object.keys(raw.grid).forEach(function (k) {
            var v = raw.grid[k];
            if (typeof v === "number" && v % 1 === 0 && v >= 1 && v <= GAUGE_MAX) { o.grid[k] = v; }
          });
        }
        D.champsObservateur.forEach(function (c) { if (typeof raw[c.id] === "string") { o[c.id] = raw[c.id]; } });
      }
    } catch (e) { /* données illisibles : on repart de zéro */ }
    return o;
  }

  var obs = loadObs();

  function saveObs() {
    if (!storageOk) { return; }
    try { window.localStorage.setItem(OBS_KEY, JSON.stringify(obs)); }
    catch (e) { storageOk = false; }
  }

  /* ---------- blocs communs ---------- */
  function roleCard() {
    var r = D.roles[role];
    return h("div", { class: "role-card role-" + role },
      h("p", { class: "role-label", text: "Votre rôle" }),
      h("p", { class: "role-name", text: r.label + (sim.acteurs[role] ? " : " + sim.acteurs[role].titre : "") }),
      h("p", { class: "role-desc", text: r.desc }));
  }

  function header() {
    return h("div", null,
      h("p", { class: "eyebrow", text: "Situation " + sim.num + ", " + sim.famille }),
      h("h1", { text: sim.titre }));
  }

  function contextCard() {
    return h("section", { class: "card", "aria-labelledby": "ctx-title" },
      h("h2", { id: "ctx-title", text: "Contexte commun" }),
      h("p", { text: sim.contexte }),
      h("p", { class: "muted small", text: "Ce contexte est projeté pour tous les participants." }));
  }

  function list(items) {
    return h("ul", null, items.map(function (i) { return h("li", { text: i }); }));
  }

  function storageWarning() {
    if (storageOk) { return null; }
    return h("p", { class: "callout callout-warn", role: "note" },
      h("strong", { text: "Point de vigilance : " }),
      "le stockage local est indisponible (navigation privée ?). Vos observations ne seront pas conservées si vous actualisez la page.");
  }

  function cadreCard(titleId) {
    var C = D.cadre;
    return h("section", { class: "card", "aria-labelledby": titleId },
      h("h2", { id: titleId, text: "Cadre de jeu" }),
      h("p", { class: "muted", text: C.titre }),
      h("ol", { class: "cadre-list" }, C.etapes.map(function (e) {
        return h("li", null, h("strong", { text: e.nom + " : " }), e.question);
      })),
      h("p", { class: "callout" }, h("strong", { text: "Enjeu : " }), C.enjeu));
  }

  /* ---------- chronomètre (manager) ---------- */
  function renderTimer() {
    var total = D.dureeSimulation;
    var T = { remaining: total, running: false, endTs: 0, id: null, warned: false };
    var card = h("section", { class: "card timer-card", "aria-labelledby": "timer-title" });
    var flag = h("p", { class: "timer-flag", hidden: true });
    var display = h("p", { class: "timer-display", role: "timer", "aria-live": "off", "aria-atomic": "true" });
    var status = h("p", { class: "timer-status", role: "status", "aria-live": "polite", "aria-atomic": "true" });
    var bStart = h("button", { type: "button", class: "btn btn-primary" }, "Démarrer");
    var bPause = h("button", { type: "button", class: "btn btn-secondary" }, "Pause");
    var bReset = h("button", { type: "button", class: "btn btn-secondary" }, "Réinitialiser");

    function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r; }
    function setStatus(msg, alertLevel) { status.textContent = msg; status.classList.toggle("is-alert", !!alertLevel); }
    function update() {
      var warn = T.remaining > 0 && T.remaining <= D.alerteSecondes;
      var ended = T.remaining === 0;
      display.textContent = fmt(T.remaining);
      card.classList.toggle("is-warning", warn);
      card.classList.toggle("is-ended", ended);
      flag.hidden = !(warn || ended);
      flag.textContent = ended ? "Temps écoulé" : "Dernière minute";
      bStart.disabled = T.running || ended;
      bPause.disabled = !T.running;
      bStart.textContent = (T.remaining < total && T.remaining > 0) ? "Reprendre" : "Démarrer";
    }
    function remainingNow() { return Math.max(0, Math.ceil((T.endTs - Date.now()) / 1000)); }
    function tick() {
      T.remaining = remainingNow();
      if (T.remaining === 0) {
        window.clearInterval(T.id); T.id = null; T.running = false;
        setStatus("Temps écoulé. Concluez par une décision finale et un suivi daté.", true);
      } else if (T.remaining <= D.alerteSecondes && !T.warned) {
        T.warned = true;
        setStatus("Attention : il reste moins d’une minute.", true);
      }
      update();
    }
    bStart.addEventListener("click", function () {
      if (T.running || T.remaining === 0) { return; }
      var fresh = T.remaining === total;
      T.endTs = Date.now() + T.remaining * 1000;
      T.running = true;
      T.id = window.setInterval(tick, 250);
      setStatus(fresh ? "Chronomètre démarré." : "Chronomètre repris.", false);
      update();
    });
    bPause.addEventListener("click", function () {
      if (!T.running) { return; }
      T.remaining = remainingNow();
      window.clearInterval(T.id); T.id = null; T.running = false;
      setStatus("Chronomètre en pause.", false);
      update();
    });
    bReset.addEventListener("click", function () {
      if (T.id) { window.clearInterval(T.id); T.id = null; }
      T.running = false; T.remaining = total; T.warned = false;
      setStatus("Chronomètre réinitialisé.", false);
      update();
    });

    card.appendChild(h("h2", { id: "timer-title", text: "Chronomètre (facultatif)" }));
    card.appendChild(h("p", { class: "muted", text: "Simulation : " + Math.round(total / 60) + " minutes. Le chronomètre ne démarre jamais seul et reste local à cet appareil." }));
    card.appendChild(flag);
    card.appendChild(display);
    card.appendChild(status);
    card.appendChild(h("div", { class: "actions" }, bStart, bPause, bReset));
    update();
    return card;
  }

  /* ---------- grille d'observation universelle ---------- */
  function renderGrid() {
    var G = D.grille;
    var total = G.groupes.reduce(function (a, g) { return a + g.criteres.length; }, 0);
    var section = h("section", { class: "card", "aria-labelledby": "grid-title" });
    var count = h("p", { class: "grid-count", role: "status", "aria-live": "polite" });

    function updateCount() {
      var n = Object.keys(obs.grid).length;
      count.textContent = n === 0
        ? "Aucun critère noté pour l’instant : c’est normal, rien n’est obligatoire."
        : n + " critère" + (n > 1 ? "s" : "") + " noté" + (n > 1 ? "s" : "") + " sur " + total + ".";
    }

    function buildTile(c) {
      var el = h("div", { class: "tile" });
      var segs = [];
      var gauge = h("div", { class: "gauge", "aria-hidden": "true" });
      for (var i = 0; i < GAUGE_MAX; i++) { var seg = h("i"); segs.push(seg); gauge.appendChild(seg); }
      var cnt = h("span", { class: "tile-count", "aria-live": "polite", "aria-atomic": "true" });
      var minus = h("button", { type: "button", class: "tile-btn tile-minus", "aria-label": "Retirer une observation : " + c.texte }, "\u2212");
      var plus = h("button", { type: "button", class: "tile-btn tile-plus", "aria-label": "Ajouter une observation : " + c.texte }, "+");

      function paint() {
        var v = obs.grid[c.id] || 0;
        el.setAttribute("data-level", String(v));
        cnt.textContent = "";
        cnt.appendChild(h("span", { "aria-hidden": "true", text: v ? "\u00d7" + v : "0" }));
        cnt.appendChild(h("span", { class: "sr-only", text: v === 0 ? "non noté" : "observé " + v + " fois" }));
        segs.forEach(function (sg, idx) { sg.className = idx < v ? "on" : ""; });
        minus.setAttribute("aria-disabled", v === 0 ? "true" : "false");
        plus.setAttribute("aria-disabled", v >= GAUGE_MAX ? "true" : "false");
      }
      plus.addEventListener("click", function () {
        var v = obs.grid[c.id] || 0;
        if (v >= GAUGE_MAX) { return; }
        obs.grid[c.id] = v + 1; saveObs(); paint(); updateCount();
      });
      minus.addEventListener("click", function () {
        var v = obs.grid[c.id] || 0;
        if (v <= 0) { return; }
        if (v === 1) { delete obs.grid[c.id]; } else { obs.grid[c.id] = v - 1; }
        saveObs(); paint(); updateCount();
      });
      el.appendChild(h("p", { class: "tile-label", text: c.texte }));
      el.appendChild(h("div", { class: "tile-ctl" }, minus, cnt, plus));
      el.appendChild(gauge);
      paint();
      return el;
    }

    section.appendChild(h("h2", { id: "grid-title", text: "Grille d’observation" }));
    section.appendChild(h("p", { class: "callout" },
      h("strong", { text: "Rien n’oblige à tout renseigner. " }),
      "Notez uniquement ce que vous avez réellement observé : un critère laissé à 0 signifie simplement « pas noté ». Cette grille est la même pour toutes les situations."));
    section.appendChild(h("p", { class: "muted", text: "Touchez + à chaque fois que vous observez le comportement (1 fois : observé, 2 fois ou plus : comportement renforcé). Touchez − pour corriger. Vos notes restent uniquement sur cet appareil." }));
    section.appendChild(count);
    section.appendChild(h("p", { class: "stem", text: G.amorce }));

    G.groupes.forEach(function (g) {
      var gid = "grp-" + g.id;
      section.appendChild(h("div", { class: "tile-group", role: "group", "aria-labelledby": gid },
        h("h3", { id: gid, text: g.titre }),
        h("div", { class: "tiles" }, g.criteres.map(buildTile))));
    });

    D.champsObservateur.forEach(function (c) {
      var id = "obs-" + c.id;
      section.appendChild(h("div", { class: "field" },
        h("label", { for: id, text: c.label }),
        h("textarea", { id: id, rows: 3, maxlength: 1000, value: obs[c.id], oninput: function (ev) { obs[c.id] = ev.target.value; saveObs(); } })));
    });

    section.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-warn",
        onclick: function () {
          confirmAction("Effacer toutes vos observations enregistrées sur cet appareil ?", "Effacer").then(function (ok) {
            if (!ok) { return; }
            obs = { grid: {} };
            D.champsObservateur.forEach(function (c) { obs[c.id] = ""; });
            saveObs();
            var fresh = renderGrid();
            section.replaceWith(fresh);
            var t = fresh.querySelector("h2");
            if (t) { t.setAttribute("tabindex", "-1"); t.focus(); }
            toast("Vos observations ont été effacées.");
          });
        }
      }, "Effacer mes observations")));

    updateCount();
    return section;
  }

  /* ---------- vues par rôle ---------- */
  function viewManager() {
    var wrap = h("div", { class: "view" });
    wrap.appendChild(header());
    wrap.appendChild(roleCard());
    wrap.appendChild(contextCard());
    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "mission-title" },
      h("h2", { id: "mission-title", text: "Votre mission" }),
      list([D.cadre.regle, D.cadre.fin])));
    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "dec-title" },
      h("h2", { id: "dec-title", text: "Décisions à prendre" }),
      list(sim.decisions),
      h("p", { class: "muted small", text: D.cadre.decisions })));
    wrap.appendChild(cadreCard("cadre-title"));
    wrap.appendChild(renderTimer());
    return wrap;
  }

  function viewCollab() {
    var a = sim.acteurs[role];
    var wrap = h("div", { class: "view" });
    wrap.appendChild(header());
    wrap.appendChild(roleCard());
    wrap.appendChild(contextCard());

    var card = h("section", { class: "card card-confidential", "aria-labelledby": "fiche-title" });
    card.appendChild(h("p", { class: "confidential", text: "Informations confidentielles : ne pas montrer aux autres participants" }));
    card.appendChild(h("h2", { id: "fiche-title", text: "Votre fiche confidentielle" }));
    card.appendChild(h("p", { text: a.profil }));
    card.appendChild(h("h3", { text: "Ce que vous vivez" }));
    card.appendChild(list(a.vecu));
    card.appendChild(h("h3", { text: "Ce que vous voulez" }));
    card.appendChild(list(a.veut));
    card.appendChild(h("h3", { text: "Votre réplique d’ouverture" }));
    card.appendChild(h("blockquote", { class: "quote", text: "« " + a.ouverture + " »" }));
    card.appendChild(h("h3", { text: "Comment jouer votre rôle" }));
    card.appendChild(h("p", { class: "callout callout-warn" }, h("strong", { text: "Point de vigilance : " }), D.reglesCollab[0]));
    card.appendChild(list(D.reglesCollab.slice(1)));
    card.appendChild(h("p", { class: "muted", text: "Selon l’attitude du manager :" }));
    card.appendChild(list(a.jeu));
    wrap.appendChild(card);
    return wrap;
  }

  function viewObserver() {
    var wrap = h("div", { class: "view" });
    wrap.appendChild(header());
    wrap.appendChild(roleCard());
    append(wrap, storageWarning());
    wrap.appendChild(contextCard());
    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "rep-title" },
      h("h2", { id: "rep-title", text: "Repères de la situation" }),
      h("p", { class: "muted", text: "Pour apprécier la stratégie du manager. Ce sont des repères, pas une liste de critères exclusifs." }),
      list(sim.reperes)));
    wrap.appendChild(cadreCard("cadre-title"));
    wrap.appendChild(renderGrid());
    return wrap;
  }

  root.textContent = "";
  root.appendChild(role === "m" ? viewManager() : (role === "o" ? viewObserver() : viewCollab()));
})();
