/**
 * Revelado al scroll al estilo Squarespace 7.1 (fade + scale, ~0,65s, ease).
 * Escalonado entre .reveal-item dentro de cada .reveal-section (--reveal-i).
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".reveal-section").forEach(function (section) {
    section.querySelectorAll(".reveal-item").forEach(function (item, i) {
      item.style.setProperty("--reveal-i", String(i));
    });
  });

  if (reduce) {
    document.querySelectorAll(".reveal-section, .sqs-animate").forEach(function (el) {
      el.classList.add("is-revealed");
    });
    return;
  }

  var rootMargin = "0px 0px -11% 0px";
  var threshold = 0.1;

  function reveal(el) {
    el.classList.add("is-revealed");
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        io.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: rootMargin, threshold: threshold }
  );

  function alreadyVisible(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.92 && r.bottom > vh * 0.05;
  }

  document.querySelectorAll(".reveal-section, .sqs-animate").forEach(function (el) {
    if (alreadyVisible(el)) {
      reveal(el);
      return;
    }
    io.observe(el);
  });
})();
