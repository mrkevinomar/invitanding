const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

  const gasUrl = process.env.GAS_WEBAPP_URL;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(out),
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        statusCode: 502,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          error: "No se pudo guardar en la hoja",
          detail: text.slice(0, 300),
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
