const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizeGasUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  return raw.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
}

function looksLikeHtml(s) {
  const t = s.trim().slice(0, 200).toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html") || (t.startsWith("<") && t.includes("<html"));
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  const gasUrl = normalizeGasUrl(process.env.GAS_WEBAPP_URL);
  if (!gasUrl) {
    return {
      statusCode: 500,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        error: "Falta GAS_WEBAPP_URL en variables de entorno de Netlify",
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "JSON inválido" }),
    };
  }

  const nombre = String(payload.nombre || "").trim().slice(0, 200);
  const apellido = String(payload.apellido || "").trim().slice(0, 200);
  const asistencia = String(payload.asistencia || "").trim();
  const acompanantes = String(payload.acompanantes || "").trim().slice(0, 500);
  const mensaje = String(payload.mensaje || "").trim().slice(0, 2000);

  const allowed = ["Sí, ¡allí estaré!", "No podré asistir"];
  if (!nombre || !apellido) {
    return {
      statusCode: 400,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Nombre y apellido obligatorios" }),
    };
  }
  if (!allowed.includes(asistencia)) {
    return {
      statusCode: 400,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Indica si asistirás o no" }),
    };
  }

  const out = { nombre, apellido, asistencia, acompanantes, mensaje };

  try {
    const res = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(out),
      redirect: "follow",
    });

    const text = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    if (parsed && parsed.ok === false) {
      return {
        statusCode: 502,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          error: String(parsed.error || "El script no pudo guardar la fila"),
        }),
      };
    }

    if (res.ok && looksLikeHtml(text)) {
      return {
        statusCode: 502,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          error:
            "Google devolvió una página HTML en lugar del script. Suele pasar si la URL no es la de «Implementar» (/exec), o si «Quién tiene acceso» no es «Cualquier usuario».",
        }),
      };
    }

    if (!res.ok) {
      let hint = "";
      if (res.status === 401 || res.status === 403) {
        hint =
          " Revisa en Apps Script: Implementar → tu despliegue → «Quién tiene acceso» = Cualquier usuario (incluso anónimo).";
      } else if (res.status === 404) {
        hint = " Comprueba que GAS_WEBAPP_URL sea la URL completa que termina en /exec (copiada del despliegue).";
      } else {
        hint = " Revisa en Netlify → Functions → rsvp-submit → logs del último intento.";
      }
      const scriptMsg =
        parsed && (parsed.error || parsed.message) ? ` ${String(parsed.error || parsed.message)}` : "";
      return {
        statusCode: 502,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          error: `Google respondió con error HTTP ${res.status}.${hint}${scriptMsg}`.trim(),
        }),
      };
    }

    if (parsed && parsed.ok === true) {
      return {
        statusCode: 200,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true }),
      };
    }

    if (parsed === null && text.trim() !== "") {
      return {
        statusCode: 502,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          error:
            "Respuesta inesperada del script. Comprueba que doPost devuelva JSON con { ok: true } (como en RSVP-GOOGLE-SHEETS.txt).",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: String(e && e.message ? e.message : e) }),
    };
  }
}
