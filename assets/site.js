/* Kopfkratzer – Menü, Bildvergrößerung, Bücherfilter, Kontaktformular.
   Keine Cookies, keine Analyse-Dienste. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Kopfzeile: Schatten beim Scrollen ----------
  var header = document.querySelector(".site-header");
  var toTop = document.createElement("a");
  toTop.href = "#inhalt";
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Nach oben");
  toTop.innerHTML = '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M10 16V4M5 9l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  toTop.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  document.body.appendChild(toTop);
  var onScroll = function () {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    toTop.classList.toggle("show", y > 900);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Sanftes Einblenden beim Scrollen ----------
  if ("IntersectionObserver" in window && !reduceMotion) {
    var targets = document.querySelectorAll(".section-head, .buy-card, .feature, .book-grid > li, .split > *, .adult-card, .page-strip li, .about, .yt-band, .faq details, .card, .gallery li, .pn, .cta-band, .contact-aside, .form-card");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(targets, function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // schon sichtbar: nicht animieren
      el.classList.add("reveal");
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sib % 5, 4) * 60 + "ms";
      io.observe(el);
    });
  }

  // ---------- Countdown: neues Video jeden Sonntag um 9 Uhr (deutsche Zeit) ----------
  var cd = document.querySelector("[data-countdown]");
  if (cd) initCountdown(cd);

  function initCountdown(cd) {
    var TZ = "Europe/Berlin", WOCHENTAG = 0, STUNDE = 9, LIVE_STUNDEN = 3;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short", hourCycle: "h23" });
    } catch (err) { return; } // sehr alte Browser: Countdown bleibt ausgeblendet
    var tage = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var teile = function (d) {
      var o = {};
      fmt.formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
      return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, min: +o.minute, s: +o.second, wd: tage[o.weekday] };
    };
    // Abstand der deutschen Zeit zu UTC in Millisekunden (Sommer-/Winterzeit automatisch)
    var versatz = function (d) {
      var p = teile(d);
      return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(d.getTime() / 1000) * 1000;
    };
    var naechsterTermin = function (jetzt) {
      var p = teile(jetzt);
      var tageBis = (WOCHENTAG - p.wd + 7) % 7;
      if (tageBis === 0 && p.h >= STUNDE) tageBis = 7;
      var lokal = Date.UTC(p.y, p.m - 1, p.d + tageBis, STUNDE, 0, 0);
      var t = lokal - versatz(jetzt);
      return new Date(lokal - versatz(new Date(t)));
    };
    var istLive = function (jetzt) {
      var p = teile(jetzt);
      return p.wd === WOCHENTAG && p.h >= STUNDE && p.h < STUNDE + LIVE_STUNDEN;
    };
    var datumText = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
    var el = {};
    ["d", "h", "m", "s"].forEach(function (k) { el[k] = cd.querySelector('[data-cd="' + k + '"]'); });
    var live = cd.querySelector("[data-cd-live]");
    var wann = cd.querySelector("[data-cd-when]");
    var label = cd.querySelector(".countdown-label");
    var zwei = function (n) { return (n < 10 ? "0" : "") + n; };
    var ziel = null;

    var tick = function () {
      var jetzt = new Date();
      if (!ziel || jetzt >= ziel) ziel = naechsterTermin(jetzt);
      var rest = Math.max(0, Math.floor((ziel - jetzt) / 1000));
      el.d.textContent = Math.floor(rest / 86400);
      el.h.textContent = zwei(Math.floor(rest % 86400 / 3600));
      el.m.textContent = zwei(Math.floor(rest % 3600 / 60));
      el.s.textContent = zwei(rest % 60);
      var l = istLive(jetzt);
      live.hidden = !l;
      cd.classList.toggle("is-live", l);
      label.textContent = l ? "Danach geht es weiter in" : "Das nächste Video kommt in";
      wann.textContent = datumText.format(ziel) + ", 9:00 Uhr";
    };
    tick();
    cd.hidden = false;
    setInterval(tick, 1000);
  }

  // ---------- Über mich: auf dem Handy zum Aufklappen ----------
  var aboutToggle = document.querySelector(".about-toggle");
  if (aboutToggle) {
    aboutToggle.addEventListener("click", function () {
      var about = aboutToggle.closest(".about");
      about.classList.remove("collapsed");
      aboutToggle.setAttribute("aria-expanded", "true");
      aboutToggle.hidden = true;
      var next = about.querySelector(".about-more");
      if (next) { next.setAttribute("tabindex", "-1"); next.focus({ preventScroll: true }); }
    });
  }

  // ---------- Mobiles Menü ----------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("hauptnav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    };
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); toggle.focus(); }
    });
  }

  // ---------- Bücherregal: Filter ----------
  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    var grid = document.querySelector(".book-grid");
    var items = grid ? grid.querySelectorAll("li") : [];
    filterBar.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]");
      if (!b) return;
      var f = b.getAttribute("data-filter");
      Array.prototype.forEach.call(filterBar.querySelectorAll("button"), function (x) {
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
      var shown = 0;
      Array.prototype.forEach.call(items, function (li) {
        var ok = f === "alle" || li.getAttribute("data-status") === f;
        li.hidden = !ok;
        if (ok) { shown++; li.classList.add("in"); }
      });
      var out = document.getElementById("filter-count");
      if (out) out.textContent = shown + (shown === 1 ? " Band" : " Bände");
    });
  }

  // ---------- Benachrichtigung über neue Bücher (Brevo, Double-Opt-in) ----------
  var nlForm = document.querySelector("[data-nl-form]");
  if (nlForm) initNewsletter(nlForm);

  function initNewsletter(f) {
    var box = f.closest(".nl-box");
    var done = box.querySelector(".nl-success");
    var status = f.querySelector(".nl-status");
    var email = f.querySelector('input[name="EMAIL"]');
    var btn = f.querySelector('button[type="submit"]');
    var boxes = f.querySelectorAll('input[name="lists_25[]"]');

    function pick(id) {
      if (!id) return;
      for (var i = 0; i < boxes.length; i++) if (boxes[i].value === String(id)) boxes[i].checked = true;
    }
    var m = location.search.match(/[?&]liste=(\d+)/);
    pick(f.getAttribute("data-preselect"));
    if (m) pick(m[1]);
    document.querySelectorAll("[data-nl]").forEach(function (a) {
      a.addEventListener("click", function () { pick(a.getAttribute("data-nl")); });
    });

    function say(msg) { status.textContent = msg; status.hidden = !msg; }

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var any = false;
      for (var i = 0; i < boxes.length; i++) if (boxes[i].checked) any = true;
      var v = email.value.trim();
      if (!any) { say("Bitte wähle mindestens ein Thema aus."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { say("Bitte gib eine gültige E-Mail-Adresse ein."); email.focus(); return; }
      if (f.querySelector('input[name="email_address_check"]').value) return;
      say("");
      btn.disabled = true;
      btn.classList.add("is-busy");
      var url = f.action + (f.action.indexOf("?") > -1 ? "&" : "?") + "isAjax=1";
      function ok() { f.hidden = true; done.hidden = false; done.focus(); }
      fetch(url, { method: "POST", body: new FormData(f) })
        .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (d) {
          if (d && d.success !== false) ok();
          else { say("Das hat leider nicht geklappt. Bitte prüfe deine E-Mail-Adresse und versuche es noch einmal."); }
        })
        // Antwort nicht lesbar (z. B. vom Browser blockiert): Die Anmeldung ist in der Regel trotzdem angekommen
        .catch(ok)
        .then(function () { btn.disabled = false; btn.classList.remove("is-busy"); });
    });
  }

  // ---------- Daumen-Abstimmung (Zähldienst Abacus, ohne Cookies) ----------
  var API = "https://abacus.jasoncameron.dev/";
  var NS = "kopfkratzer.de/";
  document.querySelectorAll("[data-vote]").forEach(function (box) {
    var id = box.getAttribute("data-vote");
    var btns = box.querySelectorAll(".vote-btn");
    var note = box.querySelector(".vote-note");
    var mine = null;
    try { mine = localStorage.getItem("kk-vote-" + id); } catch (e) {}

    function show(dir, n) {
      var el = box.querySelector('[data-count="' + dir + '"]');
      if (el && typeof n === "number") el.textContent = n;
    }
    function lock(dir) {
      box.classList.add("has-voted");
      btns.forEach(function (b) {
        b.disabled = true;
        b.setAttribute("aria-pressed", b.getAttribute("data-dir") === dir ? "true" : "false");
      });
    }
    ["ja", "nein"].forEach(function (dir) {
      fetch(API + "get/" + NS + id + "-" + dir)
        .then(function (r) { return r.ok ? r.json() : { value: 0 }; })
        .then(function (d) { show(dir, d.value || 0); })
        .catch(function () {});
    });
    if (mine) { lock(mine); note.textContent = "Danke, du hast schon abgestimmt!"; note.hidden = false; }

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var dir = b.getAttribute("data-dir");
        lock(dir);
        b.classList.add("bump");
        try { localStorage.setItem("kk-vote-" + id, dir); } catch (e) {}
        var el = box.querySelector('[data-count="' + dir + '"]');
        var cur = parseInt(el.textContent, 10);
        if (!isNaN(cur)) el.textContent = cur + 1;
        note.textContent = "Danke für deine Stimme!";
        note.hidden = false;
        fetch(API + "hit/" + NS + id + "-" + dir)
          .then(function (r) { return r.json(); })
          .then(function (d) { show(dir, d.value); })
          .catch(function () {});
      });
    });
  });

  // ---------- Kontaktformular ----------
  var form =document.getElementById("kontaktformular");
  if (form) initForm(form);

  function initForm(form) {
    var card = form.closest(".form-card");
    var success = card.querySelector(".form-success");
    var status = form.querySelector(".form-status");
    var btn = form.querySelector(".btn-send");
    var btnLabel = btn.querySelector(".btn-label");
    var msg = form.querySelector("#kf-nachricht");
    var count = form.querySelector("#kf-count");
    var max = parseInt(msg.getAttribute("maxlength"), 10) || 4000;

    // Vorbelegung über die Adresse, z. B. kontakt.html?buch=Band%201&thema=Frage
    try {
      var q = new URLSearchParams(window.location.search);
      var buch = q.get("buch");
      if (buch) {
        var sel = form.querySelector("#kf-buch");
        Array.prototype.some.call(sel.options, function (o) {
          if (o.text.indexOf(buch) === 0) { sel.value = o.value || o.text; return true; }
          return false;
        });
      }
      var thema = q.get("thema");
      if (thema) {
        Array.prototype.some.call(form.querySelectorAll('input[name="anliegen"]'), function (r) {
          if (r.value.toLowerCase().indexOf(thema.toLowerCase()) === 0) { r.checked = true; return true; }
          return false;
        });
      }
    } catch (err) { /* ältere Browser: keine Vorbelegung */ }

    var updateCount = function () {
      var n = msg.value.length;
      count.textContent = n + " / " + max;
      count.classList.toggle("warn", n > max * 0.9);
    };
    msg.addEventListener("input", updateCount);
    updateCount();

    var checks = [
      { el: form.querySelector("#kf-name"), err: "#kf-name-err", ok: function (el) { return el.value.trim().length > 0; } },
      { el: form.querySelector("#kf-email"), err: "#kf-email-err", ok: function (el) { var v = el.value.trim(); return v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); } },
      { el: msg, err: "#kf-msg-err", ok: function (el) { return el.value.trim().length >= 10; } },
      { el: form.querySelector("#kf-dsgvo"), err: "#kf-dsgvo-err", ok: function (el) { return el.checked; } }
    ];
    var validate = function (c, show) {
      var good = c.ok(c.el);
      var errEl = form.querySelector(c.err);
      if (show || good) {
        errEl.hidden = good;
        c.el.setAttribute("aria-invalid", good ? "false" : "true");
        var wrap = c.el.closest(".field");
        if (wrap) wrap.classList.toggle("has-error", !good);
      }
      return good;
    };
    checks.forEach(function (c) {
      c.el.addEventListener(c.el.type === "checkbox" ? "change" : "blur", function () {
        if (c.el.type === "checkbox" || c.el.value) validate(c, true);
      });
      c.el.addEventListener("input", function () {
        if (c.el.getAttribute("aria-invalid") === "true") validate(c, true);
      });
    });

    var setStatus = function (text, kind) {
      status.hidden = !text;
      status.className = "form-status" + (kind ? " is-" + kind : "");
      status.innerHTML = text || "";
    };
    var setBusy = function (busy) {
      btn.disabled = busy;
      btn.classList.toggle("busy", busy);
      btnLabel.textContent = busy ? "Wird gesendet …" : "Nachricht senden";
    };
    var showSuccess = function (text) {
      form.hidden = true;
      if (text) success.querySelector("p").textContent = text;
      success.hidden = false;
      success.focus();
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    };
    card.querySelector(".form-again").addEventListener("click", function () {
      form.reset();
      updateCount();
      setStatus("");
      success.hidden = true;
      form.hidden = false;
      form.querySelector("#kf-name").focus();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("");
      var firstBad = null;
      checks.forEach(function (c) { if (!validate(c, true) && !firstBad) firstBad = c.el; });
      if (firstBad) {
        setStatus("Bitte prüfe die markierten Felder.", "error");
        firstBad.focus();
        return;
      }
      if (form.querySelector('[name="botcheck"]').checked) return; // Spam-Roboter

      var anliegen = (form.querySelector('input[name="anliegen"]:checked') || {}).value || "Nachricht";
      var buchWert = form.querySelector("#kf-buch").value;
      var data = {
        name: form.querySelector("#kf-name").value.trim(),
        email: form.querySelector("#kf-email").value.trim(),
        anliegen: anliegen,
        buch: buchWert || "–",
        message: msg.value.trim()
      };
      var subject = "Kopfkratzer: " + anliegen + (buchWert ? " – " + buchWert : "");
      var key = (form.getAttribute("data-access-key") || "").trim();

      if (!key) {
        // Noch kein Formular-Dienst eingerichtet: E-Mail-Programm mit fertigem Text öffnen
        var to = form.getAttribute("data-mailto");
        var body = "Anliegen: " + data.anliegen + "\nBuch: " + data.buch + "\n\n" + data.message + "\n\n--\n" + data.name + (data.email ? "\n" + data.email : "");
        window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        setStatus('Dein E-Mail-Programm öffnet sich mit der fertigen Nachricht – du musst sie dort nur noch absenden. Klappt das nicht? Schreib direkt an <a href="mailto:' + to + '">' + to + "</a>.", "info");
        return;
      }

      setBusy(true);
      var payload = {
        access_key: key,
        subject: subject,
        from_name: "Kopfkratzer Kontaktformular",
        name: data.name,
        Anliegen: data.anliegen,
        Buch: data.buch,
        message: data.message,
        botcheck: false
      };
      if (data.email) {
        payload.email = data.email;
        payload.replyto = data.email;
      } else {
        payload["E-Mail"] = "keine angegeben (Absender möchte keine Antwort)";
      }
      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, json: j }; });
      }).then(function (res) {
        setBusy(false);
        if (res.ok && res.json.success !== false) {
          var vorname = data.name.split(" ")[0];
          showSuccess(data.email
            ? "Danke, " + vorname + "! Ich melde mich so bald wie möglich bei dir unter " + data.email + "."
            : "Danke, " + vorname + "! Deine Nachricht ist bei mir angekommen. Ich lese sie persönlich.");
        } else {
          throw new Error((res.json && res.json.message) || "Fehler");
        }
      }).catch(function () {
        setBusy(false);
        var to = form.getAttribute("data-mailto");
        setStatus('Das hat leider nicht geklappt. Bitte versuche es gleich noch einmal oder schreib direkt an <a href="mailto:' + to + '">' + to + "</a>.", "error");
      });
    });
  }

  // ---------- Blick ins Buch: Vergrößerung mit Vor/Zurück ----------
  var shots = Array.prototype.slice.call(document.querySelectorAll(".gallery .shot"));
  if (!shots.length) return;

  var box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Blick ins Buch");
  box.innerHTML =
    '<img alt="">' +
    '<p class="lightbox-cap"><span></span><small></small></p>' +
    '<button type="button" class="lb-close" aria-label="Schließen">✕</button>' +
    '<button type="button" class="lb-prev" aria-label="Vorherige Seite">‹</button>' +
    '<button type="button" class="lb-next" aria-label="Nächste Seite">›</button>';
  document.body.appendChild(box);

  var img = box.querySelector("img");
  var cap = box.querySelector(".lightbox-cap span");
  var counter = box.querySelector(".lightbox-cap small");
  var current = 0;
  var opener = null;
  var touchX = null;

  function show(i) {
    current = (i + shots.length) % shots.length;
    var a = shots[current];
    img.src = a.getAttribute("href");
    img.alt = a.dataset.caption || "";
    cap.textContent = a.dataset.caption || "";
    counter.textContent = (current + 1) + " von " + shots.length;
  }
  function open(i) {
    opener = shots[i];
    show(i);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    box.querySelector(".lb-close").focus();
  }
  function close() {
    box.hidden = true;
    document.body.style.overflow = "";
    if (opener) opener.focus();
  }

  shots.forEach(function (a, i) {
    a.addEventListener("click", function (e) { e.preventDefault(); open(i); });
  });
  box.addEventListener("click", function (e) {
    if (e.target.closest(".lb-prev")) show(current - 1);
    else if (e.target.closest(".lb-next")) show(current + 1);
    else if (e.target !== img) close();
  });
  // Wischen auf dem Handy
  box.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "Tab") {
      var btns = box.querySelectorAll("button");
      var first = btns[0], last = btns[btns.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
