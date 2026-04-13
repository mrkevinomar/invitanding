/**
 * Revelado al scroll: cada .reveal-item al entrar en el viewport.
 * Inicialización tras layout (doble rAF + load + timeouts) para no dejar texto en opacity: 0.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    document.querySelectorAll(".reveal-item, .sqs-animate").forEach(function (el) {
      el.classList.add("is-revealed");
    });
    return;
  }

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal-item, .sqs-animate").forEach(function (el) {
      el.classList.add("is-revealed");
    });
    return;
  }

  var io;
  var watched = new WeakSet();

  function reveal(el) {
    if (el.classList.contains("is-revealed")) return;
    el.classList.add("is-revealed");
    try {
      if (io) io.unobserve(el);
    } catch (e) {
      /* no estaba observado */
    }
  }

  io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px 12% 0px", threshold: 0 }
  );

  function overlapsViewport(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    if (r.width <= 0 && r.height <= 0) return false;
    return r.bottom > -4 && r.top < vh + 4;
  }

  function scan() {
    document.querySelectorAll(".reveal-item").forEach(function (el) {
      if (el.classList.contains("is-revealed")) return;
      if (overlapsViewport(el)) {
        reveal(el);
        return;
      }
      if (!watched.has(el)) {
        watched.add(el);
        io.observe(el);
      }
    });

    document.querySelectorAll(".sqs-animate").forEach(function (el) {
      if (el.classList.contains("reveal-item")) return;
      if (el.classList.contains("is-revealed")) return;
      if (overlapsViewport(el)) {
        reveal(el);
        return;
      }
      if (!watched.has(el)) {
        watched.add(el);
        io.observe(el);
      }
    });
  }

  function kick() {
    scan();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(kick);
      });
    });
  } else {
    requestAnimationFrame(function () {
      requestAnimationFrame(kick);
    });
  }

  window.addEventListener("load", function () {
    requestAnimationFrame(scan);
  });

  window.setTimeout(scan, 120);
  window.setTimeout(scan, 400);
})();

(function () {
  var header = document.querySelector(".site-header--over-hero");
  if (!header) return;

  var hero = document.querySelector(".hero-fullbleed");

  function updateHeaderOverHero() {
    var solid = !hero;
    if (hero) {
      var br = hero.getBoundingClientRect();
      var zone = Math.max(header.offsetHeight, 72);
      if (br.height < 120) {
        solid = false;
      } else {
        solid = br.bottom < zone;
      }
    }
    header.classList.toggle("site-header--solid", solid);
  }

  function kick() {
    requestAnimationFrame(function () {
      requestAnimationFrame(updateHeaderOverHero);
    });
  }

  window.addEventListener("scroll", updateHeaderOverHero, { passive: true });
  window.addEventListener("resize", updateHeaderOverHero);
  window.addEventListener("load", kick);
  kick();
})();
