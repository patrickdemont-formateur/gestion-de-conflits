/* ==========================================================================
   console.js - Console de l'animateur « Gérer les conflits »
   1. saisie du nombre de participants et des prénoms
   2. roulette (bandit manchot) : situation + rôles, avec contrôles de cohérence
   3. QR code par rôle, puis animation minutée de la séquence

   Rien n'est envoyé nulle part : les réglages et l'historique des tirages
   restent sur l'appareil de l'animateur (localStorage).
   ========================================================================== */
(function () {
  "use strict";

  var CKEY = "gestion-conflits-console-v1";
  var SKEY = "gestion-conflits-admin-v1";
  var MAX_PARTICIPANTS = 24;

  window.LM_CONSOLE = { start: start };

  function start(LM) {
    var D = LM.D;
    var h = LM.h;
    var append = LM.append;
    var root = LM.root;
    var toast = LM.toast;
    var storageOk = true;

    /* ------------------------------------------------------------------
       Mise en page large et roue crantée
       ------------------------------------------------------------------ */
    root.classList.add("container-wide");
    var headerInner = document.querySelector(".header-inner");
    if (headerInner) { headerInner.classList.add("container-wide"); }
    var footerInner = document.querySelector(".site-footer .container");
    if (footerInner) { footerInner.classList.add("container-wide"); }
    var gear = document.getElementById("admin-link");
    if (gear) { gear.hidden = false; }

    /* ------------------------------------------------------------------
       Aléatoire, partitions, permutations
       ------------------------------------------------------------------ */
    function shuffle(a) {
      var r = a.slice();
      for (var i = r.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = r[i]; r[i] = r[j]; r[j] = t;
      }
      return r;
    }
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function permutations(a) {
      if (a.length <= 1) { return [a.slice()]; }
      var out = [];
      a.forEach(function (x, i) {
        var rest = a.slice(0, i).concat(a.slice(i + 1));
        permutations(rest).forEach(function (p) { out.push([x].concat(p)); });
      });
      return out;
    }

    /* Une table accueille 2 à 4 personnes : au-delà, on forme des sous-groupes équilibrés */
    function partition(names) {
      var n = names.length;
      if (n <= 4) { return [names.slice()]; }
      var g = Math.ceil(n / 4);
      var base = Math.floor(n / g);
      var extra = n % g;
      var sh = shuffle(names);
      var out = [];
      var k = 0;
      for (var i = 0; i < g; i++) {
        var size = base + (i < extra ? 1 : 0);
        out.push(sh.slice(k, k + size));
        k += size;
      }
      return out;
    }

    function foldName(s) {
      return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    /* ------------------------------------------------------------------
       Réglages et état (localStorage de l'animateur)
       ------------------------------------------------------------------ */
    var settings = { base: "" };
    try {
      var rawS = JSON.parse(window.localStorage.getItem(SKEY) || "null");
      if (rawS && typeof rawS.base === "string") { settings.base = rawS.base.slice(0, 300); }
    } catch (e) { storageOk = false; }

    function saveSettings() {
      try { window.localStorage.setItem(SKEY, JSON.stringify(settings)); }
      catch (e) { storageOk = false; }
    }

    function emptyState() {
      return { names: [], tables: [], draws: {}, hist: {}, used: [], log: [], active: 0 };
    }

    function isObj(o) { return o !== null && typeof o === "object" && !Array.isArray(o); }

    function sanitize(s) {
      var out = emptyState();
      if (!isObj(s)) { return out; }
      var seen = {};
      (Array.isArray(s.names) ? s.names : []).forEach(function (n) {
        var c = LM.cleanName(n);
        var key = foldName(c);
        if (c && !seen[key] && out.names.length < MAX_PARTICIPANTS) { seen[key] = true; out.names.push(c); }
      });
      if (out.names.length < 2) { return emptyState(); }
      var tables = Array.isArray(s.tables) ? s.tables.map(function (t) {
        return (Array.isArray(t) ? t : []).filter(function (n) { return out.names.indexOf(n) !== -1; });
      }).filter(function (t) { return t.length > 0; }) : [];
      var flat = [].concat.apply([], tables);
      var okTables = flat.length === out.names.length && out.names.every(function (n) { return flat.indexOf(n) !== -1; })
        && new Set(flat).size === flat.length && tables.every(function (t) { return t.length >= 2 && t.length <= 4; });
      out.tables = okTables ? tables : partition(out.names);
      if (isObj(s.hist)) {
        Object.keys(s.hist).forEach(function (n) {
          var v = s.hist[n];
          if (out.names.indexOf(n) !== -1 && isObj(v)) {
            out.hist[n] = { m: Math.max(0, parseInt(v.m, 10) || 0), c: Math.max(0, parseInt(v.c, 10) || 0), o: Math.max(0, parseInt(v.o, 10) || 0) };
          }
        });
      }
      out.used = (Array.isArray(s.used) ? s.used : []).filter(function (id) { return !!LM.situationById(id); });
      out.active = Math.min(Math.max(parseInt(s.active, 10) || 0, 0), out.tables.length - 1);
      if (isObj(s.draws)) {
        Object.keys(s.draws).forEach(function (k) {
          var ti = parseInt(k, 10);
          var dr = s.draws[k];
          if (!(ti >= 0 && ti < out.tables.length) || !isObj(dr)) { return; }
          var sim = LM.situationById(dr.sim);
          if (!sim || !isObj(dr.assign)) { return; }
          var names = out.tables[ti];
          var assign = { o: null };
          var okDraw = true;
          LM.rolesOf(sim).forEach(function (r) {
            var v = dr.assign[r];
            if (v === null || v === undefined) { return; }
            if (names.indexOf(v) === -1) { okDraw = false; } else { assign[r] = v; }
          });
          var assigned = Object.keys(assign).map(function (r) { return assign[r]; }).filter(Boolean);
          var allRequired = LM.requiredRoles(sim).every(function (r) { return !!assign[r]; });
          if (okDraw && allRequired && new Set(assigned).size === assigned.length && assigned.length === names.length) {
            out.draws[ti] = { sim: sim.id, assign: assign };
          }
        });
      }
      return out;
    }

    var st;
    try { st = sanitize(JSON.parse(window.localStorage.getItem(CKEY) || "null")); }
    catch (e) { st = emptyState(); storageOk = false; }

    function saveState() {
      try { window.localStorage.setItem(CKEY, JSON.stringify(st)); }
      catch (e) { storageOk = false; }
    }

    /* ------------------------------------------------------------------
       Adresse de base et liens
       ------------------------------------------------------------------ */
    function isValidBase(u) { return /^(https?|file):\/\/\S+$/i.test(u); }
    function normalizeBase(u) {
      u = u.split("#")[0].split("?")[0];
      var last = u.slice(u.lastIndexOf("/") + 1);
      if (u.slice(-1) !== "/" && !/\.[a-z0-9]+$/i.test(last)) { u += "/"; }
      return u;
    }
    function baseUrl() {
      var custom = (settings.base || "").trim();
      return custom && isValidBase(custom) ? normalizeBase(custom) : LM.detectedBase();
    }
    function makeLink(sim, role, dr, ti) {
      return LM.buildUrl(baseUrl(), sim.id, role, dr.assign[role] || "", st.tables.length > 1 ? ti + 1 : 0);
    }

    /* ------------------------------------------------------------------
       Tirage : situation compatible + affectation sans doublon de rôle
       ------------------------------------------------------------------ */
    function histOf(name) {
      if (!st.hist[name]) { st.hist[name] = { m: 0, c: 0, o: 0 }; }
      return st.hist[name];
    }
    /* coût d'un rôle : on évite de redonner le même rôle à la même personne */
    function roleCost(name, role) {
      var hh = histOf(name);
      if (role === "m") { return 4 * hh.m; }
      if (role === "o") { return 2 * hh.o; }
      return hh.c;
    }
    function bestAssignment(names, roles) {
      var best = null;
      var bestCost = Infinity;
      shuffle(permutations(names)).forEach(function (perm) {
        var cost = 0;
        perm.forEach(function (nm, i) { cost += roleCost(nm, roles[i]); });
        if (cost < bestCost) { bestCost = cost; best = perm; }
      });
      var assign = { o: null };
      roles.forEach(function (r, i) { assign[r] = best[i]; });
      return assign;
    }

    function drawForTable(ti) {
      var names = st.tables[ti];
      var n = names.length;
      var elig = LM.eligible(n);
      if (!elig.length) { return null; }
      var pool = elig;
      if (st.tables.length > 1) {
        /* plusieurs tables : le formateur ne peut pas observer partout, on privilégie un observateur participant */
        var withObs = elig.filter(function (s) { return n === LM.requiredRoles(s).length + 1; });
        if (withObs.length) { pool = withObs; }
      }
      var fresh = pool.filter(function (s) { return st.used.indexOf(s.id) === -1; });
      if (!fresh.length) {
        st.used = st.used.filter(function (id) { return !pool.some(function (s) { return s.id === id; }); });
        fresh = pool;
      }
      var sim = pick(fresh);
      var roles = LM.requiredRoles(sim);
      if (n === roles.length + 1) { roles = roles.concat(["o"]); }
      var assign = bestAssignment(names, roles);
      roles.forEach(function (r) {
        var hh = histOf(assign[r]);
        if (r === "m") { hh.m += 1; } else if (r === "o") { hh.o += 1; } else { hh.c += 1; }
      });
      st.used.push(sim.id);
      var dr = { sim: sim.id, assign: assign };
      st.draws[ti] = dr;
      st.log.unshift({ table: ti + 1, sim: sim.id });
      st.log = st.log.slice(0, 30);
      saveState();
      return dr;
    }

    /* Contrôles de cohérence affichés après chaque tirage */
    function runChecks(ti, dr) {
      var names = st.tables[ti];
      var sim = LM.situationById(dr.sim);
      var req = LM.requiredRoles(sim);
      var roles = LM.rolesOf(sim);
      var assigned = roles.map(function (r) { return dr.assign[r]; }).filter(Boolean);
      var res = [];
      res.push({
        ok: assigned.length === new Set(assigned).size,
        text: "Chaque participant a un seul rôle."
      });
      res.push({
        ok: names.every(function (nm) { return assigned.filter(function (a) { return a === nm; }).length === 1; }),
        text: "Les " + names.length + " participants sont tous affectés."
      });
      res.push({
        ok: req.every(function (r) { return !!dr.assign[r]; }),
        text: "Tous les rôles joués sont affectés (" + req.map(function (r) { return D.roles[r].label.toLowerCase(); }).join(", ") + ")."
      });
      var coherent = names.length === req.length || names.length === req.length + 1;
      res.push({
        ok: coherent && (names.length === req.length) === !dr.assign.o,
        text: names.length + " participants pour " + req.length + " rôles joués : "
          + (dr.assign.o ? "l’observateur est un participant." : "l’observation est assurée par le formateur.")
      });
      var linksOk = roles.every(function (r) {
        var v = LM.resolveLink(makeLink(sim, r, dr, ti));
        return v.ok && v.sim.id === sim.id && v.role === r && v.name === (dr.assign[r] || "");
      });
      res.push({
        ok: linksOk,
        text: "Chaque QR code ouvre la situation " + sim.num + " avec les informations de son rôle."
      });
      return res;
    }

    /* ------------------------------------------------------------------
       Composants : QR agrandi, chronomètre, étapes
       ------------------------------------------------------------------ */
    function openQrDialog(title, url, qr) {
      var dlg = document.createElement("dialog");
      dlg.className = "qr-dialog";
      dlg.setAttribute("aria-labelledby", "qr-dlg-title");
      var closeBtn = h("button", { type: "button", class: "btn btn-primary" }, "Fermer");
      dlg.appendChild(h("h2", { id: "qr-dlg-title", text: title }));
      dlg.appendChild(h("div", { class: "qr-box qr-box-large" }, window.QR.svgElement(qr, "QR code : " + title)));
      dlg.appendChild(h("p", { class: "url-text", text: url }));
      dlg.appendChild(h("div", { class: "dialog-actions" }, closeBtn));
      document.body.appendChild(dlg);
      function closeDlg() {
        if (typeof dlg.close === "function") { dlg.close(); }
        dlg.removeAttribute("open");
        if (dlg.parentNode) { dlg.parentNode.removeChild(dlg); }
      }
      closeBtn.addEventListener("click", closeDlg);
      dlg.addEventListener("click", function (ev) { if (ev.target === dlg) { closeDlg(); } });
      dlg.addEventListener("close", function () { if (dlg.parentNode) { dlg.parentNode.removeChild(dlg); } });
      if (typeof dlg.showModal === "function") { dlg.showModal(); } else { dlg.setAttribute("open", ""); }
      closeBtn.focus();
    }

    var activeTimerStop = null;
    function stopConsoleTimer() { if (activeTimerStop) { activeTimerStop(); activeTimerStop = null; } }

    /* Chronomètre de la console : retourne { el, set(secondes, alerteSecondes) } */
    function createTimer() {
      var T = { total: 60, alert: 15, remaining: 60, running: false, endTs: 0, id: null, warned: false };
      var card = h("div", { class: "timer-card timer-inline" });
      var flag = h("p", { class: "timer-flag", hidden: true });
      var display = h("p", { class: "timer-display", role: "timer", "aria-live": "off", "aria-atomic": "true" });
      var status = h("p", { class: "timer-status", role: "status", "aria-live": "polite", "aria-atomic": "true" });
      var bStart = h("button", { type: "button", class: "btn btn-primary" }, "Démarrer");
      var bPause = h("button", { type: "button", class: "btn btn-secondary" }, "Pause");
      var bReset = h("button", { type: "button", class: "btn btn-secondary" }, "Réinitialiser");
      function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r; }
      function setStatus(msg, a) { status.textContent = msg; status.classList.toggle("is-alert", !!a); }
      function update() {
        var warn = T.remaining > 0 && T.remaining <= T.alert;
        var ended = T.remaining === 0;
        display.textContent = fmt(T.remaining);
        card.classList.toggle("is-warning", warn);
        card.classList.toggle("is-ended", ended);
        flag.hidden = !(warn || ended);
        flag.textContent = ended ? "Temps écoulé" : "Dernière minute";
        bStart.disabled = T.running || ended;
        bPause.disabled = !T.running;
        bStart.textContent = (T.remaining < T.total && T.remaining > 0) ? "Reprendre" : "Démarrer";
      }
      function stop() { if (T.id) { window.clearInterval(T.id); T.id = null; } T.running = false; }
      function now() { return Math.max(0, Math.ceil((T.endTs - Date.now()) / 1000)); }
      function tick() {
        T.remaining = now();
        if (T.remaining === 0) { stop(); setStatus("Temps écoulé.", true); }
        else if (T.remaining <= T.alert && !T.warned) { T.warned = true; setStatus("Attention : bientôt la fin.", true); }
        update();
      }
      bStart.addEventListener("click", function () {
        if (T.running || T.remaining === 0) { return; }
        var fresh = T.remaining === T.total;
        T.endTs = Date.now() + T.remaining * 1000;
        T.running = true;
        T.id = window.setInterval(tick, 250);
        setStatus(fresh ? "Chronomètre démarré." : "Chronomètre repris.", false);
        update();
      });
      bPause.addEventListener("click", function () {
        if (!T.running) { return; }
        T.remaining = now(); stop(); setStatus("Chronomètre en pause.", false); update();
      });
      bReset.addEventListener("click", function () {
        stop(); T.remaining = T.total; T.warned = false; setStatus("Chronomètre réinitialisé.", false); update();
      });
      card.appendChild(flag);
      card.appendChild(display);
      card.appendChild(status);
      card.appendChild(h("div", { class: "actions" }, bStart, bPause, bReset));
      function set(seconds, alertSeconds) {
        stop();
        T.total = seconds; T.remaining = seconds; T.alert = alertSeconds; T.warned = false;
        setStatus("", false);
        update();
      }
      activeTimerStop = stop;
      set(60, 15);
      return { el: card, set: set };
    }

    /* ------------------------------------------------------------------
       Vue : préparation (étape 1)
       ------------------------------------------------------------------ */
    function describeCount(n) {
      if (!(n >= 2)) { return "Il faut au moins 2 participants (le formateur n’est pas compté)."; }
      if (n > MAX_PARTICIPANTS) { return "Maximum " + MAX_PARTICIPANTS + " participants."; }
      if (n <= 4) {
        var nums = LM.eligible(n).map(function (s) { return s.num; });
        return "1 table de " + n + " participants. Situations possibles : " + nums.join(", ") + ".";
      }
      var parts = partition(new Array(n).fill("x")).map(function (t) { return t.length; });
      return parts.length + " tables (" + parts.join(" + ") + " participants). Chaque table tire sa propre situation.";
    }

    function eligibilityTable() {
      var rows = [2, 3, 4].map(function (n) {
        var sims = LM.eligible(n);
        return h("tr", null,
          h("th", { scope: "row", text: String(n) }),
          h("td", { text: sims.map(function (s) { return s.num; }).join(", ") }),
          h("td", { text: n === 2 ? "Formateur" : (n === 3 ? "Participant (situations 02 et 06) ou formateur (autres)" : "Participant") }));
      });
      rows.push(h("tr", null,
        h("th", { scope: "row", text: "5 et plus" }),
        h("td", { text: "Sous-groupes de 2 à 4" }),
        h("td", { text: "Selon la table" })));
      return h("div", { class: "table-wrap" },
        h("table", { class: "table" },
          h("caption", { text: "Situations possibles selon le nombre de participants" }),
          h("thead", null, h("tr", null,
            h("th", { scope: "col", text: "Participants par table" }),
            h("th", { scope: "col", text: "Situations" }),
            h("th", { scope: "col", text: "Observateur" }))),
          h("tbody", null, rows)));
    }

    function viewSetup() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("div", null,
        h("h1", { text: "Gérer les conflits : préparer la séance" }),
        h("p", { class: "muted", text: D.sousTitre })));
      if (!storageOk) {
        wrap.appendChild(h("p", { class: "callout callout-warn", role: "note" },
          h("strong", { text: "Point de vigilance : " }),
          "le stockage local est indisponible (navigation privée ?). Les participants ne seront pas conservés si vous actualisez la page."));
      }
      wrap.appendChild(stepBar(1));

      var vals = (prefill && prefill.length ? prefill : st.names).slice();
      prefill = null;
      var nbInput = h("input", { type: "number", id: "nb", min: 2, max: MAX_PARTICIPANTS, value: String(vals.length || 3), inputmode: "numeric" });
      var namesBox = h("div", { class: "setup-names" });
      var info = h("p", { class: "muted", role: "status", "aria-live": "polite" });
      var errBox = h("div", { class: "error-list", role: "alert", "aria-live": "assertive" });

      function readCount() {
        var n = parseInt(nbInput.value, 10);
        return isNaN(n) ? 0 : n;
      }
      function currentVals() {
        return [].slice.call(namesBox.querySelectorAll("input")).map(function (i) { return i.value; });
      }
      function buildFields() {
        var old = currentVals();
        if (old.length) { vals = old; }
        var n = readCount();
        namesBox.textContent = "";
        var count = Math.min(Math.max(n, 0), MAX_PARTICIPANTS);
        for (var i = 0; i < count; i++) {
          var id = "nm-" + i;
          namesBox.appendChild(h("div", { class: "field" },
            h("label", { for: id, text: "Prénom du participant " + (i + 1) }),
            h("input", { type: "text", id: id, maxlength: LM.NAME_MAX, autocomplete: "off", value: vals[i] || "" })));
        }
        info.textContent = describeCount(n);
      }
      nbInput.addEventListener("input", buildFields);

      var form = h("form", { novalidate: true, class: "card", "aria-labelledby": "setup-title" },
        h("h2", { id: "setup-title", text: "Étape 1 : les participants" }),
        h("p", { text: "Saisissez le nombre de participants, puis leurs prénoms. Le formateur n’est pas compté : il observe lorsqu’il ne reste pas de participant pour ce rôle." }),
        h("div", { class: "field" }, h("label", { for: "nb", text: "Nombre de participants" }), nbInput),
        info, namesBox, errBox,
        h("div", { class: "actions" }, h("button", { type: "submit", class: "btn btn-primary" }, "Valider et passer à la roulette")));

      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var errors = [];
        var n = readCount();
        var inputs = [].slice.call(namesBox.querySelectorAll("input"));
        inputs.forEach(function (i) { i.removeAttribute("aria-invalid"); });
        nbInput.removeAttribute("aria-invalid");
        var firstBad = null;
        if (!(n >= 2 && n <= MAX_PARTICIPANTS)) {
          errors.push("Le nombre de participants doit être compris entre 2 et " + MAX_PARTICIPANTS + ".");
          nbInput.setAttribute("aria-invalid", "true");
          firstBad = nbInput;
        }
        var names = inputs.map(function (i) { return LM.cleanName(i.value); });
        var seen = {};
        names.forEach(function (nm, i) {
          if (!nm) {
            errors.push("Le prénom du participant " + (i + 1) + " est vide.");
            inputs[i].setAttribute("aria-invalid", "true");
            if (!firstBad) { firstBad = inputs[i]; }
            return;
          }
          var key = foldName(nm);
          if (seen[key] !== undefined) {
            errors.push("Les participants " + (seen[key] + 1) + " et " + (i + 1) + " portent le même prénom (« " + nm + " ») : précisez-les, par exemple avec l’initiale du nom.");
            inputs[i].setAttribute("aria-invalid", "true");
            if (!firstBad) { firstBad = inputs[i]; }
          } else { seen[key] = i; }
        });
        errBox.textContent = "";
        if (errors.length) {
          errBox.appendChild(h("ul", null, errors.map(function (e) { return h("li", { text: e }); })));
          if (firstBad) { firstBad.focus(); }
          return;
        }
        var before = lastNames.length ? lastNames : st.names;
        var sameSet = before.length === names.length && names.every(function (nm) { return before.indexOf(nm) !== -1; });
        lastNames = [];
        var next = emptyState();
        next.names = names;
        next.tables = partition(names);
        if (sameSet) { next.hist = st.hist; next.used = st.used; next.log = st.log; }
        st = next;
        saveState();
        render(true);
      });

      wrap.appendChild(form);
      wrap.appendChild(h("section", { class: "card", "aria-labelledby": "elig-title" },
        h("h2", { id: "elig-title", text: "Pourquoi cette vérification ?" }),
        h("p", { text: "Chaque situation a son nombre de rôles : manager + 1 ou 2 collaborateurs, plus un observateur facultatif. La roulette ne tire que des situations compatibles avec le nombre de participants, et affecte chacun à un seul rôle." }),
        eligibilityTable()));
      wrap.appendChild(consoleNav("home"));
      buildFields();
      return wrap;
    }

    function stepBar(current) {
      var steps = ["Participants", "Roulette", "Animation"];
      return h("ol", { class: "steps stepbar", "aria-label": "Étapes de la préparation" }, steps.map(function (s, i) {
        var n = i + 1;
        var done = n < current;
        var cur = n === current;
        return h("li", { class: "steps-item" + (done ? " is-done" : "") + (cur ? " is-current" : ""), "aria-current": cur ? "step" : false },
          h("span", { class: "steps-n", text: "Étape " + n }),
          h("span", { class: "steps-state", text: s + (done ? " (fait)" : "") }));
      }));
    }

    function consoleNav(current) {
      var links = [];
      if (current !== "home") { links.push(h("a", { class: "btn btn-secondary", href: "#accueil" }, "Retour à la console")); }
      if (current !== "situations") { links.push(h("a", { class: "btn btn-secondary", href: "#situations" }, "Situations et fiches")); }
      if (current !== "aide") { links.push(h("a", { class: "btn btn-secondary", href: "#aide" }, "Aide")); }
      if (current !== "parametres") { links.push(h("a", { class: "btn btn-secondary", href: "#parametres" }, "Paramètres")); }
      return h("nav", { class: "actions", "aria-label": "Navigation de la console" }, links);
    }

    /* ------------------------------------------------------------------
       Vue : roulette et résultats
       ------------------------------------------------------------------ */
    var spinning = false;
    var prefill = null;      /* prénoms à réafficher quand on modifie les participants */
    var lastNames = [];      /* groupe précédent, pour conserver l'historique si le groupe est inchangé */

    function viewDraw() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("div", null,
        h("h1", { text: "Gérer les conflits : la roulette" }),
        h("p", { class: "muted", text: D.sousTitre })));
      wrap.appendChild(stepBar(Object.keys(st.draws).length ? 3 : 2));

      var multi = st.tables.length > 1;
      var chips = h("ul", { class: "chips", "aria-label": "Participants" }, st.names.map(function (n) { return h("li", { class: "chip", text: n }); }));
      var partActions = h("div", { class: "actions" },
        h("button", {
          type: "button", class: "btn btn-secondary",
          onclick: function () {
            LM.confirmAction("Modifier les participants ? Les tirages en cours seront effacés.", "Modifier").then(function (ok) {
              if (!ok) { return; }
              var keep = st.names.slice();
              st.draws = {};
              st.tables = [];
              st.names = [];
              saveState();
              prefill = keep;
              lastNames = keep;
              render(true);
            });
          }
        }, "Modifier les participants"));
      if (multi) {
        partActions.appendChild(h("button", {
          type: "button", class: "btn btn-secondary",
          onclick: function () {
            if (spinning) { return; }
            LM.confirmAction("Recomposer les tables au hasard ? Les tirages en cours seront effacés.", "Recomposer").then(function (ok) {
              if (!ok) { return; }
              st.tables = partition(st.names);
              st.draws = {};
              st.active = 0;
              saveState();
              render(true);
            });
          }
        }, "Recomposer les tables"));
      }
      wrap.appendChild(h("section", { class: "card", "aria-labelledby": "part-title" },
        h("h2", { id: "part-title", text: "Participants (" + st.names.length + ")" }),
        chips, partActions));

      if (multi) {
        wrap.appendChild(h("nav", { class: "table-tabs", "aria-label": "Tables" }, st.tables.map(function (t, i) {
          return h("button", {
            type: "button", class: "btn " + (i === st.active ? "btn-primary" : "btn-secondary"),
            "aria-pressed": i === st.active ? "true" : "false",
            onclick: function () { if (spinning) { return; } st.active = i; saveState(); render(true); }
          }, "Table " + (i + 1) + " : " + t.join(", "));
        })));
      }

      var ti = st.active;
      var resultBox = h("div", { class: "view result-box" });
      wrap.appendChild(renderMachine(ti, resultBox));
      wrap.appendChild(resultBox);
      if (st.draws[ti]) { fillResult(resultBox, ti); }

      wrap.appendChild(consoleNav("home"));
      return wrap;
    }

    function tableLabel(ti) {
      return st.tables.length > 1 ? "Table " + (ti + 1) + " : " : "";
    }

    function renderMachine(ti, resultBox) {
      var names = st.tables[ti];
      var n = names.length;
      var elig = LM.eligible(n);
      var existing = st.draws[ti] || null;

      var cab = h("section", { class: "slot", "aria-labelledby": "slot-title" });
      cab.appendChild(h("h2", { id: "slot-title", class: "slot-title", text: "Étape 2 : la roulette" }));
      cab.appendChild(h("p", { class: "slot-sub", text: tableLabel(ti) + n + " participants, situations possibles : " + elig.map(function (s) { return s.num; }).join(", ") + "." }));

      var reels = [];
      var reelsBox = h("div", { class: "reels", "aria-hidden": "true" });

      function makeReel(label, initial, cls) {
        var strip = h("div", { class: "reel-strip" }, h("div", { class: "reel-item", text: initial }));
        var win = h("div", { class: "reel-window" }, strip);
        var el = h("div", { class: "reel " + (cls || "") }, h("p", { class: "reel-label", text: label }), win);
        var r = { el: el, strip: strip, current: initial };
        reels.push(r);
        reelsBox.appendChild(el);
        return r;
      }

      var roleShort = function (r) { return D.roles[r].court; };
      var sitInit = existing ? LM.situationById(existing.sim).num : "?";
      makeReel("Situation", sitInit, "reel-num");
      names.forEach(function (nm) {
        var role = null;
        if (existing) {
          ["m", "c1", "c2", "o"].forEach(function (r) { if (existing.assign[r] === nm) { role = r; } });
        }
        makeReel(nm, role ? roleShort(role) : "?", "reel-role");
      });
      cab.appendChild(reelsBox);

      var live = h("p", { class: "sr-only", role: "status", "aria-live": "polite" });
      var lever = h("button", { type: "button", class: "slot-lever" },
        h("span", { class: "lever-knob", "aria-hidden": "true" }),
        h("span", { class: "lever-text", text: existing ? "Tirer à nouveau le levier" : "Tirer le levier" }));
      cab.appendChild(h("div", { class: "slot-controls" }, lever));
      cab.appendChild(live);

      /* rôles possibles pour les rouleaux des participants */
      var rolePool = {};
      elig.forEach(function (s) {
        LM.requiredRoles(s).forEach(function (r) { rolePool[r] = true; });
        if (n === LM.requiredRoles(s).length + 1) { rolePool.o = true; }
      });
      var roleFillers = Object.keys(rolePool).map(roleShort);
      var numFillers = elig.map(function (s) { return s.num; });

      function reduced() {
        try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
        catch (e) { return false; }
      }

      function spinReel(reel, target, fillers, dur, index, done) {
        var items = [reel.current];
        var count = 12 + index * 3;
        for (var i = 0; i < count; i++) { items.push(pick(fillers)); }
        items.push(target);
        function settle() {
          reel.strip.style.transition = "none";
          reel.strip.style.transform = "translateY(0)";
          reel.strip.textContent = "";
          reel.strip.appendChild(h("div", { class: "reel-item", text: target }));
          reel.current = target;
          done();
        }
        if (dur <= 0) { settle(); return; }
        reel.strip.style.transition = "none";
        reel.strip.style.transform = "translateY(0)";
        reel.strip.textContent = "";
        items.forEach(function (t) { reel.strip.appendChild(h("div", { class: "reel-item", text: t })); });
        void reel.strip.offsetHeight;
        var pct = ((items.length - 1) / items.length) * 100;
        reel.strip.style.transition = "transform " + dur + "ms cubic-bezier(.15,.7,.25,1)";
        reel.strip.style.transform = "translateY(-" + pct + "%)";
        window.setTimeout(settle, dur + 60);
      }

      lever.addEventListener("click", function () {
        if (spinning) { return; }
        var dr = drawForTable(ti);
        if (!dr) { toast("Aucune situation n’est compatible avec ce nombre de participants."); return; }
        var sim = LM.situationById(dr.sim);
        spinning = true;
        lever.setAttribute("aria-disabled", "true");
        lever.classList.add("is-pulling");
        resultBox.textContent = "";
        live.textContent = "Tirage en cours…";
        var fast = reduced();
        var remaining = reels.length;
        function oneDone() {
          remaining -= 1;
          if (remaining > 0) { return; }
          spinning = false;
          lever.setAttribute("aria-disabled", "false");
          lever.classList.remove("is-pulling");
          lever.querySelector(".lever-text").textContent = "Tirer à nouveau le levier";
          fillResult(resultBox, ti);
          live.textContent = "Situation " + sim.num + " : " + sim.titre + ". "
            + LM.rolesOf(sim).map(function (r) { return D.roles[r].label + " : " + (dr.assign[r] || "formateur"); }).join(". ") + ".";
          var t = resultBox.querySelector("h2");
          if (t) { t.setAttribute("tabindex", "-1"); t.focus(); }
          saveState();
        }
        spinReel(reels[0], sim.num, numFillers, fast ? 0 : 1500, 0, oneDone);
        names.forEach(function (nm, i) {
          var role = null;
          ["m", "c1", "c2", "o"].forEach(function (r) { if (dr.assign[r] === nm) { role = r; } });
          spinReel(reels[i + 1], roleShort(role), roleFillers, fast ? 0 : 1500 + (i + 1) * 450, i + 1, oneDone);
        });
      });

      return cab;
    }

    /* ---------- résultat : situation, rôles, contrôles, QR, animation ---------- */
    function fillResult(box, ti) {
      var dr = st.draws[ti];
      var sim = LM.situationById(dr.sim);
      box.textContent = "";

      box.appendChild(h("section", { class: "card sit-card", "aria-labelledby": "sit-title" },
        h("div", { class: "sit-head" },
          h("p", { class: "sit-num", "aria-hidden": "true", text: sim.num }),
          h("div", null,
            h("p", { class: "eyebrow", text: tableLabel(ti) + "Situation " + sim.num + ", " + sim.famille }),
            h("h2", { id: "sit-title", text: sim.titre }))),
        h("p", { class: "sit-context", text: sim.contexte }),
        h("p", { class: "muted small", text: "À projeter : le contexte commun uniquement (ni les décisions à prendre, ni les repères pour agir)." }),
        sim.sensible ? h("p", { class: "callout callout-warn", role: "note" },
          h("strong", { text: "Situation sensible : " }),
          "rappelez que c’est un jeu de rôle, laissez chacun libre de sortir du rôle à tout moment, et évitez de rejouer un vécu personnel. Dans la réalité, le signalement suit les procédures de votre organisation.") : null));

      /* rôles et affectations */
      var roles = LM.rolesOf(sim);
      var rows = roles.map(function (r) {
        var who = dr.assign[r];
        return h("tr", null,
          h("th", { scope: "row", text: D.roles[r].label }),
          h("td", null, who ? h("strong", { text: who }) : h("span", { class: "muted", text: "Formateur (tous les participants ont un rôle joué)" })));
      });
      var checks = runChecks(ti, dr);
      var allOk = checks.every(function (c) { return c.ok; });
      box.appendChild(h("section", { class: "card", "aria-labelledby": "roles-title" },
        h("h2", { id: "roles-title", text: "Rôles et affectations" }),
        h("div", { class: "table-wrap" },
          h("table", { class: "table" },
            h("caption", { text: "Qui joue quel rôle" }),
            h("thead", null, h("tr", null, h("th", { scope: "col", text: "Rôle" }), h("th", { scope: "col", text: "Participant" }))),
            h("tbody", null, rows))),
        h("h3", { text: "Contrôles de cohérence" }),
        h("ul", { class: "checks" }, checks.map(function (c) {
          return h("li", { class: c.ok ? "check-ok" : "check-ko" },
            h("strong", { text: c.ok ? "Vérifié : " : "À corriger : " }), c.text);
        })),
        allOk ? null : h("p", { class: "callout callout-warn", role: "alert" }, "Une incohérence a été détectée : retirez le levier avant de distribuer les liens.")));

      /* QR codes, un par rôle */
      if (allOk) {
        box.appendChild(h("section", { class: "view", "aria-labelledby": "qr-title" },
          h("h2", { id: "qr-title", text: "Un QR code par rôle" }),
          h("p", { class: "muted", text: "Chaque participant scanne uniquement le QR code de son rôle. Les informations affichées correspondent à la situation " + sim.num + " et à ce rôle." + (dr.assign.o ? "" : " Le QR code « Observateur » est pour le formateur.") }),
          h("div", { class: "access-grid" }, roles.map(function (r) { return qrTile(sim, r, dr, ti); }))));
        box.appendChild(renderDeroule(sim, dr));
      }
    }

    function qrTile(sim, role, dr, ti) {
      var who = dr.assign[role];
      var url = makeLink(sim, role, dr, ti);
      var qr = window.QR ? window.QR.encode(url) : null;
      var title = D.roles[role].label + " : " + (who || "formateur");
      var tile = h("section", { class: "card access-tile tile-role-" + role, "aria-labelledby": "qr-t-" + role });
      tile.appendChild(h("h3", { id: "qr-t-" + role, text: D.roles[role].label }));
      tile.appendChild(who
        ? h("p", { class: "access-name", text: who })
        : h("p", { class: "access-name access-name-empty", text: "Formateur" }));
      if (qr) {
        tile.appendChild(h("div", { class: "qr-box" }, window.QR.svgElement(qr, "QR code : " + title)));
      } else {
        tile.appendChild(h("p", { class: "callout callout-warn", role: "note" }, "QR code indisponible : lien trop long. Utilisez l’adresse ci-dessous."));
      }
      var inputId = "url-" + role;
      var input = h("input", { type: "text", id: inputId, class: "url-input", readonly: true, value: url, spellcheck: "false", autocomplete: "off" });
      input.addEventListener("focus", function () { input.select(); });
      tile.appendChild(h("div", { class: "field" }, h("label", { for: inputId, text: "Adresse du lien" }), input));
      var copyBtn = h("button", { type: "button", class: "btn btn-primary" }, "Copier l’adresse");
      var copyTimer = null;
      copyBtn.addEventListener("click", function () {
        LM.copyText(url).then(function (ok) {
          if (ok) {
            toast("Adresse copiée : " + title + ".");
            copyBtn.textContent = "Adresse copiée";
            window.clearTimeout(copyTimer);
            copyTimer = window.setTimeout(function () { copyBtn.textContent = "Copier l’adresse"; }, 3000);
          } else {
            input.focus(); input.select();
            toast("Copie automatique impossible : l’adresse est sélectionnée, faites Ctrl+C.");
          }
        });
      });
      var actions = h("div", { class: "actions" }, copyBtn);
      if (qr) {
        actions.appendChild(h("button", {
          type: "button", class: "btn btn-secondary",
          onclick: function () { openQrDialog(title, url, qr); }
        }, "Agrandir le QR code"));
      }
      tile.appendChild(actions);
      return tile;
    }

    /* ---------- animation de la séquence (déroulé du support) ---------- */
    function renderDeroule(sim, dr) {
      var sec = h("section", { class: "card", "aria-labelledby": "der-title" });
      sec.appendChild(h("h2", { id: "der-title", text: "Étape 3 : animer la séquence" }));
      var timer = createTimer();
      var panel = h("div", { class: "deroule-panel" });
      var navBtns = [];
      var nav = h("nav", { class: "deroule-nav", "aria-label": "Étapes de l’animation" });

      function stepBody(step) {
        var body = h("div", null);
        if (step.id === "projeter") {
          body.appendChild(h("p", { text: "Projetez uniquement le contexte commun de la situation " + sim.num + " (affiché plus haut)." }));
          body.appendChild(h("p", { class: "muted", text: "Ne projetez ni les décisions à prendre, ni les repères pour agir, ni les fiches des rôles." }));
        } else if (step.id === "distribuer") {
          body.appendChild(h("ul", null,
            h("li", { text: "Chaque participant scanne le QR code de son rôle, ou ouvre son lien." }),
            dr.assign.o ? null : h("li", { text: "Vous êtes l’observateur : ouvrez le QR code « Observateur » sur votre appareil pour utiliser la grille." }),
            h("li", { text: "Rappelez qu’une fiche confidentielle ne se montre à personne." })));
        } else if (step.id === "simuler") {
          body.appendChild(h("ul", null,
            h("li", { text: D.cadre.regle }),
            h("li", { text: D.cadre.fin }),
            h("li", { text: "Si le manager reçoit les protagonistes séparément, les autres attendent leur tour." })));
        } else if (step.id === "debriefer") {
          body.appendChild(h("ul", null,
            h("li", { text: D.debrief.manager }),
            h("li", { text: D.debrief.collaborateurs }),
            h("li", { text: D.debrief.observateur })));
          var rep = h("section", { class: "reveal-box", hidden: true, "aria-labelledby": "rep-title" },
            h("h3", { id: "rep-title", text: "Repères pour agir : situation " + sim.num }),
            h("ol", null, sim.reperes.map(function (r) { return h("li", { text: r }); })));
          var tg = h("button", { type: "button", class: "btn btn-secondary", "aria-expanded": "false" }, "Afficher les repères pour agir");
          tg.addEventListener("click", function () {
            var opening = rep.hidden;
            rep.hidden = !opening;
            tg.setAttribute("aria-expanded", opening ? "true" : "false");
            tg.textContent = opening ? "Masquer les repères pour agir" : "Afficher les repères pour agir";
          });
          body.appendChild(h("div", { class: "actions" }, tg));
          body.appendChild(rep);
        } else if (step.id === "rejouer") {
          body.appendChild(h("p", { text: D.debrief.rejeu }));
          body.appendChild(h("p", { class: "muted", text: "Mêmes rôles, même situation : les liens restent valables." }));
        }
        return body;
      }

      function select(i) {
        var step = D.deroule[i];
        navBtns.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); b.className = "btn " + (k === i ? "btn-primary" : "btn-secondary"); });
        panel.textContent = "";
        panel.appendChild(h("h3", { class: "deroule-title", text: step.nom + " (" + step.minutes + " min)" }));
        panel.appendChild(h("p", { class: "deroule-consigne", text: step.consigne }));
        panel.appendChild(stepBody(step));
        var seconds = step.minutes * 60;
        timer.set(seconds, seconds >= 180 ? 60 : 15);
      }

      D.deroule.forEach(function (step, i) {
        var b = h("button", { type: "button", class: "btn btn-secondary", "aria-pressed": "false", onclick: function () { select(i); } }, (i + 1) + ". " + step.nom + " (" + step.minutes + " min)");
        navBtns.push(b);
        nav.appendChild(b);
      });
      sec.appendChild(nav);
      sec.appendChild(panel);
      sec.appendChild(timer.el);
      select(0);
      return sec;
    }

    /* ------------------------------------------------------------------
       Vue : situations et fiches (aperçu pour le formateur)
       ------------------------------------------------------------------ */
    function viewSituations() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("h1", { text: "Situations et fiches" }));
      wrap.appendChild(h("p", { class: "muted", text: "Aperçu réservé au formateur : chaque lien ouvre la fiche d’un rôle dans un nouvel onglet (sans prénom). Les fiches des collaborateurs sont confidentielles : ne les projetez pas." }));
      var base = baseUrl();
      var rows = D.situations.map(function (s) {
        var req = LM.requiredRoles(s).length;
        var links = LM.rolesOf(s).map(function (r) {
          return h("li", null, h("a", { href: LM.buildUrl(base, s.id, r, "", 0), target: "_blank", rel: "noopener noreferrer" }, D.roles[r].label));
        });
        return h("tr", null,
          h("th", { scope: "row", text: s.num }),
          h("td", null, h("strong", { text: s.titre }), h("br"), h("span", { class: "muted", text: s.famille })),
          h("td", { text: req + " rôles joués" + (s.sensible ? " (sensible)" : "") }),
          h("td", { text: req + " (observateur : formateur) ou " + (req + 1) }),
          h("td", null, h("ul", { class: "inline-links" }, links)));
      });
      wrap.appendChild(h("div", { class: "card table-wrap" },
        h("table", { class: "table" },
          h("caption", { text: "Les six situations" }),
          h("thead", null, h("tr", null,
            h("th", { scope: "col", text: "N°" }),
            h("th", { scope: "col", text: "Situation" }),
            h("th", { scope: "col", text: "Rôles" }),
            h("th", { scope: "col", text: "Participants" }),
            h("th", { scope: "col", text: "Fiches" }))),
          h("tbody", null, rows))));
      wrap.appendChild(consoleNav("situations"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Vue : paramètres
       ------------------------------------------------------------------ */
    function viewSettings() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("h1", { text: "Paramètres" }));
      if (!storageOk) {
        wrap.appendChild(h("p", { class: "callout callout-warn", role: "note" },
          h("strong", { text: "Point de vigilance : " }), "le stockage local est indisponible : les réglages ne seront pas conservés."));
      }

      var baseInput = h("input", {
        type: "url", id: "adm-base", autocomplete: "off", spellcheck: "false",
        placeholder: LM.detectedBase(), value: settings.base, "aria-describedby": "adm-base-help adm-base-msg"
      });
      var baseMsg = h("p", { id: "adm-base-msg", class: "small", role: "status", "aria-live": "polite" });
      function checkBase() {
        var v = (settings.base || "").trim();
        if (!v) { baseMsg.textContent = "Adresse utilisée : " + LM.detectedBase() + " (détectée automatiquement)."; baseMsg.className = "small muted"; }
        else if (!isValidBase(v)) { baseMsg.textContent = "Adresse non valide : elle doit commencer par https:// . L’adresse détectée est utilisée à la place."; baseMsg.className = "small is-error"; }
        else { baseMsg.textContent = "Adresse utilisée : " + normalizeBase(v); baseMsg.className = "small muted"; }
      }
      baseInput.addEventListener("input", function (ev) { settings.base = ev.target.value; saveSettings(); checkBase(); });
      wrap.appendChild(h("section", { class: "card", "aria-labelledby": "adm-base-title" },
        h("h2", { id: "adm-base-title", text: "Adresse du site" }),
        h("p", { id: "adm-base-help", text: "Par défaut, l’adresse de cette page sert à fabriquer les liens et les QR codes. Ne la modifiez que si vous préparez la séance depuis un autre emplacement (par exemple en test local) : saisissez l’adresse publique du site, par exemple https://compte.github.io/gestion-conflits/" }),
        h("div", { class: "field" }, h("label", { for: "adm-base", text: "Adresse publique du site (facultatif)" }), baseInput),
        baseMsg));
      checkBase();

      wrap.appendChild(h("section", { class: "card", "aria-labelledby": "adm-reset" },
        h("h2", { id: "adm-reset", text: "Remises à zéro sur cet appareil" }),
        h("p", { text: "L’historique des tirages évite de redonner la même situation ou le même rôle à la même personne. Effacez-le entre deux groupes." }),
        h("div", { class: "actions" },
          h("button", {
            type: "button", class: "btn btn-warn",
            onclick: function () {
              LM.confirmAction("Effacer l’historique des tirages (situations déjà jouées, rôles déjà tenus) et les tirages en cours ?", "Effacer").then(function (ok) {
                if (!ok) { return; }
                st.hist = {}; st.used = []; st.log = []; st.draws = {};
                saveState();
                toast("L’historique des tirages a été effacé.");
              });
            }
          }, "Effacer l’historique des tirages"),
          h("button", {
            type: "button", class: "btn btn-warn",
            onclick: function () {
              LM.confirmAction("Effacer toutes les données de cette console (participants, tirages, historique, adresse du site) ?", "Tout effacer").then(function (ok) {
                if (!ok) { return; }
                st = emptyState();
                settings = { base: "" };
                try { window.localStorage.removeItem(CKEY); window.localStorage.removeItem(SKEY); } catch (e) { /* ignoré */ }
                render(true);
                toast("Les données de la console ont été effacées.");
              });
            }
          }, "Tout effacer")),
        st.log.length ? h("div", null,
          h("h3", { text: "Derniers tirages" }),
          h("ul", null, st.log.slice(0, 8).map(function (l) {
            var s = LM.situationById(l.sim);
            return h("li", { text: (st.tables.length > 1 ? "Table " + l.table + " : " : "") + "situation " + s.num + ", " + s.titre });
          }))) : null));
      wrap.appendChild(consoleNav("parametres"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Vue : aide
       ------------------------------------------------------------------ */
    function helpCard(id, title) {
      var card = h("section", { class: "card", "aria-labelledby": id }, h("h2", { id: id, text: title }));
      for (var i = 2; i < arguments.length; i++) { append(card, arguments[i]); }
      return card;
    }

    function viewHelp() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("h1", { text: "Aide pour l’animateur" }));
      var total = D.deroule.reduce(function (a, s) { return a + s.minutes; }, 0);

      wrap.appendChild(helpCard("aide-flux", "Déroulé d’une séance",
        h("ol", null,
          h("li", { text: "Ouvrez le site depuis son adresse publique et saisissez le nombre de participants et leurs prénoms." }),
          h("li", { text: "Tirez le levier : la roulette désigne la situation et le rôle de chacun." }),
          h("li", { text: "Projetez le contexte commun, puis faites scanner les QR codes (un par rôle)." }),
          h("li", { text: "Animez la séquence avec les étapes minutées : " + D.deroule.map(function (s) { return s.nom.toLowerCase() + " " + s.minutes + " min"; }).join(", ") + " (" + total + " minutes)." }))));

      wrap.appendChild(helpCard("aide-regles", "Règles du tirage",
        h("ul", null,
          h("li", { text: "Une personne a un seul rôle, et tous les rôles joués sont affectés." }),
          h("li", { text: "Les situations 02 et 06 se jouent avec un manager et un collaborateur ; les situations 01, 03, 04 et 05 avec un manager et deux collaborateurs." }),
          h("li", { text: "L’observateur est un participant s’il en reste un ; sinon, c’est le formateur. Son QR code ouvre dans tous les cas la grille d’observation." }),
          h("li", { text: "La roulette ne tire que des situations compatibles avec le nombre de participants de la table : 2 participants : situations 02 et 06 ; 3 participants : les six situations ; 4 participants : situations 01, 03, 04 et 05." }),
          h("li", { text: "Au-delà de 4 participants, des tables de 2 à 4 sont formées au hasard. Chaque table tire sa situation ; les situations déjà tirées sont évitées tant qu’il en reste d’autres." }),
          h("li", { text: "L’historique évite de redonner à une personne un rôle qu’elle a déjà tenu quand c’est possible (le rôle de manager en priorité)." }))));

      wrap.appendChild(helpCard("aide-controles", "Contrôles de cohérence",
        h("p", { text: "Après chaque tirage, la console vérifie : un seul rôle par personne, tous les participants affectés, tous les rôles joués pourvus, nombre de participants cohérent avec la situation, et que chaque lien ouvre bien la situation tirée avec les informations de son rôle. Si un contrôle échoue, les QR codes ne sont pas affichés : retirez le levier." }),
        h("p", { text: "La grille d’observation est universelle : elle suit les cinq temps du cadre de jeu (qualifier, sécuriser, choisir, conduire, contractualiser) et sert pour toutes les situations." })));

      wrap.appendChild(helpCard("aide-sensible", "Situation 06 : un cadre plus attentif",
        h("p", { text: "Le signalement de propos répétés touche à un risque humain réel. Posez le cadre du jeu de rôle, laissez chacun libre de sortir du rôle, évitez de rejouer un vécu personnel, et rappelez que l’alerte RH réelle suit les procédures de votre organisation." })));

      wrap.appendChild(helpCard("aide-depannage", "Dépannage",
        h("ul", null,
          h("li", null, h("strong", { text: "« Lien invalide » : " }), "le lien doit contenir la situation et le rôle (?s=3&r=m). Recopiez-le depuis la console."),
          h("li", null, h("strong", { text: "Le QR code ouvre une page introuvable : " }), "vérifiez l’adresse du site dans les Paramètres."),
          h("li", null, h("strong", { text: "Aucun participant à l’écran : " }), "la console conserve les participants sur cet appareil ; sans stockage local, ressaisissez-les."),
          h("li", null, h("strong", { text: "La copie ne fonctionne pas : " }), "l’adresse est sélectionnée, faites Ctrl+C (ou appui long sur smartphone)."))));

      wrap.appendChild(helpCard("aide-limites", "Confidentialité et limites",
        h("ul", null,
          h("li", { text: "Le cloisonnement des rôles est pédagogique, pas informatique : un site statique ne peut pas empêcher quelqu’un d’ouvrir le code source ou de modifier l’adresse." }),
          h("li", { text: "Les prénoms figurent dans les liens et QR codes, donc dans les journaux de l’hébergeur du site. Utilisez des prénoms d’usage si cela pose problème." }),
          h("li", { text: "Aucune donnée n’est envoyée à un serveur applicatif. Les notes de l’observateur restent sur son appareil." }),
          h("li", { text: "Les fiches des collaborateurs sont des textes rédigés pour l’outil à partir des contextes du support : relisez-les et adaptez-les à votre public." }))));

      wrap.appendChild(consoleNav("aide"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Routage par hash : #accueil (défaut), #situations, #parametres, #aide
       ------------------------------------------------------------------ */
    var ROUTES = ["situations", "parametres", "aide"];

    function currentRoute() {
      var hsh = window.location.hash.replace(/^#/, "");
      return ROUTES.indexOf(hsh) !== -1 ? hsh : "home";
    }
    var TITLES = { home: "Console", situations: "Situations et fiches", parametres: "Paramètres", aide: "Aide" };

    function render(moveFocus) {
      stopConsoleTimer();
      var r = currentRoute();
      var view;
      if (r === "situations") { view = viewSituations(); }
      else if (r === "parametres") { view = viewSettings(); }
      else if (r === "aide") { view = viewHelp(); }
      else {
        view = st.names.length >= 2 ? viewDraw() : viewSetup();
      }
      root.textContent = "";
      root.appendChild(view);
      document.title = "Gérer les conflits - " + TITLES[r];
      if (gear) {
        if (r === "parametres") { gear.setAttribute("aria-current", "page"); } else { gear.removeAttribute("aria-current"); }
      }
      if (moveFocus) {
        var title = root.querySelector("h1");
        if (title) { title.setAttribute("tabindex", "-1"); title.focus(); }
        try { window.scrollTo(0, 0); } catch (e) { /* sans importance */ }
      }
    }

    window.addEventListener("hashchange", function () { render(true); });
    render(false);
  }
})();
