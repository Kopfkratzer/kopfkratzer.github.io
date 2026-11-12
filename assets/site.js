/* Kopfkratzer – Menü und Bildvergrößerung. Keine Cookies, keine externen Dienste. */
(function () {
  "use strict";

  // Mobiles Menü
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("hauptnav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Blick ins Buch: Vergrößerung mit Vor/Zurück
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
  var count = box.querySelector(".lightbox-cap small");
  var current = 0;
  var opener = null;

  function show(i) {
    current = (i + shots.length) % shots.length;
    var a = shots[current];
    img.src = a.getAttribute("href");
    img.alt = a.dataset.caption || "";
    cap.textContent = a.dataset.caption || "";
    count.textContent = (current + 1) + " von " + shots.length;
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
    a.addEventListener("click", function (e) {
      e.preventDefault();
      open(i);
    });
  });
  box.addEventListener("click", function (e) {
    if (e.target.closest(".lb-prev")) show(current - 1);
    else if (e.target.closest(".lb-next")) show(current + 1);
    else if (e.target !== img) close();
  });
  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "Tab") {
      // Fokus bleibt im Dialog
      var btns = box.querySelectorAll("button");
      var first = btns[0], last = btns[btns.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
