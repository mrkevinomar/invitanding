/**
 * Contacto: dos modos (elige uno)
 *
 * 1) Netlify Forms (clave vacía abajo): tras el deploy, en Netlify → Forms → tu formulario
 *    → Notifications / Integraciones y añade tu email para recibir cada envío.
 *
 * 2) Web3Forms (https://web3forms.com): crea un formulario gratuito, copia la access key
 *    y pégala en contact.html en window.INVITANDING_WEB3FORMS_KEY. Los mensajes llegan al
 *    correo que indiques en Web3Forms. Funciona en cualquier hosting.
 */
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var key = typeof window.INVITANDING_WEB3FORMS_KEY === "string" ? window.INVITANDING_WEB3FORMS_KEY.trim() : "";

  function isLocalDev() {
    var h = location.hostname;
    return h === "localhost" || h === "127.0.0.1" || h === "";
  }

  form.addEventListener("submit", function (e) {
    if (key) {
      e.preventDefault();
      if (!form.reportValidity()) return;
    } else if (isLocalDev()) {
      e.preventDefault();
      window.alert(
        "En local (localhost) un servidor de archivos estático no acepta envíos POST del formulario (por eso ves error 501).\n\n" +
          "Para probar el contacto en tu máquina:\n\n" +
          "• Pega tu clave de Web3Forms en contact.html (INVITANDING_WEB3FORMS_KEY), o\n" +
          "• Ejecuta en la carpeta del repo: netlify dev\n\n" +
          "En el sitio ya publicado en Netlify, el modo sin clave usa Netlify Forms y sí acepta POST."
      );
      return;
    } else {
      return;
    }

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }

    var fd = new FormData(form);
    fd.append("access_key", key);
    fd.append("subject", "Nuevo contacto — Invitanding");

    var emailInput = form.querySelector('input[name="email"]');
    if (emailInput && emailInput.value) {
      fd.append("from_name", emailInput.value);
    }

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: fd,
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data && data.success) {
          var next = form.getAttribute("data-success-url") || "contacto-gracias.html";
          window.location.href = next;
          return;
        }
        var msg = (data && data.message) || "No se pudo enviar el mensaje. Intenta de nuevo.";
        window.alert(msg);
      })
      .catch(function () {
        window.alert("Error de red. Comprueba tu conexión e intenta más tarde.");
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("aria-busy");
        }
      });
  });
})();
